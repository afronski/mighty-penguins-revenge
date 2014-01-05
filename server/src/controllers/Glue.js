"use strict";

var domain = require("domain"),

    ConsoleLogger = require("../loggers/ConsoleLogger"),

    Queries = require("./Queries"),
    Commands = require("./Commands");

// Private helpers.

function bySession(session, room) {
    return room.session === session;
}

function withoutPlayer(nick, player) {
    return player.nick !== nick;
}

// Constructor.

function Glue(rooms, scores, settings) {
    this.queries = new Queries(rooms, scores);
    this.commands = new Commands(rooms, scores);

    this.settings = settings;
}

// Public methods.

Glue.prototype.createRoom = function (socket, room, player) {
    var owner = this,
        handler = domain.create();

    /* istanbul ignore next: Untestable */
    handler.on("error", function (error) {
        ConsoleLogger.error("[Glue.createRoom] Error occurred:", error);
    });

    this.commands.createRoom(room, player, handler.intercept(function (session) {
        ConsoleLogger.info("Room '%s' with session '%s' created by '%s'.", room, session, player.nick);

        socket.set("nick", player.nick, function () {
            socket.set("room-author", true);
            socket.set("session", session);

            socket.emit("room-created", session);
            socket.join(session);

            owner.queries.getAccessibleRooms(handler.intercept(function (rooms) {
                socket.broadcast.emit("list-of-rooms", rooms);
            }));
        });
    }));
};

Glue.prototype.joinRoom = function (socket, session, player) {
    var owner = this,
        handler = domain.create();

    /* istanbul ignore next: Untestable */
    handler.on("error", function (error) {
        ConsoleLogger.error("[Glue.joinRoom] Error occurred:", error);
    });

    socket.set("nick", player.nick, function () {
        socket.set("room-author", false);
        socket.set("session", session);

        socket.join(session);

        ConsoleLogger.info("Room '%s' joined by player '%s'.", session, player.nick);

        owner.commands.joinRoom(session, player, handler.intercept(function (room) {
            socket.emit("room-joined", room.session, room.name);
        }));
    });
};

Glue.prototype.getListOfRooms = function (socket) {
    var handler = domain.create();

    /* istanbul ignore next: Untestable */
    handler.on("error", function (error) {
        ConsoleLogger.error("[Glue.getListOfRooms] Error occurred:", error);
    });

    this.queries.getAccessibleRooms(handler.intercept(function (rooms) {
        socket.emit("list-of-rooms", rooms);
    }));
};

Glue.prototype.handleGameStart = function (socket, session) {
    var owner = this,
        handler = domain.create();

    /* istanbul ignore next: Untestable */
    handler.on("error", function (error) {
        ConsoleLogger.error("[Glue.handleGameStart] Error occurred:", error);
    });

    socket.get("room-author", handler.intercept(function (isAuthor) {
        owner.queries.getAccessibleRooms(handler.intercept(function (rooms) {
            rooms = rooms.filter(bySession.bind(null, session))[0];

            if (rooms) {
                /* istanbul ignore else: Guard */
                if (isAuthor) {
                    owner.commands.lockRoom(session, handler.intercept(function () {
                        ConsoleLogger.info("Game associated with session '%s' started!", session);
                        socket.broadcast.to(session).emit("game-started");

                        owner.queries.getAccessibleRooms(handler.intercept(function (rooms) {
                            socket.broadcast.emit("list-of-rooms", rooms);
                        }));
                    }));
                } else {
                    ConsoleLogger.error("Not an author requested the game start of '%s'.", session);
                }
            } else {
                ConsoleLogger.error("Unknown room '%s' requested on game start.", session);
                socket.emit("game-failed");
            }
        }));
    }));
};

Glue.prototype.getPlayersList = function (socket, session) {
    var owner = this,
        handler = domain.create();

    /* istanbul ignore next: Untestable */
    handler.on("error", function (error) {
        ConsoleLogger.error("[Glue.getPlayersList] Error occurred:", error);
    });

    socket.get("nick", handler.intercept(function (nick) {
        owner.queries.roomsProvider.get(handler.intercept(function (rooms) {
            rooms = rooms.filter(bySession.bind(null, session))[0];

            /* istanbul ignore else: Guard */
            if (rooms) {
                socket.emit("list-of-players", rooms.players.filter(withoutPlayer.bind(null, nick)));
                ConsoleLogger.info("Retreiving players for '%s' room, requested by '%s'.", session, nick);
            }
        }));
    }));
};

