(function (QUnit, jaws, Entity, Constants) {
    "use strict";

    QUnit.module("Entity", {
        setup: function () {
            this.entity = new Entity();
            this.entity.initialize("Player.png");
        }
    });

    QUnit.test("Entity should derive from jaws.Sprite prototype", function () {
        QUnit.ok(this.entity instanceof jaws.Sprite, "It should be a Sprite from jaws library!");
    });

    QUnit.test("After passing position as a parameter it should be set up", function () {
        var entity = new Entity({ x: -10, y: -15 });

        entity.initialize("Player.png");

        QUnit.equal(-10, entity.x);
        QUnit.equal(-15, entity.y);
    });

    QUnit.test("At the beginning score and health should be setup", function () {
        QUnit.equal(0, this.entity.getScore());
        QUnit.equal(100, this.entity.getHealth());
    });

    QUnit.test("At the beginning it should be scaled and anchored at the bottom-center", function () {
        QUnit.equal(Constants.Scale, this.entity.scale_image);
        QUnit.equal("center_bottom", this.entity.anchor);
    });

    QUnit.test("Entity should be in rest state at the beginning", function () {
        QUnit.equal(this.entity.restAnimation.frames[0], this.entity.image,
                    "Current image should be equal to first frame of rest animation.");
    });

    QUnit.test("Entity preparation should reset velocity on X axis", function () {
        this.entity.vx = 10;
        this.entity.prepare();

        QUnit.equal(0, this.entity.vx, "Velocity on X axis after preparation should be equal to zero.");
    });

    QUnit.test("After moving to the right, velocity should change", function () {
        this.entity.right();

        QUnit.ok(this.entity.vx > 0, "Velocity after moving to the right should be greater than zero.");
        QUnit.equal(false, this.entity.flipped, "Also we have to draw sprite normally.");
    });

    QUnit.test("After moving to the left, velocity and flipped state should change", function () {
        this.entity.left();

        QUnit.ok(this.entity.vx < 0, "Velocity after moving to the right should be less than zero.");
        QUnit.equal(true, this.entity.flipped, "Also we have to draw sprite as flipped.");
    });

    QUnit.test("After invoking rest, current image should return to the initial state", function () {
        this.entity.jumping = false;
        this.entity.can_jump = true;

        this.entity.right();
        this.entity.update();

        QUnit.notEqual(this.entity.restAnimation.frames[0], this.entity.image,
                      "Current image should not be in initial state.");

        this.entity.rest();
        QUnit.equal(this.entity.restAnimation.frames[0], this.entity.image,
                    "Current image should return to initial state.");
    });

    QUnit.test("Bounding rectangle should equal to frame times factor of image scaling", function () {
        var boundingRect = this.entity.col_rect();

        QUnit.equal(Constants.EntitySize.Width * Constants.Scale, boundingRect.width);
        QUnit.equal(Constants.EntitySize.Height * Constants.Scale, boundingRect.height);
    });

    QUnit.test("Jumping will change frame to jump only if velocity on Y axis is less than zero", function () {
        this.entity.jumping = false;
        this.entity.can_jump = true;

        this.entity.jump();
        this.entity.update();
        QUnit.equal(this.entity.jumpAnimation.frames[0], this.entity.image,
                    "Current image should be equal to the first frame of jumping animation.");
    });

    QUnit.test("Jumping is possible only when you are not jumping already", function () {
        this.entity.jumping = true;
        this.entity.can_jump = false;

        this.entity.jump();

        QUnit.equal(true, this.entity.can_jump);
        QUnit.equal(true, this.entity.jumping, "After jumping we cannot jump again until we land.");
    });

    QUnit.test("After jumping it should restore to the rest animation", function () {
        this.entity.jumping = true;
        this.entity.can_jump = false;

        this.entity.jump();

        this.entity.jumping = false;
        this.entity.can_jump = true;
        this.entity.vy = 0;
        this.entity.vx = 0;

        this.entity.update();

        QUnit.equal(this.entity.restAnimation.frames[0], this.entity.image,
                    "After jumping it should restore to the rest animation frames.");
    });

} (window.QUnit, window.jaws, window.Entity, window.Constants));