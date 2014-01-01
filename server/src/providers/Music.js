"use strict";

var MemoryCache = require("../caching/MemoryCache"),
    cache;

function randomFromRange(minimum, maximum) {
    return Math.floor(Math.random() * (maximum - minimum + 1) + minimum);
}

function initialize(directory, pattern, continuation) {
    cache = new MemoryCache(pattern, directory);
    cache.prefetch(continuation);
}

function tracks() {
    return Object.keys(cache.storage);
}

function streamRandomTrack(request, response) {
    var supportsMP3 = request.headers && request.headers.accept.indexOf("audio/mpeg") !== -1,
        file = "Music";

    if (supportsMP3) {
        response.writeHead(200, { "Content-Type": "audio/mpeg" });
    } else {
        response.writeHead(200, { "Content-Type": "audio/ogg" });
    }

    file += randomFromRange(1, tracks().length / 2).toString();
    file += supportsMP3 ? ".mp3" : ".ogg";

    // TODO: It should respond with content of file represented by variable 'file'.
}

module.exports = exports = {
    initialize: initialize,

    tracks: tracks,
    streamRandomTrack: streamRandomTrack
};