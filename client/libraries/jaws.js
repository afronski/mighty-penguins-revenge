var jaws = function(jaws) {
    var title;
    var log_tag;
    jaws.Parallax = function() {
        jaws.log.error("To use jaws.Parallax() you need to include src/extras/parallax.js");
    };
    jaws.SpriteList = function() {
        jaws.log.error("To use SpriteList() you need to include src/extras/sprite_list.js");
    };
    jaws.TileMap = function() {
        jaws.log.error("To use TileMap() you need to include src/extras/tile_map.js");
    };
    jaws.PixelMap = function() {
        jaws.log.error("To use PixelMap() you need to include src/extras/pixel_map.js");
    };
    jaws.QuadTree = function() {
        jaws.log.error("To use QuadTree() you need to include src/extras/quadtree.js");
    };
    jaws.Audio = function() {
        jaws.log.error("To use jaws.Audio() you need to include src/extras/audio.js");
    };
    jaws.title = function(value) {
        if (!jaws.isString(value)) {
            jaws.log.error("jaws.title: Passed in value is not a String.");
            return;
        }
        if (value) {
            return title.innerHTML = value;
        }
        return title.innerHTML;
    };
    jaws.unpack = function() {
        var make_global = [ "Sprite", "SpriteList", "Animation", "Viewport", "SpriteSheet", "Parallax", "TileMap", "pressed", "QuadTree" ];
        make_global.forEach(function(item) {
            if (window[item]) {
                jaws.log.warn("jaws.unpack: " + item + " already exists in global namespace.");
            } else {
                window[item] = jaws[item];
            }
        });
    };
    jaws.log = function(msg, append) {
        if (!jaws.isString(msg)) {
            msg = JSON.stringify(msg);
        }
        if (jaws.log.on) {
            if (log_tag && jaws.log.use_log_element) {
                if (append) {
                    log_tag.innerHTML += msg + "<br />";
                } else {
                    log_tag.innerHTML = msg;
                }
            }
            if (console.log && jaws.log.use_console) {
                console.log("JawsJS: ", msg);
            }
        }
    };
    jaws.log.on = true;
    jaws.log.use_console = false;
    jaws.log.use_log_element = true;
    jaws.log.warn = function(msg) {
        if (console.warn && jaws.log.use_console && jaws.log.on) {
            console.warn(msg);
        } else {
            jaws.log("[WARNING]: " + JSON.stringify(msg), true);
        }
    };
    jaws.log.error = function(msg) {
        if (console.error && jaws.log.use_console && jaws.log.on) {
            console.error(msg);
        } else {
            jaws.log("[ERROR]: " + JSON.stringify(msg), true);
        }
    };
    jaws.log.info = function(msg) {
        if (console.info && jaws.log.use_console && jaws.log.on) {
            console.info(msg);
        } else {
            jaws.log("[INFO]: " + JSON.stringify(msg), true);
        }
    };
    jaws.log.debug = function(msg) {
        if (console.debug && jaws.log.use_console && jaws.log.on) {
            console.debug(msg);
        } else {
            jaws.log("[DEBUG]: " + JSON.stringify(msg), true);
        }
    };
    jaws.log.clear = function() {
        if (log_tag) {
            log_tag.innerHTML = "";
        }
        if (console.clear) {
            console.clear();
        }
    };
    jaws.init = function(options) {
        title = document.getElementsByTagName("title")[0];
        jaws.url_parameters = jaws.getUrlParameters();
        jaws.canvas = document.getElementsByTagName("canvas")[0];
        if (!jaws.canvas) {
            jaws.dom = document.getElementById("canvas");
        }
        if (jaws.canvas) {
            jaws.context = jaws.canvas.getContext("2d");
        } else if (jaws.dom) {
            jaws.dom.style.position = "relative";
        } else {
            jaws.canvas = document.createElement("canvas");
            jaws.canvas.width = options.width;
            jaws.canvas.height = options.height;
            jaws.context = jaws.canvas.getContext("2d");
            document.body.appendChild(jaws.canvas);
        }
        log_tag = document.getElementById("jaws-log");
        if (jaws.url_parameters["debug"]) {
            if (!log_tag) {
                log_tag = document.createElement("div");
                log_tag.id = "jaws-log";
                log_tag.style.cssText = "overflow: auto; color: #aaaaaa; width: 300px; height: 150px; margin: 40px auto 0px auto; padding: 5px; border: #444444 1px solid; clear: both; font: 10px verdana; text-align: left;";
                document.body.appendChild(log_tag);
            }
        }
        if (jaws.url_parameters["bust_cache"]) {
            jaws.log.info("Busting cache when loading assets");
            jaws.assets.bust_cache = true;
        }
        if (jaws.context) jaws.useCrispScaling();
        jaws.width = jaws.canvas ? jaws.canvas.width : jaws.dom.offsetWidth;
        jaws.height = jaws.canvas ? jaws.canvas.height : jaws.dom.offsetHeight;
        jaws.mouse_x = 0;
        jaws.mouse_y = 0;
        window.addEventListener("mousemove", saveMousePosition);
    };
    jaws.useCrispScaling = function() {
        jaws.context.imageSmoothingEnabled = false;
        jaws.context.webkitImageSmoothingEnabled = false;
        jaws.context.mozImageSmoothingEnabled = false;
    };
    jaws.useSmoothScaling = function() {
        jaws.context.imageSmoothingEnabled = true;
        jaws.context.webkitImageSmoothingEnabled = true;
        jaws.context.mozImageSmoothingEnabled = true;
    };
    function saveMousePosition(e) {
        jaws.mouse_x = e.pageX || e.clientX;
        jaws.mouse_y = e.pageY || e.clientY;
        var game_area = jaws.canvas ? jaws.canvas : jaws.dom;
        jaws.mouse_x -= game_area.offsetLeft;
        jaws.mouse_y -= game_area.offsetTop;
    }
    jaws.start = function(game_state, options, game_state_setup_options) {
        if (!options) options = {};
        var fps = options.fps || 60;
        if (options.loading_screen === undefined) options.loading_screen = true;
        if (!options.width) options.width = 500;
        if (!options.height) options.height = 300;
        jaws.init(options);
        if (!jaws.isFunction(game_state) && !jaws.isObject(game_state)) {
            jaws.log.error("jaws.start: Passed in GameState is niether function or object");
            return;
        }
        if (!jaws.isObject(game_state_setup_options) && game_state_setup_options !== undefined) {
            jaws.log.error("jaws.start: The setup options for the game state is not an object.");
            return;
        }
        if (options.loading_screen) {
            jaws.assets.displayProgress(0);
        }
        jaws.log.info("setupInput()", true);
        jaws.setupInput();
        function assetProgress(src, percent_done) {
            jaws.log.info(percent_done + "%: " + src, true);
            if (options.loading_screen) {
                jaws.assets.displayProgress(percent_done);
            }
        }
        function assetError(src, percent_done) {
            jaws.log.info(percent_done + "%: Error loading asset " + src, true);
        }
        function assetsLoaded() {
            jaws.log.info("all assets loaded", true);
            jaws.switchGameState(game_state || window, {
                fps: fps
            }, game_state_setup_options);
        }
        jaws.log.info("assets.loadAll()", true);
        if (jaws.assets.length() > 0) {
            jaws.assets.loadAll({
                onprogress: assetProgress,
                onerror: assetError,
                onload: assetsLoaded
            });
        } else {
            assetsLoaded();
        }
    };
    jaws.switchGameState = function(game_state, options, game_state_setup_options) {
        if (options === undefined) options = {};
        if (jaws.isFunction(game_state)) {
            game_state = new game_state();
        }
        if (!jaws.isObject(game_state)) {
            jaws.log.error("jaws.switchGameState: Passed in GameState should be a Function or an Object.");
            return;
        }
        var fps = options && options.fps || jaws.game_loop && jaws.game_loop.fps || 60;
        var setup = options.setup;
        jaws.game_loop && jaws.game_loop.stop();
        jaws.clearPressedKeys();
        jaws.clearKeyCallbacks();
        jaws.previous_game_state = jaws.game_state;
        jaws.game_state = game_state;
        jaws.game_loop = new jaws.GameLoop(game_state, {
            fps: fps,
            setup: setup
        }, game_state_setup_options);
        jaws.game_loop.start();
    };
    jaws.imageToCanvas = function(image) {
        if (jaws.isCanvas(image)) return image;
        if (!jaws.isImage(image)) {
            jaws.log.error("jaws.imageToCanvas: Passed in object is not an Image.");
            return;
        }
        var canvas = document.createElement("canvas");
        canvas.src = image.src;
        canvas.width = image.width;
        canvas.height = image.height;
        var context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, image.width, image.height);
        return canvas;
    };
    jaws.forceArray = function(obj) {
        return Array.isArray(obj) ? obj : [ obj ];
    };
    jaws.clear = function() {
        jaws.context.clearRect(0, 0, jaws.width, jaws.height);
    };
    jaws.fill = function(fill_style) {
        jaws.context.fillStyle = fill_style;
        jaws.context.fillRect(0, 0, jaws.width, jaws.height);
    };
    jaws.draw = function() {
        var list = arguments;
        if (list.length == 1 && jaws.isArray(list[0])) list = list[0];
        for (var i = 0; i < list.length; i++) {
            if (jaws.isArray(list[i])) jaws.draw(list[i]); else if (list[i].draw) list[i].draw();
        }
    };
    jaws.update = function() {
        var list = arguments;
        if (list.length == 1 && jaws.isArray(list[0])) list = list[0];
        for (var i = 0; i < list.length; i++) {
            if (jaws.isArray(list[i])) jaws.update(list[i]); else if (list[i].update) list[i].update();
        }
    };
    jaws.isImage = function(obj) {
        return Object.prototype.toString.call(obj) === "[object HTMLImageElement]";
    };
    jaws.isCanvas = function(obj) {
        return Object.prototype.toString.call(obj) === "[object HTMLCanvasElement]";
    };
    jaws.isDrawable = function(obj) {
        return jaws.isImage(obj) || jaws.isCanvas(obj);
    };
    jaws.isString = function(obj) {
        return typeof obj === "string" || typeof obj === "object" && obj.constructor === String;
    };
    jaws.isNumber = function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    };
    jaws.isArray = function(obj) {
        if (!obj) return false;
        return !(obj.constructor.toString().indexOf("Array") === -1);
    };
    jaws.isObject = function(value) {
        return value !== null && typeof value === "object";
    };
    jaws.isFunction = function(obj) {
        return Object.prototype.toString.call(obj) === "[object Function]";
    };
    jaws.isRegExp = function(obj) {
        return obj instanceof RegExp;
    };
    jaws.isOutsideCanvas = function(item) {
        if (item.x && item.y) {
            return item.x < 0 || item.y < 0 || item.x > jaws.width || item.y > jaws.height;
        }
    };
    jaws.forceInsideCanvas = function(item) {
        if (item.x && item.y) {
            if (item.x < 0) {
                item.x = 0;
            }
            if (item.x > jaws.width) {
                item.x = jaws.width;
            }
            if (item.y < 0) {
                item.y = 0;
            }
            if (item.y > jaws.height) {
                item.y = jaws.height;
            }
        }
    };
    jaws.getUrlParameters = function() {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf("?") + 1).split("&");
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split("=");
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    };
    jaws.parseOptions = function(object, options, defaults) {
        object["options"] = options;

        Object.keys(options).forEach(function (option) {
            if (typeof(defaults[option]) === "undefined") {
                jaws.log.warn("jaws.parseOptions: Unsupported property " + option + "for " + object.constructor);
            }
        });

        Object.keys(defaults).forEach(function (option) {
            if (jaws.isFunction(defaults[option])) {
                defaults[option] = defaults[option]();
            }

            if (typeof(options[option]) !== "undefined") {
                object[option] = options[option];
            } else {
                object[option] = jaws.clone(defaults[option]);
            }
        });
    };
    jaws.clone = function(value) {
        if (jaws.isArray(value)) return value.slice(0);
        if (jaws.isObject(value)) return JSON.parse(JSON.stringify(value));
        return value;
    };
    jaws.imageToCanvasContext = function(image) {
        var canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        var context = canvas.getContext("2d");
        if (jaws.context) {
            context.imageSmoothingEnabled = jaws.context.mozImageSmoothingEnabled;
            context.webkitImageSmoothingEnabled = jaws.context.mozImageSmoothingEnabled;
            context.mozImageSmoothingEnabled = jaws.context.mozImageSmoothingEnabled;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        return context;
    };
    jaws.retroScaleImage = function(image, factor) {
        var canvas = jaws.isImage(image) ? jaws.imageToCanvas(image) : image;
        var context = canvas.getContext("2d");
        var data = context.getImageData(0, 0, canvas.width, canvas.height).data;
        var canvas2 = document.createElement("canvas");
        canvas2.width = image.width * factor;
        canvas2.height = image.height * factor;
        var context2 = canvas2.getContext("2d");
        var to_data = context2.createImageData(canvas2.width, canvas2.height);
        var w2 = to_data.width;
        var h2 = to_data.height;
        for (var y = 0; y < h2; y += 1) {
            var y2 = Math.floor(y / factor);
            var y_as_x = y * to_data.width;
            var y2_as_x = y2 * image.width;
            for (var x = 0; x < w2; x += 1) {
                var x2 = Math.floor(x / factor);
                var y_dst = (y_as_x + x) * 4;
                var y_src = (y2_as_x + x2) * 4;
                to_data.data[y_dst] = data[y_src];
                to_data.data[y_dst + 1] = data[y_src + 1];
                to_data.data[y_dst + 2] = data[y_src + 2];
                to_data.data[y_dst + 3] = data[y_src + 3];
            }
        }
        context2.putImageData(to_data, 0, 0);
        return canvas2;
    };
    return jaws;
}(jaws || {});

