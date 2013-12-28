(function (QUnit, jaws, Player) {
    "use strict";

    QUnit.test("Player should derive from jaws.Sprite prototype", function () {
        var player = new Player();

        QUnit.ok(player instanceof jaws.Sprite, "It should be a Sprite from jaws library!");
    });

    QUnit.test("Player should be in rest state at the beginning", function () {
        var player = new Player();

        QUnit.equal(player.restAnimation.frames[0], player.image,
                    "Current image should be equal to first frame of rest animation.");
    });

    QUnit.test("After moving to the right, velocity should change", function () {
        var player = new Player();

        player.right();

        QUnit.ok(player.vx > 0, "Velocity after moving to the right should be greater than zero.");
        QUnit.equal(false, player.flipped, "Also we have to draw sprite normally.");
    });

    QUnit.test("After moving to the left, velocity and flipped state should change", function () {
        var player = new Player();

        player.left();

        QUnit.ok(player.vx < 0, "Velocity after moving to the right should be less than zero.");
        QUnit.equal(true, player.flipped, "Also we have to draw sprite as flipped.");
    });

    QUnit.test("After invoking rest, current image should return to the initial state", function () {
        var player = new Player();

        player.can_jump = true;

        player.right();
        player.update();
        QUnit.notEqual(player.restAnimation.frames[0], player.image,
                      "Current image should not be in initial state.");

        player.rest();
        QUnit.equal(player.restAnimation.frames[0], player.image,
                    "Current image should return to initial state.");
    });

    QUnit.test("Bounding rectangle should return size of one frame times factor of image scaling", function () {
        var player = new Player(),
            boundingRect = player.col_rect();

        QUnit.equal(6 * 5, boundingRect.width);
        QUnit.equal(11 * 5, boundingRect.height);
    });

    QUnit.test("Jumping should change frame to jump only if velocity on Y axis is less than zero", function () {
        var player = new Player();

        player.jump();
        player.update();
        QUnit.equal(player.jumpAnimation.frames[0], player.image,
                    "Current image should be equal to the first frame of jumping animation.");

        player.vy = 0.0;
        player.update();
        QUnit.equal(player.restAnimation.frames[0], player.image,
                    "When we falling down, current image should be equal to the first frame of rest animation.");
    });

    QUnit.test("Jumping is possible only when you are not jumping already", function () {
        var player = new Player();

        player.jump();

        QUnit.equal(false, player.can_jump, "After jumping we cannot jump again until we land.");
    });


} (window.QUnit, window.jaws, window.Player));