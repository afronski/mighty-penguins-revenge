(function (jaws, Game, IntroScreen) {
    "use strict";

    jaws.onload = function () {
        Game.setUp();
        Game.loadMusic("/music");

        jaws.start(IntroScreen);
    };

} (window.jaws, window.Game, window.IntroScreen));