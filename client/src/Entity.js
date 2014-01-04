(function (jaws, Bullet, Constants) {
    "use strict";

    var MinimumScore = 0,

        MinimumHealth = 0,
        MaximumHealth = 100,

        DefaultPosition = {
            x: 100,
            y: 100
        };

    function Entity(options) {
        if (!options) {
            options = {};
        }

        if (!options.x) {
            options.x = DefaultPosition.x;
        }

        if (!options.y) {
            options.y = DefaultPosition.y;
        }

        options.scale_image = Constants.Scale;
        options.anchor = "center_bottom";

        jaws.Sprite.call(this, options);

        this.vx = 0;
        this.vy = 0;

        this.nick = options.nick || "";

        this.health = MaximumHealth;
        this.score = MinimumScore;

        this.flipped = false;
        this.dead = false;

        this.jumping = false;
        this.can_jump = true;

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

        this.fire = function () {
            return new Bullet(this, this.flipped ? -1 : 1);
        };

        this.incrementScore = function () {
            ++this.score;
        };

        this.getHealth = function () {
            return this.health;
        };

        this.decreaseHealth = function (bullet) {
            this.health -= bullet.power;

            if (!this.isAlive()) {
                this.kill();
                bullet.owner.incrementScore();
            }
        };

        this.isAlive = function () {
            return this.health > MinimumHealth;
        };

        this.kill = function () {
            this.dead = true;
            this.health = MinimumHealth;
        };

        this.getScore = function () {
            return this.score;
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

        this.dump = function () {
            return {
                x: this.x,
                y: this.y,

                vx: this.vx,
                vy: this.vy,

                jumping: this.jumping,
                can_jump: this.can_jump,

                flipped: this.flipped,

                dead: this.dead,
                health: this.health,

                nick: this.nick,
                score: this.score
            };
        };
    }

    Entity.prototype = jaws.Sprite.prototype;

    window.Entity = Entity;

} (window.jaws, window.Bullet, window.Constants));