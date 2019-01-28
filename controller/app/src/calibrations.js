const app = require('./app.js');
const config = require('./config');
const memory = require('feathers-memory');
const Path = require('path');
const fs = require('fs-extra');
const archiver = require('archiver');
const mutex = require("await-mutex").default;
const globby = require('globby');

const debug = require('debug')('calibrations');

app.use('/api/calibrations', memory() );

const service = app.service('/api/calibrations');
const isDirectory = async path => (await fs.stat(path)).isDirectory();

const calibrationsPath = Path.join(config.PATH,'/db');

const defaultCalibration = () => ({
    date   : Date.now(),
});

app.param('calibration', async (browser_request, browser_response, next, id) => {
    try {
        browser_request.calibration = await service.get(id);

        if(!browser_request.calibration) {
            next(new Error("CALIBRATION: ${id} - not found"));
        } else {
            next();
        }
    } catch(error) {
        next(error);
    }
});

app.get('/calibration/:calibration/:preview.jpg', async (browser_request, browser_response) => {
    try {
        const calibrationId = browser_request.calibration[service.id];
        const preview = browser_request.params.preview;
        const { calibrationPath } = paths(calibrationsPath, calibrationId);
        const { scanner } = await config.service.get('0');
        const folder = 'calibration';
        const fileName = Path.join(calibrationPath, folder, `${preview}.jpg`);

        if(!browser_request.calibration.done) {

            const mac = scanner.map[preview];

            if(mac) {
                browser_response.redirect(`/preview/${mac}/${calibrationId}-1.jpg`);
            } else {
                browser_response.redirect('/noise.jpg');
            }

            return;
        }

        const file_stream = fs.createReadStream(fileName);

        file_stream.pipe(browser_response);

        file_stream.on('error', error => {
            debug(`CALIBRATION: ${calibrationId} - preview error:`, error);

            if(!browser_response.headersSent && !browser_response.finished)
                browser_response.redirect('/noise.jpg');
            file_stream.destroy();
        });

    } catch(error) {
        debug(`CALIBRATION: ${browser_request.calibration[service.id]} - preview error:`, error);
        browser_response.status(500).send(error);
    }
});

app.get('/calibration/:calibration.zip', async (browser_request, browser_response) => {
    try {
        const archive = archiver('zip', { store: true });
        const calibrationId = browser_request.calibration[service.id];

        archive.pipe(browser_response);

        const { calibrationPath: parentCalibrationPath } = paths(calibrationsPath, calibrationId.toString());

        const calibrationPath = Path.join(parentCalibrationPath, 'calibration');

        const calibrationFilesJpg = await globby( Path.join(calibrationPath, '*.jpg'));

        const calibrationFilesMkv = await globby( Path.join(calibrationPath, '*.mkv'));

        archive.file( Path.join(parentCalibrationPath, 'calibration.json'), { name: 'calibration.json'} );

        if(!browser_request.query.hasOwnProperty('mkv')) {
            calibrationFilesJpg.forEach( filePath => archive.file( filePath, { name: Path.join('calibration', Path.basename(filePath))}));
        } else {
            calibrationFilesMkv.forEach( filePath => archive.file( filePath, { name: Path.join('calibration', Path.basename(filePath))}));
        }

        archive.on('warning', error => debug(`CALIBRATION: ${calibrationId} - Archive warning:`, error));
        archive.on('error',   error => debug(`CALIBRATION: ${calibrationId} - Archive error:`  , error));

        archive.on('progress', async data => {
            if(data.entries.total==data.entries.processed &&
                data.fs.totalBytes==data.fs.processedBytes) {

                service.patch(calibrationId, { zipDownloaded: true });
            }
        });

        archive.finalize();

    } catch(error) {
        debug(`CALIBRATION: ${browser_request.calibration[service.id]} - archive error:`, error);
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
        debug(`CALIBRATION: ${id} - Error updating failed camera ${value}`, error);
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

                context.data = Object.assign( await defaultCalibration(), { [service.id]: nextId.toString(), }, context.data);
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
