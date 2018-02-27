#!/usr/bin/env node

const config = require("./config");

const debug = require("debug")("APP");
const multicast = require("./multicast");

const delay = ms => new Promise(res => setTimeout(res, ms))

const app = require("./app.js");
const switches = require('./switches.js');
const cameras = require('./cameras.js');

const sendCmd = async (cmd) => {
    const message = Buffer.from([cmd]);

    await multicast.send(message, 0, message.length, config.MCAST_CAMERA_COMMAND_PORT, config.MCAST_GROUP_ADDR);
};

const send = {
    ping:  () => sendCmd( 0 ),
    shoot: () => sendCmd( 1 )
};

app.post("/api/shoot", async (request, response) => {
    try {
        await send.shoot();
        response.status(204).end();
    } catch(err) {
        response.status(500).send(err);
    }
});

const look = async mac => {
    let list = await cameras.find({query: { id: mac }});
    let camera = list.length ? list[0] : undefined;
    return camera;
};

const onMessage = async (message, rinfo) => {
    const address = rinfo.address;
    const mac = message.toString("ascii", 0, 17);

    let camera = await look(mac);

    if(!camera) {
        debug(`Found new camera MAC:${mac} IP:${address}`);
        camera = await cameras.create({ id: mac });
    }

    if(camera.lastReboot && camera.lastReboot>camera.lastSeen)
        debug(`Reconnecting after reboot on ${camera.interface}:${camera.port} IP:${camera.address}. Boot took ${time.since(camera.lastBoot)} seconds.`);
    else if(time.since(camera.lastSeen).secs()>2)
        debug(`Lost connection to ${camera.interface}:${camera.port} ${camera.address} for ${time.since(camera.lastSeen).secs()} seconds`);

    if(camera.lastReboot && (!camera.lastSeen || camera.lastSeen < camera.lastReboot))
        camera.firstSeen = Date.now();

    camera.lastSeen = Date.now();
    camera.address = address;
    camera.mac = mac;
    camera.online = true;

    await cameras.patch(mac, camera);
};

const doasync = require("doasync");

const ifconfig = doasync(require("wireless-tools/ifconfig"));
const ip = require("ip");
const time = require("time-since");

let tplinks = {};

for(let { interface } of config.SWITCHES)
    tplinks[interface] = require("./tplink")();

// Configure the interface with address
let ipConfiguration = (interface, address) => {
    let range = ip.toBuffer(address).slice( 0, 3 );

    return {
        interface: interface,
        ipv4_address: address,
        ipv4_broadcast: ip.toString([...range, 255]),
        ipv4_subnet_mask: "255.255.255.0"
    };
}

// Configure the interface with address xxx.xxx.xxx.200
let ipConfiguration200 = (interface, address) => {
    let range = ip.toBuffer(address).slice( 0, 3 );

    return {
        interface: interface,
        ipv4_address: ip.toString([...range, 200]),
        ipv4_broadcast: ip.toString([...range, 255]),
        ipv4_subnet_mask: "255.255.255.0"
    };
}

let probeSwitch = async (interface, address) => {

    debug(`Checking switch ${interface} ${address}`);

    await ifconfig.down(interface);
    await ifconfig.up(ipConfiguration200(interface, address));

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

            for(let i=0; i<config.SWITCH_PORTS; i++)
                await device.port(i,"spanning-tree|spanning-tree common-config portfast enable");

            debug("Spanning tree configured");

        }, {
            timeout: 2*60*1000,
            execTimeout: 2*60*1000
        });

        debug(`Changing IP address to ${desiredAddress}`);
        await tplinks[interface].changeIpAddress(defaultAddress, 0, desiredAddress, "255.255.255.0");
        debug("IP address changed");

        await ifconfig.up(ipConfiguration200(interface, desiredAddress));

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

    // Get MAC addresses from the switches
    for(let { interface, switchAddress } of config.SWITCHES) {
        await tplinks[interface].session(switchAddress, async device => {

            let table = await device.portMacTable();

            for(let { port, mac } of table)
                if(await look(mac))
                    await cameras.patch(mac, { interface, switchAddress, port });
        });
    }

    let tasks = [];

    for(let camera of await cameras.find()) {
        let notSeen = !camera.lastSeen || time.since(camera.lastSeen).secs()>10;
        let notRebooted = !camera.lastReboot || time.since(camera.lastReboot).secs()>60;

        if(notSeen && notRebooted) {

            if(camera.lastSeen && !camera.lastReboot)
                debug(`Connection lost on ${camera.interface}:${camera.port} ${camera.address}`);
            else if(camera.lastSeen && camera.lastReboot<camera.lastSeen)
                debug(`Connection lost on ${camera.interface}:${camera.port}. ${time.since(camera.firstSeen).secs()} seconds since first seen`);
            else if(!camera.lastReboot)
                debug(`Discovering camera on ${camera.interface}:${camera.port}`);
            else
                debug(`Powercycle camera on ${camera.interface}:${camera.port}`);

            await cameras.patch(camera.id, { online: false, lastReboot: Date.now() });

            // TODO: Power cycle in parallel
            if(camera.interface && camera.switchAddress && camera.port) {
                debug(`Power cycle ${camera.interface}:${camera.port}`);
                tasks.push(tplinks[camera.interface].session(camera.switchAddress, device => device.powerCycle(camera.port, 4000)));
            }
        }
    }

    await Promise.all(tasks);

    if(!lastReboot || time.since(lastReboot).secs()>60) {
        let tasks = [];

        // get list of all switch ports without detected camera
        for(let {interface, switchAddress} of config.SWITCHES)
            for(let port=0; port < config.SWITCH_PORTS; port++)
                if((await cameras.find({ query: { interface, port } })).length==0) {
                    debug(`Power cycle ${interface}:${port}`);
                    tasks.push(tplinks[interface].session(switchAddress, device => device.powerCycle(port, 4000)));
                }

        await Promise.all(tasks);
        lastReboot = Date.now();
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
    // By default switches are on address 192.168.0.1
    // so we need to have just one ethernet port up to
    // be able to connect to the switch
    debug("Disable all network interfaces");

    for(let { interface } of config.SWITCHES)
        await ifconfig.down(interface);

    debug("Network interfaces are disabled");

    for(let { interface, switchAddress } of config.SWITCHES) {
        if(!await probeSwitch(interface, switchAddress)) {

            if(!await probeSwitch(interface, config.SWITCH_DEFAULT_ADDRESS))
                throw `Can't connect to the switch on port ${interface}`;

            await configure(interface, switchAddress, config.SWITCH_DEFAULT_ADDRESS);
        }

        debug(`Found switch ${interface} ${switchAddress}`);

        await ifconfig.down(interface);

    }

    debug("Enable all network interfaces");

    for(let { interface, hostAddress } of config.SWITCHES)
        await ifconfig.up(ipConfiguration(interface, hostAddress));

    debug("Network interfaces are enabled");
};

let run = async () => {

    try {
        // Probe and configure all switches
        for(let { interface, switchAddress } of config.SWITCHES)
            if(!await tplinks[interface].probe(switchAddress)) {
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

        setInterval(send.ping, 1000);

        /* Give some time to the get ping response from the working cameras */
        await delay(2000);

        debug("Starting main loop");

        while(true)
            await loop();

    } catch(error) {
        console.log("Error:", error);
    }
    debug("Quitting");
}

debug("Starting");

/* app.listen() *MUST* be called after all feathers plugins are initialised
 *  * (especialy the authentication ones) to call their setup() methods. */

app.listen(80);

run();
