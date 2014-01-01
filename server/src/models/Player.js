"use strict";

function Player(nick) {
    if (!nick.trim()) {
        throw new Error("Nick cannot be empty!");
    }

    this.nick = nick.trim();
    this.score = 0;
}

module.exports = exports = Player;