(function (Entity) {
    "use strict";

    function Enemy(options) {
        Entity.call(this, options);

        this.initialize("Enemy.png");

        // TODO: It should have name and health indicator above avatar.
    }

    Enemy.prototype = Entity.prototype;

    window.Enemy = Enemy;

} (window.Entity));