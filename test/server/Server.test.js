"use strict";

require("should");

var path = require("path"),

    sinon = require("sinon"),

    helpers = require("./helpers/TestUtilities");

describe("Main server based on 'express' framework", function () {

    before(function () {
        helpers.mock({ express: true });

        this.server = require("../../server/src/Server");
    });

    after(helpers.disable);

    it("should serve static content by using middleware", function () {
        this.server.initialize(__dirname);

        sinon.assert.calledOnce(helpers.getMock("express").implementation.use);
    });

    it("should serve static content from proper directory", function () {
        this.server.initialize(__dirname);

        sinon.assert.calledWith(helpers.getMock("express").static, path.join(__dirname, "client"));
    });

    it("should listen on port specified in configuration file", function () {
        this.server.initialize(__dirname);
        this.server.listen();

        sinon.assert.calledOnce(helpers.getMock("express").implementation.listen);
        sinon.assert.calledWith(helpers.getMock("express").implementation.listen, 8999);
    });

});