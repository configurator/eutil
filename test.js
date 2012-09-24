// Tests the various files in this directory.

var should = require('should'),

    async = require('./async'),
    log = require('./log');

describe('async', function () {
    it('should return the final result to the last callback when all items finish correctly', function (done) {
        async(
            function results_1(callback) {
                log();
                return callback(null, 1);
            },
            function results_2(callback, arg) {
                log();
                return callback(null, arg + 1);
            },
            function results_callback(err, result) {
                log();
                should.not.exist(err);
                result.should.equal(2);

                done();
            }
        );
    });

    it('should pass errors to the final callback', function (done) {
        async(
            function errors_1(callback) {
                log();
                return callback(null, 1);
            },
            function errors_2(callback, arg) {
                log();
                return callback('error', arg + 1);
            },
            function errors_callback(err, result) {
                log();
                err.should.equal('error');

                done();
            }
        );
    });

    it('should stop calling functions when seeing an error', function (done) {
        var called = false;
        async(
            function stop_on_error_1(callback) {
                log();
                return callback('error', 1);
            },
            function stop_on_error_2(callback, arg) {
                log();
                called = true;
                throw 'This function should not be called.';
            },
            function stop_on_error_callback(err, result) {
                log();
                err.should.equal('error');
                called.should.be.false;

                done();
            }
        );
    });

    it('should support multiple results in the callback', function (done) {
        async(
            function multiple_results_1(callback) {
                log();
                return callback(null, 'ab', 100)
            },
            function multiple_results_2(callback, arg1, arg2) {
                log();
                return callback(null, arg1 + 'cd', arg2 + 2000);
            },
            function multiple_results_callback(err, result1, result2) {
                log();
                should.not.exist(err);
                result1.should.equal('abcd');
                result2.should.equal(2100);

                done();
            }
        );
    });

    it('should support objects', function (done) {
        async(
            {
                a: function objects_a(callback) {
                    log();
                    callback(null, 'one');
                },
                b: function objects_b(callback) {
                    log();
                    callback(null, 2);
                }
            },
            function objects_callback(err, results) {
                log();
                should.not.exist(err);
                results.should.eql({ a: 'one', b: 2 });
                results.should.not.be.an.instanceOf(Array);

                done();
            }
        );
    });

    it('should support arrays', function (done) {
        async(
            [
                function arrays_a(callback) {
                    log();
                    callback(null, 'one');
                },
                function arrays_b(callback) {
                    log();
                    callback(null, 2);
                }
            ],
            function arrays_callback(err, results) {
                log();
                should.not.exist(err);
                results.should.eql([ 'one', 2 ]);
                results.should.be.an.instanceOf(Array);

                done();
            }
        );
    });

    it('should support passing arguments to objects', function (done) {
        async(
            function (callback) {
                callback(null, 1);
            },
            [
                function objects_args_a(callback, arg) {
                    log();
                    callback(null, 'one ' + arg);
                },
                function objects_args_b(callback, arg) {
                    log();
                    callback(null, 1 + arg);
                }
            ],
            function objects_args_callback(err, results) {
                log();
                should.not.exist(err);
                results.should.eql([ 'one 1', 2 ]);

                done();
            }
        );
    });

    it('should support passing arguments to arrays', function (done) {
        async(
            function (callback) {
                callback(null, 1);
            },
            [
                function arrays_args_a(callback, arg) {
                    log();
                    callback(null, 'one ' + arg);
                },
                function arrays_args_b(callback, arg) {
                    log();
                    callback(null, 1 + arg);
                }
            ],
            function arrays_args_callback(err, results) {
                log();

                should.not.exist(err);
                results.should.eql([ 'one 1', 2 ]);

                done();
            }
        );
    });

    it('should support errors in objects', function (done) {
        async(
            {
                a: function objects_errors_a(callback) {
                    log();
                    callback(null, 'one');
                },
                b: function objects_errors_b(callback) {
                    log();
                    callback('err');
                },
                c: function objects_errors_c(callback) {
                    log();
                    callback(null, 3);
                }
            },
            function objects_callback(err, results) {
                log();
                err.should.eql({ b: 'err' });

                done();
            }
        );
    });

    it('should support errors in arrays', function (done) {
        async(
            [
                function objects_errors_a(callback) {
                    log();
                    callback(null, 'one');
                },
                function objects_errors_b(callback) {
                    log();
                    callback('err');
                },
                function objects_errors_c(callback) {
                    log();
                    callback(null, 3);
                }
            ],
            function arrays_callback(err, results) {
                log();
                err.should.eql([, 'err', ]);

                done();
            }
        );
    });
});
