(function (QUnit, Enemy) {
    "use strict";

    QUnit.test("Enemy should have proper asset loaded", function () {
        var enemy = new Enemy();

        QUnit.equal("Enemy.png", enemy.asset);
    });

} (window.QUnit, window.Enemy));