var jaws = function(jaws) {
    var pressed_keys = {};
    var previously_pressed_keys = {};
    var keycode_to_string = [];
    var on_keydown_callbacks = [];
    var on_keyup_callbacks = [];
    var mousebuttoncode_to_string = [];
    var ie_mousebuttoncode_to_string = [];
    jaws.setupInput = function() {
        var k = [];
        k[8] = "backspace";
        k[9] = "tab";
        k[13] = "enter";
        k[16] = "shift";
        k[17] = "ctrl";
        k[18] = "alt";
        k[19] = "pause";
        k[20] = "capslock";
        k[27] = "esc";
        k[32] = "space";
        k[33] = "pageup";
        k[34] = "pagedown";
        k[35] = "end";
        k[36] = "home";
        k[37] = "left";
        k[38] = "up";
        k[39] = "right";
        k[40] = "down";
        k[45] = "insert";
        k[46] = "delete";
        k[91] = "left_window_key leftwindowkey";
        k[92] = "right_window_key rightwindowkey";
        k[93] = "select_key selectkey";
        k[106] = "multiply *";
        k[107] = "add plus +";
        k[109] = "subtract minus -";
        k[110] = "decimalpoint";
        k[111] = "divide /";
        k[144] = "numlock";
        k[145] = "scrollock";
        k[186] = "semicolon ;";
        k[187] = "equalsign =";
        k[188] = "comma ,";
        k[189] = "dash -";
        k[190] = "period .";
        k[191] = "forwardslash /";
        k[192] = "graveaccent `";
        k[219] = "openbracket [";
        k[220] = "backslash \\";
        k[221] = "closebracket ]";
        k[222] = "singlequote '";
        var m = [];
        m[0] = "left_mouse_button";
        m[1] = "center_mouse_button";
        m[2] = "right_mouse_button";
        var ie_m = [];
        ie_m[1] = "left_mouse_button";
        ie_m[2] = "right_mouse_button";
        ie_m[4] = "center_mouse_button";
        mousebuttoncode_to_string = m;
        ie_mousebuttoncode_to_string = ie_m;
        var numpadkeys = [ "numpad0", "numpad1", "numpad2", "numpad3", "numpad4", "numpad5", "numpad6", "numpad7", "numpad8", "numpad9" ];
        var fkeys = [ "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9" ];
        var numbers = [ "0", "1", "2", "3", "4", "5", "6", "7", "8", "9" ];
        var letters = [ "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z" ];
        for (var i = 0; numbers[i]; i++) {
            k[48 + i] = numbers[i];
        }
        for (var i = 0; letters[i]; i++) {
            k[65 + i] = letters[i];
        }
        for (var i = 0; numpadkeys[i]; i++) {
            k[96 + i] = numpadkeys[i];
        }
        for (var i = 0; fkeys[i]; i++) {
            k[112 + i] = fkeys[i];
        }
        keycode_to_string = k;
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        var jawswindow = jaws.canvas || jaws.dom;
        jawswindow.addEventListener("mousedown", handleMouseDown, false);
        jawswindow.addEventListener("mouseup", handleMouseUp, false);
        jawswindow.addEventListener("touchstart", handleTouchStart, false);
        jawswindow.addEventListener("touchend", handleTouchEnd, false);
        window.addEventListener("blur", resetPressedKeys, false);
        document.oncontextmenu = function() {
            return false;
        };
    };
    function resetPressedKeys(e) {
        pressed_keys = {};
    }
    function handleKeyUp(e) {
        event = e ? e : window.event;
        var human_names = keycode_to_string[event.keyCode].split(" ");
        human_names.forEach(function(human_name) {
            pressed_keys[human_name] = false;
            if (on_keyup_callbacks[human_name]) {
                on_keyup_callbacks[human_name](human_name);
                e.preventDefault();
            }
            if (prevent_default_keys[human_name]) {
                e.preventDefault();
            }
        });
    }
    function handleKeyDown(e) {
        event = e ? e : window.event;
        var human_names = keycode_to_string[event.keyCode].split(" ");
        human_names.forEach(function(human_name) {
            pressed_keys[human_name] = true;
            if (on_keydown_callbacks[human_name]) {
                on_keydown_callbacks[human_name](human_name);
                e.preventDefault();
            }
            if (prevent_default_keys[human_name]) {
                e.preventDefault();
            }
        });
    }
    function handleMouseDown(e) {
        event = e ? e : window.event;
        var human_name = mousebuttoncode_to_string[event.button];
        if (navigator.appName == "Microsoft Internet Explorer") {
            human_name = ie_mousebuttoncode_to_string[event.button];
        }
        pressed_keys[human_name] = true;
        if (on_keydown_callbacks[human_name]) {
            on_keydown_callbacks[human_name](human_name);
            e.preventDefault();
        }
    }
    function handleMouseUp(e) {
        event = e ? e : window.event;
        var human_name = mousebuttoncode_to_string[event.button];
        if (navigator.appName == "Microsoft Internet Explorer") {
            human_name = ie_mousebuttoncode_to_string[event.button];
        }
        pressed_keys[human_name] = false;
        if (on_keyup_callbacks[human_name]) {
            on_keyup_callbacks[human_name](human_name);
            e.preventDefault();
        }
    }
    function handleTouchStart(e) {
        event = e ? e : window.event;
        pressed_keys["left_mouse_button"] = true;
        jaws.mouse_x = e.touches[0].pageX - jaws.canvas.offsetLeft;
        jaws.mouse_y = e.touches[0].pageY - jaws.canvas.offsetTop;
    }
    function handleTouchEnd(e) {
        event = e ? e : window.event;
        pressed_keys["left_mouse_button"] = false;
        jaws.mouse_x = undefined;
        jaws.mouse_y = undefined;
    }
    var prevent_default_keys = [];
    jaws.preventDefaultKeys = function(array_of_strings) {
        var list = arguments;
        if (list.length == 1 && jaws.isArray(list[0])) list = list[0];
        for (var i = 0; i < list.length; i++) {
            prevent_default_keys[list[i]] = true;
        }
    };
    jaws.pressed = function(keys, logical_and) {
        if (jaws.isString(keys)) {
            keys = keys.split(" ");
        }
        if (logical_and) {
            return keys.every(function(key) {
                return pressed_keys[key];
            });
        } else {
            return keys.some(function(key) {
                return pressed_keys[key];
            });
        }
    };
    jaws.clearPressedKeys = function() {
        previously_pressed_keys = {};
        pressed_keys = {};
    };
    jaws.pressedWithoutRepeat = function(keys, logical_and) {
        if (jaws.pressed(keys, logical_and)) {
            if (!previously_pressed_keys[keys]) {
                previously_pressed_keys[keys] = true;
                return true;
            }
        } else {
            previously_pressed_keys[keys] = false;
            return false;
        }
    };
    jaws.on_keydown = function(key, callback) {
        if (jaws.isArray(key)) {
            for (var i = 0; key[i]; i++) {
                on_keydown_callbacks[key[i]] = callback;
            }
        } else {
            on_keydown_callbacks[key] = callback;
        }
    };
    jaws.on_keyup = function(key, callback) {
        if (jaws.isArray(key)) {
            for (var i = 0; key[i]; i++) {
                on_keyup_callbacks[key[i]] = callback;
            }
        } else {
            on_keyup_callbacks[key] = callback;
        }
    };
    jaws.clearKeyCallbacks = function() {
        on_keyup_callbacks = [];
        on_keydown_callbacks = [];
    };
    return jaws;
}(jaws || {});

