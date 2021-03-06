(function (jaws, Constants) {
    "use strict";

    var DefaultKillingPower = 10,
        DefaultBulletVelocity = 8,

        WeaponSoundName = null;

    function playWeaponSound() {
        var audioSupported = window.navigator.userAgent.search(/phantomjs/i) === -1;

        /* istanbul ignore next */
        if (audioSupported) {
            if (!WeaponSoundName) {
                WeaponSoundName = this.weaponSoundPrefix + (jaws.assets.can_play["ogg"] ? ".ogg" : ".mp3");
            }

            jaws.assets.data[WeaponSoundName].currentTime = 0;
            jaws.assets.data[WeaponSoundName].play();
        }
    }

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
        this.weaponSoundPrefix = "SoundWeapon1";

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

        // Initial position and play sound.
        playWeaponSound.call(this);
        this.rest();
    }

    Bullet.prototype = jaws.Sprite.prototype;

    window.Bullet = Bullet;

} (window.jaws, window.Constants));