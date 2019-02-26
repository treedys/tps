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
            next(new Error(`CAMERA: ${id} - Not Found`));
        } else {
            next();
        }
    } catch(error) {
        next(error);
    }
});

app.get('/preview/:camera*', async (browser_request, browser_response) => {
    try {

        if(!browser_request.camera) {
            browser_response.redirect('/noise.jpg');
            return;
        }

        const path = browser_request.params[0];

        const camera_request = request.get(`http://${browser_request.camera.address}/${path}`, {timeout: 2*1000} );

        camera_request.pause();

        camera_request.on('response', camera_response => {
            if(camera_response.statusCode == 200) {
                camera_request.pipe(browser_response);
                camera_request.resume();
            } else {
                browser_response.redirect('/noise.jpg');
                camera_request.destroy();
            }
        });

        camera_request.on('error', error => {
            if(!browser_response.headersSent && !browser_response.finished)
                browser_response.redirect('/noise.jpg');
            camera_request.destroy();
            debug(`CAMERA: ${browser_request.camera.switchAddress}:${browser_request.camera.port} - preview Error:`, error);
        });

        camera_request.on('end', chunk => {
            debug(`CAMERA: ${browser_request.camera.switchAddress}:${browser_request.camera.port} - request End`, chunk)
        });
        camera_request.on('close', () => {
            debug(`CAMERA: ${browser_request.camera.switchAddress}:${browser_request.camera.port} - request Close`);
            camera_request.destroy();
        });

    } catch(error) {
        browser_response.status(500).send(error);
    }
});

module.exports = { service };