var jaws = function(jaws) {
    jaws.Assets = function Assets() {
        if (!(this instanceof Assets)) return new Assets();
        var self = this;
        self.loaded = [];
        self.loading = [];
        self.src_list = [];
        self.data = [];
        self.bust_cache = false;
        self.image_to_canvas = true;
        self.fuchia_to_transparent = true;
        self.root = "";
        self.file_type = {};
        self.file_type["json"] = "json";
        self.file_type["wav"] = "audio";
        self.file_type["mp3"] = "audio";
        self.file_type["ogg"] = "audio";
        self.file_type["m4a"] = "audio";
        self.file_type["weba"] = "audio";
        self.file_type["aac"] = "audio";
        self.file_type["mka"] = "audio";
        self.file_type["flac"] = "audio";
        self.file_type["png"] = "image";
        self.file_type["jpg"] = "image";
        self.file_type["jpeg"] = "image";
        self.file_type["gif"] = "image";
        self.file_type["bmp"] = "image";
        self.file_type["tiff"] = "image";
        self.file_type["mp4"] = "video";
        self.file_type["webm"] = "video";
        self.file_type["ogv"] = "video";
        self.file_type["mkv"] = "video";
        var audioTest = new Audio();
        var videoTest = document.createElement("video");
        self.can_play = {};
        self.can_play["wav"] = !!audioTest.canPlayType('audio/wav; codecs="1"').replace(/^no$/, "");
        self.can_play["ogg"] = !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, "");
        self.can_play["mp3"] = !!audioTest.canPlayType("audio/mpeg;").replace(/^no$/, "");
        self.can_play["m4a"] = !!(audioTest.canPlayType("audio/x-m4a;") || audioTest.canPlayType("audio/aac;")).replace(/^no$/, "");
        self.can_play["weba"] = !!audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, "");
        self.can_play["aac"] = !!audioTest.canPlayType("audio/aac;").replace(/^no$/, "");
        self.can_play["mka"] = !!audioTest.canPlayType("audio/x-matroska;").replace(/^no$/, "");
        self.can_play["flac"] = !!audioTest.canPlayType("audio/x-flac;").replace(/^no$/, "");
        self.can_play["mp4"] = !!videoTest.canPlayType("video/mp4;").replace(/^no$/, "");
        self.can_play["webm"] = !!videoTest.canPlayType('video/webm; codecs="vorbis"').replace(/^no$/, "");
        self.can_play["ogv"] = !!videoTest.canPlayType('video/ogg; codecs="vorbis"').replace(/^no$/, "");
        self.can_play["mkv"] = !!videoTest.canPlayType("video/x-matroska;").replace(/^no$/, "");
        self.length = function() {
            return self.src_list.length;
        };
        self.setRoot = function(path) {
            self.root = path;
            return self;
        };
        self.get = function(src) {
            if (jaws.isArray(src)) {
                return src.map(function(i) {
                    return self.data[i];
                });
            } else if (jaws.isString(src)) {
                if (src[src.length - 1] === "*") {
                    var needle = src.replace("*", "");
                    for (var i = 0; i < self.src_list.length; i++) {
                        if (self.src_list[i].indexOf(needle) == 0 && self.data[self.src_list[i]]) return self.data[self.src_list[i]];
                    }
                }
                if (self.data[src]) {
                    return self.data[src];
                } else {
                    jaws.log.warn("No such asset: " + src, true);
                }
            } else {
                jaws.log.error("jaws.get: Neither String nor Array. Incorrect URL resource " + src);
                return;
            }
        };
        self.isLoading = function(src) {
            if (jaws.isString(src)) {
                return self.loading[src];
            } else {
                jaws.log.error("jaws.isLoading: Argument not a String with " + src);
            }
        };
        self.isLoaded = function(src) {
            if (jaws.isString(src)) {
                return self.loaded[src];
            } else {
                jaws.log.error("jaws.isLoaded: Argument not a String with " + src);
            }
        };
        self.getPostfix = function(src) {
            if (jaws.isString(src)) {
                return src.toLowerCase().match(/.+\.([^?]+)(\?|$)/)[1];
            } else {
                jaws.log.error("jaws.assets.getPostfix: Argument not a String with " + src);
            }
        };
        function getType(src) {
            if (jaws.isString(src)) {
                var postfix = self.getPostfix(src);
                return self.file_type[postfix] ? self.file_type[postfix] : postfix;
            } else {
                jaws.log.error("jaws.assets.getType: Argument not a String with " + src);
            }
        }
        self.add = function(src) {
            var list = arguments;
            if (list.length == 1 && jaws.isArray(list[0])) list = list[0];
            for (var i = 0; i < list.length; i++) {
                if (jaws.isArray(list[i])) {
                    self.add(list[i]);
                } else {
                    if (jaws.isString(list[i])) {
                        self.src_list.push(list[i]);
                    } else {
                        jaws.log.error("jaws.assets.add: Neither String nor Array. Incorrect URL resource " + src);
                    }
                }
            }
            return self;
        };
        self.loadAll = function(options) {
            self.load_count = 0;
            self.error_count = 0;
            if (options.onprogress && jaws.isFunction(options.onprogress)) self.onprogress = options.onprogress;
            if (options.onerror && jaws.isFunction(options.onerror)) self.onerror = options.onerror;
            if (options.onload && jaws.isFunction(options.onload)) self.onload = options.onload;
            self.src_list.forEach(function(item) {
                self.load(item);
            });
            return self;
        };
        self.load = function(src, options) {
            if (!options) options = {};
            if (!jaws.isString(src)) {
                jaws.log.error("jaws.assets.load: Argument not a String with " + src);
                return;
            }
            var asset = {};
            var resolved_src = "";
            asset.src = src;
            asset.onload = options.onload;
            asset.onerror = options.onerror;
            self.loading[src] = true;
            var parser = RegExp("^((f|ht)tp(s)?:)?//");
            if (parser.test(src)) {
                resolved_src = asset.src;
            } else {
                resolved_src = self.root + asset.src;
            }
            if (self.bust_cache) {
                resolved_src += "?" + parseInt(Math.random() * 1e7);
            }
            var type = getType(asset.src);
            if (type === "image") {
                try {
                    asset.image = new Image();
                    asset.image.asset = asset;
                    asset.image.addEventListener("load", assetLoaded);
                    asset.image.addEventListener("error", assetError);
                    asset.image.src = resolved_src;
                } catch (e) {
                    jaws.log.error("Cannot load Image resource " + resolved_src + " (Message: " + e.message + ", Name: " + e.name + ")");
                }
            } else if (self.can_play[self.getPostfix(asset.src)]) {
                if (type === "audio") {
                    try {
                        asset.audio = new Audio();
                        asset.audio.asset = asset;
                        asset.audio.addEventListener("error", assetError);
                        asset.audio.addEventListener("canplay", assetLoaded);
                        self.data[asset.src] = asset.audio;
                        asset.audio.src = resolved_src;
                        asset.audio.load();
                    } catch (e) {
                        jaws.log.error("Cannot load Audio resource " + resolved_src + " (Message: " + e.message + ", Name: " + e.name + ")");
                    }
                } else if (type === "video") {
                    try {
                        asset.video = document.createElement("video");
                        asset.video.asset = asset;
                        self.data[asset.src] = asset.video;
                        asset.video.setAttribute("style", "display:none;");
                        asset.video.addEventListener("error", assetError);
                        asset.video.addEventListener("canplay", assetLoaded);
                        document.body.appendChild(asset.video);
                        asset.video.src = resolved_src;
                        asset.video.load();
                    } catch (e) {
                        jaws.log.error("Cannot load Video resource " + resolved_src + " (Message: " + e.message + ", Name: " + e.name + ")");
                    }
                }
            } else {
                if (type === "audio" && !self.can_play[self.getPostfix(asset.src)]) {
                    assetSkipped(asset);
                    return self;
                }
                try {
                    var req = new XMLHttpRequest();
                    req.asset = asset;
                    req.onreadystatechange = assetLoaded;
                    req.onerror = assetError;
                    req.open("GET", resolved_src, true);
                    if (type !== "json") req.responseType = "blob";
                    req.send(null);
                } catch (e) {
                    jaws.log.error("Cannot load " + resolved_src + " (Message: " + e.message + ", Name: " + e.name + ")");
                }
            }
            return self;
        };
        function assetLoaded(event) {
            var asset = this.asset;
            var src = asset.src;
            var filetype = getType(asset.src);
            try {
                if (filetype === "json") {
                    if (this.readyState !== 4) {
                        return;
                    }
                    self.data[asset.src] = JSON.parse(this.responseText);
                } else if (filetype === "image") {
                    var new_image = self.image_to_canvas ? jaws.imageToCanvas(asset.image) : asset.image;
                    if (self.fuchia_to_transparent && self.getPostfix(asset.src) === "bmp") {
                        new_image = fuchiaToTransparent(new_image);
                    }
                    self.data[asset.src] = new_image;
                } else if (filetype === "audio" && self.can_play[self.getPostfix(asset.src)]) {
                    self.data[asset.src] = asset.audio;
                } else if (filetype === "video" && self.can_play[self.getPostfix(asset.src)]) {
                    self.data[asset.src] = asset.video;
                } else {
                    self.data[asset.src] = this.response;
                }
            } catch (e) {
                jaws.log.error("Cannot process " + src + " (Message: " + e.message + ", Name: " + e.name + ")");
                self.data[asset.src] = null;
            }
            if (!self.loaded[src]) self.load_count++;
            self.loaded[src] = true;
            self.loading[src] = false;
            processCallbacks(asset, true, event);
        }
        function assetSkipped(asset) {
            self.loaded[asset.src] = true;
            self.loading[asset.src] = false;
            self.load_count++;
            processCallbacks(asset, true);
        }
        function assetError(event) {
            var asset = this.asset;
            self.error_count++;
            processCallbacks(asset, false, event);
        }
        function processCallbacks(asset, ok, event) {
            var percent = parseInt((self.load_count + self.error_count) / self.src_list.length * 100);
            if (ok) {
                if (self.onprogress) self.onprogress(asset.src, percent);
                if (asset.onprogress && event !== undefined) asset.onprogress(event);
            } else {
                if (self.onerror) self.onerror(asset.src, percent);
                if (asset.onerror && event !== undefined) asset.onerror(event);
            }
            if (percent === 100) {
                if (self.onload) self.onload();
                self.onprogress = null;
                self.onerror = null;
                self.onload = null;
            }
        }
        self.displayProgress = function(percent_done) {
            if (!jaws.isNumber(percent_done)) return;
            if (!jaws.context) return;
            jaws.context.save();
            jaws.context.fillStyle = "black";
            jaws.context.fillRect(0, 0, jaws.width, jaws.height);
            jaws.context.fillStyle = "white";
            jaws.context.strokeStyle = "white";
            jaws.context.textAlign = "center";
            jaws.context.strokeRect(50 - 1, jaws.height / 2 - 30 - 1, jaws.width - 100 + 2, 60 + 2);
            jaws.context.fillRect(50, jaws.height / 2 - 30, (jaws.width - 100) / 100 * percent_done, 60);
            jaws.context.font = "11px verdana";
            jaws.context.fillText("Loading... " + percent_done + "%", jaws.width / 2, jaws.height / 2 - 35);
            jaws.context.font = "11px verdana";
            jaws.context.fillStyle = "#ccc";
            jaws.context.textBaseline = "bottom";
            jaws.context.fillText("powered by www.jawsjs.com", jaws.width / 2, jaws.height - 1);
            jaws.context.restore();
        };
    };
    function fuchiaToTransparent(image) {
        if (!jaws.isDrawable(image)) return;
        var canvas = jaws.isImage(image) ? jaws.imageToCanvas(image) : image;
        var context = canvas.getContext("2d");
        var img_data = context.getImageData(0, 0, canvas.width, canvas.height);
        var pixels = img_data.data;
        for (var i = 0; i < pixels.length; i += 4) {
            if (pixels[i] === 255 && pixels[i + 1] === 0 && pixels[i + 2] === 255) {
                pixels[i + 3] = 0;
            }
        }
        context.putImageData(img_data, 0, 0);
        return canvas;
    }
    jaws.assets = new jaws.Assets();
    return jaws;
}(jaws || {});

var jaws = function(jaws) {
    window.requestAnimFrame = function() {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element) {
            window.setTimeout(callback, 16.666);
        };
    }();
    jaws.GameLoop = function GameLoop(game_object, options, game_state_setup_options) {
        if (!(this instanceof GameLoop)) return new GameLoop(game_object, options);
        this.tick_duration = 0;
        this.fps = 0;
        this.ticks = 0;
        var update_id;
        var paused = false;
        var stopped = false;
        var that = this;
        var mean_value = new MeanValue(20);
        this.runtime = function() {
            return this.last_tick - this.first_tick;
        };
        this.start = function() {
            jaws.log.info("Game loop start", true);
            this.first_tick = new Date().getTime();
            this.current_tick = new Date().getTime();
            this.last_tick = new Date().getTime();
            if (options.setup !== false && game_object.setup) {
                game_object.setup(game_state_setup_options);
            }
            step_delay = 1e3 / options.fps;
            if (options.fps == 60) {
                requestAnimFrame(this.loop);
            } else {
                update_id = setInterval(this.loop, step_delay);
            }
        };
        this.loop = function() {
            that.current_tick = new Date().getTime();
            that.tick_duration = that.current_tick - that.last_tick;
            that.fps = mean_value.add(1e3 / that.tick_duration).get();
            if (!stopped && !paused) {
                if (game_object.update) {
                    game_object.update();
                }
                if (game_object.draw) {
                    game_object.draw();
                }
                that.ticks++;
            }
            if (options.fps == 60 && !stopped) requestAnimFrame(that.loop);
            that.last_tick = that.current_tick;
        };
        this.pause = function() {
            paused = true;
        };
        this.unpause = function() {
            paused = false;
        };
        this.stop = function() {
            if (update_id) clearInterval(update_id);
            stopped = true;
        };
    };
    function MeanValue(size) {
        this.size = size;
        this.values = new Array(this.size);
        this.value;
        this.add = function(value) {
            if (this.values.length > this.size) {
                this.values.splice(0, 1);
                this.value = 0;
                for (var i = 0; this.values[i]; i++) {
                    this.value += this.values[i];
                }
                this.value = this.value / this.size;
            }
            this.values.push(value);
            return this;
        };
        this.get = function() {
            return parseInt(this.value);
        };
    }
    return jaws;
}(jaws || {});

var jaws = function(jaws) {
    var correction = 0;
    jaws.Rect = function Rect(x, y, width, height) {
        if (!(this instanceof Rect)) return new Rect(x, y, width, height);
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.right = x + width - correction;
        this.bottom = y + height - correction;
    };
    jaws.Rect.prototype.getPosition = function() {
        return [ this.x, this.y ];
    };
    jaws.Rect.prototype.move = function(x, y) {
        this.x += x;
        this.y += y;
        this.right += x;
        this.bottom += y;
        return this;
    };
    jaws.Rect.prototype.moveTo = function(x, y) {
        this.x = x;
        this.y = y;
        this.right = this.x + this.width - correction;
        this.bottom = this.y + this.height - correction;
        return this;
    };
    jaws.Rect.prototype.resize = function(width, height) {
        this.width += width;
        this.height += height;
        this.right = this.x + this.width - correction;
        this.bottom = this.y + this.height - correction;
        return this;
    };
    jaws.Rect.prototype.clone = function() {
        return new jaws.Rect(this.x, this.y, this.width, this.height);
    };
    jaws.Rect.prototype.shrink = function(x, y) {
        this.x += x;
        this.y += y;
        this.width -= x + x;
        this.height -= y + y;
        this.right = this.x + this.width - correction;
        this.bottom = this.y + this.height - correction;
        return this;
    };
    jaws.Rect.prototype.resizeTo = function(width, height) {
        this.width = width;
        this.height = height;
        this.right = this.x + this.width - correction;
        this.bottom = this.y + this.height - correction;
        return this;
    };
    jaws.Rect.prototype.draw = function() {
        jaws.context.strokeStyle = "red";
        jaws.context.strokeRect(this.x - .5, this.y - .5, this.width, this.height);
        return this;
    };
    jaws.Rect.prototype.collidePoint = function(x, y) {
        return x >= this.x && x <= this.right && y >= this.y && y <= this.bottom;
    };
    jaws.Rect.prototype.collideRect = function(rect) {
        return (this.x >= rect.x && this.x <= rect.right || rect.x >= this.x && rect.x <= this.right) && (this.y >= rect.y && this.y <= rect.bottom || rect.y >= this.y && rect.y <= this.bottom);
    };
    jaws.Rect.prototype.toString = function() {
        return "[Rect " + this.x + ", " + this.y + ", " + this.width + ", " + this.height + "]";
    };
    return jaws;
}(jaws || {});

if (typeof module !== "undefined" && "exports" in module) {
    module.exports = jaws.Rect;
}

