"use strict";

require("should");

var path = require("path"),

    Rooms = require("../../server/src/providers/Rooms"),
    Scores = require("../../server/src/providers/Scores");

describe("Empty rooms provider", function () {

    it("should explode when no path is set up", function () {
        (function () {
            Rooms.clear();
        }).should.throwError("Please setup a path for Rooms database!");
    });

});

describe("Rooms provider", function () {

    beforeEach(function () {
        this.room = { name: "Room 1", players: [] };
        Rooms.setPath(path.join(__dirname, "databases"));
    });

    afterEach(function (finish) {
        Rooms.clear(finish);
    });

    it("should have ability to add new room to the storage", function (finish) {
        Rooms.get(function (error, results) {
            if (error) {
                finish(error);
                return;
            }

            results.length.should.be.equal(0);

            Rooms.add(this.room, function (error) {
                if (error) {
                    finish(error);
                    return;
                }

                Rooms.get(function (error, results) {
                    if (error) {
                        finish(error);
                        return;
                    }

                    results.length.should.be.equal(1);

                    finish();
                });
            });
        });
    });

    it("should have ability to clear storage", function (finish) {
        Rooms.add(this.room, function (error) {
            if (error) {
                finish(error);
                return;
            }

            Rooms.get(function (error, results) {
                if (error) {
                    finish(error);
                    return;
                }

                results.length.should.not.be.equal(0);

                Rooms.clear(function (error) {
                    if (error) {
                        finish(error);
                        return;
                    }

                    Rooms.get(function (error, results) {
                        if (error) {
                            finish(error);
                            return;
                        }

                        results.length.should.be.equal(0);

                        finish();
                    });
                });
            });
        });
    });

    it("should have ability to remove room from the storage", function (finish) {
        Rooms.remove("Room 1", function (error) {
            if (error) {
                finish(error);
                return;
            }

            Rooms.get(function (error, results) {
                if (error) {
                    finish(error);
                    return;
                }

                results.length.should.be.equal(0);

                Rooms.add(this.room, function (error) {
                    if (error) {
                        finish(error);
                        return;
                    }

                    Rooms.remove("Room 1", function (error) {
                        if (error) {
                            finish(error);
                            return;
                        }

                        Rooms.get(function (error, results) {
                            if (error) {
                                finish(error);
                                return;
                            }

                            results.length.should.be.equal(0);
                        });
                    });
                });
            });
        });
    });

    it("should have ability to get all rooms from the storage", function (finish) {
        Rooms.add(this.room, function (error) {
            if (error) {
                finish(error);
                return;
            }

            Rooms.get(function (error, results) {
                if (error) {
                    finish(error);
                    return;
                }

                results.length.should.be.equal(0);

                results[0].name.should.be.equal("Room 1");
                results[0].players.length.should.be.equal(0);
            });
        });
    });

});

describe("Empty scores provider", function () {

    it("should explode when no path is set up", function () {
        (function () {
            Scores.clear();
        }).should.throwError("Please setup a path for Scores database!");
    });

});

describe.skip("Scores provider", function () {

    beforeEach(function () {
        this.score = { roomName: "Room 1", players: [] };
    });

    afterEach(function (finish) {
        Scores.clear(finish);
    });

    it("should have ability to add new score to the storage", function (finish) {
        Scores.get(function (error, results) {
            if (error) {
                finish(error);
                return;
            }

            results.length.should.be.equal(0);

            Scores.add(this.score, function (error) {
                if (error) {
                    finish(error);
                    return;
                }

                Scores.get(function (error, results) {
                    if (error) {
                        finish(error);
                        return;
                    }

                    results.length.should.be.equal(1);

                    finish();
                });
            });
        });
    });

    it("should have ability to clear storage", function (finish) {
        Scores.add(this.score, function (error) {
            if (error) {
                finish(error);
                return;
            }

            Scores.get(function (error, results) {
                if (error) {
                    finish(error);
                    return;
                }

                results.length.should.not.be.equal(0);

                Scores.clear(function (error) {
                    if (error) {
                        finish(error);
                        return;
                    }

                    Scores.get(function (error, results) {
                        if (error) {
                            finish(error);
                            return;
                        }

                        results.length.should.be.equal(0);

                        finish();
                    });
                });
            });
        });
    });

    it("should have ability to remove score from the storage", function (finish) {
        Scores.remove("Room 1", function (error) {
            if (error) {
                finish(error);
                return;
            }

            Scores.get(function (error, results) {
                if (error) {
                    finish(error);
                    return;
                }

                results.length.should.be.equal(0);

                Scores.add(this.score, function (error) {
                    if (error) {
                        finish(error);
                        return;
                    }

                    Scores.remove("Room 1", function (error) {
                        if (error) {
                            finish(error);
                            return;
                        }

                        Scores.get(function (error, results) {
                            if (error) {
                                finish(error);
                                return;
                            }

                            results.length.should.be.equal(0);
                        });
                    });
                });
            });
        });
    });

    it("should have ability to get all score lists from the storage", function (finish) {
        Scores.add(this.score, function (error) {
            if (error) {
                finish(error);
                return;
            }

            Scores.get(function (error, results) {
                if (error) {
                    finish(error);
                    return;
                }

                results.length.should.be.equal(0);

                results[0].roomName.should.be.equal("Room 1");
                results[0].players.length.should.be.equal(0);
            });
        });
    });

});