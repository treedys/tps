const app = require('./app.js');
const memory = require('feathers-memory');
const download = require('download');

app.use('/api/cameras', memory() );

const cameras = app.service('/api/cameras');

app.param('camera', async (request, response, next, id) => {
    try {
        request.camera = await cameras.get(id);

        if(!request.camera) {
            next(new Error("Wrong camera ID"));
        } else {
            next();
        }
    } catch(err) {
        next(err);
    }
});

app.get('/preview/:camera*', (request, response) => {
    try {
        const path = request.params[0];

        download(`http://${request.camera.address}/${path}`).pipe(response);

    } catch(err) {
        response.status(500).send(err);
    }
});

module.exports = cameras;
