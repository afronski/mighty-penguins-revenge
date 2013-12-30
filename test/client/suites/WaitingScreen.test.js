(function (QUnit, jaws, WaitingScreen) {
    "use strict";

    QUnit.module("WaitingScreen", {
        setup: function () {
            this.waitingScreen = new WaitingScreen("Nick", "Room");
            this.authorWaitingScreen = new WaitingScreen("Author Nick", "Author Room", true);
        }
    });

    QUnit.test("Created WaitingScreen should have proper values set up", function () {
        QUnit.equal("Nick", this.waitingScreen.nick);
        QUnit.equal("Room", this.waitingScreen.room);

        QUnit.equal(false, this.waitingScreen.createdByMe);
        QUnit.equal(true, this.authorWaitingScreen.createdByMe);
    });

    QUnit.test("Creating WaitingScreen should setup options for prompt", function () {
        QUnit.ok(typeof(this.waitingScreen.promptOptions) !== "undefined", "Should have prompt options.");
        QUnit.ok(typeof(this.waitingScreen.informationOptions) !== "undefined", "Should have information options.");
    });

    QUnit.test("Setting up WaitingScreen create prompt object", function () {
        this.waitingScreen.setup();

        QUnit.ok(typeof(this.waitingScreen.prompt) !== "undefined", "Should have prompt object.");
        QUnit.ok(typeof(this.waitingScreen.information) !== "undefined", "Should have information object.");
    });

    QUnit.test("When set up, updating and drawing it should not explode", function () {
        QUnit.expect(0);

        this.waitingScreen.setup();

        this.waitingScreen.update();
        this.waitingScreen.draw();
    });

} (window.QUnit, window.jaws, window.WaitingScreen));