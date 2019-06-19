const ip = require("ip");
const rwlock = require("async-rwlock").RWLock;
const delay = require('delay');
const time = require("time-since");
const ipRangeCheck = require('ip-range-check');

const debug = require('debug')('NETWORK');

const config = require('./config.js');
const interfaces = require('./interfaces.js');
const dnsmasq = require('./dnsmasq.js');
const cameras = require('./cameras.js');

class computer {

    constructor() {
        this.ports = [];
        this.ipSubnetLocks = {};
        this.debug = debug/*.extend('computer')*/;

        return this.asyncConstructor();
    }

    async asyncConstructor() {

        this.interfaces = await new interfaces();

        this.ports = Object.values(this.interfaces.listAll())
            .filter( ({ name }) => !(name=="lo" || name=="eno1" || name=="eth0" || name.startsWith("usb") || name.startsWith("dummy") || name.startsWith("rndis") || name.startsWith("l4t")) )
            .map( ({ name, mac }, index) => ({
                index,
                name,
                mac,
                pcAddress: ip.toString([ 192, 168, 201+index, 200 ]),
                ipSubnet: ip.subnet(this.portAddress(index), "255.255.255.0")
            }) );

        await Promise.all(this.ports.map( port => this.interfaces.up(port.name) ));
        await Promise.all(this.ports.map( async port => {

            await this.interfaces.clean(port.name);

            await this.interfaces.route(port.name, port.pcAddress);
        }));

        this.debug('Initialised');

        return this;
    }

    async discover() {
        let changed = false;

        this.ports = await Promise.all(this.ports.map( async port => {
            try {
                if(!this.interfaces.isRunning(port.name) && !port.switch) {
                    return port;
                }

                if(port.switch) {
                    if(port.switch.tplink?.connection?.getConnection()?.destroyed) {
                        port.switch.debug('Switch disconnected');
                        await portswitch.close();
                        portswitch = undefined;
                        changed = true;
                    }

                    if(!(this.interfaces.isRunning(port.name) && await tplink.probe(this.portAddress(port.index)))) {
                        port.switch.debug('Switch gone');
                        await port.switch.close();
                        port.switch = undefined;
                        changed = true;
                    }
                }

                if(!port.switch) {
                    if(await this.routeOnly(port.index, this.portAddress(port.index), async () => await tplink.probe(this.portAddress(port.index), { timeout: 10*1000 }))) {
                        this.debug(`${port.name}: Discovered configured switch`);
                        port.switch = await new tplink(this, port.index);
                        if(port.switch) {
                            changed = true;
                        }
                    }
                }

                if(!port.switch) {
                    if(await this.routeOnly(port.index, config.SWITCH_DEFAULT_ADDRESS, async () => await tplink.probe(config.SWITCH_DEFAULT_ADDRESS, { timeout: 10*1000 }))) {
                        this.debug(`${port.name}: Discovered factory default switch`);
                        if(await tplink.configure(this, port.index, this.portAddress(port.index))) {
                            port.switch = await new tplink(this, port.index);
                            if(port.switch) {
                                changed = true;
                            }
                        }
                    }
                }
            } catch(error) {
                this.debug(`${port.name}: Discover error:`, error);
            }

            return port;
        }));

        // dnsmasq must work before child switches are discovered to provide tftp for network boot and firmware upgrade
        if(changed)
            dnsmasq(this.ports.filter(port => port.switch).map(port => ({
                interface: port.name,
                start:     ip.toString([ 192, 168, 201+port.index,   1 ]),
                end:       ip.toString([ 192, 168, 201+port.index, 199 ])
            }) ));

        await Promise.all(this.ports.filter(port => port.switch).map(async port => {
            try {
                await port.switch.discover();
            } catch(error) {
                port.switch.debug('Discover error:', error);
            }
        }));
    }

    ipSubnet(ipAddress) {
        const ipSubnet = ip.subnet(ipAddress, "255.255.255.0");

        if(!this.ipSubnetLocks[ipSubnet.networkAddress])
            this.ipSubnetLocks[ipSubnet.networkAddress] = new rwlock();

        return ipSubnet;
    }

