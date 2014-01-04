(function (jaws, io, WaitingScreen, Constants, utils) {
    "use strict";

    var NickPromptPrefix = "NICK: ",
        DefaultNick = "[Unknown Penguin]",

        DefaultNickError = "You cannot use default nick!",
        NotUniqueNickInRoom = "Your nick is not unique in selected room!",

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

        /* istanbul ignore if */
        if (typeof(io) !== "undefined") {
            // Connecting to the '/rooms' channel and attaching handlers.
            this.socket = io.connect("/rooms", Constants.SocketResource);

            this.socket.on("connect", getRooms.bind(this));

            this.socket.on("room-created", handleNewRoomCreation.bind(this));
            this.socket.on("room-joined", handleRoomJoining.bind(this));

            this.socket.on("list-of-rooms", this.updateRooms.bind(this));
        }
    }

    // Private methods.

    /* istanbul ignore next */
    function getRooms() {
        this.socket.emit("get-list-of-rooms");
    }

    /* istanbul ignore next */
    function byName(nick, player) {
        return player.nick === nick;
    }

    /* istanbul ignore next */
    function verifyUniqueNick(players) {
        var sameNames = players.filter(byName.bind(null, this.nick));

        if (sameNames.length === 0) {
            this.socket.emit("join-room", this.getSelected().session, getPlayer.call(this));
        } else {
            window.alert(NotUniqueNickInRoom);

            this.nick = DefaultNick;

            this.nickPromptOptions.text = NickPromptPrefix + this.nick;
            this.nickPrompt.set(this.nickPromptOptions);
        }
    }

    /* istanbul ignore next */
    function handleRoomJoining(session, name) {
        var room = {
            name: name,
            session: session
        };

        jaws.switchGameState(WaitingScreen.bind(WaitingScreen, this.nick, room));
    }

    /* istanbul ignore next */
    function handleNewRoomCreation(session) {
        var room = {
            name: this.newRoomName,
            session: session
        };

        jaws.switchGameState(WaitingScreen.bind(WaitingScreen, this.nick, room, true));
    }

    /* istanbul ignore next */
    function getPlayer() {
        return {
            nick: this.nick,
            score: 0
        };
    }

    function createRoomItems(names) {
        var owner = this;

        return names.map(function (room, index) {
            var itemOptions = jaws.clone(RoomListItemOptions);

            itemOptions.y += (index + 1) * RoomListItemHeight;
            itemOptions.text = room.name;

            owner.selectable.push({ name: room.name, session: room.session, y: itemOptions.y });

            return new jaws.Text(itemOptions);
        });
    }

    function updateSelector() {
        this.selectorOptions.y = this.getSelected().y;
        this.selector.set(this.selectorOptions);
    }

    /* istanbul ignore next */
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
                this.nick = utils.getValue("Enter your name:", DefaultNick);

                this.nickPromptOptions.text = NickPromptPrefix + this.nick;
                this.nickPrompt.set(this.nickPromptOptions);
            } else if (this.isSelected("NewRoom")) {
                if (this.nick === DefaultNick) {
                    window.alert(DefaultNickError);
                } else {
                    this.newRoomName = utils.getValue("Enter room name:");
                    this.socket.emit("create-room", this.newRoomName, getPlayer.call(this));
                }
            } else {
                if (this.nick === DefaultNick) {
                    window.alert(DefaultNickError);
                } else {
                    this.socket.on("list-of-all-players", verifyUniqueNick.bind(this));
                    this.socket.emit("all-players-list", this.getSelected().session);
                }
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
    };

    RoomsSelectionScreen.prototype.updateRooms = function (rooms) {
        this.rooms = rooms;
        this.selectable = jaws.clone(DefaultSelectable);

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

} (window.jaws, window.io, window.WaitingScreen, window.Constants, window.utils));