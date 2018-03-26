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
    } catch(err) {
        next(err);
    }
});

app.get('/scan/:scan/preview-:index.jpg', async (browser_request, browser_response) => {
    try {
        const { scanPath } = paths(Path.join(config.PATH,'/db'), browser_request.scan[service.id]);
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

    } catch(err) {
        browser_response.status(500).send(err);
    }
});

app.get('/scan/:scan.zip', async (browser_request, browser_response) => {
    try {
        var archive = archiver('zip', { store: true });

        archive.pipe(browser_response);

        const { scanPath } = paths(Path.join(config.PATH,'/db'), browser_request.scan[service.id]);

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

const populate = async (path) => {

    try {
        await fs.ensureDir(path);

        let directories = await fs.readdir(path);

        await Promise.all(directories.map(async scanId => {

            const { scanPath, scanJsonPath } = paths(path, scanId);

            if(await isDirectory(scanPath) && await fs.exists(scanJsonPath)) {
                let scan = JSON.parse(await fs.readFile(scanJsonPath));

                const exists = await service.find({ query: { [service.id]: scanId } });

                if(exists.length) {
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

                const directories = await fs.readdir(Path.join(config.PATH,'/db'));
                const numbers = directories.filter(directory=>!isNaN(directory)).map(directory=>parseInt(directory));
                const next = numbers && numbers.length && Math.max(...numbers)+1 || 1;

                const { scanPath, scanJsonPath } = paths(Path.join(config.PATH,'/db'), next.toString());

                await fs.ensureDir(scanPath);

                context.data = Object.assign( defaultScan(), { [service.id]: next.toString(), }, context.data);
            }
        }
    },
    after: {
        create: async context => {
            const scans = [].concat(context.data);

            await Promise.all(scans.map(async ({ [service.id]:id, ...scan }) => {
                const { scanJsonPath } = paths(Path.join(config.PATH,'/db'), id);
                await fs.outputJson(scanJsonPath, scan);
            }));
        },
        update: async context => {
            if(context.id) {
                const { [service.id]:id, ...scan } = context.data;
                const { scanJsonPath } = paths(Path.join(config.PATH,'/db'), id);
                await fs.outputJson(scanJsonPath, scan);
            } else {
                debug("unsupported update", context.data);
            }
        },
        patch: async context => {
            if(context.id) {
                const { [service.id]:id, ...scan } = await service.get(context.id);
                const { scanJsonPath } = paths(Path.join(config.PATH,'/db'), id);
                await fs.outputJson(scanJsonPath, scan);
            } else {
                debug("unsupported patch", context.data);
            }
        },
        remove: context => {
            debug("unsupported remove:", context);
        }
    }
});

populate(Path.join(config.PATH,'/db'));

module.exports = service;