    async routeOnly(portIndex, ipAddress, handler) {
        const ipSubnet = this.ipSubnet(ipAddress);

        await this.ipSubnetLocks[ipSubnet.networkAddress].writeLock();

        try {
            if(!this.ports[portIndex].ipSubnet.contains(ipAddress))
                await this.interfaces.route(this.ports[portIndex].name, ipSubnet.lastAddress);

            const result = await handler();

            if(!this.ports[portIndex].ipSubnet.contains(ipAddress))
                await this.interfaces.unroute(this.ports[portIndex].name, ipSubnet.lastAddress);

            this.ipSubnetLocks[ipSubnet.networkAddress].unlock();
            return result;
        } catch(error) {
            this.ipSubnetLocks[ipSubnet.networkAddress].unlock();
            throw error;
        }
    }

    async route(portIndex, ipAddress, handler) {

        const ipSubnet = this.ipSubnet(ipAddress);

        await this.ipSubnetLocks[ipSubnet.networkAddress].readLock();

        try {
            if(!this.ports[portIndex].ipSubnet.contains(ipAddress))
                await this.interfaces.route(this.ports[portIndex].name, ipSubnet.lastAddress);

            const result = await handler();

            if(!this.ports[portIndex].ipSubnet.contains(ipAddress))
                await this.interfaces.unroute(this.ports[portIndex].name, ipSubnet.lastAddress);

            this.ipSubnetLocks[ipSubnet.networkAddress].unlock();
            return result;
        } catch(error) {
            this.ipSubnetLocks[ipSubnet.networkAddress].unlock();
            throw error;
        }
    }

    get numberOfPorts() {
        return this.ports.length;
    }

    isSystemPort(portIndex) {
        return this.ports[portIndex].isSystemPort;
    }

    portName(portIndex) {
        return this.ports[portIndex].name;
    }

    portAddress(portIndex) {
        return ip.toString( [ 192, 168, 201+portIndex, 201 ] );
    }

    ipRange(portIndex) {
        return `192.168.${201+portIndex}.0/24`;
    }

    mac(portIndex) {
        return this.ports[portIndex].mac;
    }
};

class tplink {

    constructor(parentSwitch, parentPort) {
        this.parentSwitch = parentSwitch;
        this.parentPort   = parentPort;
        this.tplink       = require('./tplink')();
        this.routeLock    = new rwlock();
        this.ports        = [];

        this.debug = parentSwitch.debug.extend(this.switchName);

        return this.asyncConstructor();
    }

    async asyncConstructor() {

        try {
            await this.parentSwitch.route(this.parentPort, this.switchAddress, async () => {
                await this.tplink.session(this.switchAddress, async device => {

                    const systemInfo = await device.systemInfo();

                    const { groups: { ports, sfp } }              = systemInfo['System Description'].match(/JetStream (?<ports>[0-9]+)-Port .* with (?<sfp>[0-9]+) SFP Slots/);
                    const { groups: { model, ports:totalPorts } } = systemInfo['System Name'       ].match(/(?<model>[A-Z0-9]+)-(?<ports>[0-9]+)[A-Z]+/);

                    this.numberOfPorts = Number(ports);

                    // FIXME: Reboot the switch if it is online more than 24h

                    await device.enableAll([], this.numberOfPorts);

                    this.uplinkPort = Number(await this.findMacPort( this.parentSwitch.mac(this.parentPort), device ));

                    await device.port(this.uplinkPort, 'speed auto');

                    // Create an empty array for all ports
                    this.ports = Array(this.numberOfPorts).fill(null).map( (o,index) => ({ port:index })  );

                    await Promise.all(this.ports.map( async ({port}) => {
                        try {
                            await device.powerEnable(port);
                            this.ports[port].lastPowerCycle = Date.now();
                        } catch(error) {
                            this.debug(`${port}: Power up error:`, error);
                        }
                    }));

                    // Give some time to PoE to power up
                    await delay(2*1000);

                    this.debug(`Created ${model}-${ports} at ${this.switchAddress} Uplink port ${this.uplinkPort}`);
                });
            });

            return this;
        } catch(error) {
            this.debug('asyncConstructor error:', error);
            return undefined;
        }
    }

