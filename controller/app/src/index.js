const debug = require("debug")("APP");

const config = require("./config");

const multicast = require("./multicast");

const pTimeout = require('p-timeout');
const delay = require('delay');

const app = require("./app.js");
const status = require('./status.js');
const switches = require('./switches.js');
const cameras = require('./cameras.js');
const scans = require('./scans.js');
const calibrations = require('./calibrations.js');
const network = require('./network.js');

const sendCmd = async (args) => {

    const message = Buffer.concat(
        [].concat(args).map(
            arg => Buffer.isBuffer(arg) ? arg : Buffer.from([arg])
        )
    );

    await multicast.send(message, 0, message.length, config.MCAST_CAMERA_COMMAND_PORT, config.MCAST_GROUP_ADDR);
};

const all = Buffer.from('FF:FF:FF:FF:FF:FF');

const bufferFromInt32LE = int32 => { let buf = Buffer.alloc(4); buf.writeInt32LE(int32, 0); return buf; }

// TODO: Build the structures with https://github.com/TooTallNate/ref-struct
const send = {
     ping: async (mac)     => sendCmd([ Buffer.from(mac), 0 ]),
    shoot: async (mac, id) => sendCmd([ Buffer.from(mac), 1, bufferFromInt32LE(id), await config.pack() ]),
    erase: async (mac, id) => sendCmd([ Buffer.from(mac), 2, bufferFromInt32LE(id) ]),
     exec: async (mac, s)  => sendCmd([ Buffer.from(mac), 3, Buffer.from(s), 0 ]),

     pingAll: async ()   => send. ping( all     ),
    shootAll: async (id) => send.shoot( all, id ),
    eraseAll: async (id) => send.erase( all, id ),
     execAll: async (s)  => send. exec( all, s  )
};

const shotsConfig = [
    { name: 'projection', index: '1' },
    { name: 'normal',     index: '2' }
];

const request = require('request');
const eventToPromise = require('event-to-promise');
const fs = require('fs-extra');
const path = require('path');

const defer = require('p-defer');

const configRecordDefer = defer();

let configRecord;

let computer;

app.post("/api/shoot/preview", async (browser_request, browser_response) => {
    debug("Camera preview");
    try {
        await status.service.patch(0, { shooting: true });
        await send.shootAll(0);
        await delay(5*1000);
        await status.service.patch(0, { shooting: false });
        browser_response.status(204).end();
    } catch(error) {
        debug('Error:', error);
        browser_response.status(500).send(error);
    }
});

app.post("/api/shoot/scan", async (browser_request, browser_response) => {

    let scanId;

    try {
        const scan = await scans.service.create({
            config: {
                camera: configRecord.camera
            }
        });
        scanId = scan[scans.service.id];
        browser_response.send({ id: scanId });
        debug(`SCAN: ${scanId} - Start`);
    } catch(error) {
        browser_response.status(500).send(error);
        return;
    }

    try {
        await status.service.patch(0, { shooting: true });
        await send.shootAll(scanId);
        await delay(5*1000);
        await status.service.patch(0, { shooting: false });
    } catch(error) {
        debug(`SCAN: ${scanId} - Error:`, error);
    }
});

const downloadToFile = (url, filePath) => new Promise( async (resolve, reject) => {

    // Use HEAD request to check if the target file exists
    const fileStream = fs.createWriteStream(filePath);
    const httpRequest = request.get(url, {timeout:5*1000});

    httpRequest.on('error', error => {
        fileStream.destroy();
        httpRequest.destroy();
        reject(error);
    });

    fileStream.on('error', error => {
        fileStream.destroy();
        httpRequest.destroy();
        reject(error);
    });

    httpRequest.pause();

    try {

        const [response] = await eventToPromise.multi(httpRequest, ["response"], ["error", "abort"] );

        if(response.statusCode!=200) {
            httpRequest.destroy();
            fileStream.destroy();
            reject(new Error(`Response ${response.statusCode} from ${url}`));
            return;
        }

        httpRequest.pipe(fileStream);
        httpRequest.resume();

        await pTimeout(Promise.all([
            eventToPromise.multi(httpRequest, ["finish", "close", "end", "complete"], ["error", "abort"] ),
            eventToPromise.multi(fileStream,  ["finish", "close"], ["error", "unpipe"] )
        ]), 120*1000, `Timeout downloading ${url}`);

        resolve();

    } catch(error) {
        httpRequest.destroy();
        fileStream.destroy();
        reject(error);
    }
});

