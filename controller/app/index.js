#!/usr/bin/env node

const config = require("./config");

const debug = require("debug")("APP");
const multicast = require("./multicast");

const pTimeout = require('p-timeout');
const delay = ms => new Promise(res => setTimeout(res, ms))

const app = require("./app.js");
const status = require('./status.js');
const switches = require('./switches.js');
const cameraService = require('./cameras.js');
const scans = require('./scans.js');

const cameras = {};

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

const cameraIndex = camera => {
    const ipAddress = ip.toBuffer(camera.address);

    return (ipAddress[2]-201)*50+camera.port;
}

app.post("/api/preview", async (browse_requet, browser_response) => {
    try {
        await status.patch(0, { shooting: true });
        await send.shootAll(0);
        await delay(5*1000);
        await status.patch(0, { shooting: false });
        browser_response.status(204).end();
    } catch(err) {
        browser_response.status(500).send(err);
    }
});

app.post("/api/shoot", async (browser_request, browser_response) => {

    let scanId;

    try {
        const scan = await scans.create({});
        scanId = scan[scans.id];
        browser_response.send({ id: scanId });
        debug(`Start scan ${scanId}`);
    } catch(err) {
        browser_response.status(500).send(err);
        return;
    }

    try {
        await status.patch(0, { shooting: true });
        await send.shootAll(scanId);
        await delay(5*1000);
        await status.patch(0, { shooting: false });

        await Promise.all(shotsConfig.map( ({ name }) =>
            fs.ensureDir(path.join(config.PATH,`db/${scanId}/${name}/`))
        ));

        await Promise.all(Object.entries(cameras).map( async ([mac, camera]) => {
            try {
                const index = cameraIndex(camera);

                if(isNaN(index)) {
                    debug("NaN:",mac, camera);
                    return;
                }

                debug(`Start ${index}`);

                await Promise.all(shotsConfig.map( async ({ name, index: cameraFileIndex }) => {

                    // Use HEAD request to check if the target jpg file exists

                    const fileName = `/db/${scanId}/${name}/${index}.jpg`;

                    const file_stream = fs.createWriteStream(path.join(config.PATH, fileName));
                    const camera_request = request.get(`http://${camera.address}/${scanId}-${cameraFileIndex}.jpg`);

                    camera_request.pipe(file_stream);

                    await pTimeout(Promise.all([
                        eventToPromise.multi(camera_request, ["finish", "close", "end", "complete"], ["error", "abort"] ),
                        eventToPromise.multi(file_stream,    ["finish", "close"], ["error", "unpipe"] )
                    ]), 120*1000, `Timeout downloading ${fileName}`);

                }));

                await send.erase(mac, scanId);

                debug(`Done ${index}`);
            } catch(error) {
                debug(error);
            }
        }));

        debug(`Done scan ${scanId}`);

        await scans.patch(scanId, { done: Date.now() });

    } catch(error) {
        debug(error);
    }
});

app.post("/api/cameras/restart", async (browser_request, browser_response) => {
    try {
        let switchTasks = [];

        await status.patch(0, { restarting: true });

        for(let {interface, switchAddress} of config.SWITCHES) {
            switchTasks.push(tplinks[interface].session(switchAddress, async device => {

                let tasks = [];

                for(let port=0; port < config.SWITCH_PORTS; port++) {
                    debug(`Forced power cycle ${interface}:${port}`);
                    tasks.push(device.powerCycle(port, 4000));
                }
                await Promise.all(tasks);
            }));
        }

        await Promise.all(switchTasks);

        lastReboot = Date.now();

        await status.patch(0, { restarting: false });

        browser_response.status(204).end();

    } catch(err) {
        await status.patch(0, { restarting: false });
        browser_response.status(500).send(err);
    }
});

let discovered = 0;
let linked = 0;
let linking = false;

