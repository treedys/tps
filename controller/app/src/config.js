const app = require('./app.js');
const os = require('os');
const posix = require('posix');
const dbus = require('dbus-native');
const avahi = require('avahi-dbus');
const nedb = require('nedb');
const feathersNedb = require('feathers-nedb');
const path = require('path');
const debug = require('debug')('CONFIG');

const avahiDaemon = new avahi.Daemon(dbus.systemBus());

const settings = {
    PATH: "/disk/sda1",
    SWITCH_DEFAULT_ADDRESS: "192.168.0.1",
    MCAST_GROUP_ADDR: "224.1.1.1",
    MCAST_CAMERA_COMMAND_PORT: 6502,
    MCAST_CAMERA_REPLY_PORT: 6501,
    SWITCH_PROBE_TIMEOUTS: {
        timeout: 5*1000,
        execTimeout: 5*1000
    },
    SWITCH_CONFIG_TIMEOUTS: {
        timeout: 2*60*1000,
        execTimeout: 2*60*1000
    },
    CAMERA: {
        quality:         75, //    1 .. 100
        sharpness:        0, // -100 .. 100
        contrast:         0, // -100 .. 100
        brightness:      50, //    0 .. 100
        saturation:       0, // -100 .. 100
        shutterSpeed: 16000, //    1 ..
        iso:            100, //  100 .. 800
        redGain:       1000, //    0 ..
        blueGain:      1000, //    0 ..
        drc:              0, //    0 ..   3 OFF, LOW, MEDIUM, HIGH
        whiteBalance:     1, //    0 ..   8 OFF, AUTO ... HORIZON
        gpioDelay17:      0,
        gpioDelay18:      0,
        gpioDelay22:      0,
        gpioDelay27:      0,
        open:          true,
        close:         true,
        rotation:        90, // 0, 90, 180, 270
    }
};

const defaultConfig = {
    _id: '0',
    hostname: 'scanner',
    preview: 1,
    nextId: 1,
    scanFields: 'First Name;Last Name;Email;Gender:Male,Female,Other',
    camera: {
        normal: settings.CAMERA,
        projection: settings.CAMERA
    },
    scanner: {
        columns: 18,
        rows: 7,
        extra: 3,
        map: [],
        new: []
    }
};

const defer = require('p-defer');

const initialisedDefer = defer();

const initDefault = async error => {

    if(error)
        debug("Configuration autoload error:", error);

    try {
        const configs = await service.find();

        if(configs.length==0) {
            debug("Creating default config");
            await service.create(defaultConfig);
        }

        await updateHostName(configs[0]?.hostname);

    } catch(error) {
        debug("initDefault:", error);
        await service.create(defaultConfig);
    }

    initialisedDefer.resolve();
};

const db = new nedb({
    filename: path.join(settings.PATH,'config.json'),
    autoload: true,
    onload: initDefault
});

app.use('/api/config', feathersNedb({ Model: db }));

const service = app.service('/api/config');

const _pack = config => {

    const gpioDelay = (config.projectionDelay*.9) || 1;

    switch(config.stripLight) {
        case "full":
            config.gpioDelay17 = 0;
            config.gpioDelay18 = 0;
            break;
        case "high":
            config.gpioDelay17 = gpioDelay;
            config.gpioDelay18 = 0;
            break;
        case "medium":
            config.gpioDelay17 = 0;
            config.gpioDelay18 = gpioDelay;
            break;
        case "low":
            config.gpioDelay17 = gpioDelay;
            config.gpioDelay18 = gpioDelay;
            break;
    }

    const message = Buffer.alloc(29);

    let offset = 0;

    // Keep in sync with 'struct camera_configuration'

    offset = message.writeInt32LE(config.shutterSpeed, offset);
    offset = message.writeInt16LE(config.iso,          offset);
    offset = message.writeInt16LE(config.redGain,      offset);
    offset = message.writeInt16LE(config.blueGain,     offset);
    offset = message.writeInt16LE(config.rotation,     offset);
    offset = message.writeInt16LE(config.gpioDelay17,  offset);
    offset = message.writeInt16LE(config.gpioDelay18,  offset);
    offset = message.writeInt16LE(config.gpioDelay22,  offset);
    offset = message.writeInt16LE(config.gpioDelay27,  offset);
    offset = message.writeInt8   (config.open,         offset);
    offset = message.writeInt8   (config.close,        offset);
    offset = message.writeInt8   (config.quality,      offset);
    offset = message.writeInt8   (config.sharpness,    offset);
    offset = message.writeInt8   (config.contrast,     offset);
    offset = message.writeInt8   (config.brightness,   offset);
    offset = message.writeInt8   (config.saturation,   offset);
    offset = message.writeInt8   (config.drc,          offset);
    offset = message.writeInt8   (config.whiteBalance, offset);

    return message;
}