var jaws = function(jaws) {
    jaws.Sprite = function Sprite(options) {
        if (!(this instanceof Sprite)) return new Sprite(options);
        this.set(options);
        this.context = options.context ? options.context : jaws.context;
    };
    jaws.Sprite.prototype.default_options = {
        x: 0,
        y: 0,
        alpha: 1,
        angle: 0,
        flipped: false,
        anchor_x: 0,
        anchor_y: 0,
        image: null,
        image_path: null,
        anchor: null,
        scale_image: null,
        damping: 1,
        scale_x: 1,
        scale_y: 1,
        scale: 1,
        color: "#ddd",
        width: 16,
        height: 16,
        _constructor: null,
        context: null,
        data: null
    };
    jaws.Sprite.prototype.set = function(options) {
        if (jaws.isString(this.image)) this.image_path = this.image;
        jaws.parseOptions(this, options, this.default_options);
        if (this.scale) this.scale_x = this.scale_y = this.scale;
        if (this.image) this.setImage(this.image);
        if (this.scale_image) this.scaleImage(this.scale_image);
        if (this.anchor) this.setAnchor(this.anchor);
        if (!this.image && this.color && this.width && this.height) {
            var canvas = document.createElement("canvas");
            var context = canvas.getContext("2d");
            canvas.width = this.width;
            canvas.height = this.height;
            context.fillStyle = this.color;
            context.fillRect(0, 0, this.width, this.height);
            this.image = canvas;
        }
        this.cacheOffsets();
        return this;
    };
    jaws.Sprite.prototype.clone = function(object) {
        var constructor = this._constructor ? eval(this._constructor) : this.constructor;
        var new_sprite = new constructor(this.attributes());
        new_sprite._constructor = this._constructor || this.constructor.name;
        return new_sprite;
    };
    jaws.Sprite.prototype.setImage = function(value) {
        var that = this;
        if (jaws.isDrawable(value)) {
            this.image = value;
            return this.cacheOffsets();
        } else {
            if (jaws.assets.isLoaded(value)) {
                this.image = jaws.assets.get(value);
                this.cacheOffsets();
            } else {
                jaws.log.warn("Image '" + value + "' not preloaded with jaws.assets.add(). Image and a working sprite.rect() will be delayed.");
                jaws.assets.load(value, {
                    onload: function() {
                        that.image = jaws.assets.get(value);
                        that.cacheOffsets();
                    }
                });
            }
        }
        return this;
    };
    jaws.Sprite.prototype.stepToWhile = function(target_x, target_y, continueStep) {
        var step = 1;
        var step_x = target_x < this.x ? -step : step;
        var step_y = target_y < this.y ? -step : step;
        target_x = parseInt(target_x);
        target_y = parseInt(target_y);
        var collision_x = false;
        var collision_y = false;
        while (true) {
            if (collision_x === false) {
                if (this.x != target_x) {
                    this.x += step_x;
                }
                if (!continueStep(this)) {
                    this.x -= step_x;
                    collision_x = true;
                }
            }
            if (collision_y === false) {
                if (this.y != target_y) {
                    this.y += step_y;
                }
                if (!continueStep(this)) {
                    this.y -= step_y;
                    collision_y = true;
                }
            }
            if ((collision_x || this.x == target_x) && (collision_y || this.y == target_y)) return {
                x: collision_x,
                y: collision_y
            };
        }
    };
    jaws.Sprite.prototype.stepWhile = function(vx, vy, continueStep) {
        return this.stepToWhile(this.x + vx, this.y + vy, continueStep);
    };
    jaws.Sprite.prototype.flip = function() {
        this.flipped = this.flipped ? false : true;
        return this;
    };
    jaws.Sprite.prototype.flipTo = function(value) {
        this.flipped = value;
        return this;
    };
    jaws.Sprite.prototype.rotate = function(value) {
        this.angle += value;
        return this;
    };
    jaws.Sprite.prototype.rotateTo = function(value) {
        this.angle = value;
        return this;
    };
    jaws.Sprite.prototype.moveTo = function(x, y) {
        if (jaws.isArray(x) && y === undefined) {
            y = x[1];
            x = x[0];
        }
        this.x = x;
        this.y = y;
        return this;
    };
    jaws.Sprite.prototype.move = function(x, y) {
        if (jaws.isArray(x) && y === undefined) {
            y = x[1];
            x = x[0];
        }
        if (x) this.x += x;
        if (y) this.y += y;
        return this;
    };
    jaws.Sprite.prototype.scaleAll = function(value) {
        this.scale_x *= value;
        this.scale_y *= value;
        return this.cacheOffsets();
    };
    jaws.Sprite.prototype.scaleTo = function(value) {
        this.scale_x = this.scale_y = value;
        return this.cacheOffsets();
    };
    jaws.Sprite.prototype.scaleWidth = function(value) {
        this.scale_x *= value;
        return this.cacheOffsets();
    };
    jaws.Sprite.prototype.scaleHeight = function(value) {
        this.scale_y *= value;
        return this.cacheOffsets();
    };
    jaws.Sprite.prototype.setX = function(value) {
        this.x = value;
        return this;
    };
    jaws.Sprite.prototype.setY = function(value) {
        this.y = value;
        return this;
    };
    jaws.Sprite.prototype.setTop = function(value) {
        this.y = value + this.top_offset;
        return this;
    };
    jaws.Sprite.prototype.setBottom = function(value) {
        this.y = value - this.bottom_offset;
        return this;
    };
    jaws.Sprite.prototype.setLeft = function(value) {
        this.x = value + this.left_offset;
        return this;
    };
    jaws.Sprite.prototype.setRight = function(value) {
        this.x = value - this.right_offset;
        return this;
    };
    jaws.Sprite.prototype.setWidth = function(value) {
        this.scale_x = value / this.image.width;
        return this.cacheOffsets();
    };
    jaws.Sprite.prototype.setHeight = function(value) {
        this.scale_y = value / this.image.height;
        return this.cacheOffsets();
    };
    jaws.Sprite.prototype.resize = function(width, height) {
        if (jaws.isArray(width) && height === undefined) {
            height = width[1];
            width = width[0];
        }
        this.scale_x = (this.width + width) / this.image.width;
        this.scale_y = (this.height + height) / this.image.height;
        return this.cacheOffsets();
    };
    jaws.Sprite.prototype.resizeTo = function(width, height) {
        if (jaws.isArray(width) && height === undefined) {
            height = width[1];
            width = width[0];
        }
        this.scale_x = width / this.image.width;
        this.scale_y = height / this.image.height;
        return this.cacheOffsets();
    };
    jaws.Sprite.prototype.setAnchor = function(value) {
        var anchors = {
            top_left: [ 0, 0 ],
            left_top: [ 0, 0 ],
            center_left: [ 0, .5 ],
            left_center: [ 0, .5 ],
            bottom_left: [ 0, 1 ],
            left_bottom: [ 0, 1 ],
            top_center: [ .5, 0 ],
            center_top: [ .5, 0 ],
            center_center: [ .5, .5 ],
            center: [ .5, .5 ],
            bottom_center: [ .5, 1 ],
            center_bottom: [ .5, 1 ],
            top_right: [ 1, 0 ],
            right_top: [ 1, 0 ],
            center_right: [ 1, .5 ],
            right_center: [ 1, .5 ],
            bottom_right: [ 1, 1 ],
            right_bottom: [ 1, 1 ]
        };
        if (a = anchors[value]) {
            this.anchor_x = a[0];
            this.anchor_y = a[1];
            if (this.image) this.cacheOffsets();
        }
        return this;
    };
    jaws.Sprite.prototype.cacheOffsets = function() {
        if (!this.image) {
            return;
        }
        this.width = this.image.width * this.scale_x;
        this.height = this.image.height * this.scale_y;
        this.left_offset = this.width * this.anchor_x;
        this.top_offset = this.height * this.anchor_y;
        this.right_offset = this.width * (1 - this.anchor_x);
        this.bottom_offset = this.height * (1 - this.anchor_y);
        if (this.cached_rect) this.cached_rect.resizeTo(this.width, this.height);
        return this;
    };
    jaws.Sprite.prototype.rect = function() {
        if (!this.cached_rect && this.width) this.cached_rect = new jaws.Rect(this.x, this.y, this.width, this.height);
        if (this.cached_rect) this.cached_rect.moveTo(this.x - this.left_offset, this.y - this.top_offset);
        return this.cached_rect;
    };
    jaws.Sprite.prototype.draw = function() {
        if (!this.image) {
            return this;
        }
        this.context.save();
        this.context.translate(this.x, this.y);
        if (this.angle != 0) {
            jaws.context.rotate(this.angle * Math.PI / 180);
        }
        this.flipped && this.context.scale(-1, 1);
        this.context.globalAlpha = this.alpha;
        this.context.translate(-this.left_offset, -this.top_offset);
        this.context.drawImage(this.image, 0, 0, this.width, this.height);
        this.context.restore();
        return this;
    };
    jaws.Sprite.prototype.scaleImage = function(factor) {
        if (!this.image) return;
        this.setImage(jaws.retroScaleImage(this.image, factor));
        return this;
    };
    jaws.Sprite.prototype.asCanvasContext = function() {
        var canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;
        var context = canvas.getContext("2d");
        if (jaws.context) context.mozImageSmoothingEnabled = jaws.context.mozImageSmoothingEnabled;
        context.drawImage(this.image, 0, 0, this.width, this.height);
        return context;
    };
    jaws.Sprite.prototype.asCanvas = function() {
        var canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;
        var context = canvas.getContext("2d");
        if (jaws.context) context.mozImageSmoothingEnabled = jaws.context.mozImageSmoothingEnabled;
        context.drawImage(this.image, 0, 0, this.width, this.height);
        return canvas;
    };
    jaws.Sprite.prototype.toString = function() {
        return "[Sprite " + this.x.toFixed(2) + ", " + this.y.toFixed(2) + ", " + this.width + ", " + this.height + "]";
    };
    jaws.Sprite.prototype.attributes = function() {
        var object = {};
        object["_constructor"] = this._constructor || "jaws.Sprite";
        object["x"] = parseFloat(this.x.toFixed(2));
        object["y"] = parseFloat(this.y.toFixed(2));
        object["image"] = this.image_path;
        object["alpha"] = this.alpha;
        object["flipped"] = this.flipped;
        object["angle"] = parseFloat(this.angle.toFixed(2));
        object["scale_x"] = this.scale_x;
        object["scale_y"] = this.scale_y;
        object["anchor_x"] = this.anchor_x;
        object["anchor_y"] = this.anchor_y;
        if (this.data !== null) object["data"] = jaws.clone(this.data);
        return object;
    };
    jaws.Sprite.parse = function(objects) {
        var sprites = [];
        if (jaws.isArray(objects)) {
            if (objects.every(function(item) {
                return item._constructor;
            })) {
                parseArray(objects);
            } else {
                sprites = objects;
            }
        } else if (jaws.isString(objects)) {
            parseArray(JSON.parse(objects));
            jaws.log.info(objects);
        }
        function parseArray(array) {
            array.forEach(function(data) {
                var constructor = data._constructor ? eval(data._constructor) : data.constructor;
                if (jaws.isFunction(constructor)) {
                    jaws.log.info("Creating " + data._constructor + "(" + data.toString() + ")", true);
                    var object = new constructor(data);
                    object._constructor = data._constructor || data.constructor.name;
                    sprites.push(object);
                }
            });
        }
        return sprites;
    };
    jaws.Sprite.prototype.toJSON = function() {
        return JSON.stringify(this.attributes());
    };
    return jaws;
}(jaws || {});

if (typeof module !== "undefined" && "exports" in module) {
    module.exports = jaws.Sprite;
}

var jaws = function(jaws) {
    jaws.SpriteSheet = function SpriteSheet(options) {
        if (!(this instanceof SpriteSheet)) return new SpriteSheet(options);
        jaws.parseOptions(this, options, this.default_options);
        if (jaws.isString(this.image) && !options.frame_size) {
            var regexp = new RegExp("_(\\d+)x(\\d+)", "g");
            var sizes = regexp.exec(this.image);
            this.frame_size = [];
            this.frame_size[0] = parseInt(sizes[1]);
            this.frame_size[1] = parseInt(sizes[2]);
        }
        this.image = jaws.isDrawable(this.image) ? this.image : jaws.assets.data[this.image];
        if (this.scale_image) {
            var image = jaws.isDrawable(this.image) ? this.image : jaws.assets.get(this.image);
            this.frame_size[0] *= this.scale_image;
            this.frame_size[1] *= this.scale_image;
            this.image = jaws.retroScaleImage(image, this.scale_image);
        }
        var index = 0;
        this.frames = [];
        if (this.orientation == "down") {
            for (var x = this.offset; x < this.image.width; x += this.frame_size[0]) {
                for (var y = 0; y < this.image.height; y += this.frame_size[1]) {
                    this.frames.push(cutImage(this.image, x, y, this.frame_size[0], this.frame_size[1]));
                }
            }
        } else {
            for (var y = this.offset; y < this.image.height; y += this.frame_size[1]) {
                for (var x = 0; x < this.image.width; x += this.frame_size[0]) {
                    this.frames.push(cutImage(this.image, x, y, this.frame_size[0], this.frame_size[1]));
                }
            }
        }
    };
    jaws.SpriteSheet.prototype.default_options = {
        image: null,
        orientation: "down",
        frame_size: [ 32, 32 ],
        offset: 0,
        scale_image: null
    };
    function cutImage(image, x, y, width, height) {
        var cut = document.createElement("canvas");
        cut.width = width;
        cut.height = height;
        var ctx = cut.getContext("2d");
        ctx.drawImage(image, x, y, width, height, 0, 0, cut.width, cut.height);
        return cut;
    }
    jaws.SpriteSheet.prototype.toString = function() {
        return "[SpriteSheet " + this.frames.length + " frames]";
    };
    return jaws;
}(jaws || {});

var jaws = function(jaws) {
    jaws.Animation = function Animation(options) {
        if (!(this instanceof Animation)) return new Animation(options);
        jaws.parseOptions(this, options, this.default_options);
        if (options.sprite_sheet) {
            var sprite_sheet = new jaws.SpriteSheet({
                image: options.sprite_sheet,
                scale_image: this.scale_image,
                frame_size: this.frame_size,
                orientation: this.orientation,
                offset: this.offset
            });
            this.frames = sprite_sheet.frames;
            this.frame_size = sprite_sheet.frame_size;
        }
        if (options.scale_image) {
            var image = jaws.isDrawable(options.sprite_sheet) ? options.sprite_sheet : jaws.assets.get(options.sprite_sheet);
            this.frame_size[0] *= options.scale_image;
            this.frame_size[1] *= options.scale_image;
            options.sprite_sheet = jaws.retroScaleImage(image, options.scale_image);
        }
        this.current_tick = new Date().getTime();
        this.last_tick = new Date().getTime();
        this.sum_tick = 0;
        if (options.subsets) {
            this.subsets = {};
            for (subset in options.subsets) {
                start_stop = options.subsets[subset];
                this.subsets[subset] = this.slice(start_stop[0], start_stop[1]);
            }
        }
    };
    jaws.Animation.prototype.default_options = {
        frames: [],
        subsets: [],
        frame_duration: 100,
        index: 0,
        loop: 1,
        bounce: 0,
        frame_direction: 1,
        frame_size: null,
        orientation: "down",
        on_end: null,
        offset: 0,
        scale_image: null,
        sprite_sheet: null
    };
    jaws.Animation.prototype.subset = function(subset) {
        return this.subsets[subset];
    };
    jaws.Animation.prototype.update = function() {
        this.current_tick = new Date().getTime();
        this.sum_tick += this.current_tick - this.last_tick;
        this.last_tick = this.current_tick;
        if (this.sum_tick > this.frame_duration) {
            this.index += this.frame_direction;
            this.sum_tick = 0;
        }
        if (this.index >= this.frames.length || this.index < 0) {
            if (this.bounce) {
                this.frame_direction = -this.frame_direction;
                this.index += this.frame_direction * 2;
            } else if (this.loop) {
                if (this.frame_direction < 0) {
                    this.index = this.frames.length - 1;
                } else {
                    this.index = 0;
                }
            } else {
                this.index -= this.frame_direction;
                if (this.on_end) {
                    this.on_end();
                    this.on_end = null;
                }
            }
        }
        return this;
    };
    jaws.Animation.prototype.slice = function(start, stop) {
        var o = {};
        o.frame_duration = this.frame_duration;
        o.loop = this.loop;
        o.bounce = this.bounce;
        o.on_end = this.on_end;
        o.frame_direction = this.frame_direction;
        o.frames = this.frames.slice().slice(start, stop);
        return new jaws.Animation(o);
    };
    jaws.Animation.prototype.next = function() {
        this.update();
        return this.frames[this.index];
    };
    jaws.Animation.prototype.atLastFrame = function() {
        return this.index == this.frames.length - 1;
    };
    jaws.Animation.prototype.atFirstFrame = function() {
        return this.index == 0;
    };
    jaws.Animation.prototype.currentFrame = function() {
        return this.frames[this.index];
    };
    jaws.Animation.prototype.toString = function() {
        return "[Animation, " + this.frames.length + " frames]";
    };
    return jaws;
}(jaws || {});

