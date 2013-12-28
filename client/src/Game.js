(function (jaws, isTrue) {
    "use strict";

    var DefaultAssetsPrefix = "/images/",

        UsedKeys = [ "up", "down", "left", "right", "space" ],

        Assets = [
            "Player.png",
            "Enemy.png",
            "block.bmp"
        ];

    function setUp(continuation, assetsPath) {
        function finished() {
            if (jaws.assets.loaded.every(isTrue)) {
                continuation();
            }
        }

        jaws.unpack();
        jaws.assets.setRoot(assetsPath || DefaultAssetsPrefix).add(Assets).loadAll({ onload: finished });

        jaws.preventDefaultKeys(UsedKeys);
    }

    window.Game = {
        setUp: setUp
    };

} (window.jaws, window.isTrue));