const pack = async () => {

    const { camera: { shotInterval, normal, projection }  } = await service.get('0');

    switch(shotInterval) {
        case "normal":
            projection.open  = true;
            projection.close = true;
            normal    .open  = true;
            normal    .close = true;
            break;
        case "short":
            projection.open  = false;
            projection.close = true;
            normal    .open  = true;
            normal    .close = false;
            break;
    }

        normal.gpioDelay22 =     normal.projectionDelay ||     normal.gpioDelay22;
    projection.gpioDelay22 = projection.projectionDelay || projection.gpioDelay22;

    return Buffer.concat([_pack(normal), _pack(projection)]);
};

const updateHostName =  async hostname => {
    hostname = hostname || "scanner";
    if(os.hostname() != hostname) {
        try {
            debug(`Updating hostname from ${os.hostname()} to ${hostname}`);
            posix.sethostname(hostname);
            avahiDaemon.SetHostName(hostname);
        } catch(error) {
            debug("updateHostName:", error);
        }
    }
}

const onConfigChange = async context => {
    const newConfig = context.data;
    const oldConfig = await service.get(context.id);

    if(oldConfig.scanner && newConfig.scanner) {
        if((newConfig.scanner.columns!=undefined && (newConfig.scanner.columns != oldConfig.scanner.columns)) ||
           (newConfig.scanner.rows   !=undefined && (newConfig.scanner.rows    != oldConfig.scanner.rows   )) ||
           (newConfig.scanner.extra  !=undefined && (newConfig.scanner.extra   != oldConfig.scanner.extra  ))) {

            debug("Resetting camera map", oldConfig.scanner, newConfig.scanner);

            newConfig.scanner.new = [].concat(newConfig.scanner.new || oldConfig.scanner.new, newConfig.scanner.map || oldConfig.scanner.map).filter(mac=>!!mac);
            newConfig.scanner.map = [];
        }
    }

    await updateHostName(newConfig.hostname);

    return context;
};

service.hooks({
    before: {
        update: onConfigChange,
        patch: onConfigChange
    }
});

const mutex = require("await-mutex").default;
const newCameraMutex = new mutex();

const getScanner = async () => ({
    ... defaultConfig.scanner,
    ... ( await service.get('0') )?.scanner
})

const eraseNewCameras = async () => {

    let unlock = await newCameraMutex.lock();

    try {
        await service.patch('0', {
            scanner: {
                ...(await getScanner()),
                new: []
            }
        });

        unlock();
    } catch(error) {
        unlock();
        throw error;
    }
}

const addNewCamera = async (mac) => {

    let unlock = await newCameraMutex.lock();

    try {
        let scanner = await getScanner();

        if(!scanner.map.includes(mac) && !scanner.new.includes(mac)) {
            debug(`Adding new camera ${mac}`);

            scanner.new.push(mac);

            await service.patch('0', { scanner } );
        }

        unlock();
    } catch(error) {
        unlock();
        throw error;
    }
}

const cameraIndex = async (mac) => {
    const index = (await getScanner()).map.indexOf(mac);

    return index>=0 ? index : undefined;
}

module.exports = {
    ...settings,
    service,
    pack,
    eraseNewCameras,
    addNewCamera,
    cameraIndex,
    initialised: initialisedDefer
};

