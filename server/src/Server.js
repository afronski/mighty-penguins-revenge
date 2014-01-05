"use strict";

var http = require("http"),
    path = require("path"),
    util = require("util"),

    express = require("express"),
    socketIO = require("socket.io"),

    ConfigurationReader = require("./configuration/ConfigurationReader"),
    Logger = require("./loggers/ConsoleLogger"),
    Glue = require("./controllers/Glue"),

    Rooms = require("./providers/Rooms"),
    Scores = require("./providers/Scores"),
    Music = require("./providers/Music"),

    application = express(),
    configurationReader,
    webSockets;

function initialize(directory) {
    var databasesPath = path.join(directory, "server/databases");

    configurationReader = new ConfigurationReader(path.join(directory, "server"));

    /* istanbul ignore next: Untestable (Asynchronous call) */
    // Initialization.
    Music.initialize(path.join(directory, "client/assets"), "Music*.*", function () {
        // Wire-up routing after initialization.
        application.get("/music", Music.streamRandomTrack);
    });

    Rooms.setPath(databasesPath);
    Scores.setPath(databasesPath);

    // Middleware registration.
    application.use(express.static(path.join(directory, "client")));
}

function listen() {
    var port = configurationReader.get("port"),
        gameSettings = {
            MaximumScore: configurationReader.get("score")
        },
        server = http.createServer(application),
        glue = new Glue(Rooms, Scores, gameSettings);

    webSockets = socketIO.listen(server, { log: false, resource: "/ws" });
    glue.wire(webSockets);
    server.listen(port);

    Logger.info(util.format("Application listening on port: %d", port));
}

module.exports = exports = {
    initialize: initialize,
    listen: listen
};