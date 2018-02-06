#!/usr/bin/env node

const debug = require("debug")("APP");
const multicast = require("./multicast");

const delay = ms => new Promise(res => setTimeout(res, ms))

const portsPerSwitch = 48;
const MCAST_GRP = "224.1.1.1";
const MCAST_PORT = 6502;

const sendCmd = async (cmd) => {
    const message = Buffer.from([cmd]);

    await multicast.send(message, 0, message.length, MCAST_PORT, MCAST_GRP);
};

const send = {
    ping:  () => sendCmd( 0 ),
    shoot: () => sendCmd( 1 )
};

const onMessage = (message, rinfo) => {
    const address = rinfo.address;
    const mac = message.toString("ascii", 0, 17);

    if(!cameras[mac]) {
        debug(`Found new camera MAC:${mac} IP:${address}`);
        cameras[mac] = {};
    }

    let camera = cameras[mac];

    if(camera.lastReboot && camera.lastReboot>camera.lastSeen)
        debug(`Reconnecting after reboot on ${camera.interface} port ${camera.port} IP:${camera.address}. Boot took ${time.since(camera.lastBoot)} seconds.`);
    else if(time.since(camera.lastSeen).secs()>2)
        debug(`Lost connection to ${camera.interface} port ${camera.port} ${camera.address} for ${time.since(camera.lastSeen).secs()} seconds`);

    if(camera.lastReboot && (!camera.lastSeen || camera.lastSeen < camera.lastReboot))
        camera.firstSeen = Date.now();

    cameras[mac].lastSeen = Date.now();
    cameras[mac].address = address;
    cameras[mac].mac = mac;
};

const doasync = require("doasync");

const ifconfig = doasync(require("wireless-tools/ifconfig"));
const ip = require("ip");
const time = require("time-since");

const tplink = require("./tplink")();

const defaultSwitchAddress = "192.168.0.1";

const ports = [
    {
        interface: "wan",
        hostAddress: "192.168.201.200",
        switchAddress: "192.168.201.100",
    }, {
        interface: "lan0",
        hostAddress: "192.168.202.200",
        switchAddress: "192.168.202.100"
    }, {
        interface: "lan1",
        hostAddress: "192.168.203.200",
        switchAddress: "192.168.203.100"
    }
];

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

    return await tplink.probe(address);
}

let configure = async (interface, desiredAddress, defaultAddress) => {

    debug(`Starting session to configure switch at ${interface}`);

    await retry(5, async () => {
        await tplink.session(defaultAddress, async device => {
            debug(`Configuring switch at ${interface}`);

            // First get rid of logging messages that mess with the CLI commands execution
            await device.config("no logging monitor|no logging buffer");

            debug("Monitor disabled");

            debug("Configuring spanning tree");

            await device.config("spanning-tree|spanning-tree mode rstp");

            for(let i=0; i<portsPerSwitch; i++)
                await device.port(i,"spanning-tree|spanning-tree common-config portfast enable");

            debug("Spanning tree configured");

        }, {
            timeout: 2*60*1000,
            execTimeout: 2*60*1000
        });

        debug(`Changing IP address to ${desiredAddress}`);
        await tplink.changeIpAddress(defaultAddress, 0, desiredAddress, "255.255.255.0");
        debug("IP address changed");

        await ifconfig.up(ipConfiguration200(interface, desiredAddress));

        await tplink.session(desiredAddress, async device => {
            debug("Updating startup config");
            await device.privileged("copy running-config startup-config");
            debug("Startup config updated");
        });
    });

    debug("Switch configured");
}

let lastReboot;
let cameras = {};

let loop = async () => {
    // Get MAC addresses from the switches
    for(let { interface, switchAddress } of ports) {
        await tplink.session(switchAddress, async device => {

            let table = await device.portMacTable();

            for(let { port, mac } of table)
                if(cameras[mac]) {
                    cameras[mac].interface = interface;
                    cameras[mac].switchAddress = switchAddress;
                    cameras[mac].port = port;
                }
        });
    }

    let tasks = [];

    for(let mac in cameras) {
        let camera = cameras[mac];
        let notSeen = !camera.lastSeen || time.since(camera.lastSeen).secs()>10;
        let notRebooted = !camera.lastReboot || time.since(camera.lastReboot).secs()>60;

        if(notSeen && notRebooted) {

            if(camera.lastSeen && !camera.lastReboot)
                debug(`Connection lost on ${camera.interface} port ${camera.port}.`);
            else if(camera.lastSeen && camera.lastReboot<camera.lastSeen)
                debug(`Connection lost on ${camera.interface} port ${camera.port}. ${time.since(camera.firstSeen).secs()} seconds since first seen`);
            else if(!camera.lastReboot)
                debug(`Discovering camera on ${camera.interface} port ${camera.port}`);
            else
                debug(`Powercycle camera on ${camera.interface} port ${camera.port}`);

            camera.lastReboot = Date.now();

            // TODO: Power cycle in parallel
            debug(`Power cycle ${camera.interface}:${camera.port}`);
            tasks.push(tplink.session(camera.switchAddress, device => device.powerCycle(camera.port, 4000)));
        }
    }

    await Promise.all(tasks);

    if(!lastReboot || time.since(lastReboot).secs()>60) {
        let tasks = [];

        // get list of all switch ports without detected camera
        for(let {interface, switchAddress} of ports) {
            for(let port=0; port < portsPerSwitch; port++) {
                let cameraPresent = false;
                for(let mac in cameras) {
                    if(cameras[mac].interface==interface && cameras[mac].port==port)
                        cameraPresent = true;
                }
                if(!cameraPresent) {
                    debug(`Power cycle ${interface}:${port}`);
                    tasks.push(tplink.session(switchAddress, device => device.powerCycle(port, 4000)));
                }
            }
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

    for(let port of ports)
        await ifconfig.down(port.interface);

    debug("Network interfaces are disabled");

    for(let port of ports) {
        if(!await probeSwitch(port.interface, port.switchAddress)) {

            if(!await probeSwitch(port.interface, defaultSwitchAddress))
                throw `Can't connect to the switch on port ${port.interface}`;

            await configure(port.interface, port.switchAddress, defaultSwitchAddress);
        }

        debug(`Found switch ${port.interface} ${port.switchAddress}`);

        await ifconfig.down(port.interface);

    }

    debug("Enable all network interfaces");

    for(let port of ports)
        await ifconfig.up(ipConfiguration(port.interface, port.hostAddress));

    debug("Network interfaces are enabled");
};

let run = async () => {

    try {
        // Probe and configure all switches
        for(let port of ports)
            if(!await tplink.probe(port.switchAddress)) {
                await configureAllSwitches();
                break;
            }

        debug("UDP binding");

        for(let port of ports)
            await multicast.server(MCAST_PORT, port.hostAddress);

        debug("UDP server binded");

        await multicast.client(6501, MCAST_GRP);

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
run();

const app = require("./app.js");

/* app.listen() *MUST* be called after all feathers plugins are initialised
 *  * (especialy the authentication ones) to call their setup() methods. */
app.listen(80);