var jaws = function(jaws) {
    jaws.Viewport = function ViewPort(options) {
        if (!(this instanceof Viewport)) return new Viewport(options);
        jaws.parseOptions(this, options, this.default_options);
        if (!this.context) this.context = jaws.context;
        if (!this.width) this.width = jaws.width;
        if (!this.height) this.height = jaws.height;
        if (!this.max_x) this.max_x = jaws.width;
        if (!this.max_y) this.max_y = jaws.height;
        var that = this;
        this.move = function(x, y) {
            x && (this.x += x);
            y && (this.y += y);
            this.verifyPosition();
        };
        this.moveTo = function(x, y) {
            if (!(x == undefined)) {
                this.x = x;
            }
            if (!(y == undefined)) {
                this.y = y;
            }
            this.verifyPosition();
        };
        this.isOutside = function(item) {
            return !that.isInside(item);
        };
        this.isInside = function(item) {
            return item.x >= that.x && item.x <= that.x + that.width && item.y >= that.y && item.y <= that.y + that.height;
        };
        this.isPartlyInside = function(item) {
            var rect = item.rect();
            return rect.right >= that.x && rect.x <= that.x + that.width && rect.bottom >= that.y && item.y <= that.y + that.height;
        };
        this.isLeftOf = function(item) {
            return item.x < that.x;
        };
        this.isRightOf = function(item) {
            return item.x > that.x + that.width;
        };
        this.isAbove = function(item) {
            return item.y < that.y;
        };
        this.isBelow = function(item) {
            return item.y > that.y + that.height;
        };
        this.centerAround = function(item) {
            this.x = Math.floor(item.x - this.width / 2);
            this.y = Math.floor(item.y - this.height / 2);
            this.verifyPosition();
        };
        this.forceInsideVisibleArea = function(item, buffer) {
            if (item.x < this.x + buffer) {
                item.x = this.x + buffer;
            }
            if (item.x > this.x + jaws.width - buffer) {
                item.x = this.x + jaws.width - buffer;
            }
            if (item.y < this.y + buffer) {
                item.y = this.y + buffer;
            }
            if (item.y > this.y + jaws.height - buffer) {
                item.y = this.y + jaws.height - buffer;
            }
        };
        this.forceInside = function(item, buffer) {
            if (item.x < buffer) {
                item.x = buffer;
            }
            if (item.x > this.max_x - buffer) {
                item.x = this.max_x - buffer;
            }
            if (item.y < buffer) {
                item.y = buffer;
            }
            if (item.y > this.max_y - buffer) {
                item.y = this.max_y - buffer;
            }
        };
        this.apply = function(func) {
            this.context.save();
            this.context.translate(-this.x, -this.y);
            func();
            this.context.restore();
        };
        this.draw = function(obj) {
            this.apply(function() {
                if (obj.forEach) obj.forEach(that.drawIfPartlyInside); else if (obj.draw) that.drawIfPartlyInside(obj);
            });
        };
        this.drawTileMap = function(tile_map) {
            var sprites = tile_map.atRect({
                x: this.x,
                y: this.y,
                right: this.x + this.width,
                bottom: this.y + this.height
            });
            this.apply(function() {
                for (var i = 0; i < sprites.length; i++) sprites[i].draw();
            });
        };
        this.drawIfPartlyInside = function(item) {
            if (that.isPartlyInside(item)) item.draw();
        };
        this.verifyPosition = function() {
            var max = this.max_x - this.width;
            if (this.x < 0) {
                this.x = 0;
            }
            if (this.x > max) {
                this.x = max;
            }
            var max = this.max_y - this.height;
            if (this.y < 0) {
                this.y = 0;
            }
            if (this.y > max) {
                this.y = max;
            }
        };
        this.moveTo(options.x || 0, options.y || 0);
    };
    jaws.Viewport.prototype.default_options = {
        context: null,
        width: null,
        height: null,
        max_x: null,
        max_y: null,
        x: 0,
        y: 0
    };
    jaws.Viewport.prototype.toString = function() {
        return "[Viewport " + this.x.toFixed(2) + ", " + this.y.toFixed(2) + ", " + this.width + ", " + this.height + "]";
    };
    return jaws;
}(jaws || {});

var jaws = function(jaws) {
    jaws.collideOneWithOne = function(object1, object2) {
        if (object1.radius && object2.radius && object1 !== object2 && jaws.collideCircles(object1, object2)) return true;
        if (object1.rect && object2.rect && object1 !== object2 && jaws.collideRects(object1.rect(), object2.rect())) return true;
        return false;
    };
    jaws.collideOneWithMany = function(object, list, callback) {
        var a = [];
        if (callback) {
            for (var i = 0; i < list.length; i++) {
                if (jaws.collideOneWithOne(object, list[i])) {
                    callback(object, list[i]);
                    a.push(list[i]);
                }
            }
            return a;
        } else {
            return list.filter(function(item) {
                return jaws.collideOneWithOne(object, item);
            });
        }
    };
    jaws.collideManyWithMany = function(list1, list2, callback) {
        var a = [];
        if (list1 === list2) {
            combinations(list1, 2).forEach(function(pair) {
                if (jaws.collideOneWithOne(pair[0], pair[1])) {
                    if (callback) {
                        callback(pair[0], pair[1]);
                    } else {
                        a.push([ pair[0], pair[1] ]);
                    }
                }
            });
        } else {
            list1.forEach(function(item1) {
                list2.forEach(function(item2) {
                    if (jaws.collideOneWithOne(item1, item2)) {
                        if (callback) {
                            callback(item1, item2);
                        } else {
                            a.push([ item1, item2 ]);
                        }
                    }
                });
            });
        }
        return a;
    };
    jaws.collideCircles = function(object1, object2) {
        return jaws.distanceBetween(object1, object2) < object1.radius + object2.radius;
    };
    jaws.collideRects = function(rect1, rect2) {
        return (rect1.x >= rect2.x && rect1.x <= rect2.right || rect2.x >= rect1.x && rect2.x <= rect1.right) && (rect1.y >= rect2.y && rect1.y <= rect2.bottom || rect2.y >= rect1.y && rect2.y <= rect1.bottom);
    };
    jaws.distanceBetween = function(object1, object2) {
        return Math.sqrt(Math.pow(object1.x - object2.x, 2) + Math.pow(object1.y - object2.y, 2));
    };
    function combinations(list, n) {
        var f = function(i) {
            if (list.isSpriteList !== undefined) {
                return list.at(i);
            } else {
                return list[i];
            }
        };
        var r = [];
        var m = new Array(n);
        for (var i = 0; i < n; i++) m[i] = i;
        for (var i = n - 1, sn = list.length; 0 <= i; sn = list.length) {
            r.push(m.map(f));
            while (0 <= i && m[i] === sn - 1) {
                i--;
                sn--;
            }
            if (0 <= i) {
                m[i] += 1;
                for (var j = i + 1; j < n; j++) m[j] = m[j - 1] + 1;
                i = n - 1;
            }
        }
        return r;
    }
    function hasItems(array) {
        return array && array.length > 0;
    }
    jaws.collide = function(x, x2, callback) {
        if (x.rect && x2.forEach) return jaws.collideOneWithMany(x, x2, callback).length > 0;
        if (x.forEach && x2.forEach) return jaws.collideManyWithMany(x, x2, callback).length > 0;
        if (x.forEach && x2.rect) return jaws.collideOneWithMany(x2, x, callback).length > 0;
        if (x.rect && x2.rect) {
            var result = jaws.collideOneWithOne(x, x2);
            if (callback && result) callback(x, x2); else return result;
        }
    };
    return jaws;
}(jaws || {});

var jaws = function(jaws) {
    jaws.PixelMap = function PixelMap(options) {
        if (!(this instanceof PixelMap)) return new PixelMap(options);
        this.options = options;
        this.scale = options.scale || 1;
        this.x = options.x || 0;
        this.y = options.y || 0;
        if (options.image) {
            this.setContext(options.image);
            if (options.scale_image) {
                this.setContext(jaws.retroScaleImage(this.context.canvas, options.scale_image));
            }
            this.width = this.context.canvas.width * this.scale;
            this.height = this.context.canvas.height * this.scale;
        } else {
            jaws.log.warn("PixelMap needs an image to work with");
        }
        this.named_colors = [];
        this.update();
    };
    jaws.PixelMap.prototype.setContext = function(image) {
        var image = jaws.isDrawable(image) ? image : jaws.assets.get(image);
        this.context = jaws.imageToCanvasContext(image);
    };
    jaws.PixelMap.prototype.update = function(x, y, width, height) {
        if (x === undefined || x < 0) x = 0;
        if (y === undefined || y < 0) y = 0;
        if (width === undefined || width > this.width) width = this.width;
        if (height === undefined || height > this.height) height = this.height;
        if (arguments.length == 0) {
            this.data = this.context.getImageData(x, y, width, height).data;
        } else {
            var tmp = this.context.getImageData(x, y, width, height).data;
            var tmp_count = 0;
            var one_line_down = this.width * 4;
            var offset = y * this.width * 4 + x * 4;
            var horizontal_line = width * 4;
            for (var y2 = 0; y2 < height; y2++) {
                for (var x2 = 0; x2 < horizontal_line; x2++) {
                    this.data[offset + x2] = tmp[tmp_count++];
                }
                offset += one_line_down;
            }
        }
    };
    jaws.PixelMap.prototype.draw = function() {
        jaws.context.drawImage(this.context.canvas, this.x, this.y, this.width, this.height);
    };
    jaws.PixelMap.prototype.namedColorAtRect = function(rect, color) {
        var x = rect.x;
        var y = rect.y;
        for (;x < rect.right - 1; x++) if (this.namedColorAt(x, y) == color || color === undefined) return this.namedColorAt(x, y);
        for (;y < rect.bottom - 1; y++) if (this.namedColorAt(x, y) == color || color === undefined) return this.namedColorAt(x, y);
        for (;x > rect.x; x--) if (this.namedColorAt(x, y) == color || color === undefined) return this.namedColorAt(x, y);
        for (;y > rect.y; y--) if (this.namedColorAt(x, y) == color || color === undefined) return this.namedColorAt(x, y);
        return false;
    };
    jaws.PixelMap.prototype.at = function(x, y) {
        x = parseInt(x);
        y = parseInt(y);
        if (y < 0) y = 0;
        var start = y * this.width * 4 + x * 4;
        var R = this.data[start];
        var G = this.data[start + 1];
        var B = this.data[start + 2];
        var A = this.data[start + 3];
        return [ R, G, B, A ];
    };
    jaws.PixelMap.prototype.namedColorAt = function(x, y) {
        var a = this.at(x, y);
        for (var i = 0; i < this.named_colors.length; i++) {
            var name = this.named_colors[i].name;
            var c = this.named_colors[i].color;
            if (c[0] == a[0] && c[1] == a[1] && c[2] == a[2] && c[3] == a[3]) return name;
        }
    };
    jaws.PixelMap.prototype.nameColor = function(color, name) {
        this.named_colors.push({
            name: name,
            color: color
        });
    };
    return jaws;
}(jaws || {});

