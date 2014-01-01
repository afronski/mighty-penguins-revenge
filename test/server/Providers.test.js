"use strict";

require("should");

var path = require("path"),

    Room = require("../../server/src/models/Room"),
    ScoresList = require("../../server/src/models/ScoresList"),

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

    before(function () {
        this.room = { name: "Room 1", players: [] };

        Rooms.setPath(path.join(__dirname, "databases"));
    });

    beforeEach(Rooms.clear);
    after(Rooms.close);

    it("should have ability to add new room to the storage", function (finish) {
        var owner = this;

        Rooms.get(function (error, results) {
            if (error) {
                finish(error);
                return;
            }

            results.length.should.be.equal(0);

            Rooms.add(owner.room, function (error) {
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
        var owner = this;

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

                Rooms.add(owner.room, function (error) {
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

                            finish();
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

                results.length.should.be.equal(1);

                results[0].should.be.an.instanceof(Room);
                results[0].name.should.be.equal("Room 1");
                results[0].players.length.should.be.equal(0);

                finish();
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

describe("Scores provider", function () {

    before(function () {
        this.score = { roomName: "Room 1", players: [] };

        Scores.setPath(path.join(__dirname, "databases"));
    });

    beforeEach(Scores.clear);
    after(Scores.close);

    it("should have ability to add new score to the storage", function (finish) {
        var owner = this;

        Scores.get(function (error, results) {
            if (error) {
                finish(error);
                return;
            }

            results.length.should.be.equal(0);

            Scores.add(owner.score, function (error) {
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
        var owner = this;

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

                Scores.add(owner.score, function (error) {
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

                            finish();
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

                results.length.should.be.equal(1);

                results[0].should.be.an.instanceof(ScoresList);
                results[0].roomName.should.be.equal("Room 1");
                results[0].players.length.should.be.equal(0);

                finish();
            });
        });
    });

});