(function (jaws, WaitingScreen, Constants, utils) {
    "use strict";

    var NickPromptPrefix = "NICK: ",
        DefaultNick = "[Unknown Penguin]",

        RoomListItemHeight = 30,
        RoomListItemOptions = {
            x: 110,
            y: 210,

            fontSize: Constants.SmallFontSize,
            fontFace: Constants.FontFace
        },

        SelectedItem = 0,
        Selectable = [
            { name: "SelectNick", y: 75 },
            { name: "NewRoom", y: 150 }
        ];

    // Constructor.
    function RoomsSelectionScreen() {
        this.rooms = [];
        this.roomItems = [];

        this.newRoomName = null;
        this.nick = DefaultNick;

        // Pointer for selecting items.
        this.selectorOptions = {
            x: 75,

            text: ">",

            fontSize: Constants.SmallFontSize,
            fontFace: Constants.FontFace
        };

        this.selectorOptions.y = Selectable[SelectedItem].y;

        // Rest of prompters.
        this.nickPromptOptions = {
            x: 100,
            y: 75,

            text: NickPromptPrefix + this.nick,

            fontSize: Constants.SmallFontSize,
            fontFace: Constants.FontFace
        };

        this.newRoomPromptOptions = {
            x: 100,
            y: 150,

            text: "NEW ROOM",

            fontSize: Constants.SmallFontSize,
            fontFace: Constants.FontFace
        };

        this.roomSelectionPromptOptions = {
            x: 100,
            y: 200,

            text: "SELECT ROOM:",

            fontSize: Constants.SmallFontSize,
            fontFace: Constants.FontFace
        };
    }

    // Private methods.
    function getValue(text) {
        var value = window.prompt(text);

        if (!value || value.length > 15) {
            return getValue(text);
        } else {
            return value;
        }
    }

    function createRoomItems(names) {
        return names.map(function (room, index) {
            var itemOptions = jaws.clone(RoomListItemOptions);

            itemOptions.y += (index + 1) * RoomListItemHeight;
            itemOptions.text = room;

            Selectable.push({ name: room, y: itemOptions.y });

            return new jaws.Text(itemOptions);
        });
    }

    function selected(name) {
        return Selectable[SelectedItem].name === name;
    }

    function updateSelector() {
        this.selectorOptions.y = Selectable[SelectedItem].y;
        this.selector.set(this.selectorOptions);
    }

    function moveSelectorUp() {
        --SelectedItem;

        if (SelectedItem < 0) {
            SelectedItem = Selectable.length - 1;
        }

        updateSelector.call(this);
    }

    function moveSelectorDown() {
        ++SelectedItem;

        if (SelectedItem >= Selectable.length) {
            SelectedItem = 0;
        }

        updateSelector.call(this);
    }

    function handleKeyboard() {
        if (jaws.pressedWithoutRepeat("up")) {
            jaws.clearPressedKeys();
            moveSelectorUp.call(this);
        }

        if (jaws.pressedWithoutRepeat("down")) {
            jaws.clearPressedKeys();
            moveSelectorDown.call(this);
        }

        if (jaws.pressedWithoutRepeat("space")) {
            if (selected("SelectNick")) {
                this.nick = getValue("Enter your name:");

                this.nickPromptOptions.text = NickPromptPrefix + this.nick;
                this.nickPrompt.set(this.nickPromptOptions);
            } else if (selected("NewRoom")) {
                this.newRoomName = getValue("Enter room name:");

                // TODO: Create room and then move to the new state.
                jaws.switchGameState(WaitingScreen.bind(WaitingScreen, this.nick, this.newRoomName, true));
            } else {
                jaws.switchGameState(WaitingScreen.bind(WaitingScreen, this.nick, Selectable[SelectedItem].name));
            }
        }
    }

    // Public API.
    RoomsSelectionScreen.prototype.setup = function () {
        this.selector = new jaws.Text(this.selectorOptions);
        this.nickPrompt = new jaws.Text(this.nickPromptOptions);
        this.newRoomPrompt = new jaws.Text(this.newRoomPromptOptions);
        this.roomSelectionPrompt = new jaws.Text(this.roomSelectionPromptOptions);

        // TODO: Move it when AJAX returned.
        this.roomItems = createRoomItems(this.rooms);
    };

    RoomsSelectionScreen.prototype.update = function () {
        // Handle input.
        handleKeyboard.call(this);
    };

    RoomsSelectionScreen.prototype.draw = function () {
        jaws.fill(Constants.BackgroundColor);

        this.selector.draw();

        this.nickPrompt.draw();
        this.newRoomPrompt.draw();
        this.roomSelectionPrompt.draw();

        this.roomItems.forEach(utils.each("draw"));
    };

    window.RoomsSelectionScreen = RoomsSelectionScreen;

} (window.jaws, window.WaitingScreen, window.Constants, window.utils));