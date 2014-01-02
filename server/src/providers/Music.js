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
    var supportsOGG = request.headers && request.headers.accept.indexOf("audio/ogg") !== -1,
        file = "Music";

    if (supportsOGG) {
        response.writeHead(200, { "Content-Type": "audio/ogg" });
    } else {
        response.writeHead(200, { "Content-Type": "audio/mpeg" });
    }

    file += randomFromRange(1, tracks().length / 2).toString();
    file += supportsOGG ? ".ogg" : ".mp3";

    cache.exposeStream(file).pipe(response);
}

module.exports = exports = {
    initialize: initialize,

    tracks: tracks,
    streamRandomTrack: streamRandomTrack
};