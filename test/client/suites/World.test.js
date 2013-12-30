(function (QUnit, jaws, World) {
    "use strict";

    QUnit.module("World", {
        setup: function () {
            this.world = new World();
        }
    });

    QUnit.test("Creating World should setup options for HUD", function () {
        QUnit.ok(typeof(this.world.hudOptions) !== "undefined", "Should have HUD options.");
        QUnit.ok(typeof(this.world.quadTree) !== "undefined", "Should have quad tree for collision.");
    });


    QUnit.test("Setting up World create prompt object", function () {
        this.world.setup({ x: 50, y: 3350 });

        QUnit.ok(typeof(this.world.hud) !== "undefined", "Should have hud object.");
    });

    QUnit.test("When set up, updating and drawing it should not explode", function () {
        QUnit.expect(0);

        this.world.setup({ x: 50, y: 3350 });

        this.world.update();
        this.world.draw();
    });

    QUnit.test("Should recalculate physics and collisions when player moves", function () {
        this.world.setup({ x: 50, y: 3350 });
        this.world.update();

        this.world.player.right();
        this.world.move(this.world.player);
        this.world.update();

        this.world.player.right();
        this.world.move(this.world.player);
        this.world.update();

        this.world.player.right();
        this.world.move(this.world.player);
        this.world.update();

        this.world.player.right();
        this.world.move(this.world.player);
        this.world.update();

        QUnit.expect(0);
    });

} (window.QUnit, window.jaws, window.World));