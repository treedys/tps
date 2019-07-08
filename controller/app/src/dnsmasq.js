
const debug = require('debug')('DNSMASQ');
const { spawn } = require('child_process');
const eventToPromise = require('event-to-promise');
const argv = require('minimist')(process.argv.slice(2));
const rwlock = require("async-rwlock").RWLock;

const noop = () => {};

let dnsmasq;
let start = noop, restart = noop;

const lock = new rwlock();

const restarter = async () => {
    await restart();
    setTimeout( restarter, 60*1000 );
}

restarter();

const dnsmasqKill = async () => {
    if(dnsmasq && !dnsmasq.killed) {
        try {
            dnsmasq.kill();
            await eventToPromise.multi(dnsmasq, ["exit"], ["error"] );
            dnsmasq = undefined;
        } catch(error) {
            debug(`error: ${error.toString()}`);
        }
    } else {
        if(dnsmasq)
            debug('Already killed');
    }
}

module.exports = async (ports) => {

    let dnsmasqDebug = debug;

    start = noop;
    restart = noop;

    await lock.writeLock();

    await dnsmasqKill();

    start = () => {
        dnsmasq = spawn( argv['dnsmasq'] || '/usr/sbin/dnsmasq', [
            '--no-daemon',
            '--conf-file=/dev/null',
            '--port=0',
            ...( argv['camera-firmware'] ? [
                '--enable-tftp',
                '--pxe-service=0,"Raspberry Pi Boot"',
                `--tftp-root=${argv['camera-firmware']}`
            ] : [] ),
            ...( argv['dnsmasq-leases'] ? [
                `--dhcp-leasefile=${argv['dnsmasq-leases']}`
            ] : [] ),
            ...( ports.length ? [
                '--dhcp-reply-delay=1',
                ...ports.map( port  => `--dhcp-range=${port.interface},${port.start},${port.end},72h` )
            ] : [] )
        ]);

        dnsmasqDebug = debug.extend(dnsmasq.pid);

        dnsmasqDebug('Started');
    }

    restart = async () => {
        await lock.writeLock();
        dnsmasqDebug("Restarting");
        await dnsmasqKill();
        start();
        await lock.unlock();
    }

    start();

    dnsmasq.on('close',      (code, signal)        => dnsmasqDebug(`close: ${code} ${signal}`         ));
    dnsmasq.on('error',      (err)                 => dnsmasqDebug(`error: ${err?.toString?.()}`      ));
    dnsmasq.on('exit',       (code, signal)        => dnsmasqDebug(`exit: ${code} ${signal}`          ));
    dnsmasq.on('disconnect', ()                    => dnsmasqDebug('disconnect'                       ));
    dnsmasq.on('message',    (message, sendHandle) => dnsmasqDebug(`message: ${message} ${sendHandle}`));

    lock.unlock();
}

module.exports.lock = lock;
