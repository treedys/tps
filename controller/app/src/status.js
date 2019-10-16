const app = require('./app.js');
const memory = require('feathers-memory');

const Path = require('path');
const df = require('@sindresorhus/df');
const config = require('./config.js');

app.use('/api/status', memory() );

const service = app.service('/api/status');

service.create({
    id:0,
    shooting: false,
    restarting: false
});

const dbPath = Path.join(config.PATH,'/db');
const updateFreeSpace  = async () => service.patch( 0, { df: await df.file(dbPath) });

setInterval( async () => {
    try {
        await updateFreeSpace();
    } catch(error) {
    }
}, 1000);

module.exports = {
    updateFreeSpace,
    service
};