    async close() {
        this.ports = Promise.all(this.ports.map( async ({switch:_switch, camera, ...port }, index) => {
            try {
                await _switch?.close();
                // FIXME:   camera?.close();
                if(camera) {
                    camera.debug('Camera gone');
                    await cameras.update({ mac: camera.mac, online: false, switch: undefined, switchName:undefined, port: undefined});
                }
            } catch(error) {
                this.debug(`${index}: Close error: `, error);
            }
            return port;
        }));

        this.debug('Closed');

        this.parentSwitch = undefined;
        this.parentPort = undefined;
    }

    static async probe(ipAddress, options) {
        return await require('./tplink')().probe(ipAddress, options);
    }

    async discover() {
        let unknownPortList = [];
        let knownPortList = [];
        let cameraPortList = [];
        let powerCyclePortList = [];
        let defaultPortList = [];
        let emptyPortList = [];

        // First quickly check if there are any ports to be discovered
        await this.parentSwitch.route(this.parentPort, this.switchAddress, async () => {
            await this.tplink.session(this.switchAddress, async device => {

                const portStatus = await device.portStatus();
                const powerStatus = await device.powerStatus();

                await Promise.all([...Array(this.numberOfPorts).keys()].map( async port => {
                    // Checking for switch on the uplink, offline, PoE or already known port is meaningless
                    try {
                        if(port==this.uplinkPort)
                            return;

                        if(portStatus[port].online && powerStatus[port].PoE && !this.ports[port].switch && !this.ports[port].camera)
                            cameraPortList.push(port);

                        if(portStatus[port].online && !powerStatus[port].PoE && !this.ports[port].switch && !this.ports[port].camera)
                            unknownPortList.push(port);

                        if(this.ports[port].switch?.tplink?.connection?.getConnection()?.destroyed) {
                            this.debug(`${port}: Switch disconnected`);
                            await this.ports[port].switch.close();
                            this.ports[port].switch = undefined;
                        }

                        if(this.ports[port].switch && !(portStatus[port].online && await tplink.probe(this.portAddress(port)))) {
                            this.debug(`${port}: Switch gone`);
                            await this.ports[port].switch.close();
                            this.ports[port].switch = undefined;
                        }

                        if(this.ports[port].camera && !powerStatus[port].PoE) {
                            this.debug(`${port}: Camera gone. PoE off`);

                            await cameras.update({ mac: this.ports[port].camera.mac, online: false, switch: undefined, switchName:undefined, port: undefined});
                            this.ports[port].camera = undefined;
                        }

                        if(this.ports[port].camera?.online && time.since(this.ports[port].camera.lastSeen).secs()>2*60) {
                            this.debug(`${port}: Camera gone. Last seen ${time.since(this.ports[port].camera.lastSeen).secs()}s ago.`);

                            powerCyclePortList.push(port);

                            await cameras.update({ mac: this.ports[port].camera.mac, online: false, switch: undefined, switchName:undefined, port: undefined});
                            this.ports[port].camera = undefined;
                        }

                        if(powerStatus[port].PoE && !this.ports[port].camera?.online && time.since(this.ports[port].lastPowerCycle).secs()>2*60) {
                            this.debug(`${port}: Time to power cycle. Last power cycle ${time.since(this.ports[port].lastPowerCycle).secs()}s ago.`);

                            powerCyclePortList.push(port);
                        }

                        if(powerStatus[port].PoE && this.ports[port].camera?.online && !ipRangeCheck(this.ports[port].camera?.address, this.ipRange(port)) && time.since(this.ports[port].lastPowerCycle).secs()>2*60) {
                            this.debug(`${port}: IP address (${this.ports[port].camera?.address}) not in range (${this.ipRange(port)}). Last power cycle ${time.since(this.ports[port].lastPowerCycle).secs()}s ago.`);

                            powerCyclePortList.push(port);
                        }
                    } catch(error) {
                        this.debug('Error:', error);
                    }
                }));
            });
        });

        if(unknownPortList.length) {
            this.debug(`Checking for switch on ports [${unknownPortList.join(', ')}]`);

            await this.parentSwitch.routeOnly(this.parentPort, config.SWITCH_DEFAULT_ADDRESS, async () => {
                await this.tplink.session(this.switchAddress, async device => {

                    await device.disableAll([this.uplinkPort], this.numberOfPorts);

                    for(let port of unknownPortList) {
                        try {
                            await device.portEnable(port);

                            if(await tplink.probe(this.portAddress(port, { timeout: 10*1000 }))) {
                                knownPortList.push(port);
                            } else if(await tplink.probe(config.SWITCH_DEFAULT_ADDRESS, { timeout: 10*1000 })) {
                                defaultPortList.push(port);
                            } else {
                                emptyPortList.push(port);
                            }

                            await device.portDisable(port);
                        } catch(error) {
                            this.debug(`${this.portName(port)}: Error:`, error);
                        }
                    }

                    await device.enableAll([], this.numberOfPorts);
                });
            });
        }

        if(defaultPortList.length) {
            this.debug(`Configure factory default switch on ports [${defaultPortList.join(', ')}]`);

            await Promise.all(defaultPortList.map( async port => {
                try {
                    if(await tplink.configure(this, port, this.portAddress(port))) {
                        knownPortList.push(port);
                    }
                } catch (error) {
                    this.debug(`${this.portName(port)}: Error:`, error);
                }
            }));
        }

        if(knownPortList.length) {
            this.debug(`Create configured switch on ports [${knownPortList.join(', ')}]`);

            await Promise.all(knownPortList.map( async port => {
                try {
                    this.ports[port].switch = await new tplink(this, port);

                    if(this.ports[port].switch) {
                        // FIXME: Configuring port speed could close this.ports[port].switch.tplink
                        await this.tplink.session(this.switchAddress, async device =>
                            await device.port(port, "speed auto")
                        );
                    }
                } catch(error) {
                    this.debug(`${this.portName(port)}: Error:`, error);
                }
            }));
        }

        if(emptyPortList.length) {
            this.debug(`No switch detected on ports [${emptyPortList.join(', ')}]`);
        }

        if(cameraPortList.length) {
            this.debug(`Checking for cameras on ports [${cameraPortList.join(', ')}]`);

            try {
                const portMacTable = (await this.parentSwitch.route(this.parentPort, this.switchAddress, async () =>
                    await this.tplink.session(this.switchAddress, async device =>
                        await device.portMacTable()
                    )
                )).filter( line => cameraPortList.includes(line.port) );

                if(portMacTable.length) {
                    this.debug(`Discovered cameras on ports [${portMacTable.map(line => line.port).join(', ')}]`);

                    await Promise.all(portMacTable.map( async ({port, mac}) => {
                        try {
                            this.ports[port].camera = await cameras.update({mac, switch:this, switchName:this.switchName, port});
                        } catch(error) {
                            this.debug(`${this.portName(port)}: Error:`, error);
                        }
                    }));
                }
            } catch(error) {
                this.debug('Error:', error);
            }
        }

        if(powerCyclePortList.length) {
            this.debug(`PoE power cycle on ports [${powerCyclePortList.join(', ')}]`);

            await this.parentSwitch.route(this.parentPort, this.switchAddress, async () => {
                await this.tplink.session(this.switchAddress, async device => {
                    await Promise.all(powerCyclePortList.map(async port => {

                        try {
                            await device.powerDisable(port);
                            await delay( 3*1000 );
                            await device.powerEnable(port);
                            this.ports[port].lastPowerCycle = Date.now();
                        } catch(error) {
                            this.debug(`${port}: Power cycle error:`, error);
                        }
                    }));
                })});
        }

        // Discovering child switches
        await Promise.all( this.ports.filter(port => port.switch).map( async port => {
            try {
                await port.switch.discover();
            } catch(error) {
                port.switch.debug('Discover child switch error:', error);
            }
        }));
    }

