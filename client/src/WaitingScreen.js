(function (jaws, Game, World, Constants, utils) {
    "use strict";

    var GeneratedMapName = "TestMap1.png",
        FullGeneratedMapUrl = "/assets/" + GeneratedMapName;

    // Constructor.
    function WaitingScreen(nick, roomName, createdByMe) {
        this.createdByMe = !!createdByMe;

        this.room = roomName;
        this.nick = nick;

        this.promptOptions = {
            x: this.createdByMe ? 280 : 365,
            y: 300,

            text: this.createdByMe ? "PRESS [SPACE] TO START" : "WAITING...",

            fontSize: Constants.SmallFontSize,
            fontFace: Constants.FontFace,

            color: Constants.ForegroundColor
        };

        this.informationOptions = {
            y: 250,

            text: createInformation(this.nick, this.room),
            textAlign: "center",

            fontSize: Constants.SmallFontSize,
            fontFace: Constants.FontFace,

            color: Constants.ForegroundColor
        };

        this.informationOptions.x = utils.calculateCenteringOffset(this.informationOptions.text, 900);
    }

    // Private methods.
    function createInformation(nick, room) {
        return nick + " in room " + room;
    }

    function handleKeyboard() {
        var constructor;

        /* istanbul ignore next */
        if (jaws.pressedWithoutRepeat("space")) {
            constructor = World.bind(World, GeneratedMapName);

            if (this.createdByMe) {
                Game.loadMap(FullGeneratedMapUrl, jaws.switchGameState.bind(jaws, constructor));
            }

            // TODO: Waiting for signal from server.
        }
    }

    // Public API.
    WaitingScreen.prototype.setup = function () {
        this.title = new jaws.Text({
            x: 110,
            y: 100,

            text: "WAIT FOR OTHERS TO JOIN",

            fontSize: Constants.FontSize,
            fontFace: Constants.FontFace
        });

        this.prompt = new jaws.Text(this.promptOptions);

        this.prompt.frames = 0;
        this.prompt.visibility = true;
        this.prompt.originalOptions = this.promptOptions;

        this.information = new jaws.Text(this.informationOptions);

        this.information.frames = 0;
        this.information.visibility = true;
        this.information.originalOptions = this.informationOptions;
    };

    WaitingScreen.prototype.update = function () {
        // Handle input.
        handleKeyboard.call(this);

        utils.makeTextBlink.call(this.prompt);
        utils.makeTextBlink.call(this.information);
    };

    WaitingScreen.prototype.draw = function () {
        jaws.fill(Constants.BackgroundColor);

        this.title.draw();

        this.prompt.draw();
        this.information.draw();
    };

    window.WaitingScreen = WaitingScreen;

} (window.jaws, window.Game, window.World, window.Constants, window.utils));