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

        DefaultSelectedItem = 0,
        DefaultSelectable = [
            { name: "SelectNick", y: 75 },
            { name: "NewRoom", y: 150 }
        ];

    // Constructor.
    function RoomsSelectionScreen() {
        this.rooms = [];
        this.roomItems = [];

        this.newRoomName = null;
        this.nick = DefaultNick;

        this.selectable = jaws.clone(DefaultSelectable);
        this.selectedItem = DefaultSelectedItem;

        // Pointer for selecting items.
        this.selectorOptions = {
            x: 75,

            text: ">",

            fontSize: Constants.SmallFontSize,
            fontFace: Constants.FontFace
        };

        this.selectorOptions.y = this.getSelected().y;

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
    function createRoomItems(names) {
        var owner = this;

        return names.map(function (room, index) {
            var itemOptions = jaws.clone(RoomListItemOptions);

            itemOptions.y += (index + 1) * RoomListItemHeight;
            itemOptions.text = room;

            owner.selectable.push({ name: room, y: itemOptions.y });

            return new jaws.Text(itemOptions);
        });
    }

    function updateSelector() {
        this.selectorOptions.y = this.getSelected().y;
        this.selector.set(this.selectorOptions);
    }

    function handleKeyboard() {
        if (jaws.pressedWithoutRepeat("up")) {
            jaws.clearPressedKeys();
            this.moveSelectorUp();
        }

        if (jaws.pressedWithoutRepeat("down")) {
            jaws.clearPressedKeys();
            this.moveSelectorDown();
        }

        if (jaws.pressedWithoutRepeat("space")) {
            if (this.isSelected("SelectNick")) {
                this.nick = utils.getValue("Enter your name:");

                this.nickPromptOptions.text = NickPromptPrefix + this.nick;
                this.nickPrompt.set(this.nickPromptOptions);
            } else if (this.isSelected("NewRoom")) {
                this.newRoomName = utils.getValue("Enter room name:");

                // TODO: Create room and then move to the new state.
                jaws.switchGameState(WaitingScreen.bind(WaitingScreen, this.nick, this.newRoomName, true));
            } else {
                jaws.switchGameState(WaitingScreen.bind(WaitingScreen, this.nick, this.getSelected().name));
            }
        }
    }

    // Public API.
    RoomsSelectionScreen.prototype.getSelected = function () {
        return this.selectable[this.selectedItem];
    };

    RoomsSelectionScreen.prototype.isSelected = function (name) {
        return this.getSelected().name === name;
    };

    RoomsSelectionScreen.prototype.moveSelectorUp = function () {
        --this.selectedItem;

        if (this.selectedItem < 0) {
            this.selectedItem = this.selectable.length - 1;
        }

        updateSelector.call(this);
    };

    RoomsSelectionScreen.prototype.moveSelectorDown = function () {
        ++this.selectedItem;

        if (this.selectedItem >= this.selectable.length) {
            this.selectedItem = 0;
        }

        updateSelector.call(this);
    };

    RoomsSelectionScreen.prototype.setup = function () {
        this.selector = new jaws.Text(this.selectorOptions);
        this.nickPrompt = new jaws.Text(this.nickPromptOptions);
        this.newRoomPrompt = new jaws.Text(this.newRoomPromptOptions);
        this.roomSelectionPrompt = new jaws.Text(this.roomSelectionPromptOptions);

        // TODO: Move it when AJAX returned.
        this.roomItems = createRoomItems.call(this, this.rooms);
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