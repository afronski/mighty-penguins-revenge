(function (QUnit, Game) {
    "use strict";

    QUnit.test("Should load from proper path if no arguments passed to the setup", function () {
        Game.setUp();

        QUnit.equal("/images/", Game.getRootPath());
    });

} (window.QUnit, window.Game));