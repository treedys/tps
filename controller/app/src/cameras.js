const app = require('./app.js');
const config = require("./config");

const multicast = require("./multicast");
const dnsmasq = require('./dnsmasq.js');

const memory = require('feathers-memory');
const request = require('request');

const pTimeout = require('p-timeout');
const time = require("time-since");
const ip = require("ip");
const ipRangeCheck = require('ip-range-check');
const delay = require('delay');
const eol = require('eol');
const mutex = require("await-mutex").default;
const debug = require('debug')('CAMERAS');

app.use('/api/cameras', memory() );

const service = app.service('/api/cameras');

const live = {};

app.param('camera', async (browser_request, browser_response, next, id) => {
    try {
        browser_request.camera = live[id];

        if(!browser_request.camera) {
            //            debug(`${id} - Not Found`);
        }

        next();
    } catch(error) {
        //        debug(`{id} ${error.toString()}`);
        next(error);
    }
});

app.get('/preview/:camera*', async (browser_request, browser_response) => {

    if(!browser_request.camera || !browser_request.camera.sameIpRange) {
        browser_response.redirect('/noise.jpg');
        return;
    }

    const path = browser_request.params[0];
    const camera = browser_request.camera;
    const mac = camera.mac;

    try {
        const camera_request = request.get(`http://${live[mac].address}/${path}`, {timeout: 2*1000} );

        camera_request.pause();

        camera_request.on('response', camera_response => {
            if(camera_response.statusCode == 200) {
                camera_request.pipe(browser_response);
                camera_request.resume();
            } else {
                browser_response.redirect('/noise.jpg');
                camera_request.destroy();
                //                camera.debug(`'${path}' request response: ${camera_response.statusCode}`);
            }
        });

        camera_request.on('error', error => {
            if(!browser_response.headersSent && !browser_response.finished)
                browser_response.redirect('/noise.jpg');
            camera_request.destroy();
            //            camera.debug(`'${path}' request ${error.toString()}`);
        });

        camera_request.on('end', chunk => {
            //            camera.debug(`'${path}' request End`, chunk)
        });
        camera_request.on('close', () => {
            camera_request.destroy();
            //            camera.debug(`'${path}' request Close`);
        });

    } catch(error) {
        camera.debug(`Preview: '${path}'`, error);
        browser_response.status(500).send(error);
    }
});

const sendCmd = async (args) => {

    const message = Buffer.concat(
        [].concat(args).map(
            arg => Buffer.isBuffer(arg) ? arg : Buffer.from([arg])
        )
    );

    await multicast.send(message, 0, message.length, config.MCAST_CAMERA_COMMAND_PORT, config.MCAST_GROUP_ADDR);
};

const all = Buffer.from('FF:FF:FF:FF:FF:FF');

const bufferFromInt32LE = int32 => { let buf = Buffer.alloc(4); buf.writeInt32LE(int32, 0); return buf; }

// TODO: Build the structures with https://github.com/TooTallNate/ref-struct
const send = {
     ping: async (mac)     => sendCmd([ Buffer.from(mac), 0 ]),
    shoot: async (mac, id) => sendCmd([ Buffer.from(mac), 1, bufferFromInt32LE(id), await config.pack() ]),
    erase: async (mac, id) => sendCmd([ Buffer.from(mac), 2, bufferFromInt32LE(id) ]),
     exec: async (mac, s)  => sendCmd([ Buffer.from(mac), 3, Buffer.from(s), 0 ]),

     pingAll: async ()   => send. ping( all     ),
    shootAll: async (id) => send.shoot( all, id ),
    eraseAll: async (id) => send.erase( all, id ),
     execAll: async (s)  => send. exec( all, s  )
};

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

const addressEnd = (address, end) => ip.toString( [...ip.toBuffer(address).slice(0, 3), end] );

const downloadContent = async (camera, file) => {
    try {
        return pTimeout(retry(5, async () => new Promise( (resolve,reject) => {
            const req = request(`http://${camera.address}/${file}`, {timeout:2*1000}, (error, response, body) => {
                if(error) { req.abort(); reject(error); }
                if(response?.statusCode!=200) { req.abort(); resolve(undefined); }
                resolve(body); req.end();
            });
        })), 10*1000, `Timeout`);
    } catch(error) {
        camera.debug(`Error downloading ${file}: ${error.toString()}`);
    }
    return undefined;
}

const checkNetboot = async (camera) => {
    try {
        await send.exec(camera.mac, "vcgencmd otp_dump > /var/www/otp_dump");
        await delay(100);

        const otp_dump = await downloadContent(camera, "otp_dump");
        const otp = eol.split(otp_dump).map(line => line.split(':')).reduce( (otp, [addr, value]) => Object.assign(otp, typeof(value)!="undefined" && { [parseInt(addr)]:parseInt(value,16) }), []);

        if(otp[17]!=0x3020000a) {
            camera.debug(`Configuring netboot - ${otp[17]?.toString(16)}`);
            await send.exec(camera.mac, `mkdir /var/fat;mount /dev/mmcblk0p1 /var/fat;echo "program_usb_boot_mode=1" >> /var/fat/config.txt;sync;sync;sync;reboot;`);
        }
    } catch(error) {
    	camera.debug(`checkNetboot ${otp_dump} error:`, error);
    }
}

