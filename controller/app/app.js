
const path = require("path");
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');
const rx = require('feathers-reactive');

// This creates an app that is both, an Express and Feathers app
const app = express(feathers());

// Set up REST transport using Express
app.configure(express.rest());

app.configure(socketio({ serveClient: false }));
app.configure(rx({idField: "id"}));

// Turn on JSON body parsing for REST services
app.use(express.json())

// Turn on URL-encoded body parsing for REST services
app.use(express.urlencoded({ extended: true }));

// Set up an error handler that gives us nicer errors
app.use(express.errorHandler());

// Serve static files
app.use(express.static(path.join(__dirname, "build")));

app.on('connection', connection => app.channel('unprotected').join(connection) );
app.publish( (data, context) => app.channel('unprotected') );

module.exports = app;
