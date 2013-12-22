"use strict";

require("should");

var fake = require("../../server/src/fake");

describe("Introduction", function () {

    it("Faked test", function () {
        fake().should.be.equal(true);
    });

});