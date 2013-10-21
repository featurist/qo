(function() {
    var self = this;
    var gen1_asyncIf, gen2_asyncIfElse, fs, path, pogo, argv, findParentDirectoryWhere, findQo, defineTasks, isFunctionAsynchronous, parseArgs, runTaskFromWithArgs, displayTasks;
    gen1_asyncIf = function(condition, thenBody, cb) {
        if (condition) {
            try {
                thenBody(cb);
            } catch (ex) {
                cb(ex);
            }
        } else {
            cb();
        }
    };
    gen2_asyncIfElse = function(condition, thenBody, elseBody, cb) {
        if (condition) {
            try {
                thenBody(cb);
            } catch (ex) {
                cb(ex);
            }
        } else {
            try {
                elseBody(cb);
            } catch (ex) {
                cb(ex);
            }
        }
    };
    fs = require("fs");
    path = require("path");
    pogo = require("pogo");
    argv = require("optimist").argv;
    findParentDirectoryWhere = function(predicate, continuation) {
        var gen3_arguments = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
        continuation = arguments[arguments.length - 1];
        if (!(continuation instanceof Function)) {
            throw new Error("asynchronous function called synchronously");
        }
        predicate = gen3_arguments[0];
        var findParentWhere;
        findParentWhere = function(dir, p, continuation) {
            var gen4_arguments = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
            continuation = arguments[arguments.length - 1];
            if (!(continuation instanceof Function)) {
                throw new Error("asynchronous function called synchronously");
            }
            dir = gen4_arguments[0];
            p = gen4_arguments[1];
            p(dir, function(gen5_error, gen6_asyncResult) {
                if (gen5_error) {
                    continuation(gen5_error);
                } else {
                    try {
                        gen2_asyncIfElse(!gen6_asyncResult, function(continuation) {
                            var gen7_arguments = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
                            continuation = arguments[arguments.length - 1];
                            if (!(continuation instanceof Function)) {
                                throw new Error("asynchronous function called synchronously");
                            }
                            var newDir;
                            newDir = path.normalize(path.join(dir, ".."));
                            gen1_asyncIf(dir !== "/", function(continuation) {
                                var gen8_arguments = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
                                continuation = arguments[arguments.length - 1];
                                if (!(continuation instanceof Function)) {
                                    throw new Error("asynchronous function called synchronously");
                                }
                                findParentWhere(newDir, p, continuation);
                            }, continuation);
                        }, function(continuation) {
                            var gen9_arguments = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
                            continuation = arguments[arguments.length - 1];
                            if (!(continuation instanceof Function)) {
                                throw new Error("asynchronous function called synchronously");
                            }
                            continuation(void 0, dir);
                        }, continuation);
                    } catch (gen10_exception) {
                        continuation(gen10_exception);
                    }
                }
            });
        };
        findParentWhere(process.cwd(), predicate, continuation);
    };
    findQo = function(continuation) {
        var gen11_arguments = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
        continuation = arguments[arguments.length - 1];
        if (!(continuation instanceof Function)) {
            throw new Error("asynchronous function called synchronously");
        }
        findParentDirectoryWhere(function(dir, continuation) {
            var gen12_arguments = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
            continuation = arguments[arguments.length - 1];
            if (!(continuation instanceof Function)) {
                throw new Error("asynchronous function called synchronously");
            }
            dir = gen12_arguments[0];
            fs.exists(path.join(dir, "qo.pogo"), function(e) {
                continuation(void 0, e);
            });
        }, function(gen13_error, gen14_asyncResult) {
            var foundDir;
            if (gen13_error) {
                continuation(gen13_error);
            } else {
                try {
                    foundDir = gen14_asyncResult;
                    if (foundDir) {
                        continuation(void 0, path.join(foundDir, "qo.pogo"));
                    } else {
                        continuation();
                    }
                } catch (gen15_exception) {
                    continuation(gen15_exception);
                }
            }
        });
    };
    defineTasks = function() {
        var tasks;
        tasks = {};
        global.task = function(name, $function, gen16_options) {
            var self = this;
            var description;
            description = gen16_options !== void 0 && Object.prototype.hasOwnProperty.call(gen16_options, "description") && gen16_options.description !== void 0 ? gen16_options.description : void 0;
            return tasks[name] = {
                "function": $function,
                description: description,
                name: name
            };
        };
        return tasks;
    };
    isFunctionAsynchronous = function(f) {
        return /function(.*continuation)/.test(f.toString());
    };
    parseArgs = function() {
        var args, s;
        args = argv._.slice(0);
        for (s in argv) {
            (function(s) {
                if (argv.hasOwnProperty(s)) {
                    args[s] = argv[s];
                }
            })(s);
        }
        return args;
    };
    runTaskFromWithArgs = function(name, tasks, args, continuation) {
        var gen17_arguments = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
        continuation = arguments[arguments.length - 1];
        if (!(continuation instanceof Function)) {
            throw new Error("asynchronous function called synchronously");
        }
        name = gen17_arguments[0];
        tasks = gen17_arguments[1];
        args = gen17_arguments[2];
        var task;
        task = tasks[name];
        gen2_asyncIfElse(task, function(continuation) {
            var gen18_arguments = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
            continuation = arguments[arguments.length - 1];
            if (!(continuation instanceof Function)) {
                throw new Error("asynchronous function called synchronously");
            }
            gen2_asyncIfElse(isFunctionAsynchronous(task.function), function(continuation) {
                var gen19_arguments = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
                continuation = arguments[arguments.length - 1];
                if (!(continuation instanceof Function)) {
                    throw new Error("asynchronous function called synchronously");
                }
                task.function(args, continuation);
            }, function(continuation) {
                var gen20_arguments = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
                continuation = arguments[arguments.length - 1];
                if (!(continuation instanceof Function)) {
                    throw new Error("asynchronous function called synchronously");
                }
                continuation(void 0, task.function(args));
            }, continuation);
        }, function(continuation) {
            var gen21_arguments = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
            continuation = arguments[arguments.length - 1];
            if (!(continuation instanceof Function)) {
                throw new Error("asynchronous function called synchronously");
            }
            process.stderr.write("could not find task `" + name + "'");
            continuation(void 0, process.exit(1));
        }, continuation);
    };
    displayTasks = function(tasks) {
        var tn;
        console.log("tasks:");
        console.log();
        for (tn in tasks) {
            (function(tn) {
                var task, description;
                if (tasks.hasOwnProperty(tn)) {
                    task = tasks[tn];
                    description = function() {
                        if (task.description) {
                            return " - " + task.description;
                        } else {
                            return "";
                        }
                    }();
                    console.log("    " + task.name + "" + description);
                    console.log();
                }
            })(tn);
        }
        return void 0;
    };
    exports.run = function(continuation) {
        var self = this;
        var gen22_arguments = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
        continuation = arguments[arguments.length - 1];
        if (!(continuation instanceof Function)) {
            throw new Error("asynchronous function called synchronously");
        }
        findQo(function(gen23_error, gen24_asyncResult) {
            var qo;
            if (gen23_error) {
                continuation(gen23_error);
            } else {
                try {
                    qo = gen24_asyncResult;
                    gen2_asyncIfElse(qo, function(continuation) {
                        var gen25_arguments = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
                        continuation = arguments[arguments.length - 1];
                        if (!(continuation instanceof Function)) {
                            throw new Error("asynchronous function called synchronously");
                        }
                        var tasks, taskName;
                        tasks = defineTasks();
                        process.chdir(path.dirname(qo));
                        require(qo);
                        taskName = argv._.shift();
                        gen2_asyncIfElse(taskName, function(continuation) {
                            var gen26_arguments = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
                            continuation = arguments[arguments.length - 1];
                            if (!(continuation instanceof Function)) {
                                throw new Error("asynchronous function called synchronously");
                            }
                            runTaskFromWithArgs(taskName, tasks, parseArgs(), continuation);
                        }, function(continuation) {
                            var gen27_arguments = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
                            continuation = arguments[arguments.length - 1];
                            if (!(continuation instanceof Function)) {
                                throw new Error("asynchronous function called synchronously");
                            }
                            continuation(void 0, displayTasks(tasks));
                        }, continuation);
                    }, function(continuation) {
                        var gen28_arguments = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
                        continuation = arguments[arguments.length - 1];
                        if (!(continuation instanceof Function)) {
                            throw new Error("asynchronous function called synchronously");
                        }
                        process.stderr.write("couldn't find `qo.pogo` in any parent directory");
                        continuation(void 0, process.exit(1));
                    }, continuation);
                } catch (gen29_exception) {
                    continuation(gen29_exception);
                }
            }
        });
    };
}).call(this);