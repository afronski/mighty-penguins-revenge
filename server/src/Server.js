"use strict";

require("colors");

var path = require("path"),
    util = require("util"),

    express = require("express"),

    ConfigurationReader = require("./configuration/ConfigurationReader"),
    Logger = require("./loggers/ConsoleLogger"),

    application = express(),
    configurationReader;

function initialize(directory) {
    configurationReader = new ConfigurationReader(path.join(directory, "server"));

    // TODO: Fill it properly *here* in order to serve all
    //       assets from proper directories.
}

function listen() {
    var port = configurationReader.get("port");

    application.listen(port);

    Logger.info(util.format("Application listening on port: %d", port).yellow);
}

module.exports = exports = {
    initialize: initialize,
    listen: listen
};