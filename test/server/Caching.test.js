"use strict";

require("should");

var ALL_FILES = "*",

    path = require("path"),

    concat = require("concat-stream"),

    MemoryCache = require("../../server/src/caching/MemoryCache");

describe("Memory cache", function () {

    it("should have files pattern", function () {
        var cache = new MemoryCache(ALL_FILES);

        cache.pattern.should.be.equal(ALL_FILES);
    });

    it("should have directory for searching", function () {
        var cache = new MemoryCache(ALL_FILES, path.join(__dirname, "files"));

        cache.directory.should.be.equal(path.join(__dirname, "files"));
    });

    it("should have empty cache at the beginning", function () {
        var cache = new MemoryCache("*.txt", path.join(__dirname, "files"));

        Object.keys(cache.storage).length.should.be.equal(0);
    });

    it("should have proper amount of elements after loading", function (finish) {
        var cache = new MemoryCache("*.txt", path.join(__dirname, "files"));

        cache.prefetch(function () {
            Object.keys(cache.storage).length.should.be.equal(3);

            finish();
        });
    });

    it("should provide ability to expose each element as a stream", function (finish) {
        var cache = new MemoryCache("*.txt", path.join(__dirname, "files"));

        cache.prefetch(function () {
            cache.exposeStream("File3.txt").pipe(
                concat(function (data) {
                    data.toString().should.be.equal("FULL FILE CONTENT.");

                    finish();
                })
            );
        });
    });

});