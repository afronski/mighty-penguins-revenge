(function () {
    "use strict";

    if (!Function.prototype.bind) {
        Function.prototype.bind = function (passedThis) {
            if (typeof(this) !== "function") {
                throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable!");
            }

            var args = Array.prototype.slice.call(arguments, 1),
                forBinding = this,
                NOP = function () {},
                bound = function () {
                    return forBinding.apply(this instanceof NOP && passedThis ? this : passedThis,
                                            args.concat(Array.prototype.slice.call(arguments)));
                };

            NOP.prototype = this.prototype;
            bound.prototype = new NOP();

            return bound;
        };
    }

    if (!String.prototype.trim) {
        String.prototype.trim = function () {
            return this.replace(/^\s+|\s+$/gm, "");
        };
    }

    function getValue(text) {
        var value = window.prompt(text);

        value = value.trim();

        if (!value || value.length > 15) {
            return getValue(text);
        } else {
            return value;
        }
    }

    function isTrue(object) {
        return object === true;
    }

    function each(method) {
        return function (element) {
            element[method]();
        };
    }

    function eachDo(operation) {
        return function (element) {
            operation(element);
        };
    }

    function makeTextBlink(foregroundColor, backgroundColor, duration) {
        foregroundColor = foregroundColor || "black";
        backgroundColor = backgroundColor || "white";

        duration = duration || 25;

        if (this.frames > duration) {
            this.visibility = !this.visibility;
            this.frames = 0;
        }

        this.originalOptions.color = this.visibility ? foregroundColor : backgroundColor;
        this.set(this.originalOptions);

        ++this.frames;
    }

    function calculateCenteringOffset(text, width) {
        return (width - Math.round(text.length * 0.75)) / 2;
    }

    function randomFromRange(minimum, maximum) {
        return Math.floor(Math.random() * (maximum - minimum + 1) + minimum);
    }

    window.utils = {
        getValue: getValue,
        isTrue: isTrue,

        each: each,
        eachDo: eachDo,

        makeTextBlink: makeTextBlink,
        calculateCenteringOffset: calculateCenteringOffset,

        randomFromRange: randomFromRange
    };

} ());