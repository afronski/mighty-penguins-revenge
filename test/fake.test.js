"use strict";

require("should");

var fake = require("../src/fake");

describe("Introduction", function() {

  it("Faked test", function() {
    fake().should.be.equal(true);
  });

});