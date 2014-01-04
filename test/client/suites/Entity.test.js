(function (QUnit, jaws, Entity, Bullet, Constants) {
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

    QUnit.test("After passing nick as a parameter it should be set up", function () {
        var entity = new Entity({ nick: "Nick" });

        entity.initialize("Player.png");

        QUnit.equal("Nick", entity.nick);
    });

    QUnit.test("Dump should return all properties", function () {
        var entity = new Entity({ x: 100, y: -100, nick: "Nick" }),
            dump;

        entity.initialize("Player.png");
        dump = entity.dump();

        QUnit.equal(100, dump.x);
        QUnit.equal(-100, dump.y);

        QUnit.equal(0, dump.vx);
        QUnit.equal(0, dump.vy);

        QUnit.equal("Nick", dump.nick);

        QUnit.equal(100, dump.health);
        QUnit.equal(false, dump.dead);

        QUnit.equal(false, dump.flipped);
        QUnit.equal(0, dump.score);

        QUnit.equal(false, dump.jumping);
        QUnit.equal(true, dump.can_jump);
    });

    QUnit.test("Restore should restore all properties", function () {
        var entity = new Entity({ x: 100, y: -100, nick: "Nick" }),
            dump;

        entity.initialize("Player.png");
        dump = entity.dump();

        entity.x = 0;
        entity.y = 0;

        entity.vx = -10;
        entity.vy = -10;

        entity.nick = "Test";

        entity.health = 0;
        entity.dead = true;

        entity.flipped = true;
        entity.score = 10;

        entity.jumping = true;
        entity.can_jump = false;

        entity.restore(dump);

        QUnit.equal(100, entity.x);
        QUnit.equal(-100, entity.y);

        QUnit.equal(0, entity.vx);
        QUnit.equal(0, entity.vy);

        QUnit.equal("Nick", entity.nick);

        QUnit.equal(100, entity.health);
        QUnit.equal(false, entity.dead);

        QUnit.equal(false, entity.flipped);
        QUnit.equal(0, entity.score);

        QUnit.equal(false, entity.jumping);
        QUnit.equal(true, entity.can_jump);
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

    QUnit.test("When Entity fires should return new bullet", function () {
        QUnit.ok(this.entity.fire() instanceof Bullet, "When fires, should return new bullet.");

        this.entity.flipped = true;
        QUnit.ok(this.entity.fire() instanceof Bullet, "When fires, even with flipped it wil return new bullet.");
    });

    QUnit.test("Increasing score for Entity", function () {
        QUnit.equal(0, this.entity.getScore());

        this.entity.incrementScore();
        QUnit.equal(1, this.entity.getScore());
    });

    QUnit.test("Decreasing health will eventually kill an entity", function () {
        var increased = false;

        QUnit.equal(100, this.entity.getHealth());

        this.entity.decreaseHealth({
            power: 100,
            owner: {
                incrementScore: function () {
                    increased = true;
                }
            }
        });

        QUnit.equal(0, this.entity.getHealth(), "Health should be equal to zero.");
        QUnit.equal(true, this.entity.dead, "Entity should be killed.");
        QUnit.equal(true, increased, "After killing an entity, owner will receive a point.");
    });

} (window.QUnit, window.jaws, window.Entity, window.Bullet, window.Constants));