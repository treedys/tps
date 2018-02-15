const app = require('./app.js');
const memory = require('feathers-memory');

app.use('/api/cameras', memory() );

module.exports = app.service('/api/cameras');
