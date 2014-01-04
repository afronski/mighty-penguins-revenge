(function (jaws, io, Player, Enemy, ScoresScreen, Constants, utils) {
    "use strict";

    // Constructor.
    function World(mapName) {
        var context,
            image;

        image = jaws.assets.get(mapName);

        this.map = mapName;
        this.terrain = new jaws.Sprite({ x: 0, y: 0, image: image, scale_image: Constants.Scale });

        context = this.terrain.asCanvasContext();
        this.rawTerrain = context.getImageData(0, 0, this.terrain.width, this.terrain.height).data;

        this.hudOptions = {
            x: 10,
            y: 25,

            fontSize: Constants.SmallFontSize,
            fontFace: Constants.FontFace,

            color: Constants.BackgroundColor
        };

        this.hud = new jaws.Text(this.hudOptions);

        this.enemies = [];
        this.bullets = [];

        /* istanbul ignore if */
        if (typeof(io) !== "undefined") {
            this.socket = io.connect("/rooms", Constants.SocketResource);

            this.gameState = JSON.parse(window.localStorage.getItem(Constants.GameStateKey));

            this.socket.on("list-of-players", createEnemies.bind(this));
            this.socket.on("enemy-update", updateEnemy.bind(this));
            this.socket.on("new-bullet", createNewBullet.bind(this));

            this.socket.emit("players-list", this.gameState.session);
        }
    }

    // Private methods.
    function createHUD(health, score) {
        return "HEALTH: " + parseInt(health, 10) + " SCORE: " + parseInt(score, 10);
    }

    /* istanbul ignore next */
    function sendPlayerState() {
        this.socket.emit("update-player-state", this.gameState.session, this.player.dump());
    }

    /* istanbul ignore next */
    function updateEnemy(state) {
        var enemy,
            notUpdated = this.enemies.every(function (enemy) {
                if (enemy.nick === state.nick) {
                    enemy.restore(state);
                    return false;
                }

                return true;
            });

        if (notUpdated) {
            enemy = new Enemy();
            enemy.restore(state);

            this.enemies.push(enemy);
        }
    }

    /* istanbul ignore next */
    function createNewBullet(nick) {
        var owner = this;

        this.enemies.every(function (enemy) {
            if (enemy.nick === nick) {
                owner.bullets.push(enemy.fire());
                return false;
            }

            return true;
        });
    }

    /* istanbul ignore next */
    function createEnemies(players) {
        this.enemies = players.map(function (player) {
            return new Enemy({ nick: player.nick });
        });
    }

    /* istanbul ignore next */
    function handleKeyboard() {
        if (jaws.pressed("left")) {
            this.player.left();
        }

        if (jaws.pressed("right")) {
            this.player.right();
        }

        if (jaws.pressed("up")) {
            this.player.jump();
        }

        if (jaws.pressedWithoutRepeat("space")) {
            this.bullets.push(this.player.fire());

            if (this.gameState) {
                this.socket.emit("player-fired", this.gameState.session, this.player.nick);
            }
        }

        if (jaws.pressedWithoutRepeat("esc")) {
            // TODO: Signal from server when the game ends.
            clearInterval(this.playerUpdateInterval);
            jaws.switchGameState(ScoresScreen);
        }
    }

    function drawing() {
        this.terrain.draw();

        this.bullets.forEach(utils.each("draw"));
        this.enemies.forEach(utils.each("draw"));

        this.player.draw();
    }

    function newPlayer(respawnPoint, oldPlayer) {
        var options = {},
            result;

        if (!respawnPoint) {
            respawnPoint = respawnPlayer.call(this);
        }

        options.x = respawnPoint.x;
        options.y = respawnPoint.y;

        /* istanbul ignore if */
        if (this.gameState) {
            options.nick = this.gameState.nick;
        }

        result = new Player(options);

        if (oldPlayer) {
            result.score = oldPlayer.score;
        }

        return result;
    }

    function applyGravity(object) {
        /* istanbul ignore else */
        if (object.vy < Constants.MaxGravity) {
            object.vy += Constants.WorldGravity;
        }
    }

    function terrainAt(x, y) {
        /* istanbul ignore next */
        if (x < 0) {
            return true;
        }

        /* istanbul ignore next */
        if (y < 1) {
            return true;
        }

        return this.rawTerrain[((y - 1) * this.terrain.width * 4) + (x * 4) + 3];
    }

    function terrainInRect(x, y, width, height) {
        var scanningX,
            scanningY;

        for (scanningX = x + width; x < scanningX; ++x) {
            for (scanningY = y + height; y < scanningY; ++y) {
                /* istanbul ignore next */
                if (terrainAt.call(this, x, y)) {
                    return true;
                }
            }
        }

        return false;
    }

    function deleteDead(accumulator, element) {
        if (element.isAlive()) {
            accumulator.push(element);
        }

        return accumulator;
    }

    function respawnPlayer() {
        var availableWidth = this.terrain.width - Constants.EntitySize.Width,
            availableHeight = this.terrain.height - Constants.EntitySize.Height,

            x = utils.randomFromRange(Constants.EntitySize.Width, availableWidth),
            y = utils.randomFromRange(Constants.EntitySize.Height, availableHeight),

            isLowerCornerAvailable = !terrainAt.call(this, x, y),
            isUpperCornerAvailable = !terrainAt.call(this, x, y - Constants.EntitySize.Height);

        /* istanbul ignore else */
        if (isLowerCornerAvailable && isUpperCornerAvailable) {
            return { x: x, y: y };
        } else {
            return respawnPlayer.call(this);
        }
    }

    World.prototype.decreaseHealth = function (entity, bullet) {
        if (bullet.owner !== entity) {
            entity.decreaseHealth(bullet);
            bullet.kill();
        }
    };

    // Public methods.
    World.prototype.move = function (object) {
        var target = Math.abs(object.vy),
            step = Math.floor(object.vy / target),
            bottom,
            i;

        for (i = 0; i < target; ++i) {
            object.y += step;

            /* istanbul ignore next */
            if (terrainAt.call(this, object.x, object.y) || terrainAt.call(this, object.x, object.rect().y)) {
                object.y -= step;

                if (object.vy > 0) {
                    object.jumping = false;
                }

                object.vy = 0;
            }
        }

        target = Math.abs(object.vx);
        step = Math.floor(object.vx / target);

        for (i = 0; i < target; ++i) {
            object.x += step;
            bottom = object.y - object.height;

            /* istanbul ignore next */
            if (terrainInRect.call(this, object.x, bottom, 1, object.height)) {
                if (!terrainInRect.call(this, object.x, bottom - Constants.CollisionMargin, 1, object.height)) {
                    object.y -= Constants.CollisionMargin;
                }

                object.x -= step;
            }
        }
    };

    World.prototype.moveBullet = function (object) {
        var target,
            step,
            bottom,
            i;

        target = Math.abs(object.vx);
        step = Math.floor(object.vx / target);

        for (i = 0; i < target; ++i) {
            object.x += step;
            bottom = object.y - object.height;

            /* istanbul ignore next */
            if (terrainInRect.call(this, object.x, bottom, 1, object.height)) {
                object.x -= step;

                object.kill();
            }
        }
    };

    World.prototype.setup = function (respawnPoint) {
        this.player = newPlayer.call(this, respawnPoint);
        this.viewport = new jaws.Viewport({ max_x: this.terrain.width, max_y: this.terrain.height });

        jaws.context.mozImageSmoothingEnabled = false;

        /* istanbul ignore if */
        if (this.socket) {
            this.playerUpdateInterval = setInterval(sendPlayerState.bind(this), Constants.SendPlayerStateInterval);
        }
    };

    World.prototype.update = function () {
        this.player.prepare();
        this.bullets.forEach(utils.each("prepare"));

        // Handle input.
        handleKeyboard.call(this);

        // Update HUD.
        this.hudOptions.text = createHUD(this.player.getHealth(), this.player.getScore());
        this.hud.set(this.hudOptions);

        // Update all entities.
        this.player.update();
        this.enemies.forEach(utils.each("update"));

        // Respawning and killing mechanisms.
        this.enemies = this.enemies.reduce(deleteDead, []);
        this.bullets = this.bullets.reduce(deleteDead, []);

        if (!this.player.isAlive()) {
            this.player = newPlayer.call(this, {}, this.player);
        }

        // Applying physics and collisions.
        applyGravity(this.player);
        this.enemies.forEach(utils.eachDo(applyGravity));

        jaws.collide(this.player, this.bullets, this.decreaseHealth.bind(this));
        jaws.collide(this.enemies, this.bullets, this.decreaseHealth.bind(this));

        // Move all entities.
        this.move(this.player);
        this.enemies.forEach(utils.eachDo(this.move.bind(this)));
        this.bullets.forEach(utils.eachDo(this.moveBullet.bind(this)));

        // Recenter view around player.
        this.viewport.centerAround(this.player);
    };

    World.prototype.draw = function () {
        jaws.clear();

        this.viewport.apply(drawing.bind(this));
        this.hud.draw();
    };

    // Exporting API to the public access.
    window.World = World;

} (window.jaws, window.io, window.Player, window.Enemy, window.ScoresScreen, window.Constants, window.utils));