const app = require('./app.js');
const config = require('./config.js');

app.use('/api/switches', {
    find: params => Promise.resolve(config.SWITCHES.map( (sw, index) => ({
        id: index,
        model: "TP-Link",
        ports: config.SWITCH_PORTS,
        ...sw
    }))),
    get: (id, params) => Promise.resolve({
        id,
        model: "TP-Link",
        ...config.SWITCHES[id]
    })
});

app.param('switch', (request, response, next, id) => {

    request.switchData = config.SWITCHES[id];

    if(!request.switchData) {
        next(new Error("Wrong switch ID"));
        return;
    }

    next();
});

module.exports = app.service('/api/switches');
