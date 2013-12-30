(function (QUnit, jaws, IntroScreen) {
    "use strict";

    QUnit.module("IntroScreen", {
        setup: function () {
            this.introScreen = new IntroScreen();
        }
    });

    QUnit.test("Creating IntroScreen should setup options for prompt", function () {
        QUnit.ok(typeof(this.introScreen.promptOptions) !== "undefined", "Should have prompt options.");
    });

    QUnit.test("Setting up IntroScreen create prompt object", function () {
        this.introScreen.setup();

        QUnit.ok(typeof(this.introScreen.prompt) !== "undefined", "Should have prompt object.");
    });

    QUnit.test("When set up, updating and drawing it should not explode", function () {
        QUnit.expect(0);

        this.introScreen.setup();

        this.introScreen.update();
        this.introScreen.draw();
    });

} (window.QUnit, window.jaws, window.IntroScreen));