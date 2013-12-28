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

    window.utils = {
        isTrue: isTrue,

        each: each,
        eachDo: eachDo
    };

} ());