    async findMacPort(mac, device) {

        const portMacTable = await device.portMacTable();
        const portMacLine = portMacTable?.find(({ mac: lineMac })  => lineMac.toUpperCase() == mac.toUpperCase() );

        if(portMacLine?.port===undefined)
            throw new Error(`Could not find port for the MAC:${mac} at ${JSON.stringify(portMacTable)}`);

        return portMacLine?.port;
    }

    static async configure(parentSwitch, parentPort, switchAddress) {

        const tplink = require('./tplink')();
        const switchName = parentSwitch.portName(parentPort);

        try {
            await parentSwitch.routeOnly(parentPort, config.SWITCH_DEFAULT_ADDRESS, async () => {

                await tplink.session(config.SWITCH_DEFAULT_ADDRESS, async device => {
                    parentSwitch.debug(`${switchName}: Configuring`);

                    // First get rid of logging messages that mess with the CLI commands execution
                    await device.config("no logging monitor|no logging buffer");

                    parentSwitch.debug(`${switchName}: Monitor disabled`);

                    const systemInfo = await device.systemInfo();

                    const { groups: { ports, sfp } }              = systemInfo['System Description'].match(/JetStream (?<ports>[0-9]+)-Port .* with (?<sfp>[0-9]+) SFP Slots/);
                    const { groups: { model, ports:totalPorts } } = systemInfo['System Name'       ].match(/(?<model>[A-Z0-9]+)-(?<ports>[0-9]+)[A-Z]+/);

                    for(let port=0; port<ports; port++) {
                        await device.port(port, 'speed 100');
                    }

                    parentSwitch.debug(`${switchName}: Port speed configured`);

                }, config.SWITCH_CONFIG_TIMEOUTS);

                await tplink.changeIpAddress(config.SWITCH_DEFAULT_ADDRESS, 0, switchAddress, "255.255.255.0");
                parentSwitch.debug(`${switchName}: IP address changed`);

                await tplink.session(switchAddress, async device => {
                    parentSwitch.debug(`${switchName}: Updating startup config`);
                    await device.privileged("copy running-config startup-config");
                    parentSwitch.debug(`${switchName}: Startup config updated`);
                });
            });

            parentSwitch.debug(`${switchName}: Configured`);

            return true;
        } catch(error) {
            parentSwitch.debug(`${switchName}: Configure error:`, error);

            return false;
        }
    }

