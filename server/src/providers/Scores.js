"use strict";

var RoomsDatabase = "scores.db",
    PathPrefix,

    path = require("path"),

    levelup = require("levelup"),

    databasePath,
    database;

function getDatabaseInstance() {
    if (!database) {
        if (!PathPrefix) {
            throw new Error("Please setup a path for Scores database!");
        }

        databasePath = path.join(PathPrefix, RoomsDatabase);
        database = levelup(databasePath);
    }

    return database;
}

function setPath(newPath) {
    PathPrefix = newPath;
}

function clear(continuation) {
    var database = getDatabaseInstance();

    database.close(function () {
        levelup.destroy(databasePath, continuation);
    });
}

function close(continuation) {
    database.close(continuation);
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

    clear: clear,
    close: close,

    get: get,

    add: add,
    remove: remove
};