"use strict";

var domain = require("domain"),

    ConsoleLogger = require("../loggers/ConsoleLogger"),

    Queries = require("./Queries"),
    Commands = require("./Commands");

// Private helpers.

function bySession(session, room) {
    return room.session === session;
}

// Constructor.

function Glue(rooms, scores) {
    this.queries = new Queries(rooms, scores);
    this.commands = new Commands(rooms, scores);
}

// Public methods.

Glue.prototype.handleGameStart = function (socket, session) {
    // TODO: It should broadcast two events:
    //         - 'game-started' if we will find game with corresponding session.
    //         - 'game-failed' if we can't find game with corresponding session.
    //
    //       Also it should 'lock' corresponding room in successful case when
    //       player is an author of the room.
};

Glue.prototype.wire = function (webSockets) {
    var owner = this,
        handler = domain.create();

    /* istanbul ignore next: Untestable */
    handler.on("error", function (error) {
        ConsoleLogger.error("Error occurred:", error);
    });

    /* istanbul ignore next: Untestable */
    webSockets.of("/rooms").on("connection", function (socket) {

        socket.on("create-room", function (room, player) {
            owner.commands.createRoom(room, player, handler.intercept(function (session) {
                ConsoleLogger.info("Room '%s' with session: '%s' created by '%s'.", room, player.nick, session);

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
        });

        socket.on("join-room", function (session, player) {
            socket.set("nick", player.nick, function () {
                socket.set("room-author", false);
                socket.set("session", session);

                socket.join(session);

                ConsoleLogger.info("Room '%s' joined by player '%s'.", session, player.nick);

                owner.commands.joinRoom(session, player, handler.intercept(function (room) {
                    socket.emit("room-joined", room.session, room.name);
                }));
            });
        });

        socket.on("get-list-of-rooms", function () {
            owner.queries.getAccessibleRooms(handler.intercept(function (rooms) {
                socket.emit("list-of-rooms", rooms);
            }));
        });

        socket.on("start-game", owner.handleGameStart.bind(owner, socket));

        socket.on("disconnect", function () {
            socket.get("room-author", handler.intercept(function (isAuthor) {
                socket.get("session", handler.intercept(function (session) {
                    socket.get("nick", handler.intercept(function (nick) {
                        owner.commands.leaveRoom(session, { nick: nick }, handler.intercept(function () {
                            ConsoleLogger.info("Player '%s' disconnected from room '%s'.", nick, session);
                            socket.leave(session);

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
        });
    });
};

module.exports = exports = Glue;