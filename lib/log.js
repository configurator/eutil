// log.js
// A simple logging function that calls console.log with the caller function's name and arguments.
// (c) Dor Kleiman, 2012
// MIT license
//
// Usage:
// - log();
//   Logs the calling function's name and arguments
//
// - log(name);
//   Logs the given name and the calling function's arguments
//
// - log(name, arguments...);
//   Logs the given name and arguments
//
// - log.logEnabled
//   If set to true, all logging is enabled.
//   If set to false, all logging is disabled.
//   If set to a function, the function is a filter for whether or not to log.
//   If set to a regex, logging is enabled only when the logged name matches the regex.
//   There can be multiple passes, e.g. a function may return a function which may return a regex.

var shouldLog = function (enabled, args) {
    var passes=0;
    while (typeof enabled != "boolean") {
        passes++;
        if (passes > 10) {
            throw new Error('Too much recursion in logging test function.');
        }

        switch (typeof enabled) {
            case "function":
                enabled = enabled.apply(log, args);
                continue;

            case "object":
                if (enabled instanceof RegExp) {
                    enabled = enabled.test(args[0]);
                    continue;
                } else {
                    break;
                }
        }

        throw new Error("Invalid value for log.logEnabled: " + enabled);
    }

    return enabled;
}

var log = function (name) {
    if (log.logEnabled) {
        var tolog;
        if (arguments.length > 1) {
            tolog = Array.prototype.slice.call(arguments, 1);
        } else {
            var caller = arguments.callee.caller;
            name = name || caller.name;
            tolog = Array.prototype.slice.call(caller.arguments);
        }

        if (shouldLog(log.logEnabled, [name].concat(tolog))) {
            console.log();
            console.log('\033[1;32m' + name + '\033[m');
            tolog.forEach(function (x, y) {
                if (typeof x == "function") {
                    x = x.toString().match('function[^{]*').toString();
                }
                console.log('\033[1;33m' + y + ':\033[m', x);
            });
        }
    }
};
log.logEnabled = true;

module.exports = log;
