// async.js
// Asynchronously call functions.
// Allows calling functions one after the other or in parallel.
// (c) Dor Kleiman, 2012
// MIT license
//
// Usage:
// - async(item..., callback);
//   Calls each item in the array in sequence, giving each the results from the previous item.
//   If an item is an array or object, calls each of its members in parallel and reconstructs an array or object of results.

// Throughout this file:
//   item = function (callback, args...)
//   callback = function (err, result)
// multiple results are supported in the callback, as long as it is not aggregated in objects.

var object_to_array = function object_to_array (obj) {
    if (obj == null || typeof obj != "object") {
        return obj;
    }

    var result = [];
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            result[prop] = obj[prop];
        }
    }
    return result;
}

var parallelize = function (item) {
    switch (typeof item) {
        case "function":
            return item;

        case "object":
            return function (callback) {
                var awaiting = 0;
                var result = {};
                var errors = null;
                var args = Array.prototype.slice.call(arguments, 1);
                var tocall = [];

                for (var prop in item) {
                    if (item.hasOwnProperty(prop) && item[prop]) {
                        awaiting++;
                        (function (prop, subitem) {
                            var subitemCallback = function (item_err, item_result) {
                                if (item_err) {
                                    errors = errors || {};
                                    errors[prop] = item_err;
                                }
                                result[prop] = item_result;

                                awaiting--;
                                if (awaiting == 0) {
                                    // return the results
                                    if (item instanceof Array) {
                                        // if the original item was an array, the results should be in an array as well.
                                        callback(object_to_array(errors), object_to_array(result));
                                    } else {
                                        callback(errors, result);
                                    }
                                }
                            };
                            tocall.push(function () {subitem.apply(this, [subitemCallback].concat(args)); });
                        })(prop, parallelize(item[prop]));
                    }
                }

                tocall.forEach(function (f) { f(); });
            };

        default:
            throw new Error("Invalid argument type to async: " + typeof item);
    }
};

var async = function () {
    var args = Array.prototype.slice.call(arguments);
    var finalCallback = args.pop();
    if (typeof finalCallback != "function") {
        throw new Error("Last argument to async must be a callback");
    }

    args = args.map(parallelize);

    var resultCallback = finalCallback;
    var item;
    while (item = args.pop()) {
        // At this point, we can assume that all the items in the args array are functions.
        resultCallback = (function (item, oldResult) {
            return function () {
                var args = Array.prototype.slice.call(arguments);
                var err = args.shift(); // remove err argument
                if (err) {
                    return finalCallback(err);
                } else {
                    args.unshift(oldResult); // add callback argument
                    return item.apply(this, args);
                }
            };
        })(item, resultCallback);
    }

    resultCallback();
};

module.exports = async;