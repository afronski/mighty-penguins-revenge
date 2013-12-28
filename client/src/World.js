(function (jaws, Player, isTrue) {
    "use strict";

    var MaxGravity = 10,
        WorldGravity = 0.5;

    // Constructor.
    function World(mapName) {
        var context;

        this.map = mapName;

        this.terrain = new jaws.Sprite({ x: 0, y: 0, image: this.map, scale_image: 5 });
        context = this.terrain.asCanvasContext();

        this.rawTerrain = context.getImageData(0, 0, this.terrain.width, this.terrain.height).data;
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
    }

    function applyGravity(object) {
        if (object.vy < MaxGravity) {
            object.vy += WorldGravity;
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

            if (terrainInRect.call(this, object.x, object.y - object.height, 1, object.height)) {
                if (!terrainInRect.call(this, object.x, object.y - object.height - 5, 1, object.height)) {
                    object.y -= 5;
                }

                object.x -= step;
            }
        }
    }

    // Static methods.
    World.load = function (mapName, continuation) {
        var assetsLoader = jaws.assets.add(mapName);

        function finished() {
            if (jaws.assets.loaded.every(isTrue)) {
                continuation();
            }
        }

        if (typeof(continuation) === "function") {
            assetsLoader.loadAll({ onload: finished });
        }
    };

    // Public methods.
    World.prototype.setup = function () {
        this.player = new Player({ x: 10 * 5, y: 670 * 5 });
        this.viewport = new jaws.Viewport({ max_x: this.terrain.width, max_y: this.terrain.height });

        jaws.context.mozImageSmoothingEnabled = false;
    };

    World.prototype.update = function () {
        this.player.prepare();

        // Handle input.
        handleKeyboard.call(this);

        // Update all entities.
        this.player.update();

        // Applying physics.
        applyGravity(this.player);

        // Move all entities.
        move.call(this, this.player);

        // Recenter view around player.
        this.viewport.centerAround(this.player);
    };

    World.prototype.draw = function () {
        jaws.clear();

        this.viewport.apply(drawing.bind(this));
    };

    // Exporting API to the public access.
    window.World = World;

} (window.jaws, window.Player, window.isTrue));