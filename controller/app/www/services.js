import io from 'socket.io-client';
import feathers from '@feathersjs/client';

import rx from 'feathers-reactive';

const socketio = io();

socketio.on("reconnect_failed", () => socketio.socket.reconnect());

const app = feathers()
    .configure(feathers.socketio(socketio))
    .configure(rx({idField: "id"}));

const     switches = app.service('/api/switches'    );
const      cameras = app.service('/api/cameras'     );
const        scans = app.service('/api/scans'       );
const       status = app.service('/api/status'      );
const       config = app.service('/api/config'      );

export default {
    io: socketio,
    app,
    switches,
    cameras,
    scans,
    status,
    config
};
