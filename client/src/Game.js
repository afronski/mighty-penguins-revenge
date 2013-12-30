(function (jaws) {
    "use strict";

    var DefaultAssetsPrefix = "/assets/",

        UsedKeys = [ "up", "down", "left", "right", "space" ],
        Assets = [
            "Bullet.png",
            "Enemy.png",
            "Player.png"
        ],

        RootPath;

    // Private methods.
    function loadImage(url, loaded) {
        var image = new Image();

        image.addEventListener("load", loaded);
        image.src = url;
    }

    // Public API - Implementation.
    function getRootPath() {
        return RootPath;
    }

    function setUp(assetsPath) {
        RootPath = assetsPath || DefaultAssetsPrefix;

        jaws.unpack();
        jaws.assets.setRoot(RootPath).add(Assets);

        jaws.preventDefaultKeys(UsedKeys);
    }

    function load(url, continuation) {
        var mapName = url.split("/").pop();

        function finished() {
            jaws.assets.data[mapName] = jaws.imageToCanvas(this);

            if (typeof(continuation) === "function") {
                continuation();
            }
        }

        loadImage(url, finished);
    }

    window.Game = {
        load: load,
        setUp: setUp,
        getRootPath: getRootPath,
    };

} (window.jaws));