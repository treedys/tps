const EventEmitter = require('events');
const eventToPromise = require('event-to-promise');

const debug = require("debug")("INTERFACES");
const nmDebug = require("debug")("NM");

const ip = require("ip");
const { promisify } = require('util');

const pify = require('pify');
const ipLink = pify(require('iproute').link);
const ipAddress = pify(require('iproute').address);

const netlink = require('netlink-notify');
const dnm = require('dbus-network-manager');

const actionName = () => Array.prototype.join.call(arguments,'_');

class networkInterfaces extends EventEmitter {
    constructor() {
        super();

        return this.asyncConstructor();
    }

    async asyncConstructor() {

        this.nm = await dnm.connect();

        this.nm.on('DeviceAdded', dev => nmDebug(`Device added: ${dev}`));
        this.nm.on('DeviceRemoved', dev=> nmDebug(`Device removed: ${dev}`));

        for(let device of await this.nm.GetDevices()) {

            const properties = await device.getProperties();

            device.on('StateChanged', (newState, oldState, reason) => nmDebug(`State changed: ${properties.Interface} ${oldState} ${newState} ${reason}`));
        }

        this.interfaces = (await ipLink.show() ).reduce( (result, { name, flags, mac }) => ({ ...result, [name]: { name, up:flags.includes('UP'), running:flags.includes('LOWER_UP'), mac } }), {});

        debug(this.interfaces);

        netlink?.from.on('route',   data => this.onRoute  (JSON.parse(data)) );
        netlink?.from.on('link',    data => this.onLink   (JSON.parse(data)) );
        netlink?.from.on('address', data => this.onAddress(JSON.parse(data)) );
        netlink?.from.on('error',   data => this.onError  (data) );

        return this;
    }

    listAll() {
        return this.interfaces;
    }

    onRoute(data) {
        debug(`netlink-notify.route:`, data);
        this.emit(actionName('route', data.data.addr.oif, data.event, data.data.type, data.data.addr.dst));
    }

    onLink(data) {

        debug('netlink-notify.link:', data);

        const name = data?.data?.name;
        const up = data?.data?.up;
        const running = data?.data?.running;

        if(this.interfaces[name]?.up != up) {
            this.interfaces[name].up = up;
            this.emit(actionName(up?"up":"down", name));
        }

        if(this.interfaces[name]?.running != running) {
            this.interfaces[name].running = running;
            this.emit(actionName(running?"running":"stopped", name));
        }
    }

    onAddress(data) {
        debug(`netlink-notify.address:`, data);
    }

    onError(error) {
        debug(`netlink-notify.error:`, data);
    }

    async clean(name) {
        await Promise.all(
            (await ipAddress.show({ dev:name }))[name]
            .filter( ({type}) => type=="inet" )
            .map( ({address}) => Promise.all([
                netlink && eventToPromise(this, actionName('route', name, 'delete', 'local', address)),
                // address is already reported with /24 sufix which breaks this.unroute
                ipAddress.delete({ dev:name, address })
            ]) ));
    }

    async route(name, address) {
        debug(`route: ${name} at ${address}`);

        try {
            await Promise.all([
                netlink && eventToPromise(this, actionName('route', name, 'new', 'local', address)),
                ipAddress.add({ dev:name, scope:'global', local: `${address}/24` })
            ]);
        } catch (error) {
            debug(`route:`, error);
        }
    }

    async unroute(name, address) {
        debug(`unroute: ${name} at ${address}`);

        try {
            await Promise.all([
                netlink && eventToPromise(this, actionName('route', name, 'delete', 'local', address)),
                ipAddress.delete({ dev:name, address: `${address}/24` })
            ]);
        } catch (error) {
            debug(`unroute:`, error);
        }
    }

    async up(name) {

        if(!this.isUp(name)) {
            debug(`up: ${name}`);
            await Promise.all([
                netlink && eventToPromise(this, actionName("up", name)),
                ipLink.set({ dev:name, state:'up' })
            ]);
            debug(`up: ${name} - done`);
        }
    }

    async down(name) {
        if(this.isUp(name)) {
            debug(`down: ${name}`);
            await Promise.all([
                netlink && eventToPromise(this, actionName("stopped", name)),
                ipLink.set({ dev:name, state:'down' })
            ]);
            debug(`down: ${name} - done`);
        }
    }

    isRunning(name) {
        return this.interfaces[name].running;
    }

    isUp(name) {
        return this.interfaces[name].up;
    }
}

module.exports = networkInterfaces;
