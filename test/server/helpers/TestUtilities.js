"use strict";

var util = require("util"),

    mockery = require("mockery"),
    sinon = require("sinon"),

    MockedModules = {},
    MockFactory = {};

// Mock for Express framework.

function ExpressMock() {
    var owner,
        implementation,
        result;

    implementation = {
        use: sinon.spy(),
        listen: sinon.spy()
    };

    owner = this;
    result = function () {
        return implementation;
    };

    result.static = sinon.spy();
    result.implementation = implementation;

    return result;
}

// Mock for custom console logger.

function ConsoleLoggerMock() {
    return {
        info: function () {}
    };
}

// Mocks factory.

MockFactory.create = function (name) {
    if (name === "express") {
        return new ExpressMock();
    } else if (name.indexOf("ConsoleLogger") !== -1) {
        return new ConsoleLoggerMock();
    } else {
        throw new Error(util.format("Unknown mock '%s' passed to MockFactory!", name));
    }
};

// Public API.

module.exports.mock = exports.mock = function (mocks) {
    mocks["./loggers/ConsoleLogger"] = true;

    MockedModules = mocks;

    Object.keys(MockedModules).forEach(function (module) {
        if (MockedModules[module]) {
            MockedModules[module] = MockFactory.create(module);
            mockery.registerMock(module, MockedModules[module]);
        }
    });

    mockery.enable({
        warnOnReplace: false,
        warnOnUnregistered: false
    });
};

module.exports.disable = exports.disable = function () {
    Object.keys(MockedModules).forEach(function (module) {
        if (MockedModules[module]) {
            mockery.deregisterMock(module);
        }
    });

    mockery.disable();
};

module.exports.getMock = exports.getMock = function (name) {
    if (name in MockedModules) {
        return MockedModules[name];
    } else {
        throw new Error(util.format("There is no instance of mock '%s'!", name));
    }
};