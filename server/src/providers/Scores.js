"use strict";

function clear(continuation) {
    continuation();
}

function get(continuation) {
    continuation();
}

function add(score, continuation) {
    continuation();
}

function remove(roomName, continuation) {
    continuation();
}

module.exports = exports = {
    clear: clear,

    get: get,

    add: add,
    remove: remove
};