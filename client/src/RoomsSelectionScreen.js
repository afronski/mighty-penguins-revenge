(function (jaws, Game, World, Constants) {
    "use strict";

    var GeneratedMapName = "TestMap1.png",
        FullGeneratedMapUrl = "/assets/" + GeneratedMapName;

    // Constructor.
    function RoomsSelectionScreen() {}

    // Private methods.
    function handleKeyboard() {
        if (jaws.pressed("up")) {

        }

        if (jaws.pressed("down")) {

        }

        if (jaws.pressedWithoutRepeat("space")) {
            Game.load(FullGeneratedMapUrl, function () {
                jaws.switchGameState(World.bind(World, GeneratedMapName));
            });
        }
    }

    // Public API.
    RoomsSelectionScreen.prototype.setup = function () {
        this.text = new jaws.Text({
            x: 100,
            y: 100,

            text: "SELECT ROOM:",

            fontSize: Constants.FontSize,
            fontFace: Constants.FontFace
        });
    };

    RoomsSelectionScreen.prototype.update = function () {
        // Handle input.
        handleKeyboard.call(this);
    };

    RoomsSelectionScreen.prototype.draw = function () {
        jaws.fill("white");

        this.text.draw();
    };

    window.RoomsSelectionScreen = RoomsSelectionScreen;

} (window.jaws, window.Game, window.World, window.Constants));