"use strict";

require("should");

var path = require("path"),

    sinon = require("sinon"),
    concat = require("concat-stream"),

    musicProvider = require("../../server/src/providers/Music");

describe("Music provider", function () {

    beforeEach(function () {
        this.requestForMP3 = { headers: { "accept": "audio/mpeg" } };
        this.requestForOGG = { headers: { "accept": "audio/ogg" } };

        this.responseForMP3 = concat(function (data) {
            data.toString().should.be.equal("MP3");
        });

        this.responseForMP3.writeHead = sinon.spy();

        this.responseForOGG = concat(function (data) {
            data.toString().should.be.equal("OGG");
        });

        this.responseForOGG.writeHead = sinon.spy();

        sinon.spy(this.responseForMP3, "on");
        sinon.spy(this.responseForOGG, "on");
    });

    afterEach(function () {
        this.responseForMP3.on.restore();
        this.responseForOGG.on.restore();
    });

    it("should load all songs from specified pattern and directory", function (finish) {
        musicProvider.initialize(path.join(__dirname, "files/fake-music"), "Music*.*", function () {
            musicProvider.tracks().length.should.be.equal(4);

            finish();
        });
    });

    it("should stream OGG by default", function () {
        musicProvider.streamRandomTrack({}, this.responseForOGG);

        sinon.assert.calledWith(this.responseForOGG.writeHead, 200, { "Content-Type": "audio/ogg" });
        sinon.assert.called(this.responseForOGG.on);
    });

    it("should stream OGG track when requested with proper 'Accept' header", function () {
        musicProvider.streamRandomTrack(this.requestForOGG, this.responseForOGG);

        sinon.assert.calledWith(this.responseForOGG.writeHead, 200, { "Content-Type": "audio/ogg" });
        sinon.assert.called(this.responseForOGG.on);
    });

    it("should stream MP3 track when requested with proper 'Accept' header", function () {
        musicProvider.streamRandomTrack(this.requestForMP3, this.responseForMP3);

        sinon.assert.calledWith(this.responseForMP3.writeHead, 200, { "Content-Type": "audio/mpeg" });
        sinon.assert.called(this.responseForMP3.on);
    });

});