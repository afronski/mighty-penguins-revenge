(function (jaws, Constants) {
    "use strict";

    // Constructor.
    function ScoresScreen() {}

    // Private methods.
    function handleKeyboard() {
        if (jaws.pressedWithoutRepeat("space")) {
            jaws.switchGameState(window.IntroScreen);
        }
    }

    // Public API.
    ScoresScreen.prototype.setup = function () {
        this.text = new jaws.Text({
            x: 100,
            y: 100,

            text: "SCORES:",
            fontSize: Constants.TextSize
        });
    };

    ScoresScreen.prototype.update = function () {
        // Handle input.
        handleKeyboard.call(this);
    };

    ScoresScreen.prototype.draw = function () {
        jaws.fill("white");

        this.text.draw();
    };

    window.ScoresScreen = ScoresScreen;

} (window.jaws, window.Constants));