var jaws = function(jaws) {
    jaws.Parallax = function Parallax(options) {
        if (!(this instanceof Parallax)) return new Parallax(options);
        jaws.parseOptions(this, options, this.default_options);
    };
    jaws.Parallax.prototype.default_options = {
        width: function() {
            return jaws.width;
        },
        height: function() {
            return jaws.height;
        },
        scale: 1,
        repeat_x: null,
        repeat_y: null,
        camera_x: 0,
        camera_y: 0,
        layers: []
    };
    jaws.Parallax.prototype.draw = function(options) {
        var layer, numx, numy, initx;
        for (var i = 0; i < this.layers.length; i++) {
            layer = this.layers[i];
            if (this.repeat_x) {
                initx = -(this.camera_x / layer.damping % layer.width);
            } else {
                initx = -(this.camera_x / layer.damping);
            }
            if (this.repeat_y) {
                layer.y = -(this.camera_y / layer.damping % layer.height);
            } else {
                layer.y = -(this.camera_y / layer.damping);
            }
            layer.x = initx;
            while (layer.y < this.height) {
                while (layer.x < this.width) {
                    if (layer.x + layer.width >= 0 && layer.y + layer.height >= 0) {
                        layer.draw();
                    }
                    layer.x = layer.x + layer.width;
                    if (!this.repeat_x) {
                        break;
                    }
                }
                layer.y = layer.y + layer.height;
                layer.x = initx;
                if (!this.repeat_y) {
                    break;
                }
            }
        }
    };
    jaws.Parallax.prototype.addLayer = function(options) {
        var layer = new jaws.ParallaxLayer(options);
        layer.scaleAll(this.scale);
        this.layers.push(layer);
    };
    jaws.Parallax.prototype.toString = function() {
        return "[Parallax " + this.x + ", " + this.y + ". " + this.layers.length + " layers]";
    };
    jaws.ParallaxLayer = function ParallaxLayer(options) {
        if (!(this instanceof ParallaxLayer)) return new ParallaxLayer(options);
        this.damping = options.damping || 0;
        jaws.Sprite.call(this, options);
    };
    jaws.ParallaxLayer.prototype = jaws.Sprite.prototype;
    return jaws;
}(jaws || {});

var jaws = function(jaws) {
    jaws.Text = function Text(options) {
        if (!(this instanceof Text)) return new Text(options);
        this.set(options);
        if (options.context) {
            this.context = options.context;
        }
        if (!options.context) {
            if (jaws.context) this.context = jaws.context;
        }
    };
    jaws.Text.prototype.default_options = {
        x: 0,
        y: 0,
        alpha: 1,
        angle: 0,
        anchor_x: 0,
        anchor_y: 0,
        anchor: "top_left",
        damping: 1,
        style: "normal",
        fontFace: "serif",
        fontSize: 12,
        color: "black",
        textAlign: "start",
        textBaseline: "alphabetic",
        text: "",
        wordWrap: false,
        width: function() {
            return jaws.width;
        },
        height: function() {
            return jaws.height;
        },
        shadowColor: null,
        shadowBlur: null,
        shadowOffsetX: null,
        shadowOffsetY: null,
        _constructor: null
    };
    jaws.Text.prototype.set = function(options) {
        jaws.parseOptions(this, options, this.default_options);
        if (this.anchor) this.setAnchor(this.anchor);
        this.cacheOffsets();
        return this;
    };
    jaws.Text.prototype.clone = function() {
        var constructor = this._constructor ? eval(this._constructor) : this.constructor;
        var new_sprite = new constructor(this.attributes());
        new_sprite._constructor = this._constructor || this.constructor.name;
        return new_sprite;
    };
    jaws.Text.prototype.rotate = function(value) {
        this.angle += value;
        return this;
    };
    jaws.Text.prototype.rotateTo = function(value) {
        this.angle = value;
        return this;
    };
    jaws.Text.prototype.moveTo = function(x, y) {
        this.x = x;
        this.y = y;
        return this;
    };
    jaws.Text.prototype.move = function(x, y) {
        if (x) this.x += x;
        if (y) this.y += y;
        return this;
    };
    jaws.Text.prototype.setX = function(value) {
        this.x = value;
        return this;
    };
    jaws.Text.prototype.setY = function(value) {
        this.y = value;
        return this;
    };
    jaws.Text.prototype.setTop = function(value) {
        this.y = value + this.top_offset;
        return this;
    };
    jaws.Text.prototype.setBottom = function(value) {
        this.y = value - this.bottom_offset;
        return this;
    };
    jaws.Text.prototype.setLeft = function(value) {
        this.x = value + this.left_offset;
        return this;
    };
    jaws.Text.prototype.setRight = function(value) {
        this.x = value - this.right_offset;
        return this;
    };
    jaws.Text.prototype.setWidth = function(value) {
        this.width = value;
        this.cacheOffsets();
        return this;
    };
    jaws.Text.prototype.setHeight = function(value) {
        this.height = value;
        this.cacheOffsets();
        return this;
    };
    jaws.Text.prototype.resize = function(width, height) {
        this.width += width;
        this.height += height;
        this.cacheOffsets();
        return this;
    };
    jaws.Text.prototype.resizeTo = function(width, height) {
        this.width = width;
        this.height = height;
        this.cacheOffsets();
        return this;
    };
    jaws.Text.prototype.setAnchor = function(value) {
        var anchors = {
            top_left: [ 0, 0 ],
            left_top: [ 0, 0 ],
            center_left: [ 0, .5 ],
            left_center: [ 0, .5 ],
            bottom_left: [ 0, 1 ],
            left_bottom: [ 0, 1 ],
            top_center: [ .5, 0 ],
            center_top: [ .5, 0 ],
            center_center: [ .5, .5 ],
            center: [ .5, .5 ],
            bottom_center: [ .5, 1 ],
            center_bottom: [ .5, 1 ],
            top_right: [ 1, 0 ],
            right_top: [ 1, 0 ],
            center_right: [ 1, .5 ],
            right_center: [ 1, .5 ],
            bottom_right: [ 1, 1 ],
            right_bottom: [ 1, 1 ]
        };
        if (anchors.hasOwnProperty(value)) {
            this.anchor_x = anchors[value][0];
            this.anchor_y = anchors[value][1];
            this.cacheOffsets();
        }
        return this;
    };
    jaws.Text.prototype.cacheOffsets = function() {
        this.left_offset = this.width * this.anchor_x;
        this.top_offset = this.height * this.anchor_y;
        this.right_offset = this.width * (1 - this.anchor_x);
        this.bottom_offset = this.height * (1 - this.anchor_y);
        if (this.cached_rect) this.cached_rect.resizeTo(this.width, this.height);
        return this;
    };
    jaws.Text.prototype.rect = function() {
        if (!this.cached_rect && this.width) this.cached_rect = new jaws.Rect(this.x, this.y, this.width, this.height);
        if (this.cached_rect) this.cached_rect.moveTo(this.x - this.left_offset, this.y - this.top_offset);
        return this.cached_rect;
    };
    jaws.Text.prototype.draw = function() {
        this.context.save();
        if (this.angle !== 0) {
            this.context.rotate(this.angle * Math.PI / 180);
        }
        this.context.globalAlpha = this.alpha;
        this.context.translate(-this.left_offset, -this.top_offset);
        this.context.fillStyle = this.color;
        this.context.font = this.style + " " + this.fontSize + "px " + this.fontFace;
        this.context.textBaseline = this.textBaseline;
        this.context.textAlign = this.textAlign;
        if (this.shadowColor) this.context.shadowColor = this.shadowColor;
        if (this.shadowBlur) this.context.shadowBlur = this.shadowBlur;
        if (this.shadowOffsetX) this.context.shadowOffsetX = this.shadowOffsetX;
        if (this.shadowOffsetY) this.context.shadowOffsetY = this.shadowOffsetY;
        var oldY = this.y;
        var oldX = this.x;
        if (this.wordWrap) {
            var words = this.text.split(" ");
            var nextLine = "";
            for (var n = 0; n < words.length; n++) {
                var testLine = nextLine + words[n] + " ";
                var measurement = this.context.measureText(testLine);
                if (this.y < oldY + this.height) {
                    if (measurement.width > this.width) {
                        this.context.fillText(nextLine, this.x, this.y);
                        nextLine = words[n] + " ";
                        this.y += this.fontSize;
                    } else {
                        nextLine = testLine;
                    }
                    this.context.fillText(nextLine, this.x, this.y);
                }
            }
        } else {
            if (this.context.measureText(this.text).width < this.width) {
                this.context.fillText(this.text, this.x, this.y);
            } else {
                var words = this.text.split(" ");
                var nextLine = " ";
                for (var n = 0; n < words.length; n++) {
                    var testLine = nextLine + words[n] + " ";
                    if (this.context.measureText(testLine).width < Math.abs(this.width - this.x)) {
                        this.context.fillText(testLine, this.x, this.y);
                        nextLine = words[n] + " ";
                        nextLine = testLine;
                    }
                }
            }
        }
        this.y = oldY;
        this.x = oldX;
        this.context.restore();
        return this;
    };
    jaws.Text.prototype.asCanvasContext = function() {
        var canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;
        var context = canvas.getContext("2d");
        context.mozImageSmoothingEnabled = jaws.context.mozImageSmoothingEnabled;
        this.context.fillStyle = this.color;
        this.context.font = this.style + this.fontSize + "px " + this.fontFace;
        this.context.textBaseline = this.textBaseline;
        this.context.textAlign = this.textAlign;
        if (this.shadowColor) this.context.shadowColor = this.shadowColor;
        if (this.shadowBlur) this.context.shadowBlur = this.shadowBlur;
        if (this.shadowOffsetX) this.context.shadowOffsetX = this.shadowOffsetX;
        if (this.shadowOffsetY) this.context.shadowOffsetY = this.shadowOffsetY;
        var oldY = this.y;
        var oldX = this.x;
        if (this.wordWrap) {
            var words = this.text.split(" ");
            var nextLine = "";
            for (var n = 0; n < words.length; n++) {
                var testLine = nextLine + words[n] + " ";
                var measurement = this.context.measureText(testLine);
                if (this.y < oldY + this.height) {
                    if (measurement.width > this.width) {
                        this.context.fillText(nextLine, this.x, this.y);
                        nextLine = words[n] + " ";
                        this.y += this.fontSize;
                    } else {
                        nextLine = testLine;
                    }
                    this.context.fillText(nextLine, this.x, this.y);
                }
            }
        } else {
            if (this.context.measureText(this.text).width < this.width) {
                this.context.fillText(this.text, this.x, this.y);
            } else {
                var words = this.text.split(" ");
                var nextLine = " ";
                for (var n = 0; n < words.length; n++) {
                    var testLine = nextLine + words[n] + " ";
                    if (this.context.measureText(testLine).width < Math.abs(this.width - this.x)) {
                        this.context.fillText(testLine, this.x, this.y);
                        nextLine = words[n] + " ";
                        nextLine = testLine;
                    }
                }
            }
        }
        this.y = oldY;
        this.x = oldX;
        return context;
    };
    jaws.Text.prototype.asCanvas = function() {
        var canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;
        var context = canvas.getContext("2d");
        context.mozImageSmoothingEnabled = jaws.context.mozImageSmoothingEnabled;
        this.context.fillStyle = this.color;
        this.context.font = this.style + this.fontSize + "px " + this.fontFace;
        this.context.textBaseline = this.textBaseline;
        this.context.textAlign = this.textAlign;
        if (this.shadowColor) this.context.shadowColor = this.shadowColor;
        if (this.shadowBlur) this.context.shadowBlur = this.shadowBlur;
        if (this.shadowOffsetX) this.context.shadowOffsetX = this.shadowOffsetX;
        if (this.shadowOffsetY) this.context.shadowOffsetY = this.shadowOffsetY;
        var oldY = this.y;
        var oldX = this.x;
        if (this.wordWrap) {
            var words = this.text.split(" ");
            var nextLine = "";
            for (var n = 0; n < words.length; n++) {
                var testLine = nextLine + words[n] + " ";
                var measurement = context.measureText(testLine);
                if (this.y < oldY + this.height) {
                    if (measurement.width > this.width) {
                        context.fillText(nextLine, this.x, this.y);
                        nextLine = words[n] + " ";
                        this.y += this.fontSize;
                    } else {
                        nextLine = testLine;
                    }
                    context.fillText(nextLine, this.x, this.y);
                }
            }
        } else {
            if (context.measureText(this.text).width < this.width) {
                this.context.fillText(this.text, this.x, this.y);
            } else {
                var words = this.text.split(" ");
                var nextLine = " ";
                for (var n = 0; n < words.length; n++) {
                    var testLine = nextLine + words[n] + " ";
                    if (context.measureText(testLine).width < Math.abs(this.width - this.x)) {
                        context.fillText(testLine, this.x, this.y);
                        nextLine = words[n] + " ";
                        nextLine = testLine;
                    }
                }
            }
        }
        this.y = oldY;
        this.x = oldX;
        return canvas;
    };
    jaws.Text.prototype.toString = function() {
        return "[Text " + this.x.toFixed(2) + ", " + this.y.toFixed(2) + ", " + this.width + ", " + this.height + "]";
    };
    jaws.Text.prototype.attributes = function() {
        var object = this.options;
        object["_constructor"] = this._constructor || "jaws.Text";
        object["x"] = parseFloat(this.x.toFixed(2));
        object["y"] = parseFloat(this.y.toFixed(2));
        object["text"] = this.text;
        object["alpha"] = this.alpha;
        object["angle"] = parseFloat(this.angle.toFixed(2));
        object["anchor_x"] = this.anchor_x;
        object["anchor_y"] = this.anchor_y;
        object["style"] = this.style;
        object["fontSize"] = this.fontSize;
        object["fontFace"] = this.fontFace;
        object["color"] = this.color;
        object["textAlign"] = this.textAlign;
        object["textBaseline"] = this.textBaseline;
        object["wordWrap"] = this.wordWrap;
        object["width"] = this.width;
        object["height"] = this.height;
        return object;
    };
    jaws.Text.prototype.toJSON = function() {
        return JSON.stringify(this.attributes());
    };
    return jaws;
}(jaws || {});

if (typeof module !== "undefined" && "exports" in module) {
    module.exports = jaws.Text;
}

