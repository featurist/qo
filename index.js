(function() {
    var gen1_continuationOrDefault = function(args) {
        var c = args[args.length - 1];
        if (typeof c === "function") {
            return {
                continuation: c,
                arguments: Array.prototype.slice.call(args, 0, args.length - 1)
            };
        } else {
            return {
                continuation: function(error, result) {
                    if (error) {
                        throw error;
                    } else {
                        return result;
                    }
                },
                arguments: args
            };
        }
    };
    var gen2_asyncIf = function(condition, thenBody, cb) {
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
    var gen3_asyncIfElse = function(condition, thenBody, elseBody, cb) {
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
    var gen4_rethrowErrors = function(continuation, block) {
        return function(error, result) {
            if (error) {
                return continuation(error);
            } else {
                try {
                    return block(result);
                } catch (ex) {
                    return continuation(ex);
                }
            }
        };
    };
    var self = this;
    var fs, path, pogo, argv, findParentDirectoryWhere, findQo, defineTasks, isFunctionAsynchronous, parseArgs, runTaskFromWithArgs, displayTasks;
    fs = require("fs");
    path = require("path");
    pogo = require("pogo");
    argv = require("optimist").argv;
    findParentDirectoryWhere = function(predicate, continuation) {
        var gen5_a = gen1_continuationOrDefault(arguments);
        continuation = gen5_a.continuation;
        var gen6_arguments = gen5_a.arguments;
        predicate = gen6_arguments[0];
        var findParentWhere;
        findParentWhere = function(dir, p, continuation) {
            var gen7_a = gen1_continuationOrDefault(arguments);
            continuation = gen7_a.continuation;
            var gen8_arguments = gen7_a.arguments;
            dir = gen8_arguments[0];
            p = gen8_arguments[1];
            p(dir, gen4_rethrowErrors(continuation, function(gen9_asyncResult) {
                gen3_asyncIfElse(!gen9_asyncResult, function(continuation) {
                    var gen10_a = gen1_continuationOrDefault(arguments);
                    continuation = gen10_a.continuation;
                    var gen11_arguments = gen10_a.arguments;
                    var newDir;
                    newDir = path.normalize(path.join(dir, ".."));
                    gen2_asyncIf(dir !== "/", function(continuation) {
                        var gen12_a = gen1_continuationOrDefault(arguments);
                        continuation = gen12_a.continuation;
                        var gen13_arguments = gen12_a.arguments;
                        findParentWhere(newDir, p, continuation);
                    }, continuation);
                }, function(continuation) {
                    var gen14_a = gen1_continuationOrDefault(arguments);
                    continuation = gen14_a.continuation;
                    var gen15_arguments = gen14_a.arguments;
                    return continuation(void 0, dir);
                }, continuation);
            }));
        };
        findParentWhere(process.cwd(), predicate, continuation);
    };
    findQo = function(continuation) {
        var gen16_a = gen1_continuationOrDefault(arguments);
        continuation = gen16_a.continuation;
        var gen17_arguments = gen16_a.arguments;
        findParentDirectoryWhere(function(dir, continuation) {
            var gen18_a = gen1_continuationOrDefault(arguments);
            continuation = gen18_a.continuation;
            var gen19_arguments = gen18_a.arguments;
            dir = gen19_arguments[0];
            fs.exists(path.join(dir, "qo.pogo"), function(e) {
                continuation(void 0, e);
            });
        }, gen4_rethrowErrors(continuation, function(gen20_asyncResult) {
            var foundDir;
            foundDir = gen20_asyncResult;
            if (foundDir) {
                return continuation(void 0, path.join(foundDir, "qo.pogo"));
            } else {
                continuation();
            }
        }));
    };
    defineTasks = function() {
        var tasks;
        tasks = {};
        global.task = function(name, $function, gen21_options) {
            var self = this;
            var description, desc;
            description = gen21_options !== void 0 && Object.prototype.hasOwnProperty.call(gen21_options, "description") && gen21_options.description !== void 0 ? gen21_options.description : void 0;
            desc = gen21_options !== void 0 && Object.prototype.hasOwnProperty.call(gen21_options, "desc") && gen21_options.desc !== void 0 ? gen21_options.desc : void 0;
            return tasks[name] = {
                "function": $function,
                description: desc || description,
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
        var gen22_a = gen1_continuationOrDefault(arguments);
        continuation = gen22_a.continuation;
        var gen23_arguments = gen22_a.arguments;
        name = gen23_arguments[0];
        tasks = gen23_arguments[1];
        args = gen23_arguments[2];
        var task;
        task = tasks[name];
        gen3_asyncIfElse(task, function(continuation) {
            var gen24_a = gen1_continuationOrDefault(arguments);
            continuation = gen24_a.continuation;
            var gen25_arguments = gen24_a.arguments;
            gen3_asyncIfElse(isFunctionAsynchronous(task.function), function(continuation) {
                var gen26_a = gen1_continuationOrDefault(arguments);
                continuation = gen26_a.continuation;
                var gen27_arguments = gen26_a.arguments;
                task.function(args, continuation);
            }, function(continuation) {
                var gen28_a = gen1_continuationOrDefault(arguments);
                continuation = gen28_a.continuation;
                var gen29_arguments = gen28_a.arguments;
                return continuation(void 0, task.function(args));
            }, continuation);
        }, function(continuation) {
            var gen30_a = gen1_continuationOrDefault(arguments);
            continuation = gen30_a.continuation;
            var gen31_arguments = gen30_a.arguments;
            process.stderr.write("could not find task `" + name + "'");
            return continuation(void 0, process.exit(1));
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
                            return ", " + task.description;
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
        var gen32_a = gen1_continuationOrDefault(arguments);
        continuation = gen32_a.continuation;
        var gen33_arguments = gen32_a.arguments;
        findQo(gen4_rethrowErrors(continuation, function(gen34_asyncResult) {
            var qo;
            qo = gen34_asyncResult;
            gen3_asyncIfElse(qo, function(continuation) {
                var gen35_a = gen1_continuationOrDefault(arguments);
                continuation = gen35_a.continuation;
                var gen36_arguments = gen35_a.arguments;
                var tasks, taskName;
                tasks = defineTasks();
                process.chdir(path.dirname(qo));
                require(qo);
                taskName = argv._.shift();
                gen3_asyncIfElse(taskName, function(continuation) {
                    var gen37_a = gen1_continuationOrDefault(arguments);
                    continuation = gen37_a.continuation;
                    var gen38_arguments = gen37_a.arguments;
                    runTaskFromWithArgs(taskName, tasks, parseArgs(), continuation);
                }, function(continuation) {
                    var gen39_a = gen1_continuationOrDefault(arguments);
                    continuation = gen39_a.continuation;
                    var gen40_arguments = gen39_a.arguments;
                    return continuation(void 0, displayTasks(tasks));
                }, continuation);
            }, function(continuation) {
                var gen41_a = gen1_continuationOrDefault(arguments);
                continuation = gen41_a.continuation;
                var gen42_arguments = gen41_a.arguments;
                process.stderr.write("couldn't find `qo.pogo` in any parent directory");
                return continuation(void 0, process.exit(1));
            }, continuation);
        }));
    };
}).call(this);