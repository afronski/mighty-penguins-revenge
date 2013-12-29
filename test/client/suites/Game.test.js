(function (QUnit, Game) {
    "use strict";

    QUnit.test("Should load from proper path if no arguments passed to the setup", function () {
        Game.setUp();

        QUnit.equal("/assets/", Game.getRootPath());
    });

} (window.QUnit, window.Game));