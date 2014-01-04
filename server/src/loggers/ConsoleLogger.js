"use strict";

module.exports.info = exports.info = function () {
    var args = Array.prototype.slice.call(arguments);

    console.info.apply(console, args);
};

module.exports.error = exports.error = function () {
    var args = Array.prototype.slice.call(arguments);

    console.error.apply(console, args);
};