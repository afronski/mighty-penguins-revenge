"use strict";

require("should");

var path = require("path"),

    ConfigurationReader = require("../../server/src/configuration/ConfigurationReader");

describe("Configuration reader", function () {

    it("should read configuration from JSON file", function () {
        var configuration = new ConfigurationReader(path.join(__dirname, "assets"));

        configuration.get("port").should.be.equal(1234);
    });

    it("should explode when reading not existing configuration file", function () {
        (function() {
            new ConfigurationReader(path.join(__dirname, "missing-directory"));
        }).should.throwError();
    });

    it("should explode when getting not existing settings property", function () {
        var configuration = new ConfigurationReader(path.join(__dirname, "assets"));

        (function() {
            configuration.get("missing");
        }).should.throwError();
    });

});