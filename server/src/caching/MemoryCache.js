"use strict";

var fs = require("fs"),

    path = require("path"),
    glob = require("glob"),
    CombinedStream = require("combined-stream");

function MemoryCache(pattern, directory) {
    this.pattern = pattern;
    this.directory = directory;

    this.storage = {};
}

MemoryCache.prototype.prefetch = function (continuation) {
    var owner = this;

    function finish(index, length) {
        if (index === (length - 1)) {
            continuation();
        }
    }

    glob(path.join(owner.directory, owner.pattern), function (error, files) {
        /* istanbul ignore next: Untestable */
        if (error) {
            continuation(error);
            return;
        }

        files.forEach(function (file, index) {
            var key = path.basename(file);

            fs.readFile(file, function (error, buffer) {
                /* istanbul ignore else: Guard */
                if (!error) {
                    owner.storage[key] = buffer;
                }

                finish(index, files.length);
            });
        });
    });
};

MemoryCache.prototype.exposeStream = function (file) {
    var stream = CombinedStream.create({ pauseStreams: false });

    stream.append(this.storage[file]);
    return stream;
};

module.exports = exports = MemoryCache;