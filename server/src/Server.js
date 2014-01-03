"use strict";

require("colors");

var http = require("http"),
    path = require("path"),
    util = require("util"),

    express = require("express"),
    socketIO = require("socket.io"),

    ConfigurationReader = require("./configuration/ConfigurationReader"),
    Logger = require("./loggers/ConsoleLogger"),

    musicProvider = require("./providers/Music"),

    application = express(),
    configurationReader,
    webSockets;

function initialize(directory) {
    configurationReader = new ConfigurationReader(path.join(directory, "server"));

    /* istanbul ignore next: Untestable (Asynchronous call) */
    // Initialization.
    musicProvider.initialize(path.join(directory, "client/assets"), "Music*.*", function () {
        // Wire-up routing after initialization.
        application.get("/music", musicProvider.streamRandomTrack);
    });

    // Middleware registration.
    application.use(express.static(path.join(directory, "client")));
}

function listen() {
    var port = configurationReader.get("port"),
        server = http.createServer(application);

    webSockets = socketIO.listen(server, { log: false, resource: "/ws" });
    server.listen(port);

    Logger.info(util.format("Application listening on port: %d", port).yellow);
}

module.exports = exports = {
    initialize: initialize,
    listen: listen
};