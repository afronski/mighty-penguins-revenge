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

            // TODO: Read each file with in asynchronous way and push it to the storage,
            //       only if there is no error. Be sure that you're reading buffers not string!
            //       Hint:
            //         - http://nodejs.org/api/fs.html#fs_fs_readfile_filename_options_callback
        });
    });
};

MemoryCache.prototype.exposeStream = function (file) {
    var stream = CombinedStream.create({ pauseStreams: false });

    stream.append(this.storage[file]);
    return stream;
};

module.exports = exports = MemoryCache;