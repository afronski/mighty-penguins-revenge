(function (QUnit, Enemy) {
    "use strict";

    QUnit.module("Enemy");

    QUnit.test("Enemy should have proper asset loaded", function () {
        var enemy = new Enemy();

        QUnit.equal("Enemy.png", enemy.asset);
    });

    QUnit.test("Enemy should draw description also", function () {
        var enemy = new Enemy({ nick: "Test" });

        enemy.prepare();
        enemy.draw();

        QUnit.equal("Test (100)", enemy.descriptionOptions.text);
    });

    QUnit.test("Enemy should draw description with actual state", function () {
        var enemy = new Enemy({ nick: "Test" });

        enemy.prepare();
        enemy.draw();

        QUnit.equal("Test (100)", enemy.descriptionOptions.text);

        enemy.decreaseHealth({ power: 20 });

        enemy.prepare();
        enemy.draw();

        QUnit.equal("Test (80)", enemy.descriptionOptions.text);
    });

} (window.QUnit, window.Enemy));