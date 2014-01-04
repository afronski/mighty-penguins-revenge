"use strict";

var RoomsDatabase = "scores.db",
    JsonValueEncoding,
    PathPrefix,

    path = require("path"),

    level = require("level"),

    ScoresList = require("../models/ScoresList"),

    databasePath,
    databaseInstance;

JsonValueEncoding = {
    valueEncoding: {
        encode: function (score) {
            return JSON.stringify(score);
        },

        decode: function (string) {
            var object = JSON.parse(string),
                room = { name: object.roomName, session: object.session, players: object.players },
                decoded = new ScoresList(room);

            return decoded;
        },

        buffer: false,
        type: "score"
    }
};

function getDatabaseInstance() {
    if (!databaseInstance) {
        if (!PathPrefix) {
            throw new Error("Please setup a path for Scores database!");
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

function add(score, continuation) {
    var database = getDatabaseInstance();

    database.put(score.session, score, JsonValueEncoding, continuation);
}

function remove(session, continuation) {
    var database = getDatabaseInstance();

    database.del(session, JsonValueEncoding, continuation);
}

module.exports = exports = {
    setPath: setPath,

    close: close,
    clear: clear,

    get: get,

    add: add,
    remove: remove
};