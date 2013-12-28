(function (jaws, Player, Enemy, Constants, utils) {
    "use strict";

    // Constructor.
    function World(mapName) {
        var context;

        this.map = mapName;

        this.terrain = new jaws.Sprite({ x: 0, y: 0, image: this.map, scale_image: Constants.Scale });
        context = this.terrain.asCanvasContext();

        this.rawTerrain = context.getImageData(0, 0, this.terrain.width, this.terrain.height).data;

        this.enemies = [];
        this.bullets = [];
    }

    // Private methods.
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
    }

    function drawing() {
        this.terrain.draw();
        this.player.draw();

        this.enemies.forEach(utils.each("draw"));
        this.bullets.forEach(utils.each("draw"));
    }

    function applyGravity(object) {
        if (object.vy < Constants.MaxGravity) {
            object.vy += Constants.WorldGravity;
        }
    }

    function terrainAt(x, y) {
        try {
            x = parseInt(x, 10);
            y = parseInt(y, 10);

            return this.rawTerrain[((y - 1) * this.terrain.width * 4) + (x * 4) + 3];
        } catch (exception) {
            return false;
        }
    }

    function terrainInRect(x, y, width, height) {
        var scanningX,
            scanningY;

        try {
            for (scanningX = x + width; x < scanningX; ++x) {
                for (scanningY = y + height; y < scanningY; ++y) {
                    if (terrainAt.call(this, x, y)) {
                        return true;
                    }
                }
            }

            return false;
        } catch (exception) {
            return false;
        }
    }

    function move(object) {
        var target = Math.abs(object.vy),
            step = Math.floor(object.vy / target),
            bottom,
            i;

        for (i = 0; i < target; ++i) {
            object.y += step;

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

            if (terrainInRect.call(this, object.x, bottom, 1, object.height)) {
                if (!terrainInRect.call(this, object.x, bottom - Constants.CollisionMargin, 1, object.height)) {
                    object.y -= Constants.CollisionMargin;
                }

                object.x -= step;
            }
        }
    }

    // Static methods.
    World.load = function (mapName, continuation) {
        var assetsLoader = jaws.assets.add(mapName);

        function finished() {
            if (jaws.assets.loaded.every(utils.isTrue)) {
                continuation();
            }
        }

        if (typeof(continuation) === "function") {
            assetsLoader.loadAll({ onload: finished });
        }
    };

    // Public methods.
    World.prototype.setup = function () {
        this.player = new Player({ x: 10 * Constants.Scale, y: 670 * Constants.Scale });
        this.viewport = new jaws.Viewport({ max_x: this.terrain.width, max_y: this.terrain.height });

        this.enemies.push(new Enemy({ x: 15 * Constants.Scale, y: 670 * Constants.Scale }));
        setInterval(this.enemies[0].jump.bind(this.enemies[0]), 2000);

        jaws.context.mozImageSmoothingEnabled = false;
    };

    World.prototype.update = function () {
        this.player.prepare();
        this.enemies.forEach(utils.each("prepare"));
        this.bullets.forEach(utils.each("prepare"));

        // Handle input.
        handleKeyboard.call(this);

        // Update all entities.
        this.player.update();
        this.enemies.forEach(utils.each("update"));
        this.bullets.forEach(utils.each("update"));

        // Applying physics and collisions.
        applyGravity(this.player);
        this.enemies.forEach(utils.eachDo(applyGravity));

        // Move all entities.
        move.call(this, this.player);
        this.enemies.forEach(utils.eachDo(move.bind(this)));

        // Recenter view around player.
        this.viewport.centerAround(this.player);
    };

    World.prototype.draw = function () {
        jaws.clear();

        this.viewport.apply(drawing.bind(this));
    };

    // Exporting API to the public access.
    window.World = World;

} (window.jaws, window.Player, window.Enemy, window.Constants, window.utils));