const app = require('./app.js');
const config = require('./config');
const memory = require('feathers-memory');
const Path = require('path');
const fs = require('fs-extra');
const archiver = require('archiver');

const debug = require('debug')('scans');

app.use('/api/scans', memory() );

const service = app.service('/api/scans');
const isDirectory = async path => (await fs.stat(path)).isDirectory();

const scansPath = Path.join(config.PATH,'/scans');

const defaultScan = () => ({
    date   : Date.now(),
    name   : "",
    email  : "",
    gender : "male",
    age    : "",

    SKETCHFAB_ENABLE : false,
    bodylabprocess   : false,
    cleanScan        : false,
    closeFit         : false,
    refineHead       : false,
    hands            : "open"
});

app.param('scan', async (browser_request, browser_response, next, id) => {
    try {
        browser_request.scan = await service.get(id);

        if(!browser_request.scan) {
            next(new Error("Wrong scan ID"));
        } else {
            next();
        }
    } catch(error) {
        next(error);
    }
});

app.get('/scan/:scan/preview-:index.jpg', async (browser_request, browser_response) => {
    try {
        const { scanPath } = paths(scansPath, browser_request.scan[service.id]);
        const { preview } = await config.service.get('0');
        const folder = browser_request.params.index == "2" ? "projection" : "normal";
        const fileName = Path.join(scanPath, folder, `${preview}.jpg`);

        const file_stream = fs.createReadStream(fileName);

        file_stream.pipe(browser_response);

        file_stream.on('error', error => {
            if(!browser_response.headersSend && !browser_response.finished)
                browser_response.redirect('/noise.jpg');
            file_stream.destroy();
        });

    } catch(error) {
        browser_response.status(500).send(error);
    }
});

app.get('/scan/:scan.zip', async (browser_request, browser_response) => {
    try {
        var archive = archiver('zip', { store: true });

        archive.pipe(browser_response);

        const { scanPath } = paths(scansPath, browser_request.scan[service.id]);

        archive.directory(scanPath, false);

        archive.on('warning', error => debug('Archive warning:', error));

        archive.on('error', error => debug('Archive error:', error));

        archive.finalize();

    } catch(error) {
        debug('Error:', error);
        browser_response.status(500).send(error);
    }
});

const paths = (path, scanId) => ({
    scanPath: Path.join(path, scanId),
    scanJsonPath: Path.join(Path.join(path, scanId), "scan.json")
});

const populate = async () => {

    try {
        await fs.ensureDir(scansPath);

        let scanIds = await fs.readdir(scansPath);

        await Promise.all(scanIds.map(async scanId => {

            const { scanPath, scanJsonPath } = paths(scansPath, scanId);

            if(await isDirectory(scanPath) && await fs.exists(scanJsonPath)) {

                let scan = JSON.parse(await fs.readFile(scanJsonPath));

                const alreadyExists = await service.find({ query: { [service.id]: scanId } });

                if(alreadyExists.length) {
                    await service.update( scanId, scan );
                } else {
                    await service.create({ ...scan, [service.id]: scanId });
                }
            }
        }));
    } catch(error) {
        debug("Error populating database", error);
    }
}

service.hooks({
    before: {
        create: async context => {
            if(!context.data[service.id]) {

                const directories = await fs.readdir(scansPath);
                const numbers = directories.filter(directory=>!isNaN(directory)).map(directory=>parseInt(directory));
                const next = numbers && numbers.length && Math.max(...numbers)+1 || 1;

                const { scanPath } = paths(scansPath, next.toString());

                await fs.ensureDir(scanPath);

                context.data = Object.assign( defaultScan(), { [service.id]: next.toString(), }, context.data);
            }
        }
    },
    after: {
        create: async context => {
            try {
                const scans = [].concat(context.data);

                await Promise.all(scans.map(async ({ [service.id]:id, ...scan }) => {
                    const { scanJsonPath } = paths(scansPath, id);
                    await fs.outputJson(scanJsonPath, scan);
                }));
            } catch(error) {
                debug("after create", error);
            }
        },
        update: async context => {
            try {
                if(context.id) {
                    const { [service.id]:id, ...scan } = context.data;
                    const { scanJsonPath } = paths(scansPath, id);
                    await fs.outputJson(scanJsonPath, scan);
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
                    const { [service.id]:id, ...scan } = await service.get(context.id);
                    const { scanJsonPath } = paths(scansPath, id);
                    await fs.outputJson(scanJsonPath, scan);
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

                    const { scanPath } = paths(scansPath, id);

                    debug(`Removing  ${scanPath}`);
                    await fs.remove(scanPath);
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

module.exports = service;
