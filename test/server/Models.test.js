"use strict";

require("should");

var Player = require("../../server/src/models/Player"),
    Room = require("../../server/src/models/Room"),
    ScoresList = require("../../server/src/models/ScoresList");

describe("Player", function () {

    it("should have nick and empty score", function () {
        var player = new Player("User");

        player.nick.should.be.equal("User");
        player.score.should.be.equal(0);
    });

    it("should explode when nick is empty", function () {
        (function () {
            new Player();
        }).should.throwError();

        (function () {
            new Player(null);
        }).should.throwError();

        (function () {
            new Player("");
        }).should.throwError();

        (function () {
            new Player(" \r\n\t");
        }).should.throwError();
    });

});

describe("Room", function () {

    it("should have name", function () {
        var room = new Room("Room 1");

        room.name.should.be.equal("Room 1");
    });

    it("should explode when no name was passed", function () {
        (function () {
            new Room();
        }).should.throwError();

        (function () {
            new Room(null);
        }).should.throwError();

        (function () {
            new Room("");
        }).should.throwError();
    });

    it("should have map name, generated from room's name", function () {
        var room = new Room("Room1");

        room.mapName.should.be.equal("Room1.png");
    });

    it("should provide way for slugifying map name", function () {
        var charactersForRemoval = "+=-!@#$%^&*()[]{}|\\/?.,<> ;:'\"`~ \t\n\r",
            room = new Room(charactersForRemoval);

        room.name.should.be.equal(charactersForRemoval);
        room.mapName.should.be.equal("____________________________________.png");

        room = new Room("Room #1");
        room.name.should.be.equal("Room #1");
        room.mapName.should.be.equal("Room__1.png");
    });

    it("should have players list", function () {
        var room = new Room("Room 1");

        room.players.length.should.be.equal(0);
    });

    it("should explode when new player does not have obligatory properties", function () {
        var room = new Room("Room 1");

        (function () {
            room.addPlayer({});
        }).should.throwError();

        (function () {
            room.addPlayer({ nick: "Test1" });
        }).should.throwError();

        (function () {
            room.addPlayer({ score: 0 });
        }).should.throwError();
    });

    it("should have ability to manage players list", function () {
        var room = new Room("Room 1");

        room.removePlayer("Player4");
        room.players.length.should.be.equal(0);

        room.addPlayer({ nick: "Player1", score: 0 });
        room.addPlayer({ nick: "Player2", score: 0 });
        room.addPlayer({ nick: "Player3", score: 0 });

        room.players.length.should.be.equal(3);

        room.removePlayer("Player3");
        room.players.length.should.be.equal(2);

        room.removePlayer("Player4");
        room.players.length.should.be.equal(2);
    });

});

describe("ScoresList", function () {

    it("should have room name", function () {
        var room = new Room("Room1"),
            scores = new ScoresList(room);

        scores.roomName.should.be.equal("Room1");
    });

    it("should have all players list with scores", function () {
        var room = new Room("Room1"),
            scores;

        room.addPlayer({ nick: "Player0", score: 0 });
        room.addPlayer({ nick: "Player1", score: 1 });
        room.addPlayer({ nick: "Player2", score: 2 });

        scores = new ScoresList(room);

        scores.players.length.should.be.equal(3);

        scores.players.forEach(function (player, index) {
            player.nick.should.be.equal("Player" + index.toString());
            player.score.should.be.equal(index);
        });
    });

});