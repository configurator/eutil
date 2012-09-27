// Tests the various files in this directory.

var should = require('should'),

    eutil = require('..')
    async = eutil.async,
    log = eutil.log;

describe('async', function () {
    it('should return the final result to the last callback when all items finish correctly', function (done) {
        async(
            function results_1(callback) {
                log();
                setTimeout(function () { callback(null, 1); }, 1);
            },
            function results_2(callback, arg) {
                log();
                setTimeout(function () { callback(null, arg + 1); }, 1);
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
                setTimeout(function () { callback(null, 1); }, 1);
            },
            function errors_2(callback, arg) {
                log();
                setTimeout(function () { callback('error', arg + 1); }, 1);
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
                setTimeout(function () { callback('error', 1); }, 1);
            },
            function stop_on_error_2(callback, arg) {
                log();
                called = true;
                throw new Error('This function should not be called.');
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
                setTimeout(function () { callback(null, arg1 + 'cd', arg2 + 2000); }, 1);
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
                    setTimeout(function () { callback(null, 'one'); }, 1);
                },
                b: function objects_b(callback) {
                    log();
                    setTimeout(function () { callback(null, 2); }, 1);
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
                    setTimeout(function () { callback(null, 'one'); }, 1);
                },
                function arrays_b(callback) {
                    log();
                    setTimeout(function () { callback(null, 2); }, 1);
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
                setTimeout(function () { callback(null, 1); }, 1);
            },
            [
                function objects_args_a(callback, arg) {
                    log();
                    setTimeout(function () { callback(null, 'one ' + arg); }, 1);
                },
                function objects_args_b(callback, arg) {
                    log();
                    setTimeout(function () { callback(null, 1 + arg); }, 1);
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
                setTimeout(function () { callback(null, 1); }, 1);
            },
            [
                function arrays_args_a(callback, arg) {
                    log();
                    setTimeout(function () { callback(null, 'one ' + arg); }, 1);
                },
                function arrays_args_b(callback, arg) {
                    log();
                    setTimeout(function () { callback(null, 1 + arg); }, 1);
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
                    setTimeout(function () { callback(null, 'one'); }, 1);
                },
                b: function objects_errors_b(callback) {
                    log();
                    setTimeout(function () { callback('error one'); }, 1);
                },
                c: function objects_errors_c(callback) {
                    log();
                    setTimeout(function () { callback(null, 3); }, 1);
                },
                d: function objects_errors_b(callback) {
                    log();
                    setTimeout(function () { callback('error two'); }, 1);
                },
                e: function objects_errors_c(callback) {
                    log();
                    setTimeout(function () { callback(null, 'five'); }, 1);
                }
            },
            function objects_callback(err, results) {
                log();
                err.should.eql({
                    b: 'error one',
                    d: 'error two'
                });
                results.should.eql({
                    a: 'one',
                    b: undefined,
                    c: 3,
                    d: undefined,
                    e: 'five'
                });

                done();
            }
        );
    });

    it('should support errors in arrays', function (done) {
        async(
            [
                function objects_errors_a(callback) {
                    log();
                    setTimeout(function () { callback(null, 'one'); }, 1);
                },
                function objects_errors_b(callback) {
                    log();
                    setTimeout(function () { callback('error one'); }, 1);
                },
                function objects_errors_c(callback) {
                    log();
                    setTimeout(function () { callback(null, 3); }, 1);
                },
                function objects_errors_d(callback) {
                    log();
                    setTimeout(function () { callback('error two'); }, 1);
                },
                function objects_errors_e(callback) {
                    log();
                    setTimeout(function () { callback(null, 'five'); }, 1);
                }
            ],
            function arrays_callback(err, results) {
                log();
                err.should.eql([
                    ,
                    'error one',
                    ,
                    'error two',
                ]);
                results.should.eql([
                    'one',
                    undefined,
                    3,
                    undefined,
                    'five'
                ]);

                done();
            }
        );
    });

    it('should work correctly when having multiple calls with objects and arrays', function (done) {
        var called = false;
        async(
            {
                a: function complex_a(callback) {
                    log();

                    setTimeout(function () { callback(null, 'one'); }, 1);
                },
                b: function complex_b(callback) {
                    log();

                    setTimeout(function () { callback(null, 'two'); }, 1);
                }
            },
            [
                function complex_1(callback, arg) {
                    log();
                    arg.should.eql({ a: 'one', b: 'two' });

                    setTimeout(function () { callback(null, 'three'); }, 1);
                },
                function complex_2(callback, arg) {
                    log();
                    arg.should.eql({ a: 'one', b: 'two' });

                    setTimeout(function () { callback(null, 'four'); }, 1);
                }
            ],
            function complex_outside(callback, arg) {
                log();
                arg.should.eql(['three', 'four']);

                setTimeout(function () { callback(null, 'five'); }, 1);
            },
            {
                c: function complex_c(callback, arg) {
                    log();
                    arg.should.eql('five');

                    setTimeout(function () { callback('error one'); }, 1);
                },
                d: function complex_d(callback, arg) {
                    log();
                    arg.should.eql('five');

                    setTimeout(function () { callback('error two'); }, 1);
                }
            },
            [
                function complex_not_called_1() {
                    log();
                    called = true;
                    throw new Error('This function should not be called.');
                },
                function complex_not_called_2() {
                    log();
                    called = true;
                    throw new Error('This function should not be called.');
                }
            ],
            function complex_callback(err, result) {
                log();
                err.should.eql({ c: 'error one', d: 'error two' });
                called.should.be.false;

                done();
            }
        );
    });
});
