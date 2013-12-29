(function (jaws, RoomsSelectionScreen, Constants) {
    "use strict";

    // Constructor.
    function IntroScreen() {}

    // Private methods.
    function handleKeyboard() {
        if (jaws.pressedWithoutRepeat("space")) {
            jaws.switchGameState(RoomsSelectionScreen);
        }
    }

    // Public API.
    IntroScreen.prototype.setup = function () {
        this.text = new jaws.Text({
            x: 100,
            y: 100,

            text: "MIGHTY PENGUINS REVENGE!",
            fontSize: Constants.TextSize
        });
    };

    IntroScreen.prototype.update = function () {
        // Handle input.
        handleKeyboard.call(this);
    };

    IntroScreen.prototype.draw = function () {
        jaws.fill("white");

        this.text.draw();
    };

    window.IntroScreen = IntroScreen;

} (window.jaws, window.RoomsSelectionScreen, window.Constants));