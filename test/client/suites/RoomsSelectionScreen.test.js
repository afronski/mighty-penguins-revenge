(function (QUnit, jaws, RoomsSelectionScreen) {
    "use strict";

    QUnit.module("RoomsSelectionScreen", {
        setup: function () {
            this.roomsScreen = new RoomsSelectionScreen();
        },

        tearDown: function () {
            this.roomsScreen = null;
        }
    });

    QUnit.test("Creating RoomsSelectionScreen should setup options for selector", function () {
        QUnit.ok(typeof(this.roomsScreen.selectorOptions) !== "undefined", "Should have selector options.");
        QUnit.ok(typeof(this.roomsScreen.nickPromptOptions) !== "undefined", "Should have nick prompt options.");
        QUnit.ok(typeof(this.roomsScreen.newRoomPromptOptions) !== "undefined", "Should have room prompt options.");
        QUnit.ok(typeof(this.roomsScreen.roomSelectionPromptOptions) !== "undefined", "Should have room options.");
    });

    QUnit.test("Setting up RoomsSelectionScreen create selector object", function () {
        this.roomsScreen.setup();

        QUnit.ok(typeof(this.roomsScreen.selector) !== "undefined", "Should have selector object.");
    });

    QUnit.test("When there are rooms available it should create items on room list", function () {
        this.roomsScreen.rooms = [
            "Room 1",
            "Room 2",
            "Room 3"
        ];

        this.roomsScreen.setup();

        QUnit.equal(3, this.roomsScreen.roomItems.length, "Items list should be equal to received rooms length.");
    });

    QUnit.test("When set up, updating and drawing it should not explode", function () {
        QUnit.expect(0);

        this.roomsScreen.setup();

        this.roomsScreen.update();
        this.roomsScreen.draw();
    });

    QUnit.test("Moving selector up should change selected item", function () {
        this.roomsScreen.setup();

        this.roomsScreen.moveSelectorDown();
        this.roomsScreen.moveSelectorUp();

        QUnit.equal(true, this.roomsScreen.isSelected("SelectNick"));
    });

    QUnit.test("Moving selector down should change selected item", function () {
        this.roomsScreen.setup();

        this.roomsScreen.moveSelectorDown();

        QUnit.equal(true, this.roomsScreen.isSelected("NewRoom"));
    });

    QUnit.test("Moving selector up should cycle across items", function () {
        this.roomsScreen.rooms = [];
        this.roomsScreen.setup();

        this.roomsScreen.moveSelectorUp();
        this.roomsScreen.moveSelectorUp();

        QUnit.equal(true, this.roomsScreen.isSelected("SelectNick"));
    });

    QUnit.test("Moving selector down should cycle across items", function () {
        this.roomsScreen.rooms = [];
        this.roomsScreen.setup();

        this.roomsScreen.moveSelectorDown();
        this.roomsScreen.moveSelectorDown();

        QUnit.equal(true, this.roomsScreen.isSelected("SelectNick"));
    });

} (window.QUnit, window.jaws, window.RoomsSelectionScreen));