var jaws = function(jaws) {
    jaws.QuadTree = function(bounds, depth) {
        this.depth = depth || 0;
        this.bounds = bounds || new jaws.Rect(0, 0, jaws.width, jaws.height);
        this.nodes = [];
        this.objects = [];
    };
    jaws.QuadTree.prototype.clear = function() {
        this.objects = [];
        for (var i = 0; i < this.nodes.length; i++) {
            if (typeof this.nodes[i] !== "undefined") {
                this.nodes[i].clear();
                delete this.nodes[i];
            }
        }
    };
    jaws.QuadTree.prototype.split = function() {
        var subWidth = Math.round(this.bounds.width / 2);
        var subHeight = Math.round(this.bounds.height / 2);
        var x = this.bounds.x;
        var y = this.bounds.y;
        this.nodes[0] = new jaws.QuadTree(new jaws.Rect(x + subWidth, y, subWidth, subHeight), this.depth + 1);
        this.nodes[1] = new jaws.QuadTree(new jaws.Rect(x, y, subWidth, subHeight), this.depth + 1);
        this.nodes[2] = new jaws.QuadTree(new jaws.Rect(x, y + subHeight, subWidth, subHeight), this.depth + 1);
        this.nodes[3] = new jaws.QuadTree(new jaws.Rect(x + subWidth, y + subHeight, subWidth, subHeight), this.depth + 1);
    };
    jaws.QuadTree.prototype.getIndex = function(pRect) {
        var index = -1;
        var verticalMidpoint = this.bounds.x + this.bounds.width / 2;
        var horizontalMidpoint = this.bounds.y + this.bounds.height / 2;
        var topQuadrant = pRect.y < horizontalMidpoint && pRect.y + pRect.height < horizontalMidpoint;
        var bottomQuadrant = pRect.y > horizontalMidpoint;
        if (pRect.x < verticalMidpoint && pRect.x + pRect.width < verticalMidpoint) {
            if (topQuadrant) {
                index = 1;
            } else if (bottomQuadrant) {
                index = 2;
            }
        } else if (pRect.x > verticalMidpoint) {
            if (topQuadrant) {
                index = 0;
            } else if (bottomQuadrant) {
                index = 3;
            }
        }
        return index;
    };
    jaws.QuadTree.prototype.insert = function(pRect) {
        if (!pRect.hasOwnProperty("x") && !pRect.hasOwnProperty("y") && !pRect.hasOwnProperty("width") && !pRect.hasOwnProperty("height")) {
            return;
        }
        if (typeof this.nodes[0] !== "undefined") {
            var index = this.getIndex(pRect);
            if (index !== -1) {
                this.nodes[index].insert(pRect);
                return;
            }
        }
        this.objects.push(pRect);
        if (typeof this.nodes[0] === "undefined") {
            this.split();
        }
        var i = 0;
        while (i < this.objects.length) {
            var index = this.getIndex(this.objects[i]);
            if (index !== -1) {
                this.nodes[index].insert(this.objects.splice(i, 1)[0]);
            } else {
                i++;
            }
        }
    };
    jaws.QuadTree.prototype.retrieve = function(pRect) {
        if (!pRect.hasOwnProperty("x") && !pRect.hasOwnProperty("y") && !pRect.hasOwnProperty("width") && !pRect.hasOwnProperty("height")) {
            return;
        }
        var index = this.getIndex(pRect);
        var returnObjects = this.objects;
        if (typeof this.nodes[0] !== "undefined") {
            if (index !== -1) {
                returnObjects = returnObjects.concat(this.nodes[index].retrieve(pRect));
            } else {
                for (var i = 0; i < this.nodes.length; i++) {
                    returnObjects = returnObjects.concat(this.nodes[i].retrieve(pRect));
                }
            }
        }
        return returnObjects;
    };
    jaws.QuadTree.prototype.collide = function(list1, list2, callback) {
        var overlap = false;
        var tree = new jaws.QuadTree();
        var temp = [];
        if (!list1.forEach) {
            temp.push(list1);
            list1 = temp;
        }
        if (!list2.forEach) {
            temp = [];
            temp.push(list2);
            list2 = temp;
        }
        list2.forEach(function(el) {
            tree.insert(el);
        });
        list1.forEach(function(el) {
            if (jaws.collide(el, tree.retrieve(el), callback)) {
                overlap = true;
            }
        });
        tree.clear();
        return overlap;
    };
    return jaws;
}(jaws || {});

if (typeof module !== "undefined" && "exports" in module) {
    module.exports = jaws.QuadTree;
}

window.addEventListener("load", function() {
    if (jaws.onload) jaws.onload();
}, false);

var jaws = function(jaws) {
    jaws.Audio = function Audio(options) {
        if (!(this instanceof Audio)) return new Audio(options);
        if (typeof Audio !== "undefined") {
            this.set(options);
        } else {
            jaws.log.error("jaws.Audio (constructor): 'Audio' object does not exist.");
            this.audio = null;
        }
    };
    jaws.Audio.prototype.default_options = {
        audio: null,
        autoplay: false,
        loop: false,
        volume: 0,
        onend: null,
        onplay: null,
        onpause: null,
        _constructor: null
    };
    jaws.Audio.prototype.set = function(options) {
        jaws.parseOptions(this, options, this.default_options);
        if (this.audio) {
            if (jaws.isString(this.audio)) {
                var type = jaws.assets.getPostfix(this.audio);
                if (jaws.assets.file_type[type] && jaws.assets.can_play[type]) {
                    this.setAudio(this.audio);
                } else {
                    jaws.log.warn("jaws.Audio.set: Unknown or unplayable MIME filetype.");
                    this.audio = null;
                }
            } else if (jaws.isArray(this.audio)) {
                for (var i = 0; i < this.audio.length; i++) {
                    if (jaws.isString(this.audio[i])) {
                        var type = jaws.assets.getPostfix(this.audio[i]);
                        if (jaws.assets.file_type[type] && jaws.assets.can_play[type]) {
                            this.setAudio(this.audio[i]);
                            break;
                        }
                    }
                }
                if (!(this.audio instanceof Audio)) {
                    jaws.log.warn("jaws.Audio.set: No known or playable MIME filetypes were found.");
                    this.audio = null;
                }
            } else {
                jaws.log.error("jaws.Audio.set: Passed in 'audio' property is neither a String nor Array");
                this.audio = null;
            }
        }
        return this;
    };
    jaws.Audio.prototype.setAudio = function(value) {
        var self = this;
        if (jaws.assets.isLoaded(value)) {
            var audio = jaws.assets.get(value);
            if (audio instanceof Audio) {
                this.audio = audio;
                if (this.volume >= 0 && this.volume <= 1 && jaws.isNumber(this.volume)) this.audio.volume = this.volume;
                if (this.loop) this.audio.loop = this.loop;
                if (this.onend && jaws.isFunction(this.onend)) {
                    this.audio.addEventListener("end", this.onend);
                }
                if (this.onplay && jaws.isFunction(this.onplay)) {
                    this.audio.addEventListener("play", this.onplay);
                }
                if (this.onpause && jaws.isFunction(this.onplay)) {
                    this.audio.addEventListener("pause", this.onpause);
                }
                if (this.autoplay) this.audio.autoplay = this.autoplay;
            } else {
                this.audio = null;
            }
        } else {
            jaws.log.warn("jaws.Audio.setAudio: Audio '" + value + "' not preloaded with jaws.assets.add().");
            jaws.assets.load(value, function() {
                var audio = jaws.assets.get(value);
                if (audio instanceof Audio) {
                    self.audio = audio;
                    if (self.volume >= 0 && self.volume <= 1 && jaws.isNumber(self.volume)) self.audio.volume = self.volume;
                    if (self.loop) self.audio.loop = self.loop;
                    if (self.hasOwnProperty("onend") && jaws.isFunction(self.onend)) {
                        self.audio.addEventListener("end", self.onend);
                    }
                    if (self.hasOwnProperty("onplay") && jaws.isFunction(self.onplay)) {
                        self.audio.addEventListener("play", self.onplay);
                    }
                    if (self.hasOwnProperty("onpause") && jaws.isFunction(self.onplay)) {
                        self.audio.addEventListener("pause", self.onpause);
                    }
                    if (self.autoplay) self.audio.autoplay = self.autoplay;
                } else {
                    self.audio = null;
                }
            }, function() {
                jaws.log.error("jaws.Audio.setAudio: Could not load Audio resource URL " + value);
                self.audio = null;
            });
        }
        return this;
    };
    jaws.Audio.prototype.play = function() {
        if (this.audio instanceof Audio) {
            this.audio.play();
        } else {
            jaws.log.error("jaws.Audio.play: Either 'audio' was loaded incorrectly or does not exist");
        }
    };
    jaws.Audio.prototype.stop = function() {
        if (this.audio instanceof Audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
        } else {
            jaws.log.error("jaws.Audio.stop: Either 'audio' was loaded incorrectly or does not exist");
        }
    };
    jaws.Audio.prototype.pause = function() {
        if (this.audio instanceof Audio) {
            this.audio.pause();
        } else {
            jaws.log.error("jaws.Audio.pause: Either 'audio' was loaded incorrectly or does not exist");
        }
    };
    jaws.Audio.prototype.mute = function() {
        if (this.audio instanceof Audio) {
            this.audio.mute = true;
        } else {
            jaws.log.error("jaws.Audio.mute: Either 'audio' was loaded incorrectly or does not exist");
        }
    };
    jaws.Audio.prototype.unmute = function() {
        if (this.audio instanceof Audio) {
            this.audio.mute = false;
        } else {
            jaws.log.error("jaws.Audio.unmute: Either 'audio' was loaded incorrectly or does not exist");
        }
    };
    jaws.Audio.prototype.seekTo = function(value) {
        if (this.audio instanceof Audio) {
            if (jaws.isNumber(value)) {
                if (value <= this.audio.duration) {
                    this.audio.currentTime = value;
                } else {
                    this.audio.currentTime = this.audio.duration;
                }
            }
        } else {
            jaws.log.warn("jaws.Audio.seekTo: Either 'audio' was loaded incorrectly or does not exist");
        }
    };
    jaws.Audio.prototype.setVolume = function(value) {
        if (this.audio instanceof Audio) {
            if (jaws.isNumber(value) && value <= 1 && value >= 0) {
                this.audio.volume = value;
            }
        } else {
            jaws.log.warn("jaws.Audio: jaws.setVolume: Either 'audio' was loaded incorrectly or does not exist");
        }
    };
    jaws.Audio.prototype.isLoaded = function() {
        return this.audio instanceof Audio;
    };
    jaws.Audio.prototype.toString = function() {
        var properties = "[Audio ";
        if (this.audio instanceof Audio) {
            properties += this.audio.src + ", ";
            properties += this.audio.currentTime + ", ";
            properties += this.audio.duration + ", ";
            properties += this.audio.volume + " ]";
        } else {
            properties += null + " ]";
        }
        return properties;
    };
    jaws.Audio.prototype.attributes = function() {
        var object = this.options;
        object["_constructor"] = this._constructor || "jaws.Audio";
        if (this.audio instanceof Audio) {
            object["audio"] = this.audio.src;
            object["loop"] = this.loop;
            object["muted"] = this.audio.muted;
            object["volume"] = this.audio.volume;
        } else {
            object["audio"] = null;
        }
        if (this.hasOwnProperty("autoplay")) object["autoplay"] = this.autoplay;
        return object;
    };
    jaws.Audio.prototype.toJSON = function() {
        return JSON.stringify(this.attributes());
    };
    return jaws;
}(jaws || {});

if (typeof module !== "undefined" && "exports" in module) {
    module.exports = jaws.Audio;
}

