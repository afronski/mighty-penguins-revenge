(function (jaws, RoomsSelectionScreen, Constants, utils) {
    "use strict";

    // Constructor.
    function IntroScreen() {
        this.promptOptions = {
            x: 280,
            y: 300,

            text: "PRESS [SPACE] TO START",

            fontSize: Constants.SmallFontSize,
            fontFace: Constants.FontFace,

            color: Constants.ForegroundColor
        };
    }

    // Private methods.
    function handleKeyboard() {
        if (jaws.pressedWithoutRepeat("space")) {
            jaws.switchGameState(RoomsSelectionScreen);
        }
    }

    // Public API.
    IntroScreen.prototype.setup = function () {
        this.title = new jaws.Text({
            x: 100,
            y: 100,

            text: "MIGHTY PENGUINS REVENGE!",

            fontSize: Constants.FontSize,
            fontFace: Constants.FontFace
        });

        this.prompt = new jaws.Text(this.promptOptions);

        this.prompt.frames = 0;
        this.prompt.visibility = true;
        this.prompt.originalOptions = this.promptOptions;
    };

    IntroScreen.prototype.update = function () {
        // Handle input.
        handleKeyboard.call(this);

        utils.makeTextBlink.call(this.prompt);
    };

    IntroScreen.prototype.draw = function () {
        jaws.fill(Constants.BackgroundColor);

        this.title.draw();
        this.prompt.draw();
    };

    window.IntroScreen = IntroScreen;

} (window.jaws, window.RoomsSelectionScreen, window.Constants, window.utils));