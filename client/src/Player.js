(function (window, jaws) {
    "use strict";

    function Player(options) {
        if (!options) {
            options = {};
        }

        options.anchor = "center_bottom";
        jaws.Sprite.call(this, options);

        this.animations = new jaws.Animation({
            x: 200,
            y: 64,

            sprite_sheet: "Player.png",

            frame_size: [ 6, 11 ],
            frame_duration: 125,

            scale_image: 5
        });

        this.vx = 0;
        this.vy = 0;

        this.max_climb = 6;

        this.restAnimation = this.animations.slice(0, 2);
        this.runAnimation = this.animations.slice(2, 6);
        this.jumpAnimation = this.animations.slice(6, 7);

        this.col_rect = function() {
            return this.rect().clone().shrink(7, 0);
        };

        this.rest = function() {
            this.setImage(this.restAnimation.frames[0]);
        };

        this.jump = function() {
            this.vy = -7;
            this.can_jump = false;
        };

        this.right = function() {
            this.vx = 2;
            this.flipped = false;
        };

        this.left = function() {
            this.vx = -2;
            this.flipped = true;
        };

        this.update = function() {
            if (this.vx !== 0) {
                this.setImage(this.runAnimation.next());
            }

            if (this.vy < 0) {
                this.setImage(this.jumpAnimation.frames[0]);
            } else if (!this.can_jump) {
                this.setImage(this.restAnimation.frames[0]);
            }
        };

        // Initial position.
        this.rest();
    }

    Player.prototype = jaws.Sprite.prototype;

    window.Player = Player;

} (window, window.jaws));