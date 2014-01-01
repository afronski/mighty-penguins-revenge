"use strict";

var CharactersForRemoval = "+=-!@#$%^&*()[]{}|\\/?.,<>;:'\"`~ \t\n\r",
    Replacement = "_",
    PostfixExtension = ".png";

function replaceIfInvalid(character) {
    if (CharactersForRemoval.indexOf(character) !== -1) {
        return Replacement;
    } else {
        return character;
    }
}

function filterName(name, element) {
    return element.nick !== name;
}

function Room(name) {
    if (!name) {
        throw new Error("Room name cannot be empty!");
    }

    this.name = name;
    this.mapName = Room.slugify(this.name) + PostfixExtension;

    this.players = [];
}

Room.prototype.addPlayer = function (player) {
    if (!player.nick || typeof(player.score) !== "number") {
        throw new Error("Player should have nick and score properties!");
    }

    this.players.push(player);
};

Room.prototype.removePlayer = function (name) {
    this.players = this.players.filter(filterName.bind(null, name));
};

Room.slugify = function (name) {
    return name.split("").map(replaceIfInvalid).join("");
};

module.exports = exports = Room;