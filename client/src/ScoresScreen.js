(function (jaws, io, Constants, utils) {
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

        /* istanbul ignore if */
        if (typeof(io) !== "undefined") {
            this.socket = io.connect("/rooms", Constants.SocketResource);

            this.gameState = JSON.parse(window.localStorage.getItem(Constants.GameStateKey));

            this.socket.on("game-score", this.handleReceivedScore.bind(this));

            this.socket.emit("get-score", this.gameState.session);
        }
    }

    // Private methods.

    function handleKeyboard() {
        /* istanbul ignore next */
        if (jaws.pressedWithoutRepeat("space")) {
            this.socket.removeAllListeners();

            jaws.switchGameState(window.IntroScreen);
        }
    }

    function createScoreItems(scores) {
        return scores.slice(0, 3).map(function (item, index) {
            var itemPosition = index + 1,
                itemOptions = jaws.clone(ScoreListItemOptions);

            itemOptions.y += itemPosition * ScoreListItemHeight;
            itemOptions.text = itemPosition + ". " + item.nick + " - " + item.score;

            return new jaws.Text(itemOptions);
        });
    }

    // Public API.
    ScoresScreen.prototype.handleReceivedScore = function (scores) {
        this.scores = scores;
        this.scoreItems = createScoreItems(this.scores);

        window.localStorage.removeItem(Constants.GameStateKey);
    };

    ScoresScreen.prototype.setup = function () {
        this.text = new jaws.Text({
            x: 100,
            y: 100,

            text: "SCORES:",

            fontSize: Constants.FontSize,
            fontFace: Constants.FontFace
        });

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

} (window.jaws, window.io, window.Constants, window.utils));