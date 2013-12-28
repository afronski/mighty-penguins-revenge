(function (jaws) {
    "use strict";

    var DefaultAssetsPrefix = "/images/",

        UsedKeys = [ "up", "down", "left", "right", "space" ],
        Assets = [
            "Enemy.png",
            "Player.png"
        ],

        RootPath;

    function getRootPath() {
        return RootPath;
    }

    function setUp(assetsPath) {
        RootPath = assetsPath || DefaultAssetsPrefix;

        jaws.unpack();
        jaws.assets.setRoot(RootPath).add(Assets);

        jaws.preventDefaultKeys(UsedKeys);
    }

    window.Game = {
        setUp: setUp,
        getRootPath: getRootPath
    };

} (window.jaws));