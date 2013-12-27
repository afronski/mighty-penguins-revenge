"use strict";

var ConfigurationFileName = "configuration.json",

    path = require("path"),
    fs = require("fs");

function ConfigurationReader(rootPath) {
    var configurationFilePath = path.join(rootPath, ConfigurationFileName),
        settings = JSON.parse(fs.readFileSync(configurationFilePath, "UTF-8"));

    this.get = function (key) {
        if (key in settings) {
            return settings[key];
        } else {
            throw new Error(util.format("Unknown key '%s' in settings object!", key));
        }
    };
}

module.exports = exports = ConfigurationReader;