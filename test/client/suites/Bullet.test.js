(function (QUnit, Bullet, Constants) {
    "use strict";

    QUnit.module("Bullet", {
        setup: function () {
            this.owner = { x: 10, y: 25 };
        }
    });

    QUnit.test("It should create bullet which is 'alive'", function () {
        var bullet = new Bullet(this.owner, 1, {});

        bullet.prepare();

        QUnit.ok(bullet.isAlive(), "At the beggining bullet should be active.");

        QUnit.equal(this.owner.x, bullet.x);
        QUnit.equal(this.owner.y - Constants.FirePosition, bullet.y);

        QUnit.equal(this.owner, bullet.owner, "Owner is passed as a first argument.");
        QUnit.equal(false, bullet.flipped, "Direction is connected with flipped property.");
        QUnit.equal(10, bullet.power, "Killing power should be set up.");
    });

    QUnit.test("Collision rectangle should be equal to picture dimmensions", function () {
        var bullet = new Bullet(this.owner, 1),
            rectangle = bullet.col_rect();

        QUnit.equal(bullet.image.width, rectangle.width, "Rectangle width is equal to image width.");
        QUnit.equal(bullet.image.height, rectangle.height, "Rectangle height is equal to image height.");
    });

    QUnit.test("When direction points to the left velocity and flipped should be adjusted properly", function () {
        var bullet = new Bullet(this.owner, -1);

        QUnit.equal(true, bullet.flipped, "Sprite should be flipped.");
        QUnit.ok(bullet.vx < 0, "Velocity should be directed to the left.");
    });

    QUnit.test("After killing the bullet, and preparing it it should have velocity equal to zero", function () {
        var bullet = new Bullet(this.owner, -1);

        bullet.kill();
        QUnit.notEqual(0, bullet.vx, "Velocity should not be equal to zero.");

        bullet.prepare();
        QUnit.equal(0, bullet.vx, "Velocity should be equal to zero.");
    });

} (window.QUnit, window.Bullet, window.Constants));