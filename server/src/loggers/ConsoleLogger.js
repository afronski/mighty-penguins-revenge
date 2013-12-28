"use strict";

module.exports.info = exports.info = function () {
    var args = Array.prototype.slice.call(arguments);

    console.info.apply(console, args);
};