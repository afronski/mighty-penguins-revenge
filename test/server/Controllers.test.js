"use strict";

require("should");

var domain = require("domain"),

    Commands = require("../../server/src/controllers/Commands"),
    Queries = require("../../server/src/controllers/Queries"),
    Glue,

    helpers = require("./helpers/TestUtilities");

describe("Commands", function () {

    beforeEach(helpers.mockProviders);

    it("should receive providers implementation when it is created", function () {
        var commands = new Commands(this.rooms, this.scores);

        commands.roomsProvider.should.be.equal(this.rooms);
        commands.scoresProvider.should.be.equal(this.scores);
    });

    it("should have method for creating room and adding player which requested that to it", function (finish) {
        var commands = new Commands(this.rooms, this.scores);

        commands.createRoom("Room 3", this.player, function (error, session) {
            if (error) {
                finish(error);
                return;
            }

            session.should.match(/[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{8}/i);

            finish();
        });
    });

    it("should have method for deleting room", function (finish) {
        var owner = this,
            handler = domain.create(),
            commands = new Commands(this.rooms, this.scores);

        commands.deleteRoom(this.firstRoom.session, handler.intercept(function () {
            commands.roomsProvider.get(handler.intercept(function (rooms) {
                rooms.length.should.be.equal(1);
                rooms[0].name.should.not.be.equal(owner.firstRoom.name);

                finish();
            }));
        }));
    });

    it("should have method for joining to the room", function (finish) {
        var owner = this,
            commands = new Commands(this.rooms, this.scores);

        commands.joinRoom(this.firstRoom.session, this.player, function (error, room) {
            if (error) {
                finish(error);
                return;
            }

            room.players.length.should.be.equal(2);
            room.players[1].should.be.equal(owner.player);

            finish();
        });
    });

    it("should have method for leaving the room", function (finish) {
        var owner = this,
            handler = domain.create(),
            commands = new Commands(this.rooms, this.scores);

        handler.on("error", finish);

        commands.joinRoom(this.firstRoom.session, this.player, handler.intercept(function (room) {
            room.players.length.should.be.equal(2);

            commands.leaveRoom(owner.firstRoom.session, owner.player, handler.intercept(function (room) {
                room.players.length.should.be.equal(1);
                room.players[0].should.not.be.equal(owner.player);

                finish();
            }));
        }));
    });

    it("should have method for locking room", function (finish) {
        var handler = domain.create(),
            commands = new Commands(this.rooms, this.scores);

        handler.on("error", finish);

        commands.lockRoom(this.firstRoom.session, handler.intercept(function () {
            commands.roomsProvider.get(handler.intercept(function (rooms) {
                rooms[0].available.should.be.equal(false);

                finish();
            }));
        }));
    });

    it("should have method for joining to the room which explodes if there is no such session", function (finish) {
        var commands = new Commands(this.rooms, this.scores);

        commands.joinRoom("UNKN0WN0-SESS-I0N0-NUMB-ER000000", this.player, helpers.expectError.bind(null, finish));
    });

    it("should have method for leaving the room which explodes if there is no such session", function (finish) {
        var player = this.player,
            commands = new Commands(this.rooms, this.scores);

        commands.leaveRoom("UNKN0WN0-SESS-I0N0-NUMB-ER000000", player, helpers.expectError.bind(null, finish));
    });

    it("should have method for locking room which explodes when there is no such session", function (finish) {
        var commands = new Commands(this.rooms, this.scores);

        commands.lockRoom("UNKN0WN0-SESS-I0N0-NUMB-ER000000", helpers.expectError.bind(null, finish));
    });

    it("should have method for locking room which explodes when room is not available already", function (finish) {
        var commands = new Commands(this.rooms, this.scores);

        commands.lockRoom(this.secondRoom.session, helpers.expectError.bind(null, finish));
    });

});

describe("Queries", function () {
    beforeEach(helpers.mockProviders);

    it("should receive providers implementation when it is created", function () {
        var queries = new Queries(this.rooms, this.scores);

        queries.roomsProvider.should.be.equal(this.rooms);
        queries.scoresProvider.should.be.equal(this.scores);
    });

    it("should have method for returning only available rooms", function (finish) {
        var queries = new Queries(this.rooms, this.scores);

        queries.getAccessibleRooms(function (error, results) {
            if (error) {
                finish(error);
                return;
            }

            results.length.should.be.equal(1);
            results[0].available.should.be.equal(true);

            finish();
        });
    });

    it("should should have method for returning sorted scores for specified room", function (finish) {
        var queries = new Queries(this.rooms, this.scores),
            i;

        queries.getScoresForSession(this.mockedSession, function (error, results) {
            if (error) {
                finish(error);
                return;
            }

            for (i = 1; i < results.length; ++i) {
                results[i].score.should.be.below(results[i - 1].score);
            }

            finish();
        });
    });

    it("should should have method for getting scores which explodes for unknown room", function (finish) {
        var queries = new Queries(this.rooms, this.scores);

        queries.getScoresForSession("UNKN0WN0-SESS-I0N0-NUMB-ER000000", helpers.expectError.bind(null, finish));
    });

});

describe("Glue", function () {

    before(function () {
        helpers.mock();

        Glue = require("../../server/src/controllers/Glue");
    });

    after(helpers.disable);

    beforeEach(helpers.mockProviders);

    it("should create commands and queries objects with passed providers", function () {
        var glue = new Glue(this.rooms, this.scores);

        glue.queries.roomsProvider.should.be.equal(this.rooms);
        glue.queries.scoresProvider.should.be.equal(this.scores);

        glue.commands.roomsProvider.should.be.equal(this.rooms);
        glue.commands.scoresProvider.should.be.equal(this.scores);
    });

    it("should handle properly starting game requested by room author with broadcast to room", function (finish) {
        var glue = new Glue(this.rooms, this.scores),
            owner = this,
            mockedSocket = {
                get: function (what, continuation) {
                    continuation(null, true);
                },

                broadcast: {
                    to: function (session) {
                        session.should.be.equal(owner.firstRoom.session);

                        return mockedSocket;
                    },

                    emit: function (eventName, rooms) {
                        eventName.should.be.equal("list-of-rooms");
                        rooms.length.should.be.equal(0);

                        finish();
                    }
                },

                emit: function (eventName) {
                    eventName.should.be.equal("game-started");
                }
            };

        glue.handleGameStart(mockedSocket, this.firstRoom.session);
    });

    it("should handle properly starting game for unknown session", function (finish) {
        var glue = new Glue(this.rooms, this.scores),
            mockedSocket = {
                get: function (what, continuation) {
                    continuation(null, false);
                },

                emit: function (eventName) {
                    eventName.should.be.equal("game-failed");

                    finish();
                }
            };

        glue.handleGameStart(mockedSocket, "UNKN0WN0-SESS-I0N0-NUMB-ER000000");
    });

    it("should handle message which requests players list", function (finish) {
        var glue = new Glue(this.rooms, this.scores),
            owner = this,
            mockedSocket = {
                get: function (what, continuation) {
                    continuation(null, "Player 0");
                },

                emit: function (eventName, players) {
                    eventName.should.be.equal("list-of-players");

                    players.length.should.be.equal(1);
                    players[0].nick.should.not.be.equal("Player 0");

                    finish();
                }
            };

        glue.commands.joinRoom(this.firstRoom.session, this.player, function (error, room) {
            if (error) {
                finish(error);
                return;
            }

            room.players.length.should.be.equal(2);

            glue.getPlayersList(mockedSocket, owner.firstRoom.session);
        });
    });

    it("should handle message which requests all players list", function (finish) {
        var glue = new Glue(this.rooms, this.scores),
            owner = this,
            mockedSocket = {
                get: function (what, continuation) {
                    continuation(null, "Player 0");
                },

                emit: function (eventName, players) {
                    eventName.should.be.equal("list-of-all-players");

                    players.length.should.be.equal(2);

                    finish();
                }
            };

        glue.commands.joinRoom(this.firstRoom.session, this.player, function (error, room) {
            if (error) {
                finish(error);
                return;
            }

            room.players.length.should.be.equal(2);

            glue.getAllPlayersList(mockedSocket, owner.firstRoom.session);
        });
    });

    it("should handle properly state broadcasting", function (finish) {
        var glue = new Glue(this.rooms, this.scores),
            sentSession = "aaaa1111-2222-3333-4444-bbbb5555",
            state = {
                nick: "Player 0"
            },
            mockedSocket = {
                broadcast: {
                    to: function (session) {
                        session.should.be.equal(sentSession);

                        return this;
                    },

                    emit: function (eventName, state) {
                        eventName.should.be.equal("enemy-update");
                        state.should.be.equal(state);

                        finish();
                    }
                }
            };

        glue.broadcastPlayerState(mockedSocket, sentSession, state);
    });

    it("should handle properly player bullets broadcasting", function (finish) {
        var glue = new Glue(this.rooms, this.scores),
            sentSession = "aaaa1111-2222-3333-4444-bbbb5555",
            mockedSocket = {
                broadcast: {
                    to: function (session) {
                        session.should.be.equal(sentSession);

                        return this;
                    },

                    emit: function (eventName, nick) {
                        eventName.should.be.equal("new-bullet");
                        nick.should.be.equal("Player 0");

                        finish();
                    }
                }
            };

        glue.broadcastPlayerBullet(mockedSocket, sentSession, "Player 0");
    });

});