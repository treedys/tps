
const _debug = require("debug")("TPLINK");

const eventToPromise = require('event-to-promise');
const telnet = require("telnet-client");
const mutex = require("await-mutex").default;

const pTimeout = require('p-timeout');
const delay = require('delay');
const camelCase = require('camelcase');

const telnetConfig = {
    port: 23,
    loginPrompt: "User:",
    passwordPrompt: "Password:",
    shellPrompt: /[#>]/,
    ors: "\r\n",
    pageSeparator: "Press any key to continue (Q to quit)",
    timeout: 10*1000,
    execTimeout: 10*1000,
    username: "admin",
    password: "admin"
};

const execOpts = {
    shellPrompt: /[#>]/,
};

module.exports = function() {
    var connection = new telnet();

    var execMutex = new mutex();
    var connectionMutex = new mutex();

    let debug = _debug;

    connection.on("error",       error => debug("TELNET:ERROR:",      error ));
    connection.on("failedlogin",  data => debug("TELNET:FAILEDLOGIN:", data ));
    connection.on("timeout",        () => debug("TELNET:TIMEOUT:"           ));
    connection.on("bufferexceeded", () => debug("TELNET:BUFFEREXCEEDED:"    ));

    connection.on("end",            () => debug("TELNET:END:"               ));
    connection.on("close",          () => debug("TELNET:CLOSE:"             ));

    connection.on("writedone",      () => debug("TELNET:WRITEDONE:"         ));
    connection.on("responseready",  () => debug("TELNET:RESPONSEREADY:"     ));

    connection.on("connect",        () => debug("TELNET:CONNECT:"           ));

    connection.on("ready",      prompt => debug("TELNET:READY:",     prompt ));
    connection.on("data",         data => debug("TELNET:DATA:",        data ));

    let connect = async (address, options) => {

        // FIXME: Check for deadlock (timeout?)
        let unlock = await connectionMutex.lock();

        debug = _debug.extend(address);

        const disconnect = async () => {

            debug(`SWITCH: ${address} - Disconnecting`);

            /* FIXME: finally doesn't work well with async/await
                        try {
                            await connection.end();
                        } finally {
                            unlock();
                        }
                        */
            try {
                // FIXME: connection.destroy immediately resolves
                connection.destroy();
                await eventToPromise.multi(connection, ["close"], ["error", "failedlogin", "timeout", "bufferexceeded"]);
                debug(`SWITCH: ${address} - Disconnected`);
                unlock();
                debug = _debug;
            } catch(error) {
                debug(`SWITCH: ${address} - Disconnecting error:`, error);
                connection.getSocket().destroy();
                unlock();
                debug = _debug;
                throw error;
            }
        };

        debug(`SWITCH: ${address} - Connecting`);

        let err = undefined;

        for(let retries=0; retries<5; retries++) {
            try {
                await connection.connect({ ...telnetConfig, ...options, host: address });

                debug(`SWITCH: ${address} - Connected`);

                return {
                    connection,
                    disconnect,
                    execute,
                    privileged,
                    config,
                    port,
                    vlan,
                    powerEnable,
                    powerDisable,
                    powerCycle,
                    powerStatus,
                    systemInfo,
                    portStatus,
                    portMacTable,
                    portEnable,
                    portDisable,
                    enableAll,
                    disableAll,
                    enableOnly
                };
            } catch(error) {
                debug(`SWITCH: ${address} - Connect failed: ${error.toString()}`);
                try { await connection.destroy(); } catch(ignore) { connection.getSocket().destroy(); }
                err = error;
            }

            await delay(1*1000);
        }

        debug(`SWITCH: ${address} - Connect failed`);
        debug = _debug;
        unlock();
        throw err;
    };

    let session = async (address, handler, options) => {
        let device = await connect(address, options);

        /* FIXME: finally doesn't work well with async/await

        try {
            return handler(device);
        } finally {
            await device.disconnect();
        }

        */

        try {
            let result = await handler(device);
            await device.disconnect();
            return result;
        } catch(error) {
            await device.disconnect();
            throw error
        }
    }

    let probe = async (address, options) => {
        try {
            let device = await connect(address, options);
            await device.disconnect();
            return true;
        } catch(error) {
            return false;
        }
    };

    let execute = async (commands, options) => {
        let unlock = await execMutex.lock();
        try {
            let result = "";
            for(command of commands.split("|")) {
                debug("TELNET:EXEC:", command);

                const res = await connection.exec(command, { ...execOpts, ...options});

                debug("TELNET:RES:", res);
                result += res;
            }
            unlock();
            return result.replace('\0','');
        } catch(error) {
            unlock();
            throw error;
        }
    };

    let privileged = async (commands, options) => execute(`enable|${commands}|exit`, options);
    let config     = async (commands, options) => privileged(`config|${commands}|exit`, options);

    let port = async (number, commands, options) => config(`interface gigabitEthernet 1/0/${number+1}|${commands}|exit`, options);
    let vlan = async (number, commands, options) => config(`interface vlan ${number+1}|${commands}|exit`, options);

    let portEnable   = async (number, options) => port(number, "no shutdown", options);
    let portDisable  = async (number, options) => port(number, "shutdown", options);
    let powerEnable  = async (number, options) => port(number, "power inline supply enable", options);
    let powerDisable = async (number, options) => port(number, "power inline supply disable", options);
    let powerCycle   = async (number, ms, options)  => {
        // await port(number, "power inline supply disable|power inline supply enable");
        await powerDisable(number, options);
        await delay(ms);
        await powerEnable(number, options);
    }

    let disableAll   = async (except, totalPorts, options) => {
        let excepts = [].concat(except);

        const cmd = [ ...(Array(totalPorts).keys()) ]
            .filter( port => !excepts.includes(port) )
            .map( port => `interface gigabitEthernet 1/0/${port+1}|shutdown|exit` )
            .join('|');

        await config(cmd);
    }

    let enableAll    = async (except, totalPorts, options) => {
        let excepts = [].concat(except);

        const cmd = [ ...(Array(totalPorts).keys()) ]
            .filter( port => !excepts.includes(port) )
            .map( port => `interface gigabitEthernet 1/0/${port+1}|no shutdown|exit` )
            .join('|');

        await config(cmd);
    }

    let enableOnly   = async (portToEnable, totalPorts, options) => {
        const enabled = [].concat(portToEnable);

        const cmd = [ ...(Array(totalPorts).keys()) ]
            .map( port => `interface gigabitEthernet 1/0/${port+1}|${enabled.includes(port)?'no shutdown':'shutdown'}|exit` )
            .join('|');

        await config(cmd);
    }

    const systemInfo = async (options) =>
        (await privileged("show system-info", options))
            .split(/[\r\n]+/)
            .map( line => line.split(/-(.+)/))
            .filter( ([key, value]) => key )
            .reduce( (result, [key, value]) => ({ ...result, [key.trim()]: value.trim()}), {});

    let portMacTable = async (options) => {
        let lines = (await privileged("show mac address-table", options)).split(/[\r\n]+/);

        let table = [];

        for(let lineIdx = 5; lineIdx<lines.length; lineIdx++) {

            let columns = lines[lineIdx].trim().split(/\s+/);

            if(columns.length!=5) {
                debug(`portMacTable: Skipping: ${lines[lineIdx]}`);
                continue;
            }

            let [mac, vlan, port, type, aging] = columns;
            port = parseInt(port.split("/")[2])-1;
            vlan = parseInt(vlan);
            mac = mac.toUpperCase();

            table.push({ port, mac, vlan, type, aging });
        }

        return table;
    }

    let portStatus = async (options) => {
        const lines = (await privileged('show interface status', options)).split(/[\r\n]+/).filter(line => line!='' );

        const headers = lines[0].trim().split(/\s+/).map(camelCase);

        let table = [];

        for(let lineIdx = 2; lineIdx<lines.length; lineIdx++) {

            const columns = lines[lineIdx].trim().split(/\s+/);

            if(columns.length!=headers.length) {
                debug(`portStatus: Skipping: ${lines[lineIdx]}`);
                continue;
            }

            const result  = headers.reduce( (result, key, index) => ({ ...result, [key]: columns[index] }), {} );

            if(result.port)
                result.port = parseInt(result.port.split("/")[2])-1;

            table.push(result);
        }

        return table.reduce( (result, status) => ({ ...result, [status.port]:{ ...status, online:status.status=='LinkUp' } }), {} );;
    }

    let powerStatus = async (options) => {
        const lines = (await privileged('show power inline information interface', options)).split(/[\r\n]+/).filter(line => line!='' );

        const headers = lines[0].trim().split(/\s+/).map(camelCase);

        let table = [];

        for(let lineIdx = 2; lineIdx<lines.length; lineIdx++) {

            const columns = lines[lineIdx].trim().replace(/Class /g,'Class_').split(/\s+/);

            if(columns.length!=headers.length) {
                debug(`powerStatus: Skipping: ${lines[lineIdx]}`);
                continue;
            }

            const result  = headers.reduce( (result, key, index) => ({ ...result, [key]: columns[index] }), {} );

            if(result.interface)
                result.interface = parseInt(result.interface.split("/")[2])-1;

            table.push(result);
        }

        return table.reduce( (result, status) => ({ ...result, [status.interface]:{ ...status, PoE:status.powerStatus=='ON' } }), {} );;
    }

    let changeIpAddress = async (oldAddress, vlan, newAddress, mask, options) => {
        let device = await connect(oldAddress);

        try {
            await pTimeout(device.vlan(vlan, `ip address ${newAddress} ${mask}`, options), 5*1000);
        } catch(error) {
            debug(`Change IP error:`, error);
        }
        await delay(10*1000);
        connection.getSocket().destroy();
        try { await device.disconnect(); } catch (error) { }
    }

    return {
        connect,
        session,
        probe,
        changeIpAddress
    };
};
