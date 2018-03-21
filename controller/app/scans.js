const app = require('./app.js');
const memory = require('feathers-memory');
const Path = require('path');
const fs = require('fs-extra');

const debug = require('debug')('scans');

const PATH = '/disk/sda1/db/';

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

app.get('/scan/:scan/preview.jpg', async (browser_request, browser_response) => {
    try {
        const file_stream = fs.createReadStream(browser_request.scan.icon);

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
                    await service.update( scanId, {
                        ...scan,
                        "icon": Path.join(scanPath,"normal/176.jpg"),
                        "path": scanJsonPath
                    });
                } else {
                    await service.create({
                        ...scan,

                        [service.id]: scanId,
                        "icon": Path.join(scanPath,"normal/176.jpg"),
                        "path": scanJsonPath
                    });
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

                const directories = await fs.readdir(PATH);
                const numbers = directories.filter(directory=>!isNaN(directory)).map(directory=>parseInt(directory));
                const next = numbers && numbers.length && Math.max(...numbers)+1 || 1;

                const { scanPath, scanJsonPath } = paths(PATH, next.toString());

                await fs.ensureDir(scanPath);

                context.data = Object.assign(
                    defaultScan(),
                    {
                        [service.id]: next.toString(),
                        path: scanJsonPath,
                        icon: Path.join(scanPath,"normal/176.jpg")
                    },
                    context.data
                );
            }
        }
    },
    after: {
        create: async context => {
            const scans = [].concat(context.data);

            await Promise.all(scans.map(async ({ [service.id]:id, path, icon, ...scan }) => {
                await fs.outputJson(path, scan);
            }));
        },
        update: async context => {
            if(context.id) {
                const { [service.id]:id, path, icon, ...scan } = context.data;
                await fs.outputJson(path, scan);
            } else {
                debug("unsupported update", context.data);
            }
        },
        patch: async context => {
            if(context.id) {
                const { [service.id]:id, path, icon, ...scan } = await service.get(context.id);
                await fs.outputJson(path, scan);
            } else {
                debug("unsupported patch", context.data);
            }
        },
        remove: context => {
            debug("unsupported remove:", context);
        }
    }
});

populate(PATH);

module.exports = service;
