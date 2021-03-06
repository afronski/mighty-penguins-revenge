"use strict";

var fs = require("fs"),
    domain = require("domain"),

    path = require("path"),
    glob = require("glob"),
    CombinedStream = require("combined-stream");

function MemoryCache(pattern, directory) {
    this.pattern = pattern;
    this.directory = directory;

    this.storage = {};
}

MemoryCache.prototype.prefetch = function (continuation) {
    var owner = this,
        loaded;

    function falsify() {
        return false;
    }

    function isTrue(value) {
        return value === true;
    }

    function finish(index) {
        loaded[index] = true;

        if (loaded.every(isTrue)) {
            continuation();
        }
    }

    glob(path.join(owner.directory, owner.pattern), function (error, files) {
        /* istanbul ignore next: Untestable */
        if (error) {
            continuation(error);
            return;
        }

        loaded = files.map(falsify);

        files.forEach(function (file, index) {
            var key = path.basename(file),
                handler = domain.create();

            handler.on("error", finish.bind(null, index));

            fs.exists(file, function (exists) {
                /* istanbul ignore else: Guard */
                if (exists) {
                    fs.stat(file, handler.intercept(function (stats) {
                        fs.open(file, "r", handler.intercept(function (fd) {
                            var buffer = new Buffer(stats.size);

                            fs.read(fd, buffer, 0, buffer.length, null, handler.intercept(function () {
                                owner.storage[key] = buffer;

                                fs.close(fd, handler.intercept(finish.bind(null, index)));
                            }));
                        }));
                    }));
                } else {
                    finish(index);
                }
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