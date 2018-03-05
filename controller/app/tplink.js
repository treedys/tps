
const debug = require("debug")("TPLINK");

const eventToPromise = require('event-to-promise');
const telnet = require("telnet-client");
const mutex = require("await-mutex").default;

const delay = ms => new Promise(res => setTimeout(res, ms))

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

        let unlock = await connectionMutex.lock();

        const disconnect = async () => {

            debug("Disconnecting");

            /* FIXME: finally doesn't work well with async/await
                        try {
                            await connection.end();
                        } finally {
                            unlock();
                        }
                        */
            try {
                connection.end();
                await eventToPromise.multi(connection, ["close"], ["error", "failedlogin", "timeout", "bufferexceeded"]);
                debug("Disconnected");
                unlock();
            } catch(error) {
                connection.getSocket().destroy();
                unlock();
                throw error;
            }
        };

        debug("Connecting to ", address);

        let err = undefined;

        for(let retries=0; retries<5; retries++) {
            try {
                connection.connect({ ...telnetConfig, ...options, host: address });

                await eventToPromise.multi(connection, ["ready"], ["error", "failedlogin", "timeout", "bufferexceeded"]);

                debug("Connected");

                return {
                    disconnect,
                    execute,
                    privileged,
                    config,
                    port,
                    vlan,
                    powerEnable,
                    powerDisable,
                    powerCycle,
                    portMacTable
                };
            } catch(error) {
                debug(`Connect failed: ${error}`);
                try { await disconnect(); } catch (ignore) {}
                err = error;
            }
        }
        debug("Connection failed");
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
                let [res,] = await Promise.all([
                    connection.exec(command, { ...execOpts, ...options}),
                    eventToPromise.multi(connection, ["responseready"], ["error", "failedlogin", "timeout", "bufferexceeded"])
                ]);
                debug("TELNET:RES:", res);
                result += res;
            }
            unlock();
            return result;
        } catch(error) {
            unlock();
            throw error;
        }
    };

    let privileged = async (commands, options) => execute(`enable|${commands}|exit`, options);
    let config     = async (commands, options) => privileged(`config|${commands}|exit`, options);

    let port = async (number, commands, options) => config(`interface gigabitEthernet 1/0/${number+1}|${commands}|exit`, options);
    let vlan = async (number, commands, options) => config(`interface vlan ${number+1}|${commands}|exit`, options);

    let powerEnable  = async (number, options) => port(number, "power inline supply enable", options);
    let powerDisable = async (number, options) => port(number, "power inline supply disable", options);
    let powerCycle   = async (number, ms, options)  => {
        // await port(number, "power inline supply disable|power inline supply enable");
        await powerDisable(number, options);
        await delay(ms);
        await powerEnable(number, options);
    }

    let portMacTable = async (options) => {
        let lines = (await privileged("show mac address-table", options)).split(/\r?\n/);

        let table = [];

        for(let lineIdx = 5; lineIdx<lines.length; lineIdx++) {

            let columns = lines[lineIdx].trim().split(/\s+/);

            if(columns.length!=5) {
                debug(`Skipping: ${lines[lineIdx]}`);
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

    let changeIpAddress = async (oldAddress, vlan, newAddress, mask, options) => {
        let device = await connect(oldAddress);

        try { await device.vlan(vlan, `ip address ${newAddress} ${mask}`, options); } catch(error) { }
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
