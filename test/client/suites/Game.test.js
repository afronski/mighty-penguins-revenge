(function (QUnit, jaws, Game) {
    "use strict";

    QUnit.test("Should load from proper path if no arguments passed to the setup", function () {
        Game.setUp();

        QUnit.equal("/assets/", Game.getRootPath());
    });

    QUnit.test("Should load image from passed path without continuation as well", function () {
        QUnit.stop();
        QUnit.expect(0);

        Game.load("/client/assets/TestMap1.png");

        setTimeout(QUnit.start, 1000);
    });

} (window.QUnit, window.jaws, window.Game));