const onMessage = async (message, rinfo) => {
    if(message.length==18) {
        const address = rinfo.address;
        const mac = message.toString("ascii", 0, 17);

        if(!cameras[mac]) {
            debug(`Found new ${mac} ${address}`);
            cameras[mac] = { address, online:true, lastSeen: Date.now() };
            await cameraService.create({ id: mac, address, mac, online:true });

            discovered++;
        } else if(cameras[mac].address != address || !cameras[mac].online) {
            debug(`Recovering ${cameras[mac].interface}:${cameras[mac].port} ${address}`);
            cameras[mac] = { ...cameras[mac], address, online: true };
            await cameraService.patch(mac, { address, online: true });
        }

        cameras[mac].lastSeen = Date.now();
    } else if(message.length==500) {
        // TODO: Log message to external file on the SSD
        debug(message.toString("ascii", 0, 500));
    } else {
        debug("Received:", message.length, message);
    }
};

const link = async () => {
    // Get MAC addresses from the switches
    for(let { interface, switchAddress } of config.SWITCHES) {
        await tplinks[interface].session(switchAddress, async device => {

            let table = await device.portMacTable();

            for(let { port, mac } of table)
                if(cameras[mac])
                    if( cameras[mac].interface     != interface     ||
                        cameras[mac].switchAddress != switchAddress ||
                        cameras[mac].port          != port ) {

                        debug(`Linking ${interface}:${port} to ${cameras[mac].address}`);

                        cameras[mac] = { ...cameras[mac], interface, switchAddress, port };
                        await cameraService.patch(mac, { interface, switchAddress, port });

                        linked++;
                    }
        });
    }
}

const discover = async () => {

    await send.pingAll();

    if(discovered != linked && !linking) {
        linking = true;

        try { await link() } catch(error) { debug("Link:", error); }

        linking = false;
    }
}

const interfaces = require('./interfaces.js');

const ip = require("ip");
const time = require("time-since");
const Bottleneck = require("bottleneck");

const bootLimiter = new Bottleneck({ maxConcurrent: 10 });
//bootLimiter.on('debug', (msg, data) => debug("BOTTLENECK:", msg, data));

const powerCycle = async (sw, address, port) => {
    await sw.session( address, device => device.powerDisable(port) );
    await delay(  3*1000 );
    await sw.session( address, device => device.powerEnable(port) );
    await delay( 30*1000 );
}

let tplinks = {};

for(let { interface } of config.SWITCHES)
    tplinks[interface] = require("./tplink")();

const addressEnd = (address, end) => ip.toString( [...ip.toBuffer(address).slice(0, 3), end] );

let probeSwitch = async (interface, address) => {

    debug(`Checking switch ${interface} ${address}`);

    await interfaces.upOnly(interface, addressEnd(address, 200));

    return await tplinks[interface].probe(address, {
        timeout: 1*60*1000,
        execTimeout: 1*60*1000
    });
}

let configure = async (interface, desiredAddress, defaultAddress) => {

    debug(`Starting session to configure switch at ${interface}`);

    await retry(5, async () => {
        await tplinks[interface].session(defaultAddress, async device => {
            debug(`Configuring switch at ${interface}`);

            // First get rid of logging messages that mess with the CLI commands execution
            await device.config("no logging monitor|no logging buffer");

            debug("Monitor disabled");

            debug("Configuring spanning tree");

            await device.config("spanning-tree|spanning-tree mode rstp");

            for(let port=0; port<config.SWITCH_PORTS; port++)
                await device.port(port, "spanning-tree|spanning-tree common-config portfast enable");

            debug("Spanning tree configured");

            debug("Configuring PoE");

            for(let port=0; port<config.SWITCH_PORTS; port++)
                await device.powerDisable(port);

            debug("PoE configured");
        }, {
            timeout: 2*60*1000,
            execTimeout: 2*60*1000
        });

        debug(`Changing IP address to ${desiredAddress}`);
        await tplinks[interface].changeIpAddress(defaultAddress, 0, desiredAddress, "255.255.255.0");
        debug("IP address changed");

        await interfaces.address(interface, addressEnd( desiredAddress, 200 ));

        await tplinks[interface].session(desiredAddress, async device => {
            debug("Updating startup config");
            await device.privileged("copy running-config startup-config");
            debug("Startup config updated");
        });
    });

    debug("Switch configured");
}

