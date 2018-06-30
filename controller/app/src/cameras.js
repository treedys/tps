const app = require('./app.js');
const memory = require('feathers-memory');
const request = require('request');
const debug = require('debug')('cameras');

app.use('/api/cameras', memory() );

const service = app.service('/api/cameras');

app.param('camera', async (browser_request, browser_response, next, id) => {
    try {
        browser_request.camera = await service.get(id);

        if(!browser_request.camera) {
            next(new Error("Wrong camera ID"));
        } else {
            next();
        }
    } catch(error) {
        next(error);
    }
});

app.get('/preview/:camera*', async (browser_request, browser_response) => {
    try {
        const path = browser_request.params[0];

        const camera_request = request.get(`http://${browser_request.camera.address}/${path}`);

        camera_request.pause();

        camera_request.on('response', camera_response => {
            if(camera_response.statusCode == 200) {
                camera_request.pipe(browser_response);
                camera_request.resume();
            } else {
                browser_response.redirect('/noise.jpg');
                camera_request.abort();
            }
        });

        camera_request.on('error', error => {
            if(!browser_response.headersSent && !browser_response.finished)
                browser_response.redirect('/noise.jpg');
            camera_request.abort();
            debug('Camera preview Error:', error);
        });

    } catch(error) {
        browser_response.status(500).send(error);
    }
});

module.exports = { service };
