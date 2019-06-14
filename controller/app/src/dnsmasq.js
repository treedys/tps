
const debug = require('debug')('DNSMASQ');
const { spawn } = require('child_process');
const eventToPromise = require('event-to-promise');
const argv = require('minimist')(process.argv.slice(2));

let dnsmasq;

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
            debug(`Unexpected dnsmasq state: { killed:${dnsmasq.killed}, connected: ${dnsmasq.connected} }`, dnsmasq);
    }
}

module.exports = async (ports) => {

    await dnsmasqKill();

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

    const dnsmasqDebug = debug.extend(dnsmasq.pid);

    dnsmasqDebug('Start');

    dnsmasq.on('close',      (code, signal)        => dnsmasqDebug(`close: ${code} ${signal}`         ));
    dnsmasq.on('error',      (err)                 => dnsmasqDebug(`error: ${err?.toString?.()}`      ));
    dnsmasq.on('exit',       (code, signal)        => dnsmasqDebug(`exit: ${code} ${signal}`          ));
    dnsmasq.on('disconnect', ()                    => dnsmasqDebug('disconnect'                       ));
    dnsmasq.on('message',    (message, sendHandle) => dnsmasqDebug(`message: ${message} ${sendHandle}`));
}
