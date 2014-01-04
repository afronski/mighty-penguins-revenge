"use strict";

function ScoresList(room) {
    this.roomName = room.name;
    this.session = room.session;
    this.players = JSON.parse(JSON.stringify(room.players));
}

module.exports = exports = ScoresList;