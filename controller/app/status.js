const app = require('./app.js');
const memory = require('feathers-memory');

app.use('/api/status', memory() );

const status = app.service('/api/status');

status.create({
    id:0,
    shooting: false,
    restarting: false
});

module.exports = status;