const cameraState= async (camera) => {
    await send.exec(camera.mac, "cp /etc/*-version /var/www/");
    await delay(100);

    const    cameraVersion = await downloadContent(camera,    "camera-version");
    const buildrootVersion = await downloadContent(camera, "buildroot-version");

    const needsUpgrade = cameraVersion?.trim()!=CAMERAFIRMWARESHA1 || buildrootVersion?.trim()!=BUILDROOTSHA1;

    await send.exec(camera.mac, "ls /dev/ > /var/www/dev");
    await delay(100);
    const dev = await downloadContent(camera, "dev");
    const hasSDcard = dev.includes("mmcblk0");

    await send.exec(camera.mac, "cp /proc/cmdline /var/www/");
    await delay(100);
    const cmdline = await downloadContent(camera, "cmdline");
    const bootFromSDcard = cmdline.includes("root=/dev/mmcblk0");

    return { cameraVersion, buildrootVersion, dev, cmdline, needsUpgrade, hasSDcard, bootFromSDcard };
}

const upgradeMutexes = {};

const upgradeCameraFirmmware = async (camera) => {

    const state = await cameraState(camera);

    if(!state.needsUpgrade && (!state.hasSDcard || state.bootFromSDcard)) {
        return;
    }

    await dnsmasq.lock.readLock();

    const interfaceIndex = camera.switch.interfaceIndex(camera.switch.parentPort);
    const upgradeMutex = upgradeMutexes[interfaceIndex] = upgradeMutexes[interfaceIndex] || new mutex();

    const unlock = await upgradeMutex.lock();

    camera.debug('Needs upgrade');

    try {
        // TODO: add the camera to the upgrade list

        const upgradeStarts = Date.now();

        if(!state.hasSDcard && state.needsUpgrade) {
            await send.exec(camera.mac, "reboot");
        } else if(state.hasSDcard && (!state.bootFromSDcard || state.needsUpgrade)) {
            camera.debug(`Upgrading firmware from version ${state.cameraVersion||"unknown"} to ${CAMERAFIRMWARESHA1}`);
            const cmd =  `"tftp -g -l /tmp/sdcard.img -r sdcard.img ${addressEnd(camera.address,200)} && dd if=/tmp/sdcard.img of=/dev/mmcblk0 && sync; reboot;"`;
            await send.exec(camera.mac, `echo ${cmd} > /var/www/upgrade.sh`);
            await send.exec(camera.mac, "chmod +x /var/www/upgrade.sh");
            await send.exec(camera.mac, "/var/www/upgrade.sh");
        } else {
            camera.debug(`needsUpgrade=${state.needsUpgrade} hasSDcard=${state.hasSDcard} bootFromSDcard=${state.bootFromSDcard}`);
            unlock();
            dnsmasq.lock.unlock();
            return;
        }

        let afterReboot;
        do {
            await delay(5*1000);
            // TODO: Timout the loop
            try {
                afterReboot = await cameraState(camera);
                camera.debug(`needsUpgrade=${afterReboot.needsUpgrade} hasSDcard=${afterReboot.hasSDcard} bootFromSDcard=${afterReboot.bootFromSDcard}`);
            } catch(error) {
                camera.debug('Upgrade polling error:', error);
            }
        } while((afterReboot.needsUpgrade || (afterReboot.hasSDcard && !afterReboot.bootFromSDcard)) && time.since(upgradeStarts).secs()<2*60);

        // TODO: remove the camera from the upgrade list
        unlock();
        dnsmasq.lock.unlock();

    } catch(error) {
        camera.debug('Camera upgrade error:', error);
        unlock();
        dnsmasq.lock.unlock();
    }
}

const diffPatch = (a,b) => Object.keys(b).reduce( (o, k) => a[k] != b[k] && { ...o, [k]:b[k] } || o, {} );
const stripLiveFields = ({ debug, switch:_switch, lastSeen, lastReboot, sameIpRange, ...o}) => o;
const isEmptyObject = o => Object.entries(o).length ===0;

const update = async ({ mac, ...patch}) => {

    try {
        if(!live[mac]) {
            await config.addNewCamera(mac);

            live[mac] = { id:mac, mac, debug: debug.extend(mac) };
            await service.create(stripLiveFields(live[mac]));
            live[mac].debug('Discovered', stripLiveFields(patch));
        }

        const oldCamera = live[mac];
        const newCamera = { ...oldCamera, index: await config.cameraIndex(mac), ...patch };
        const diff = diffPatch(oldCamera, newCamera);
        const stripDiff = stripLiveFields(diff);

        Object.assign(live[mac], diff);

        if(diff.index)
            live[mac].debug = debug.extend(`${live[mac].index.toString().padStart(3,'0')}`);

        if(!isEmptyObject(stripDiff)) {
            live[mac].debug('Updating:', stripDiff);
            await service.patch(mac, stripDiff);
        }

        if(live[mac].address && live[mac].switch && live[mac].port && (diff.address || diff.switch || diff.port)) {
            live[mac].sameIpRange = ipRangeCheck(live[mac].address, live[mac].switch.ipRange(live[mac].port));
        }

        if(live[mac].online && live[mac].switch && (diff.online || diff.switch) && live[mac].sameIpRange) {
            await checkNetboot(live[mac]);
            await upgradeCameraFirmmware(live[mac]);
        }
    } catch(error) {
       if(live[mac]) live[mac].debug('Update error:', error);
       else debug(`${mac} Update error:`, error);
    }

    return live[mac];
}

module.exports = { update, live, service };
