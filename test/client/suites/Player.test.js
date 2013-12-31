(function (QUnit, Player) {
    "use strict";

    QUnit.module("Player");

    QUnit.test("Player should have proper asset loaded", function () {
        var enemy = new Player();

        QUnit.equal("Player.png", enemy.asset);
    });

} (window.QUnit, window.Player));