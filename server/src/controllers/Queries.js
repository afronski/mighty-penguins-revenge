"use strict";

var util = require("util");

// Private helpers.

function isRoomAvailable(room) {
    return room.available === true;
}

function bySession(session, score) {
    return score.session === session;
}

function descendingByScore(a, b) {
    return -(a.score - b.score);
}

// Constructor.

function Queries(rooms, scores) {
    this.roomsProvider = rooms;
    this.scoresProvider = scores;
}

// Public methods.

Queries.prototype.getAccessibleRooms = function (continuation) {
    this.roomsProvider.get(function (error, results) {
        /* istanbul ignore if: Untestable */
        if (error) {
            continuation(error);
            return;
        }

        continuation(null, results.filter(isRoomAvailable));
    });
};

Queries.prototype.getScoresForSession = function (session, continuation) {
    this.scoresProvider.get(function (error, results) {
        /* istanbul ignore if: Untestable */
        if (error) {
            continuation(error);
            return;
        }

        results = results.filter(bySession.bind(null, session))[0];

        if (results) {
            continuation(null, results.players.sort(descendingByScore));
        } else {
            continuation(new Error(util.format("There is no score for session '%s'!", session)));
        }
    });
};

module.exports = exports = Queries;