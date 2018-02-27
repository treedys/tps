const EventEmitter = require('events');
const eventToPromise = require('event-to-promise');

const config = require("./config");

const debug = require("debug")("interfaces");

const ip = require("ip");

const doasync = require("doasync");
const ifconfig = doasync(require("wireless-tools/ifconfig"));

const netlink = require('netlink-notify');

// Configure the interface with address
let ipConfiguration = (name, address) => ({
    interface: name,
    ipv4_address: address,
    ipv4_broadcast: ip.toString([...ip.toBuffer(address).slice( 0, 3 ), 255]),
    ipv4_subnet_mask: "255.255.255.0"
});

const actionName = (action, name) => action+" "+name;

/* TODO: mutex calls */
class networkInterfaces extends EventEmitter {
    constructor() {
        super();

        this.map = new Map();

        netlink.from.on('route',   data => this.onRoute  (JSON.parse(data)) );
        netlink.from.on('link',    data => this.onLink   (JSON.parse(data)) );
        netlink.from.on('address', data => this.onAddress(JSON.parse(data)) );
        netlink.from.on('error',   data => this.onError  (data) );
    }

    onRoute(data) {
    }

    onLink(data) {
        let networkInterface = this.map.get(data.data.name);

        if(!networkInterface)
            return;

        if(!networkInterface.up && data.data.up) {
            debug(`up ${data.data.name}`);
            networkInterface.up = true;
            this.emit(actionName("up", data.data.name), data);
        }

        if(networkInterface.up && !data.data.up) {
            debug(`down ${data.data.name}`);
            networkInterface.up = false;
            this.emit(actionName("down", data.data.name), data);
        }

        if(!networkInterface.running && data.data.running) {
            debug(`running ${data.data.name}`);
            networkInterface.running = true;
            this.emit(actionName("running", data.data.name), data);
        }

        if(networkInterface.running && !data.data.running) {
            debug(`stopped ${data.data.name}`);
            networkInterface.running = false;
            this.emit(actionName("stopped", data.data.name), data);
        }
    }

    onAddress(data) {
    }

    onError(error) {
        debug("Error:", error);
    }

    async add(name, address) {
        debug("add:", name, address);
        this.map.set(name, { address, up:false, running: false});
        await ifconfig.down(name);
    }

    async address(name, address) {
        const networkInterface = this.map.get(name);
        debug("address:", name, address);
        networkInterface.address = address;

        if(this.isUp(name)) {
            await this.down(name);
            await this.up(name);
        }
    }

    async up(name, address) {

        if(address)
            await this.address(name, address);

        if(this.isDown(name)) {
            const networkInterface = this.map.get(name);
            debug("up:", name, address);
            await Promise.all([
                ifconfig.up(ipConfiguration(name, networkInterface.address)),
                eventToPromise(this, actionName("running", name))
            ]);
            debug("done up:", name, address);
        }
    }

    async down(name) {
        if(this.isUp(name)) {
            const networkInterface = this.map.get(name);
            debug("down:", name);
            await Promise.all([
                ifconfig.down(name),
                eventToPromise(this, actionName("stopped", name))
            ]);
            debug("done down:", name);
        }
    }

    async upAll() {
        debug("upAll");
        await Promise.all(Array.from( this.map.keys(), name => this.up(name) ));
        debug("allUp:");
    }

    async downAll() {
        debug("downAll");
        await Promise.all(Array.from( this.map.keys(), name => this.down(name) ));
        debug("allDown:");
    }

    async upOnly(only, address) {
        debug("upOnly:", only);
        await Promise.all(Array.from( this.map.keys(), name => name==only ? this.up(name, address) : this.down(name) ));
        debug("onlyUp:", only);
    }

    isUp(name) {
        const networkInterface = this.map.get(name);
        return networkInterface.running;
    }

    isDown(name) {
        const networkInterface = this.map.get(name);
        return !networkInterface.running;
    }
}

module.exports = new networkInterfaces();