    async routeOnly(portIndex, ipAddress, handler) {
        await this.routeLock.writeLock();

        try {
            await this.tplink.session(this.switchAddress, async device => {
                await device.enableOnly([portIndex, this.uplinkPort], this.numberOfPorts);
            });

            const result = await this.parentSwitch.routeOnly(this.parentPort, ipAddress, handler);

            await this.tplink.session(this.switchAddress, async device => {
                await device.enableAll([], this.numberOfPorts);
            });

            this.routeLock.unlock();
            return result;
        } catch(error) {
            this.routeLock.unlock();
            throw error;
        }
    }

    async route(portIndex, ipAddress, handler) {
        await this.routeLock.readLock();

        try {
            const result = await this.parentSwitch.route(this.parentPort, ipAddress, handler);
            this.routeLock.unlock();
            return result;
        } catch(error) {
            this.routeLock.unlock();
            throw error;
        }
    }

    isSystemPort(portIndex) {
        return portIndex==this.uplinkPort;
    }

    get switchName() {
        return `${this.parentSwitch.portName(this.parentPort)}`;
    }

    get switchAddress() {
        return this.parentSwitch.portAddress(this.parentPort);
    }

    portName(portIndex) {
        return `${portIndex}`;
    }

    portAddress(portIndex) {
        let ipAddress = ip.toBuffer(this.switchAddress);
        ipAddress[3] += portIndex+1;
        return ip.toString(ipAddress);
    }

    ipRange(portIndex) {
        return this.parentSwitch.ipRange(this.parentPort);
    }

    mac(portIndex) {
        return this.parentSwitch.mac(this.parentPort);
    }
};

module.exports = { tplink, computer }
