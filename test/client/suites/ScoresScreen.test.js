(function (QUnit, jaws, ScoresScreen) {
    "use strict";

    QUnit.module("ScoresScreen", {
        setup: function () {
            this.scoresScreen = new ScoresScreen();
        }
    });

    QUnit.test("Creating ScoresScreen should setup options for prompt", function () {
        QUnit.ok(typeof(this.scoresScreen.promptOptions) !== "undefined", "Should have prompt options.");
    });

    QUnit.test("When there are rooms available it should create items on room list", function () {
        this.scoresScreen.scores = [
            { name: "Player 1", value: "12" },
            { name: "Player 2", value: "11" },
            { name: "Player 3", value: "10" },
            { name: "Player 4", value: "9" },
            { name: "Player 5", value: "8" }
        ];

        this.scoresScreen.setup();

        QUnit.equal(5, this.scoresScreen.scores.length, "Scores list length is equal to the original length.");
        QUnit.equal(3, this.scoresScreen.scoreItems.length, "Score items should have only three top items.");
    });

    QUnit.test("Setting up ScoresScreen create prompt object", function () {
        this.scoresScreen.setup();

        QUnit.ok(typeof(this.scoresScreen.prompt) !== "undefined", "Should have prompt object.");
    });

    QUnit.test("When set up, updating and drawing it should not explode", function () {
        QUnit.expect(0);

        this.scoresScreen.setup();

        this.scoresScreen.update();
        this.scoresScreen.draw();
    });

} (window.QUnit, window.jaws, window.ScoresScreen));