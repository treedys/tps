
const debug = require("debug")("MULTICAST");

const eventToPromise = require('event-to-promise');
const dgram = require("dgram");

const netlink = require('netlink-notify');

let client, group;
let servers = {};

const bind = async host => {
    debug(`Binding ${host}:${servers[host].port}`);

    servers[host].socket = dgram.createSocket({ type:"udp4", reuseaddr:true });

    servers[host].socket.bind(servers[host].port, host);
    await eventToPromise(servers[host].socket, "listening");

    servers[host].socket.setBroadcast(true);
    servers[host].socket.setMulticastTTL(128);

    client?.addMembership(group, host);
}

const unbind = async host => {
    debug(`Unbinding ${host}:${servers[host].port}`);

    client?.dropMembership(group, host);

    servers[host].socket.close();
    await eventToPromise(servers[host].socket, 'close');
    delete servers[host].socket;
}

netlink?.from.on('route', async data => {

    try {
        const route = JSON.parse(data);

        const event = route?.event;
        const type = route?.data?.type;
        const host = route?.data?.addr?.dst;

        if(event=='delete' && type=='local' && servers[host]?.socket) {
            await unbind(host);
        }

        if(event=='new' && type=='local' && servers[host]) {
            await bind(host);
        }
    } catch (error) {
        debug('onRoute error:', error);
    }
});

module.exports = {
    client: async (port, _group) => {
        group = _group;
        client = dgram.createSocket("udp4");

        client.bind(port);
        await eventToPromise(client, "listening");

        client.setBroadcast(true);
        client.setMulticastTTL(128);

        for(let host in servers) {
            client.addMembership(group, host);
        }
    },
    server: async (port, host) => {

        debug(`Server ${host}:${port}`);
        servers[host] = servers[host] || { port };

        await bind(host);
    },
    remove: async (port, host) => {
        debug(`Remove ${host}:${port}`);

        await unbind(host);

        delete servers[host];
    },
    send: async (msg, offset, length, port , address) => {
        let tasks = [];

        for(let host in servers)
            tasks.push(new Promise((resolve, reject) => {
                try {
                    if(!servers[host].socket || !servers[host].socket.send) {
                        resolve();
                        return;
                    }

                    servers[host].socket.send(msg, offset, length, port, address, error => {
                        if(error)
                            debug(`${host}: Socket error:`, error);

                        resolve();
                    });
                } catch(error) {
                    debug(`${host}: Send error:`, error);
                    resolve();
                }
            }));

        await Promise.all(tasks);
    },
    on: (msg, callback) => client.on(msg, callback)
}
