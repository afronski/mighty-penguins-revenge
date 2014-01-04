"use strict";

require("should");

var GuidRegularExpression = /[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{8}/i,

    domain = require("domain"),
    path = require("path"),

    Room = require("../../server/src/models/Room"),
    ScoresList = require("../../server/src/models/ScoresList"),

    Rooms = require("../../server/src/providers/Rooms"),
    Scores = require("../../server/src/providers/Scores");

describe("Empty rooms provider", function () {

    it("should explode when no path is set up", function () {
        (function () {
            Rooms.clear();
        }).should.throwError("Please setup a path for Rooms database!");
    });

});

describe("Rooms provider", function () {

    before(function () {
        this.room = {
            name: "Room 1",
            session: "aaaa1111-2222-3333-4444-bbbb5555",
            players: [],
            available: true
        };

        Rooms.setPath(path.join(__dirname, "databases"));
    });

    beforeEach(Rooms.clear);
    after(Rooms.close);

    it("should have ability to add new room to the storage", function (finish) {
        var owner = this,
            handler = domain.create();

        handler.on("error", finish);

        Rooms.get(handler.intercept(function (results) {
            results.length.should.be.equal(0);

            Rooms.add(owner.room, handler.intercept(function () {
                Rooms.get(handler.intercept(function (results) {
                    results.length.should.be.equal(1);

                    finish();
                }));
            }));
        }));
    });

    it("should have ability to clear storage", function (finish) {
        var handler = domain.create();

        handler.on("error", finish);

        Rooms.add(this.room, handler.intercept(function () {
            Rooms.get(handler.intercept(function (results) {
                results.length.should.not.be.equal(0);

                Rooms.clear(handler.intercept(function () {
                    Rooms.get(handler.intercept(function (results) {
                        results.length.should.be.equal(0);

                        finish();
                    }));
                }));
            }));
        }));
    });

    it("should have ability to remove room from the storage", function (finish) {
        var owner = this,
            handler = domain.create();

        handler.on("error", finish);

        Rooms.remove("UNKN0WN0-SESS-I0N0-NUMB-ER000000", handler.intercept(function () {
            Rooms.get(handler.intercept(function (results) {
                results.length.should.be.equal(0);

                Rooms.add(owner.room, handler.intercept(function () {
                    Rooms.remove(owner.room.session, handler.intercept(function () {
                        Rooms.get(handler.intercept(function (results) {
                            results.length.should.be.equal(0);

                            finish();
                        }));
                    }));
                }));
            }));
        }));
    });

    it("should have ability to get all rooms from the storage", function (finish) {
        var handler = domain.create();

        handler.on("error", finish);

        Rooms.add(this.room, handler.intercept(function () {
            Rooms.get(handler.intercept(function (results) {
                results.length.should.be.equal(1);

                results[0].should.be.an.instanceof(Room);
                results[0].name.should.be.equal("Room 1");
                results[0].session.should.match(GuidRegularExpression);
                results[0].available.should.be.equal(true);
                results[0].players.length.should.be.equal(0);

                finish();
            }));
        }));
    });

    it("should have ability update room in storage", function (finish) {
        var owner = this,
            handler = domain.create();

        handler.on("error", finish);

        Rooms.add(owner.room, handler.intercept(function () {
            var updatedRoom = JSON.parse(JSON.stringify(owner.room)),
                oldSession = owner.room.session;

            updatedRoom.name = "Room 123";
            updatedRoom.available = false;
            updatedRoom.players = [ {} ];

            Rooms.atomicUpdate(oldSession, updatedRoom, handler.intercept(function () {
                Rooms.get(handler.intercept(function (results) {
                    results.length.should.be.equal(1);

                    results[0].should.be.an.instanceof(Room);
                    results[0].session.should.be.equal(oldSession);

                    results[0].name.should.be.equal("Room 123");
                    results[0].available.should.be.equal(false);
                    results[0].players.length.should.be.equal(1);

                    finish();
                }));
            }));
        }));
    });

});

describe("Empty scores provider", function () {

    it("should explode when no path is set up", function () {
        (function () {
            Scores.clear();
        }).should.throwError("Please setup a path for Scores database!");
    });

});

describe("Scores provider", function () {

    before(function () {
        this.score = {
            roomName: "Room 1",
            session: "aaaa1111-2222-3333-4444-bbbb5555",
            players: []
        };

        Scores.setPath(path.join(__dirname, "databases"));
    });

    beforeEach(Scores.clear);
    after(Scores.close);

    it("should have ability to add new score to the storage", function (finish) {
        var owner = this,
            handler = domain.create();

        handler.on("error", finish);

        Scores.get(handler.intercept(function (results) {
            results.length.should.be.equal(0);

            Scores.add(owner.score, handler.intercept(function () {
                Scores.get(handler.intercept(function (results) {
                    results.length.should.be.equal(1);

                    finish();
                }));
            }));
        }));
    });

    it("should have ability to clear storage", function (finish) {
        var handler = domain.create();

        handler.on("error", finish);

        Scores.add(this.score, handler.intercept(function () {
            Scores.get(handler.intercept(function (results) {
                results.length.should.not.be.equal(0);

                Scores.clear(handler.intercept(function () {
                    Scores.get(handler.intercept(function (results) {
                        results.length.should.be.equal(0);

                        finish();
                    }));
                }));
            }));
        }));
    });

    it("should have ability to remove score from the storage", function (finish) {
        var owner = this,
            handler = domain.create();

        handler.on("error", finish);

        Scores.remove("UNKN0WN0-SESS-I0N0-NUMB-ER000000", handler.intercept(function () {
            Scores.get(handler.intercept(function (results) {
                results.length.should.be.equal(0);

                Scores.add(owner.score, handler.intercept(function () {
                    Scores.remove(owner.score.session, handler.intercept(function () {
                        Scores.get(handler.intercept(function (results) {
                            results.length.should.be.equal(0);

                            finish();
                        }));
                    }));
                }));
            }));
        }));
    });

    it("should have ability to get all score lists from the storage", function (finish) {
        var handler = domain.create();

        handler.on("error", finish);

        Scores.add(this.score, handler.intercept(function () {
            Scores.get(handler.intercept(function (results) {
                results.length.should.be.equal(1);

                results[0].should.be.an.instanceof(ScoresList);
                results[0].roomName.should.be.equal("Room 1");
                results[0].session.should.match(GuidRegularExpression);
                results[0].players.length.should.be.equal(0);

                finish();
            }));
        }));
    });

});