Glue.prototype.getAllPlayersList = function (socket, session) {
    this.queries.roomsProvider.get(function (error, rooms) {
        /* istanbul ignore if: Untestable */
        if (error) {
            ConsoleLogger.error("[Glue.getAllPlayersList] Error occurred:", error);
            return;
        }

        rooms = rooms.filter(bySession.bind(null, session))[0];

        /* istanbul ignore else: Guard */
        if (rooms) {
            socket.emit("list-of-all-players", rooms.players);
            ConsoleLogger.info("Retreiving all players for '%s' room.", session);
        }
    });
};

Glue.prototype.broadcastPlayerState = function (socket, session, state) {
    socket.broadcast.to(session).emit("enemy-update", state);
};

Glue.prototype.broadcastPlayerBullet = function (socket, session, nick) {
    socket.broadcast.to(session).emit("new-bullet", nick);
};

Glue.prototype.disconnectionHandler = function (socket) {
    var owner = this,
        handler = domain.create();

    /* istanbul ignore next: Untestable */
    handler.on("error", function (error) {
        ConsoleLogger.error("[Glue.disconnectionHandler] Error occurred:", error);
    });

    socket.get("room-author", handler.intercept(function (isAuthor) {
        socket.get("session", handler.intercept(function (session) {
            socket.get("nick", handler.intercept(function (nick) {
                owner.commands.leaveRoom(session, { nick: nick }, handler.intercept(function () {
                    ConsoleLogger.info("Player '%s' disconnected from room '%s'.", nick, session);

                    socket.leave(session);
                    socket.broadcast.to(session).emit("enemy-disconnected", nick);

                    if (isAuthor) {
                        owner.commands.deleteRoom(session, handler.intercept(function () {
                            ConsoleLogger.info("Room '%s' deleted.", session);
                            socket.broadcast.to(session).emit("game-failed");

                            owner.queries.getAccessibleRooms(handler.intercept(function (rooms) {
                                socket.broadcast.emit("list-of-rooms", rooms);
                            }));
                        }));
                    }
                }));
            }));
        }));
    }));
};

Glue.prototype.updateScore = function (socket, session, nick, score) {
    var owner = this,
        handler = domain.create();

    /* istanbul ignore next: Untestable */
    handler.on("error", function (error) {
        ConsoleLogger.error("[Glue.updateScore] Error occurred:", error);
    });

    socket.get("session", handler.intercept(function (session) {
        owner.commands.updateScore(session, nick, score, handler.intercept(function (acceptedScore) {
            /* istanbul ignore else: Guard */
            if (acceptedScore >= owner.settings.MaximumScore) {
                owner.commands.closeContest(session, handler.intercept(function () {
                    owner.commands.deleteRoom(session, handler.intercept(function () {
                        ConsoleLogger.info("Session '%s' closed successfully, proceeding to scores.", session);

                        socket.emit("game-finished");
                        socket.broadcast.to(session).emit("game-finished");
                    }));
                }));
            }
        }));
    }));
};

Glue.prototype.returnScore = function (socket, session) {
    var handler = domain.create();

    /* istanbul ignore next: Untestable */
    handler.on("error", function (error) {
        ConsoleLogger.error("[Glue.returnScore] Error occurred:", error);
    });

    this.queries.getScoresForSession(session, handler.intercept(function (scores) {
        socket.broadcast.to(session).emit("game-score", scores);
    }));
};

Glue.prototype.wire = function (webSockets) {
    var owner = this;

    /* istanbul ignore next: Untestable */
    webSockets.of("/rooms").on("connection", function (socket) {
        socket.on("create-room", owner.createRoom.bind(owner, socket));
        socket.on("join-room", owner.joinRoom.bind(owner, socket));
        socket.on("get-list-of-rooms", owner.getListOfRooms.bind(owner, socket));

        socket.on("start-game", owner.handleGameStart.bind(owner, socket));

        socket.on("players-list", owner.getPlayersList.bind(owner, socket));
        socket.on("all-players-list", owner.getAllPlayersList.bind(owner, socket));

        socket.on("update-player-state", owner.broadcastPlayerState.bind(owner, socket));
        socket.on("player-fired", owner.broadcastPlayerBullet.bind(owner, socket));

        socket.on("disconnect", owner.disconnectionHandler.bind(owner, socket));

        socket.on("score-updated", owner.updateScore.bind(owner, socket));
        socket.on("get-score", owner.returnScore.bind(owner, socket));
    });
};

module.exports = exports = Glue;