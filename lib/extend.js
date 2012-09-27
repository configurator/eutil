// extend.js
// Extend an object with more properties.
// (c) Dor Kleiman, 2012
// MIT license
// Somewhat based on jQuery.extend
//
// Usage:
// - extend(object, object...)
//   Extends an object with the propeties from all other objects. By default, extend is a deep extend, i.e. recursive.
//   This does not modify the parameters, and always returns a new object.
//
// - extend.options(options)
//   Returns a new extend function with the given options.
//   Can be used directly e.g.
//       extend.options({deep: false})(obj1, obj2)
//   or indirectly e.g.
//       var extend = require('eutil').extend.options({ overwrite: false })
//
// - extend.shallow(), extend.deep()
//   Shortcut for extend.options({ deep: true/false })

var core = function (options) {
    var extend = function () {
        var args = Array.prototype.slice.call(arguments);
        var target = options.array ? [] : {};

        Array.prototype.forEach.call(arguments, function (item) {
            if (item && typeof item == "object") {
                for (var name in item) {
                    var subtarget = target[name];
                    var subitem = item[name];
                    if (subtarget === subitem) {
                        continue;
                    }

                    if (!options.overwrite && target.hasOwnProperty(name)) {
                        continue;
                    }

                    if (options.deep && (typeof subtarget == "object" || typeof subitem == "object")) {
                        // Recurse
                        target[name] = extend.options({
                            array: subitem instanceof Array || subtarget instanceof Array
                        })(subtarget, subitem);
                    } else {
                        target[name] = subitem;
                    }
                }
            }
        });
    };

    extend.options = function (newOptions) {
        newOptions = core({ deep: false, overwrite: true })(options, newOptions);
        return core(newOptions);
    };

    extend.deep = function () {
        return extend.options({ deep: true });
    }
    extend.shallow = function () {
        return extend.options({ deep: false });
    }

    return extend;
}

module.exports = core({
    deep: true,
    overwite: true,
    array: false
});