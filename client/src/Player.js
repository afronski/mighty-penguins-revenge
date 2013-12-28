(function (jaws) {
    "use strict";

    var DefaultPlayerPosition = {
        x: 100,
        y: 100
    };

    function Player(options) {
        if (!options) {
            options = DefaultPlayerPosition;
        }

        options.scale_image = 5;
        options.anchor = "center_bottom";

        jaws.Sprite.call(this, options);

        this.animations = new jaws.Animation({
            sprite_sheet: "Player.png",

            frame_size: [ 6, 11 ],
            frame_duration: 125,

            scale_image: options.scale_image
        });

        this.vx = 0;
        this.vy = 0;

        this.restAnimation = this.animations.slice(0, 2);
        this.runAnimation = this.animations.slice(2, 6);
        this.jumpAnimation = this.animations.slice(6, 7);

        this.col_rect = function () {
            return this.rect().clone();
        };

        this.prepare = function () {
            this.vx = 0;
        };

        this.rest = function () {
            this.setImage(this.restAnimation.frames[0]);
        };

        this.jump = function () {
            if (!this.jumping && this.can_jump) {
                this.vy = -10;

                this.jumping = true;
                this.can_jump = false;
            } else {
                this.can_jump = true;
            }
        };

        this.right = function () {
            this.vx = 4;
            this.flipped = false;
        };

        this.left = function () {
            this.vx = -4;
            this.flipped = true;
        };

        this.update = function () {
            if (this.vx !== 0) {
                this.setImage(this.runAnimation.next());
            }

            if (this.jumping) {
                this.setImage(this.jumpAnimation.frames[0]);
            }

            if (!this.jumping && this.vy >= 0 && this.vx === 0) {
                this.setImage(this.restAnimation.frames[0]);
            }
        };

        // Initial position.
        this.rest();
    }

    Player.prototype = jaws.Sprite.prototype;

    window.Player = Player;

} (window.jaws));