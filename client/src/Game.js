(function (jaws) {
    "use strict";

    var DefaultAssetsPrefix = "/images/",

        UsedKeys = [ "up", "down", "left", "right", "space" ],

        Assets = [
            "Enemy.png",
            "Player.png"
        ];

    function setUp(assetsPath) {
        jaws.unpack();
        jaws.assets.setRoot(assetsPath || DefaultAssetsPrefix).add(Assets);

        jaws.preventDefaultKeys(UsedKeys);
    }

    window.Game = {
        setUp: setUp
    };

} (window.jaws));