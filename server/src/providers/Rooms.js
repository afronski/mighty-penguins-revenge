"use strict";

var RoomsDatabase = "rooms.db",
    JsonValueEncoding,
    PathPrefix,

    path = require("path"),

    level = require("level"),

    Room = require("../models/Room"),

    databasePath,
    databaseInstance;

JsonValueEncoding = {
    valueEncoding: {
        encode: function (room) {
            return JSON.stringify(room);
        },

        decode: function (string) {
            var object = JSON.parse(string),
                decoded = new Room(object.name);

            decoded.players = JSON.parse(JSON.stringify(object.players));
            decoded.session = object.session;
            decoded.available = object.available;

            return decoded;
        },

        buffer: false,
        type: "room"
    }
};

function getDatabaseInstance() {
    if (!databaseInstance) {
        if (!PathPrefix) {
            throw new Error("Please setup a path for Rooms database!");
        }

        databasePath = path.join(PathPrefix, RoomsDatabase);
        databaseInstance = level(databasePath);
    }

    return databaseInstance;
}

function setPath(newPath) {
    PathPrefix = newPath;
}

function close(continuation) {
    var database = getDatabaseInstance();

    database.close(continuation);
}

function clear(continuation) {
    close(function () {
        level.destroy(databasePath, function () {
            var database = getDatabaseInstance();

            database.open(continuation);
        });
    });
}

function get(continuation) {
    var database = getDatabaseInstance(),
        results = [];

    function collectEntry(entry) {
        results.push(entry.value);
    }

    /* istanbul ignore next: untestable */
    function handleError(error) {
        if (error) {
            continuation(error);
            continuation = null;
        }
    }

    function publishResult() {
        /* istanbul ignore else: untestable */
        if (continuation) {
            continuation(null, results);
            continuation = null;
        }
    }

    database.createReadStream(JsonValueEncoding)
        .on("data", collectEntry)
        .on("end", publishResult)
        .on("error", handleError);
}

function add(room, continuation) {
    var database = getDatabaseInstance();

    database.put(room.session, room, JsonValueEncoding, continuation);
}

function remove(session, continuation) {
    var database = getDatabaseInstance();

    database.del(session, JsonValueEncoding, continuation);
}

function atomicUpdate(oldSession, newRoom, continuation) {
    var database = getDatabaseInstance(),
        operations = [
            { type: "del", key: oldSession },
            { type: "put", key: newRoom.session, value: newRoom }
        ];

    database.batch(operations, JsonValueEncoding, continuation);
}

module.exports = exports = {
    setPath: setPath,

    close: close,
    clear: clear,

    get: get,

    add: add,
    remove: remove,
    atomicUpdate: atomicUpdate
};