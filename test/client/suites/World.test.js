(function (QUnit, jaws, World, Bullet, Enemy) {
    "use strict";

    QUnit.module("World", {
        setup: function () {
            this.world = new World();
        }
    });

    QUnit.test("Creating World should setup options for HUD", function () {
        QUnit.ok(typeof(this.world.hudOptions) !== "undefined", "Should have HUD options.");
        QUnit.ok(typeof(this.world.quadTree) === "undefined", "Should not have any quad tree.");
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

    QUnit.test("World should remove dead enemies and bullets", function () {
        var deadEnemy = new Enemy({ x: 75, y: 3350 }),
            notDeadEnemy = new Enemy({ x: 125, y: 3350 }),
            deadBullet = new Bullet(deadEnemy, 1);

        this.world.setup({ x: 50, y: 3350 });

        deadEnemy.kill();
        deadBullet.kill();

        this.world.bullets.push(deadBullet);
        this.world.enemies.push(notDeadEnemy);
        this.world.enemies.push(deadEnemy);

        this.world.update();

        QUnit.equal(1, this.world.enemies.length, "Dead enemies should be removed.");
        QUnit.equal(0, this.world.bullets.length, "Dead bullets should be removed.");
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

    QUnit.test("Should recalculate physics and collisions when bullet moves", function () {
        var bullet;

        this.world.setup({ x: 50, y: 3350 });
        this.world.update();

        bullet = new Bullet(this.world.player, -1);

        this.world.moveBullet(bullet);
        this.world.update();

        QUnit.expect(0);
    });

    QUnit.test("Testing player movement", function () {
        this.world.setup({ x: 50, y: 3370 });

        this.world.player.vx = -10;
        this.world.player.vy = -10;

        this.world.move(this.world.player);

        QUnit.expect(0);
    });

    QUnit.test("After collision with bullets it should decrease health", function () {
        var enemy = new Enemy({ x: 75, y: 3350 }),
            enemyBullet;

        this.world.setup({ x: 50, y: 3350 });
        this.world.update();

        enemyBullet = new Bullet(enemy, -1);
        this.world.decreaseHealth(this.world.player, enemyBullet);

        QUnit.notEqual(100, this.world.player.getHealth(), "Enemy fire will kill eventually.");
    });

    QUnit.test("After collision with 'friendly fire' it should not decrease health", function () {
        var bullet;

        this.world.setup({ x: 50, y: 3350 });
        this.world.update();

        bullet = new Bullet(this.world.player, -1);
        this.world.decreaseHealth(this.world.player, bullet);

        QUnit.equal(100, this.world.player.getHealth(), "Friendly fire does not kill.");
    });

    QUnit.test("Player after killing should respawn", function () {
        jaws.game_state.setup({ x: 50, y: 3350 });
        jaws.game_state.player.kill();

        QUnit.equal(false, jaws.game_state.player.isAlive(), "Player should be killed.");

        jaws.game_state.update();
        QUnit.equal(true, jaws.game_state.player.isAlive(), "Player should be alive.");
    });

} (window.QUnit, window.jaws, window.World, window.Bullet, window.Enemy));