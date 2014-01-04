"use strict";

var TEMPORARY_GUID = "aaaa1111-2222-3333-4444-bbbb5555",

    util = require("util"),

    mockery = require("mockery"),
    sinon = require("sinon"),

    Room = require("../../../server/src/models/Room"),

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

// Mock for HTTP server.

function HttpMock() {
    var implementation,
        result = {};

    implementation = {
        removeAllListeners: sinon.spy(),
        listeners: sinon.stub().returns([]),
        listen: sinon.spy(),
        once: sinon.spy(),
        on: sinon.spy()
    };

    result.createServer = function () {
        return implementation;
    };

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
    } else if (name === "http") {
        return new HttpMock();
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

module.exports.expectError = exports.expectError = function (continuation, error) {
    if (!error) {
        continuation(new Error("No error occurred, where one is expected!"));
        return;
    }

    continuation();
};

module.exports.mockProviders = exports.mockProviders = function () {
    var mockedRooms = [],
        mockedScores = [
            {
                roomName: "Room 3",
                players: [
                    { nick: "Player 2", score: 4 },
                    { nick: "Player 3", score: 3 },
                    { nick: "Player 1", score: 5 },
                    { nick: "Player 4", score: 2 },
                ]
            }
        ];

    // Rooms.

    this.firstRoom = new Room("Room 1"),
    this.secondRoom = new Room("Room 2");

    this.firstRoom.addPlayer({ nick: "Player 1", score: 0 });

    this.secondRoom.addPlayer({ nick: "Player 2", score: 1 });
    this.secondRoom.lock();

    mockedRooms.push(this.firstRoom);
    mockedRooms.push(this.secondRoom);

    // Scores.

    this.mockedSession = TEMPORARY_GUID;
    mockedScores[0].session = this.mockedSession;

    // Providers.

    this.rooms = {
        add: function (room, continuation) {
            continuation(null);
        },

        atomicUpdate: function (roomName, newRoom, continuation) {
            continuation(null);
        },

        get: function (continuation) {
            continuation(null, mockedRooms);
        }
    };

    this.scores = {
        add: function (score, continuation) {
            continuation(null);
        },

        get: function (continuation) {
            continuation(null, mockedScores);
        }
    };

    // Player instance.

    this.player = {
        nick: "Player 0",
        score: 0
    };
};