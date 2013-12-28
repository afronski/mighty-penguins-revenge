(function (Entity) {
    "use strict";

    function Player(options) {
        Entity.call(this, options);

        this.initialize("Player.png");
    }

    Player.prototype = Entity.prototype;

    window.Player = Player;

} (window.Entity));