app.post("/scan/:scan/download", async (browser_request, browser_response) => {

    const scanId = browser_request.scan[scans.service.id];

    debug(`SCAN: ${scanId} - Downloading scan`);

    try {
        browser_response.status(204).end();

        await status.service.patch(0, { downloading: true });

        await Promise.all(shotsConfig.map( ({ name }) =>
            fs.ensureDir(path.join(config.PATH,`db/${scanId}/${name}/`))
        ));

        await Promise.all( configRecord.scanner.map.map( async (mac, index) => {
            try {
                if(!mac)
                    return;

                const camera = cameras.live[mac];

                if(!camera || !camera.online) {
                    await scans.fail(scanId, index);
                    return;
                }

                await Promise.all(shotsConfig.map( async ({ name, index: cameraFileIndex }) => {

                    try {
                        const fileName = path.join(config.PATH, `/db/${scanId}/${name}/${index}.jpg`);
                        const cameraUrl = `http://${camera.address}/${scanId}-${cameraFileIndex}.jpg`;

                        await downloadToFile(cameraUrl, fileName);
                    } catch(error) {
                        debug(`SCAN: ${scanId} CAMERA: ${index} - error:`, error);

                        await scans.fail(scanId, index);
                    }
                }));

                await send.erase(mac, scanId);
            } catch(error) {
                debug(`SCAN: ${scanId} CAMERA: ${index} - error:`, error);
            }
        }));

        await scans.service.patch(scanId, { done: Date.now() });

        await status.service.patch(0, { downloading: false });

        debug(`SCAN: ${scanId} - done!`);
    } catch(error) {
        await status.service.patch(0, { downloading: false });

        debug(`SCAN: ${scanId} - error:`, error);
    }
});

app.post("/api/shoot/calibration", async (browser_request, browser_response) => {

    let calibrationId;

    try {
        const calibration = await calibrations.service.create({
            config: {
                camera: configRecord.camera
            }
        });
        calibrationId = calibration[calibrations.service.id];
        browser_response.send({ id: calibrationId });
        debug(`CALIBRATION: ${calibrationId} - Start`);
    } catch(error) {
        browser_response.status(500).send(error);
        return;
    }

    try {
        await status.service.patch(0, { shooting: true });
        await send.shootAll(calibrationId);
        await delay(5*1000);
        await status.service.patch(0, { shooting: false });

        await status.service.patch(0, { downloading: true });

        await fs.ensureDir(path.join(config.PATH,`db/${calibrationId}/calibration/`));

        await Promise.all( configRecord.scanner.map.map( async (mac, index) => {
            try {
                if(!mac)
                    return;

                const camera = cameras.live[mac];

                if(!camera || !camera.online) {
                    await calibrations.fail(calibrationId, index);
                    return;
                }

                try {
                    const fileName = path.join(config.PATH, `/db/${calibrationId}/calibration/${index}.jpg`);
                    const cameraUrl = `http://${camera.address}/${calibrationId}-2.jpg`;

                    await downloadToFile(cameraUrl, fileName);
                } catch(error) {
                    debug(`CALIBRATION: ${calibrationId} CAMERA: ${index} - error:`, error);

                    await calibrations.fail(calibrationId, index);
                }

                await send.erase(mac, calibrationId);
            } catch(error) {
                debug(`CALIBRATION: ${calibrationId} CAMERA: ${index} - error:`, error);
            }
        }));

        await calibrations.service.patch(calibrationId, { done: Date.now() });

        await status.service.patch(0, { downloading: false });

        debug(`CALIBRATION: ${calibrationId} - done!`);
    } catch(error) {
        await status.service.patch(0, { downloading: false });

        debug(`CALIBRATION: ${calibrationId} - error:`, error);
    }
});

let discovering = false;

const onMessage = async (message, rinfo) => {
    if(message.length==18) {
        const address = rinfo.address;
        const mac = message.toString("ascii", 0, 17);

        await cameras.update({mac, address, online:true, lastSeen: Date.now() });
    } else if(message.length==500) {
        const camera = Object.values(cameras.live).find( c => c.address==rinfo.address );
        const error = message.toString("ascii", 0, 500);
        // TODO: Log message to external file on the SSD
        if(camera)
            camera.debug(`ERROR: ${error}`);
        else
            debug(`CAMERA ${rinfo.address} - ERROR: ${errror}`);
    } else {
        debug("Received:", message.length, message);
    }
};

const discover = async () => {

    try {
        if(!discovering) {
            discovering = true;

            await computer?.discover();

            discovering = false;
        }
    } catch(error) {
        discovering = false;
        debug("discover:", error);
    }

    try {
        await send.pingAll();
    } catch(error) {
        debug("linking:", error);
    }
}

let run = async () => {

    computer = await new network.computer();

    let discoverInterval;

    await config.initialised.promise;

    config.service.watch().get('0').subscribe(config => { configRecordDefer.resolve(config); configRecord = config; });

    await configRecordDefer.promise;

    try {
        await multicast.client(config.MCAST_CAMERA_REPLY_PORT, config.MCAST_GROUP_ADDR);

        debug("UDP client binded");

        multicast.on("message", onMessage);

        debug("Rediscover existing non-alocated cameras");

        await config.eraseNewCameras();

        debug("Starting camera heartbeat");

        discoverInterval = setInterval(discover, 1000);

        /* Give some time to the get ping response from the working cameras */
        await delay(15000);

        debug("Starting main loop");

        await status.service.patch(0, { operational: true });

        while(true)
            await delay(1*1000);

    } catch(error) {
        debug("Error:", error);
    }
    debug("Quitting");

    clearInterval(discoverInterval);

    server.close();

    process.abort();
}

process.on('unhandledRejection', (reason, promise) => {
    debug('Unhandled rejection at Promise:', promise, 'Reason:', reason);
});

debug("Starting");

/* app.listen() *MUST* be called after all feathers plugins are initialised
 *  * (especialy the authentication ones) to call their setup() methods. */

const server = app.listen(80);

run();
