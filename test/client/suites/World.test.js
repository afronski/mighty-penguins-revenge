(function (QUnit, jaws, World) {
    "use strict";

    QUnit.module("World", {
        setup: function () {
            this.world = new World();
        }
    });

    QUnit.test("Creating World should setup options for HUD", function () {
        QUnit.ok(typeof(this.world.hudOptions) !== "undefined", "Should have HUD options.");
    });


    QUnit.test("Setting up World create prompt object", function () {
        this.world.setup();

        QUnit.ok(typeof(this.world.hud) !== "undefined", "Should have hud object.");
    });

    QUnit.test("When set up, updating and drawing it should not explode", function () {
        QUnit.expect(0);

        this.world.setup();

        this.world.update();
        this.world.draw();
    });

    QUnit.test("Should recalculate physics and collisions when player moves", function () {
        this.world.setup();

        this.world.player.right();
        this.world.move(this.world.player);

        QUnit.expect(0);
    });

} (window.QUnit, window.jaws, window.World));