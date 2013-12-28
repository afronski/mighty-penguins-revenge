(function (jaws, Constants) {
    "use strict";

    var DefaultPosition = {
        x: 100,
        y: 100
    };

    function Entity(options) {
        if (!options) {
            options = DefaultPosition;
        }

        options.scale_image = Constants.Scale;
        options.anchor = "center_bottom";

        jaws.Sprite.call(this, options);

        this.vx = 0;
        this.vy = 0;

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
                this.vy = Constants.JumpingVelocity;

                this.jumping = true;
                this.can_jump = false;
            } else {
                this.can_jump = true;
            }
        };

        this.right = function () {
            this.vx = Constants.MovingVelocity;
            this.flipped = false;
        };

        this.left = function () {
            this.vx = -Constants.MovingVelocity;
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

        this.initialize = function (assetName) {
            this.asset = assetName;

            this.animations = new jaws.Animation({
                sprite_sheet: assetName,

                frame_size: [ Constants.EntitySize.Width, Constants.EntitySize.Height ],
                frame_duration: Constants.FrameDurationForEntity,

                scale_image: Constants.Scale
            });

            this.restAnimation = this.animations.slice(0, 2);
            this.runAnimation = this.animations.slice(2, 6);
            this.jumpAnimation = this.animations.slice(6, 7);

            // Initial position.
            this.rest();
        };
    }

    Entity.prototype = jaws.Sprite.prototype;

    window.Entity = Entity;

} (window.jaws, window.Constants));