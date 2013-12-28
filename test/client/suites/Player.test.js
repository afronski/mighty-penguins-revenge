(function (jaws, Player) {
    "use strict";

    test("Player should derive from jaws.Sprite prototype", function () {
        var player = new Player();

        ok(player instanceof jaws.Sprite, "It should be a Sprite from jaws library!");
    });

} (window.jaws, window.Player));