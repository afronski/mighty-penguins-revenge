"use strict";

require("should");

var Rooms = require("../../server/src/providers/Rooms"),
    Scores = require("../../server/src/providers/Scores");

describe("Rooms provider", function () {

    beforeEach(function () {
        this.room = { name: "Room 1", players: [] };
    });

    afterEach(Rooms.clear);

    it("should have ability to add new room to the storage", function () {
        Rooms.get().length.should.be.equal(0);

        Rooms.add(this.room);
        Rooms.get().length.should.be.equal(1);
    });

    it("should have ability to clear storage", function () {
        Rooms.add(this.room);
        Rooms.get().length.should.not.be.equal(0);

        Rooms.clear();
        Rooms.get().length.should.be.equal(0);
    });

    it("should have ability to remove room from the storage", function () {
        Rooms.remove("Room 1");
        Rooms.get().length.should.be.equal(0);

        Rooms.add(this.room);
        Rooms.remove("Room 1");
        Rooms.get().length.should.be.equal(0);
    });

    it("should have ability to get all rooms from the storage", function () {
        var results;

        Rooms.add(this.room);
        results = Rooms.get();

        results.length.should.be.equal(0);
        results[0].name.should.be.equal("Room 1");
        results[0].players.length.should.be.equal(0);
    });

});

describe("ScoresProvider", function () {

    beforeEach(function () {
        this.score = { roomName: "Room 1", players: [] };
    });

    afterEach(Scores.clear);

    it("should have ability to add new score list to the storage", function () {
        Scores.get().length.should.be.equal(0);

        Scores.add(this.score);
        Scores.get().length.should.be.equal(1);
    });

    it("should have ability to clear storage", function () {
        Scores.add(this.score);
        Scores.get().length.should.not.be.equal(0);

        Scores.clear();
        Scores.get().length.should.be.equal(0);
    });

    it("should have ability to remove score list from the storage", function () {
        Scores.remove("Room 1");
        Scores.get().length.should.be.equal(0);

        Scores.add(this.room);
        Scores.remove("Room 1");
        Scores.get().length.should.be.equal(0);
    });

    it("should have ability to get all score lists from the storage", function () {
        var results;

        Scores.add(this.room);
        results = Scores.get();

        results.length.should.be.equal(0);
        results[0].roomName.should.be.equal("Room 1");
        results[0].players.length.should.be.equal(0);
    });

});