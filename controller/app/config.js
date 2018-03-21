const app = require('./app.js');
const nedb = require('nedb');
const feathersNedb = require('feathers-nedb');
const path = require('path');

const settings = {
    PATH: "/disk/sda1",
    PREVIEW: "normal/29.jpg",
    SWITCH_PORTS: 48,
    SWITCH_DEFAULT_ADDRESS: "192.168.0.1",
    MCAST_GROUP_ADDR: "224.1.1.1",
    MCAST_CAMERA_COMMAND_PORT: 6502,
    MCAST_CAMERA_REPLY_PORT: 6501,
    SWITCHES: [
        {
            interface: "eth1",
            hostAddress: "192.168.201.200",
            switchAddress: "192.168.201.100",
        }, {
            interface: "eth2",
            hostAddress: "192.168.202.200",
            switchAddress: "192.168.202.100"
        }, {
            interface: "eth3",
            hostAddress: "192.168.203.200",
            switchAddress: "192.168.203.100"
        }
    ],
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
        gpio17:       false,
        gpio18:       false,
        gpio22:       false,
        gpio27:       false,
    }
};

const defaultConfig = {
    _id: '0',
    camera: {
        normal: settings.CAMERA,
        projection: settings.CAMERA
    }
};

const initDefault = async () => {

    try {
        const configs = await service.find();

        if(configs.length==0)
            await service.create(defaultConfig);
    } catch(error) {
        await service.create(defaultConfig);
    }
};

const db = new nedb({
    filename: path.join(settings.PATH,'config.json'),
    autoload: true,
    onload: initDefault
});

app.use('/api/config', feathersNedb({ Model: db }));

const service = app.service('/api/config');

const _pack = config => {

    const message = Buffer.alloc(19);

    let offset = 0;

    // Keep in sync with 'struct camera_configuration'

    offset = message.writeInt16LE(config.shutterSpeed, offset);
    offset = message.writeInt16LE(config.iso,          offset);
    offset = message.writeInt16LE(config.redGain,      offset);
    offset = message.writeInt16LE(config.blueGain,     offset);
    offset = message.writeInt8   (config.quality,      offset);
    offset = message.writeInt8   (config.sharpness,    offset);
    offset = message.writeInt8   (config.contrast,     offset);
    offset = message.writeInt8   (config.brightness,   offset);
    offset = message.writeInt8   (config.saturation,   offset);
    offset = message.writeInt8   (config.drc,          offset);
    offset = message.writeInt8   (config.whiteBalance, offset);
    offset = message.writeInt8   (config.gpio17,       offset);
    offset = message.writeInt8   (config.gpio18,       offset);
    offset = message.writeInt8   (config.gpio22,       offset);
    offset = message.writeInt8   (config.gpio27,       offset);

    return message;
}

const pack = async () => {

    const { camera: { normal, projection }  } = await service.get('0');

    return Buffer.concat([_pack(projection), _pack(normal)]);
};

module.exports = { ...settings, service, pack };

