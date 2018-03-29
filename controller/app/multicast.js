
const debug = require("debug")("MULTICAST");

const eventToPromise = require('event-to-promise');
const dgram = require("dgram");

let client;
let servers = {};

module.exports = {
    client: async (port, group) => {
        client = dgram.createSocket("udp4");

        client.bind(port);
        await eventToPromise(client, "listening");

        client.setBroadcast(true);
        client.setMulticastTTL(128);

        for(let host in servers) {
            client.addMembership(group, host);
        }
    },
    server: async (port, host, ) => {

        servers[host] = dgram.createSocket({ type:"udp4", reuseAddr:true });

        servers[host].bind(port, host);
        await eventToPromise(servers[host], "listening");

        servers[host].setBroadcast(true);
        servers[host].setMulticastTTL(128);
    },
    send: async (msg, offset, length, port , address) => {
        let tasks = [];

        for(let host in servers)
            tasks.push(new Promise((resolve, reject) =>
                servers[host].send(msg, offset, length, port, address, error =>
                    error ? reject(error) : resolve())));

        await Promise.all(tasks);
    },
    on: (msg, callback) => client.on(msg, callback)
}
