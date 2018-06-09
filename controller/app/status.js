const app = require('./app.js');
const memory = require('feathers-memory');

app.use('/api/status', memory() );

const service = app.service('/api/status');

service.create({
    id:0,
    shooting: false,
    restarting: false
});

module.exports = { service };
