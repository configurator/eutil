// extend.js
// Extend an object with more properties.
// (c) Dor Kleiman, 2012
// MIT license
// Somewhat based on jQuery.extend
//
// Usage:
// - defaultOptions(func, defaultOptions, context)
//   Returns a new function, which calls the underlying function with the given default options as the first parameter.
//   The resulting function also has a method, .options, which extends the function with more optiosn.
//   The optional context variable is used as the 'this' variable if given.


var extend = require('./extend.js');

var defaultOptions = function (func, defaultOptions, context) {
    var options = extend(defaultOptions); // Create a deep copy of the object

    var result = function () {
        func.apply(context || this, [options].concat(arguments));
    };

    result.options = function (options) {
        return defaultOptions(func, extend(defaultOptions, options), context);
    };

    return result;
};

module.exports = defaultOptions;
