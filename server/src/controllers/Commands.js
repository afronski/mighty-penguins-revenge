"use strict";

var domain = require("domain"),
    util = require("util"),

    Room = require("../models/Room"),
    ScoresList = require("../models/ScoresList");

// Private helpers.

function bySession(session, room) {
    return room.session === session;
}

function updateScoreOnlyForPlayer(nick, score, player) {
    if (player.nick === nick) {
        player.score = score;

        return false;
    }

    return true;
}

// Constructor.

function Commands(rooms, scores) {
    this.roomsProvider = rooms;
    this.scoresProvider = scores;
}

// Public methods.

Commands.prototype.createRoom = function (roomName, player, continuation) {
    var newRoom = new Room(roomName);

    newRoom.addPlayer(player);

    this.roomsProvider.add(newRoom, function (error) {
        /* istanbul ignore if: Untestable */
        if (error) {
            continuation(error);
            return;
        }

        continuation(null, newRoom.session);
    });
};

Commands.prototype.deleteRoom = function (session, continuation) {
    this.roomsProvider.remove(session, continuation);
};

Commands.prototype.joinRoom = function (session, player, continuation) {
    var owner = this,
        handler = domain.create();

    handler.on("error", continuation);

    this.roomsProvider.get(handler.intercept(function (results) {
        results = results.filter(bySession.bind(null, session))[0];

        if (results) {
            results.addPlayer(player);
            owner.roomsProvider.atomicUpdate(session, results, handler.intercept(function () {
                continuation(null, results);
            }));
        } else {
            continuation(new Error(util.format("There is no session '%s'!", session)));
        }
    }));
};

Commands.prototype.leaveRoom = function (session, player, continuation) {
    var owner = this,
        handler = domain.create();

    handler.on("error", continuation);

    this.roomsProvider.get(handler.intercept(function (results) {
        results = results.filter(bySession.bind(null, session))[0];

        if (results) {
            results.removePlayer(player.nick);
            owner.roomsProvider.atomicUpdate(session, results, handler.intercept(function () {
                continuation(null, results);
            }));
        } else {
            continuation(new Error(util.format("There is no session '%s'!", session)));
        }
    }));
};

Commands.prototype.lockRoom = function (session, continuation) {
    var owner = this,
        handler = domain.create();

    handler.on("error", continuation);

    this.roomsProvider.get(handler.intercept(function (results) {
        results = results.filter(bySession.bind(null, session))[0];

        if (results) {
            if (results.available) {
                results.lock();
                owner.roomsProvider.atomicUpdate(session, results, handler.intercept(continuation));
            } else {
                continuation(new Error(util.format("Session '%s' is already unavailable!", session)));
            }
        } else {
            continuation(new Error(util.format("There is no session '%s'!", session)));
        }
    }));
};

Commands.prototype.updateScore = function (session, nick, score, continuation) {
    var owner = this,
        handler = domain.create();

    handler.on("error", continuation);

    this.roomsProvider.get(handler.intercept(function (results) {
        results = results.filter(bySession.bind(null, session))[0];

        if (results) {
            if (!results.available) {
                results.players.every(updateScoreOnlyForPlayer.bind(null, nick, score));

                owner.roomsProvider.atomicUpdate(session, results, handler.intercept(function () {
                    continuation(null, score);
                }));
            } else {
                continuation(new Error(util.format("Session '%s' was not locked!", session)));
            }
        } else {
            continuation(new Error(util.format("There is no session '%s'!", session)));
        }
    }));
};

Commands.prototype.closeContest = function (session, continuation) {
    var owner = this,
        handler = domain.create();

    handler.on("error", continuation);

    this.roomsProvider.get(handler.intercept(function (results) {
        results = results.filter(bySession.bind(null, session))[0];

        if (results) {
            if (!results.available) {
                owner.scoresProvider.add(new ScoresList(results), handler.intercept(continuation));
            } else {
                continuation(new Error(util.format("Session '%s' was not locked!", session)));
            }
        } else {
            continuation(new Error(util.format("There is no session '%s'!", session)));
        }
    }));
};

module.exports = exports = Commands;