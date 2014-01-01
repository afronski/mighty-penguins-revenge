"use strict";

var RoomsDatabase = "scores.db",
    PathPrefix,

    path = require("path"),

    level = require("level"),

    databasePath,
    database;

function getDatabaseInstance() {
    if (!database) {
        if (!PathPrefix) {
            throw new Error("Please setup a path for Scores database!");
        }

        databasePath = path.join(PathPrefix, RoomsDatabase);
        database = level(databasePath);
    }

    return database;
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
    continuation();
}

function add(room, continuation) {
    continuation();
}

function remove(roomName, continuation) {
    continuation();
}

module.exports = exports = {
    setPath: setPath,

    close: close,
    clear: clear,

    get: get,

    add: add,
    remove: remove
};