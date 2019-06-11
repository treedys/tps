const app = require('./app.js');
const config = require('./config.js');

let switches = [];

app.use('/api/switches', {
    find: params => Promise.resolve(switches.map( (sw, index) => ({
        id: index,
        name: `${index+1}`,
        ...sw
    }))),
    get: (id, params) => Promise.resolve({
        id,
        name: `${index+1}`,
        ...switches[id]
    })
});

const service = app.service('/api/switches');

app.param('switch', (request, response, next, id) => {

    request.switchData = switches[id];

    if(!request.switchData) {
        next(new Error("Wrong switch ID"));
        return;
    }

    next();
});

module.exports = { service }