var jaws = function(jaws) {
    jaws.SpriteList = function SpriteList(options) {
        if (!(this instanceof SpriteList)) return new SpriteList(options);
        this.sprites = [];
        this.length = 0;
        if (options) this.load(options);
    };
    jaws.SpriteList.prototype.add = function() {
        var list = arguments;
        if (list.length == 1 && jaws.isArray(list[0])) list = list[0];
        if (list.length > 1) {
            for (var i = 0; i < list.length; i++) {
                this.sprites.push(list[i]);
            }
        } else {
            this.sprites.push(arguments);
        }
        this.updateLength();
        return this;
    };
    jaws.SpriteList.prototype.at = function(index) {
        return this.sprites[index];
    };
    jaws.SpriteList.prototype.concat = function() {
        return this.sprites.concat.apply(this.sprites, arguments);
    };
    jaws.SpriteList.prototype.indexOf = function(searchElement, fromIndex) {
        return this.sprites.indexOf(searchElement, fromIndex);
    };
    jaws.SpriteList.prototype.join = function(separator) {
        return this.sprites.join(separator);
    };
    jaws.SpriteList.prototype.lastIndexOf = function() {
        return this.sprites.lastIndexOf.apply(this.sprites, arguments);
    };
    jaws.SpriteList.prototype.pop = function() {
        var element = this.sprites.pop();
        this.updateLength();
        return element;
    };
    jaws.SpriteList.prototype.push = function() {
        this.sprites.push.apply(this.sprites, arguments);
        this.updateLength();
        return this.length;
    };
    jaws.SpriteList.prototype.reverse = function() {
        this.sprites.reverse();
    };
    jaws.SpriteList.prototype.shift = function() {
        var element = this.sprites.shift();
        this.updateLength();
        return element;
    };
    jaws.SpriteList.prototype.slice = function(start, end) {
        return this.sprites.slice(start, end);
    };
    jaws.SpriteList.prototype.sort = function() {
        this.sprites.sort.apply(this.sprites, arguments);
    };
    jaws.SpriteList.prototype.splice = function() {
        var removedElements = this.sprites.splice.apply(this.sprites, arguments);
        this.updateLength();
        return removedElements;
    };
    jaws.SpriteList.prototype.unshift = function() {
        this.sprites.unshift.apply(this.sprites, arguments);
        this.updateLength();
        return this.length;
    };
    jaws.SpriteList.prototype.updateLength = function() {
        this.length = this.sprites.length;
    };
    jaws.SpriteList.prototype.valueOf = function() {
        return this.toString();
    };
    jaws.SpriteList.prototype.filter = function() {
        return this.sprites.filter.apply(this.sprites, arguments);
    };
    jaws.SpriteList.prototype.forEach = function() {
        this.sprites.forEach.apply(this.sprites, arguments);
        this.updateLength();
    };
    jaws.SpriteList.prototype.every = function() {
        return this.sprites.every.apply(this.sprites, arguments);
    };
    jaws.SpriteList.prototype.map = function() {
        return this.sprites.map.apply(this.sprites, arguments);
    };
    jaws.SpriteList.prototype.reduce = function() {
        return this.sprites.reduce.apply(this.sprites, arguments);
    };
    jaws.SpriteList.prototype.reduceRight = function() {
        return this.sprites.reduceRight.apply(this.sprites, arguments);
    };
    jaws.SpriteList.prototype.some = function() {
        return this.sprites.some.apply(this.sprites, arguments);
    };
    jaws.SpriteList.prototype.isSpriteList = function() {
        return true;
    };
    jaws.SpriteList.prototype.load = function(objects) {
        var that = this;
        if (jaws.isArray(objects)) {
            if (objects.every(function(item) {
                return item._constructor;
            })) {
                parseArray(objects);
            } else {
                this.sprites = objects;
            }
        } else if (jaws.isString(objects)) {
            parseArray(JSON.parse(objects));
            jaws.log.info(objects);
        }
        this.updateLength();
        function parseArray(array) {
            array.forEach(function(data) {
                var constructor = data._constructor ? eval(data._constructor) : data.constructor;
                if (jaws.isFunction(constructor)) {
                    jaws.log.info("Creating " + data._constructor + "(" + data.toString() + ")", true);
                    var object = new constructor(data);
                    object._constructor = data._constructor || data.constructor.name;
                    that.push(object);
                }
            });
        }
    };
    jaws.SpriteList.prototype.remove = function(obj) {
        var index = this.indexOf(obj);
        if (index > -1) {
            this.splice(index, 1);
        }
        this.updateLength();
    };
    jaws.SpriteList.prototype.draw = function() {
        this.forEach(function(ea) {
            ea.draw();
        });
    };
    jaws.SpriteList.prototype.drawIf = function(condition) {
        this.forEach(function(ea) {
            if (condition(ea)) {
                ea.draw();
            }
        });
    };
    jaws.SpriteList.prototype.update = function() {
        this.forEach(function(ea) {
            ea.update();
        });
    };
    jaws.SpriteList.prototype.updateIf = function(condition) {
        this.forEach(function(ea) {
            if (condition(ea)) {
                ea.update();
            }
        });
    };
    jaws.SpriteList.prototype.deleteIf = function(condition) {
        this.removeIf(condition);
    };
    jaws.SpriteList.prototype.removeIf = function(condition) {
        this.sprites = this.filter(function(ea) {
            return !condition(ea);
        });
        this.updateLength();
    };
    jaws.SpriteList.prototype.toString = function() {
        return "[SpriteList " + this.length + " sprites]";
    };
    return jaws;
}(jaws || {});

var jaws = function(jaws) {
    jaws.TileMap.prototype.findPath = function(start_position, end_position, inverted) {
        if (typeof inverted == "undefined") {
            inverted = false;
        }
        var start_col = parseInt(start_position[0] / this.cell_size[0]);
        var start_row = parseInt(start_position[1] / this.cell_size[1]);
        var end_col = parseInt(end_position[0] / this.cell_size[0]);
        var end_row = parseInt(end_position[1] / this.cell_size[1]);
        if (start_col === end_col && start_row === end_row) {
            return [ {
                x: start_position[0],
                y: start_position[1]
            } ];
        }
        var col = start_col;
        var row = start_row;
        var step = 0;
        var score = 0;
        var max_distance = this.size[0] * this.size[1] * 2 + 1;
        var open_nodes = new Array(this.size[0]);
        for (var i = 0; i < this.size[0]; i++) {
            open_nodes[i] = new Array(this.size[1]);
            for (var j = 0; j < this.size[1]; j++) {
                open_nodes[i][j] = false;
            }
        }
        open_nodes[col][row] = {
            parent: [],
            G: 0,
            score: max_distance
        };
        var closed_nodes = new Array(this.size[0]);
        for (var i = 0; i < this.size[0]; i++) {
            closed_nodes[i] = new Array(this.size[1]);
            for (var j = 0; j < this.size[1]; j++) {
                closed_nodes[i][j] = false;
            }
        }
        var crowFlies = function(from_node, to_node) {
            return Math.abs(to_node[0] - from_node[0]) + Math.abs(to_node[1] - from_node[1]);
        };
        var findInClosed = function(col, row) {
            if (closed_nodes[col][row]) {
                return true;
            } else {
                return false;
            }
        };
        while (!(col === end_col && row === end_row)) {
            var left_right_up_down = [];
            if (col > 0) {
                left_right_up_down.push([ col - 1, row ]);
            }
            if (col < this.size[0] - 1) {
                left_right_up_down.push([ col + 1, row ]);
            }
            if (row > 0) {
                left_right_up_down.push([ col, row - 1 ]);
            }
            if (row < this.size[1] - 1) {
                left_right_up_down.push([ col, row + 1 ]);
            }
            for (var i = 0; i < left_right_up_down.length; i++) {
                var c = left_right_up_down[i][0];
                var r = left_right_up_down[i][1];
                if ((this.cell(c, r).length === 0 && !inverted || this.cell(c, r).length > 0 && inverted) && !findInClosed(c, r)) {
                    score = step + 1 + crowFlies([ c, r ], [ end_col, end_row ]);
                    if (!open_nodes[c][r] || open_nodes[c][r] && open_nodes[c][r].score > score) {
                        open_nodes[c][r] = {
                            parent: [ col, row ],
                            G: step + 1,
                            score: score
                        };
                    }
                }
            }
            var best_node = {
                node: [],
                parent: [],
                score: max_distance,
                G: 0
            };
            for (var i = 0; i < this.size[0]; i++) {
                for (var j = 0; j < this.size[1]; j++) {
                    if (open_nodes[i][j] && open_nodes[i][j].score < best_node.score) {
                        best_node.node = [ i, j ];
                        best_node.parent = open_nodes[i][j].parent;
                        best_node.score = open_nodes[i][j].score;
                        best_node.G = open_nodes[i][j].G;
                    }
                }
            }
            if (best_node.node.length === 0) {
                return [];
            }
            open_nodes[best_node.node[0]][best_node.node[1]] = false;
            col = best_node.node[0];
            row = best_node.node[1];
            step = best_node.G;
            closed_nodes[col][row] = {
                parent: best_node.parent
            };
        }
        var path = [];
        var current_node = closed_nodes[col][row];
        path.unshift({
            x: col * this.cell_size[0],
            y: row * this.cell_size[1]
        });
        while (!(col === start_col && row === start_row)) {
            col = current_node.parent[0];
            row = current_node.parent[1];
            path.unshift({
                x: col * this.cell_size[0],
                y: row * this.cell_size[1]
            });
            current_node = closed_nodes[col][row];
        }
        return path;
    };
    jaws.TileMap.prototype.lineOfSight = function(start_position, end_position, inverted) {
        if (typeof inverted == "undefined") {
            inverted = false;
        }
        var x0 = start_position[0];
        var x1 = end_position[0];
        var y0 = start_position[1];
        var y1 = end_position[1];
        var dx = Math.abs(x1 - x0);
        var dy = Math.abs(y1 - y0);
        var sx, sy;
        if (x0 < x1) {
            sx = 1;
        } else {
            sx = -1;
        }
        if (y0 < y1) {
            sy = 1;
        } else {
            sy = -1;
        }
        var err = dx - dy;
        var e2;
        while (!(x0 === x1 && y0 === y1)) {
            if (inverted) {
                if (this.at(x0, y0).length === 0) {
                    return false;
                }
            } else {
                if (this.at(x0, y0).length > 0) {
                    return false;
                }
            }
            e2 = 2 * err;
            if (e2 > -dy) {
                err = err - dy;
                x0 = x0 + sx;
            }
            if (e2 < dx) {
                err = err + dx;
                y0 = y0 + sy;
            }
        }
        return true;
    };
    return jaws;
}(jaws || {});

var jaws = function(jaws) {
    jaws.TileMap = function TileMap(options) {
        if (!(this instanceof TileMap)) return new TileMap(options);
        jaws.parseOptions(this, options, this.default_options);
        this.cells = new Array(this.size[0]);
        for (var col = 0; col < this.size[0]; col++) {
            this.cells[col] = new Array(this.size[1]);
            for (var row = 0; row < this.size[1]; row++) {
                this.cells[col][row] = [];
            }
        }
    };
    jaws.TileMap.prototype.default_options = {
        cell_size: [ 32, 32 ],
        size: [ 100, 100 ],
        sortFunction: null
    };
    jaws.TileMap.prototype.clear = function() {
        for (var col = 0; col < this.size[0]; col++) {
            for (var row = 0; row < this.size[1]; row++) {
                this.cells[col][row] = [];
            }
        }
    };
    jaws.TileMap.prototype.sortCells = function(sortFunction) {
        for (var col = 0; col < this.size[0]; col++) {
            for (var row = 0; row < this.size[1]; row++) {
                this.cells[col][row].sort(sortFunction);
            }
        }
    };
    jaws.TileMap.prototype.push = function(obj) {
        var that = this;
        if (obj.forEach) {
            obj.forEach(function(item) {
                that.push(item);
            });
            return obj;
        }
        if (obj.rect) {
            return this.pushAsRect(obj, obj.rect());
        } else {
            var col = parseInt(obj.x / this.cell_size[0]);
            var row = parseInt(obj.y / this.cell_size[1]);
            return this.pushToCell(col, row, obj);
        }
    };
    jaws.TileMap.prototype.pushAsPoint = function(obj) {
        if (Array.isArray(obj)) {
            for (var i = 0; i < obj.length; i++) {
                this.pushAsPoint(obj[i]);
            }
            return obj;
        } else {
            var col = parseInt(obj.x / this.cell_size[0]);
            var row = parseInt(obj.y / this.cell_size[1]);
            return this.pushToCell(col, row, obj);
        }
    };
    jaws.TileMap.prototype.pushAsRect = function(obj, rect) {
        var from_col = parseInt(rect.x / this.cell_size[0]);
        var to_col = parseInt((rect.right - 1) / this.cell_size[0]);
        for (var col = from_col; col <= to_col; col++) {
            var from_row = parseInt(rect.y / this.cell_size[1]);
            var to_row = parseInt((rect.bottom - 1) / this.cell_size[1]);
            for (var row = from_row; row <= to_row; row++) {
                this.pushToCell(col, row, obj);
            }
        }
        return obj;
    };
    jaws.TileMap.prototype.pushToCell = function(col, row, obj) {
        this.cells[col][row].push(obj);
        if (this.sortFunction) this.cells[col][row].sort(this.sortFunction);
        return this;
    };
    jaws.TileMap.prototype.at = function(x, y) {
        var col = parseInt(x / this.cell_size[0]);
        var row = parseInt(y / this.cell_size[1]);
        return this.cells[col][row];
    };
    jaws.TileMap.prototype.atRect = function(rect) {
        var objects = [];
        var items;
        try {
            var from_col = parseInt(rect.x / this.cell_size[0]);
            if (from_col < 0) {
                from_col = 0;
            }
            var to_col = parseInt(rect.right / this.cell_size[0]);
            if (to_col >= this.size[0]) {
                to_col = this.size[0] - 1;
            }
            var from_row = parseInt(rect.y / this.cell_size[1]);
            if (from_row < 0) {
                from_row = 0;
            }
            var to_row = parseInt(rect.bottom / this.cell_size[1]);
            if (to_row >= this.size[1]) {
                to_row = this.size[1] - 1;
            }
            for (var col = from_col; col <= to_col; col++) {
                for (var row = from_row; row <= to_row; row++) {
                    this.cells[col][row].forEach(function(item, total) {
                        if (objects.indexOf(item) == -1) {
                            objects.push(item);
                        }
                    });
                }
            }
        } catch (e) {}
        return objects;
    };
    jaws.TileMap.prototype.all = function() {
        var all = [];
        for (var col = 0; col < this.size[0]; col++) {
            for (var row = 0; row < this.size[1]; row++) {
                this.cells[col][row].forEach(function(element, total) {
                    all.push(element);
                });
            }
        }
        return all;
    };
    jaws.TileMap.prototype.cell = function(col, row) {
        return this.cells[col][row];
    };
    jaws.TileMap.prototype.toString = function() {
        return "[TileMap " + this.size[0] + " cols, " + this.size[1] + " rows]";
    };
    return jaws;
}(jaws || {});

if (typeof module !== "undefined" && "exports" in module) {
    module.exports = jaws.TileMap;
}