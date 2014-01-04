(function (Entity) {
    "use strict";

    function Enemy(options) {
        Entity.call(this, options);

        this.initialize("Enemy.png");
    }

    Enemy.prototype = Entity.prototype;

    window.Enemy = Enemy;

} (window.Entity));