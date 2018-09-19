const app = require('./app.js');
const config = require('./config');
const memory = require('feathers-memory');
const Path = require('path');
const fs = require('fs-extra');
const archiver = require('archiver');
const mutex = require("await-mutex").default;

const debug = require('debug')('calibrations');

app.use('/api/calibrations', memory() );

const service = app.service('/api/calibrations');
const isDirectory = async path => (await fs.stat(path)).isDirectory();

const calibrationsPath = Path.join(config.PATH,'/db');

const defaultCalibration = () => ({
    date   : Date.now()
});

app.param('calibration', async (browser_request, browser_response, next, id) => {
    try {
        browser_request.calibration = await service.get(id);

        if(!browser_request.calibration) {
            next(new Error("Wrong calibration ID"));
        } else {
            next();
        }
    } catch(error) {
        next(error);
    }
});

app.get('/calibration/:calibration/preview.jpg', async (browser_request, browser_response) => {
    try {
        const { calibrationPath } = paths(calibrationsPath, browser_request.calibration[service.id]);
        const { preview } = await config.service.get('0');
        const fileName = Path.join(calibrationPath, 'calibration', `${preview}.jpg`);

        const file_stream = fs.createReadStream(fileName);

        file_stream.pipe(browser_response);

        file_stream.on('error', error => {
            debug('Calibration preview error:', error);

            if(!browser_response.headersSent && !browser_response.finished)
                browser_response.redirect('/noise.jpg');
            file_stream.destroy();
        });

        browser_response.on('close', () => file_stream.destroy() );
        browser_response.on('end',   () => file_stream.destroy() );

    } catch(error) {
        browser_response.status(500).send(error);
    }
});

app.get('/calibration/:calibration.zip', async (browser_request, browser_response) => {
    try {
        var archive = archiver('zip', { store: true });

        archive.pipe(browser_response);
        const calibrationId = browser_request.calibration[service.id];

        const { calibrationPath } = paths(calibrationsPath, calibrationId);

        archive.directory(calibrationPath, false);

        archive.on('warning', error => debug('Archive warning:', error));

        archive.on('error', error => debug('Archive error:', error));

        archive.on('progress', async data => {
            if(data.entries.total==data.entries.processed &&
                data.fs.totalBytes==data.fs.processedBytes) {

                service.patch(calibrationId, { zipDownloaded: true });
            }
        });

        archive.finalize();

    } catch(error) {
        debug('Error:', error);
        browser_response.status(500).send(error);
    }
});

const paths = (path, calibrationId) => ({
    calibrationPath: Path.join(path, calibrationId),
    calibrationJsonPath: Path.join(Path.join(path, calibrationId), "calibration.json")
});

const populate = async () => {

    try {
        await fs.ensureDir(calibrationsPath);

        let calibrationIds = await fs.readdir(calibrationsPath);

        await Promise.all(calibrationIds.map(async calibrationId => {

            const { calibrationPath, calibrationJsonPath } = paths(calibrationsPath, calibrationId);

            if(await isDirectory(calibrationPath) && await fs.exists(calibrationJsonPath)) {

                let { calibrationId: unusedCalibrationId, ...calibration } = JSON.parse(await fs.readFile(calibrationJsonPath));

                const alreadyExists = await service.find({ query: { [service.id]: calibrationId } });

                if(alreadyExists.length) {
                    await service.update( calibrationId, calibration );
                } else {
                    await service.create({ ...calibration, [service.id]: calibrationId });
                }
            }
        }));
    } catch(error) {
        debug("Error populating database", error);
    }
}

const updateMutex = new mutex();

const fail = async (id, value) => {

    const unlock = await updateMutex.lock();

    try {
        const calibration = await service.get(id);
        await service.patch(id, {
            failed: [...(new Set(calibration.failed)).add(value)].sort((a,b)=>a-b)
        });
    } catch(error) {
        debug("Error updating failed cameras", error);
    }

    unlock();
}

service.hooks({
    before: {
        create: async context => {
            if(!context.data[service.id]) {

                const { nextId } = await config.service.get('0');
                await config.service.patch('0', { nextId: +nextId+1 });

                const { calibrationPath } = paths(calibrationsPath, nextId.toString());

                await fs.ensureDir(calibrationPath);

                context.data = Object.assign( defaultCalibration(), { [service.id]: nextId.toString(), }, context.data);
            }
        }
    },
    after: {
        create: async context => {
            try {
                const calibrations = [].concat(context.data);

                await Promise.all(calibrations.map(async ({ [service.id]:id, ...calibration }) => {
                    const { calibrationJsonPath } = paths(calibrationsPath, id);
                    await fs.outputJson(calibrationJsonPath, { calibrationId:id, ...calibration });
                }));
            } catch(error) {
                debug("after create", error);
            }
        },
        update: async context => {
            try {
                if(context.id) {
                    const { [service.id]:id, ...calibration } = context.data;
                    const { calibrationJsonPath } = paths(calibrationsPath, id);
                    await fs.outputJson(calibrationJsonPath, { calibrationId:id, ...calibration });
                } else {
                    debug("unsupported update", context.data);
                }
            } catch(error) {
                debug("after update", error);
            }
        },
        patch: async context => {
            try {
                if(context.id) {
                    const { [service.id]:id, ...calibration } = await service.get(context.id);
                    const { calibrationJsonPath } = paths(calibrationsPath, id);
                    await fs.outputJson(calibrationJsonPath, { calibrationId:id, ...calibration });
                } else {
                    debug("unsupported patch", context.data);
                }
            } catch(error) {
                debug("after patch", error);
            }
        },
        remove: async context => {
            try {
                const { [service.id]:id } = context;

                if(id) {

                    const { calibrationPath } = paths(calibrationsPath, id);

                    debug(`Removing  ${calibrationPath}`);
                    await fs.remove(calibrationPath);
                } else {
                    debug("unsupported remove:", context);
                }
            } catch(error) {
                debug("after remove", error);
            }
        }
    }
});

populate();

module.exports = { service, fail };
