(function (jaws, Constants, utils) {
    "use strict";

    var ScoreListItemHeight = 40,
        ScoreListItemOptions = {
            x: 110,
            y: 160,

            fontSize: Constants.SmallFontSize,
            fontFace: Constants.FontFace
        };

    // Constructor.
    function ScoresScreen() {
        this.scores = [];
        this.scoreItems = [];

        this.promptOptions = {
            x: 260,
            y: 380,

            text: "PRESS [SPACE] TO CONTINUE",

            fontSize: Constants.SmallFontSize,
            fontFace: Constants.FontFace,

            color: Constants.ForegroundColor
        };
    }

    // Private methods.
    function handleKeyboard() {
        /* istanbul ignore if: Keyboard events - Untestable */
        /* istanbul ignore else: Keyboard events - Guard */
        if (jaws.pressedWithoutRepeat("space")) {
            jaws.switchGameState(window.IntroScreen);
        }
    }

    function createScoreItems(scores) {
        return scores.slice(0, 3).map(function (score, index) {
            var itemPosition = index + 1,
                itemOptions = jaws.clone(ScoreListItemOptions);

            itemOptions.y += itemPosition * ScoreListItemHeight;
            itemOptions.text = itemPosition + ". " + score.name + " - " + score.value;

            return new jaws.Text(itemOptions);
        });
    }

    // Public API.
    ScoresScreen.prototype.setup = function () {
        this.text = new jaws.Text({
            x: 100,
            y: 100,

            text: "SCORES:",

            fontSize: Constants.FontSize,
            fontFace: Constants.FontFace
        });

        // TODO: Create when AJAX return.
        this.scoreItems = createScoreItems(this.scores);

        this.prompt = new jaws.Text(this.promptOptions);

        this.prompt.frames = 0;
        this.prompt.visibility = true;
        this.prompt.originalOptions = this.promptOptions;
    };

    ScoresScreen.prototype.update = function () {
        // Handle input.
        handleKeyboard.call(this);

        utils.makeTextBlink.call(this.prompt);
    };

    ScoresScreen.prototype.draw = function () {
        jaws.fill(Constants.BackgroundColor);

        this.text.draw();
        this.prompt.draw();

        this.scoreItems.forEach(utils.each("draw"));
    };

    window.ScoresScreen = ScoresScreen;

} (window.jaws, window.Constants, window.utils));