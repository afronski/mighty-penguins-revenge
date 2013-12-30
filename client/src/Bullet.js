(function (jaws, Constants) {
    "use strict";

    var DefaultKillingPower = 10,
        DefaultBulletVelocity = 8;

    function Bullet(owner, direction, options) {
        if (!options) {
            options = {};
        }

        options.scale_image = Constants.Scale;
        options.anchor = "center";

        jaws.Sprite.call(this, options);

        this.x = owner.x;
        this.y = owner.y - Constants.FirePosition;

        this.direction = direction;

        this.vx = DefaultBulletVelocity * this.direction;
        this.vy = 0;

        this.asset = "Bullet.png";
        this.flipped = (direction === 1) ? false : true;

        this.dead = false;
        this.power = DefaultKillingPower;
        this.owner = owner;

        this.col_rect = function () {
            return this.rect().clone();
        };

        this.prepare = function () {
            if (this.dead) {
                this.vx = 0;
            }
        };

        this.rest = function () {
            this.setImage(jaws.assets.get(this.asset));
        };

        this.isAlive = function () {
            return !this.dead;
        };

        this.kill = function () {
            this.dead = true;
        };

        // Initial position.
        this.rest();
    }

    Bullet.prototype = jaws.Sprite.prototype;

    window.Bullet = Bullet;

} (window.jaws, window.Constants));