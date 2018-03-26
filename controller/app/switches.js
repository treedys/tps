const app = require('./app.js');
const config = require('./config.js');

let switches = [];

for(let switch0 of config.SWITCHES) {
    if(switch0.switches.length==0)
        switches.push(switch0);

    for(let switch1 of switch0.switches ) {
        switches.push(switch1);
    }
}

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

app.param('switch', (request, response, next, id) => {

    request.switchData = switches[id];

    if(!request.switchData) {
        next(new Error("Wrong switch ID"));
        return;
    }

    next();
});

module.exports = app.service('/api/switches');
