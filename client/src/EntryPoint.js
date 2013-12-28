(function (jaws, Game, World) {
    "use strict";

    jaws.onload = function () {
        var MapName = "TestMap1.png";

        Game.setUp();

        World.load(MapName);
        jaws.start(World.bind(World, MapName));
    };

} (window.jaws, window.Game, window.World));