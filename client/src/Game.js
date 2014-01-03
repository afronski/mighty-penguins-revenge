(function (jaws) {
    "use strict";

    var DefaultAssetsPrefix = "/assets/",
        RootPath,

        UsedKeys = [ "up", "down", "left", "right", "space", "m" ],

        Assets = [
            "Bullet.png",
            "Enemy.png",
            "Player.png"
        ],

        Sounds = [
            "SoundWeapon1.ogg",
            "SoundWeapon1.mp3"
        ],

        BackgroundAudioLocalStorageKey = "MutedBackgroundAudio",
        BackgroundAudio;

    // Private methods.
    /* istanbul ignore next */
    function getBackgroundAudioState() {
        return JSON.parse(window.localStorage.getItem(BackgroundAudioLocalStorageKey));
    }

    /* istanbul ignore next */
    function saveBackgroundAudioState(state) {
        window.localStorage.setItem(BackgroundAudioLocalStorageKey, state);
    }

    function loadImage(url, loaded) {
        var image = new Image();

        image.addEventListener("load", loaded);
        image.src = url;
    }

    /* istanbul ignore next */
    function loadAudio(url, loaded) {
        BackgroundAudio = new Audio();

        BackgroundAudio.autoplay = false;
        BackgroundAudio.loop = false;

        BackgroundAudio.volume = 1.0;
        BackgroundAudio.muted = getBackgroundAudioState() || false;

        BackgroundAudio.addEventListener("canplay", loaded);
        BackgroundAudio.src = url;
    }

    /* istanbul ignore next */
    function replayAgain() {
        this.currentTime = 0;
        this.play();
    }

    // Public API - Implementation.
    function getRootPath() {
        return RootPath;
    }

    function setUp(assetsPath) {
        var audioSupported = window.navigator.userAgent.search(/phantomjs/i) === -1;

        /* istanbul ignore if */
        if (audioSupported) {
            Assets = Assets.concat(Sounds);
        }

        RootPath = assetsPath || DefaultAssetsPrefix;

        jaws.unpack();
        jaws.assets.setRoot(RootPath).add(Assets);

        jaws.preventDefaultKeys(UsedKeys);
    }

    /* istanbul ignore next */
    function loadMusic(path) {
        loadAudio(path, function () {
            BackgroundAudio.addEventListener("ended", replayAgain, false);
            BackgroundAudio.play();
        });

        /* istanbul ignore next */
        window.addEventListener("blur", function () {
            if (BackgroundAudio) {
                BackgroundAudio.pause();
            }
        }, false);

        /* istanbul ignore next */
        window.addEventListener("focus", function () {
            if (BackgroundAudio) {
                BackgroundAudio.play();
            }
        }, false);

        /* istanbul ignore next */
        window.addEventListener("keydown", function (event) {
            var key = event.keyCode || event.which;

            // Mute background audio via "m" key.
            if (key === 77) {
                BackgroundAudio.muted = !BackgroundAudio.muted;
                saveBackgroundAudioState(BackgroundAudio.muted);
            }
        }, false);
    }

    function loadMap(url, continuation) {
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
        getRootPath: getRootPath,
        setUp: setUp,

        loadMap: loadMap,
        loadMusic: loadMusic
    };

} (window.jaws));