let lastReboot;

let loop = async () => {

    let tasks = [];

    for(let mac in cameras) {

        let camera = cameras[mac];

        let notSeen     = !camera.lastSeen   || time.since(camera.lastSeen  ).secs()>10;
        let notRebooted = !camera.lastReboot || time.since(camera.lastReboot).secs()>60;

        if(camera.online && notSeen) {

            debug(`Lost connection to ${camera.interface}:${camera.port} ${camera.address}`);

            camera.online = false;

            tasks.push(
                cameraService.patch(mac, { online: false })
            );
        }

        if(notSeen && notRebooted) {

            if(camera.interface && camera.switchAddress && camera.port)
                tasks.push( bootLimiter.schedule( async () => {
                    await powerCycle(tplinks[camera.interface], camera.switchAddress, camera.port );
                    camera.lastReboot = Date.now();
                }));
        }
    }

    await Promise.all(tasks);

    if(!lastReboot || time.since(lastReboot).secs()>60) {

        await status.patch(0, { restarting: true });

        let tasks = [];

        for(let {interface, switchAddress} of config.SWITCHES)
            for(let port=0; port < config.SWITCH_PORTS; port++)
                if(!Object.values(cameras).find(camera => camera.interface==interface && camera.port==port)) {
                    tasks.push( bootLimiter.schedule( () => powerCycle(tplinks[interface], switchAddress, port )));
                }

        await Promise.all(tasks);

        lastReboot = Date.now();

        await status.patch(0, { restarting: false });
    } else if(!tasks.length) {
        await delay(1000);
    }
}

let retry = async (maxRetries, callback) => {

    let lastError = undefined;

    for(let retries=0; retries<maxRetries; retries++) {
        try {
            return await callback();
        } catch(error) {
            lastError = error;
        }
    }

    throw lastError;
};

let configureAllSwitches = async () => {

    for(let { interface, switchAddress } of config.SWITCHES) {
        if(!await probeSwitch(interface, switchAddress)) {

            if(!await probeSwitch(interface, config.SWITCH_DEFAULT_ADDRESS))
                throw `Can't connect to the switch on port ${interface}`;

            await configure(interface, switchAddress, config.SWITCH_DEFAULT_ADDRESS);
        }

        debug(`Found switch ${interface} ${switchAddress}`);
    }

    debug("Enable all network interfaces");

    await Promise.all(config.SWITCHES.map(
        ({ interface, hostAddress }) => interfaces.up(interface, hostAddress)
    ));

    debug("Network interfaces are enabled");
};

let run = async () => {

    let discoverInterval;

    try {
        // Prepare network interfaces
        await Promise.all(config.SWITCHES.map(
            ({ interface, hostAddress }) => interfaces.add(interface, hostAddress)
        ));

        await Promise.all(config.SWITCHES.map(
            ({ interface }) => interfaces.up(interface)
        ));

        // Probe and configure all switches
        debug("Detecting switches.");

        for(let { interface, switchAddress } of config.SWITCHES)
            if(!await tplinks[interface].probe(switchAddress)) {
                debug(`Can't find switch ${switchAddress}`);
                await configureAllSwitches();
                break;
            }

        debug("UDP binding");

        for(let { hostAddress } of config.SWITCHES)
            await multicast.server(config.MCAST_CAMERA_COMMAND_PORT, hostAddress);

        debug("UDP server binded");

        await multicast.client(config.MCAST_CAMERA_REPLY_PORT, config.MCAST_GROUP_ADDR);

        debug("UDP client binded");

        multicast.on("message", onMessage);

        debug("Starting camera heartbeat");

        discoverInterval = setInterval(discover, 1000);

        /* Give some time to the get ping response from the working cameras */
        await delay(15000);

        debug("Starting main loop");

        while(true)
            await loop();

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
