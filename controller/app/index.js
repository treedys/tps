#!/usr/bin/env node

async function run() {
    try {
    } catch(error) {
        console.log("Error:", error);
    }
}

run();

const app = require("./app.js");

/* app.listen() *MUST* be called after all feathers plugins are initialised
 *  * (especialy the authentication ones) to call their setup() methods. */
app.listen(80);
