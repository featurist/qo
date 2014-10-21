(function() {
    var Promise = require("bluebird");
    var self = this;
    var fs, path, pogo, argv, util, findParentDirectoryWhere, findQo, defineTasks, isFunctionAsynchronous, parseArgs, runTaskFromWithArgs, displayTasks;
    fs = require("fs");
    path = require("path");
    pogo = require("pogo");
    argv = require("optimist").argv;
    util = require("util");
    findParentDirectoryWhere = function(predicate) {
        var findParentWhere, gen1_asyncResult;
        return new Promise(function(gen2_onFulfilled) {
            findParentWhere = function(dir, p) {
                var gen3_asyncResult, gen4_asyncResult;
                return new Promise(function(gen2_onFulfilled) {
                    gen2_onFulfilled(Promise.resolve(p(dir)).then(function(gen4_asyncResult) {
                        return Promise.resolve(function() {
                            if (!gen4_asyncResult) {
                                return new Promise(function(gen2_onFulfilled) {
                                    newDir = path.normalize(path.join(dir, ".."));
                                    gen2_onFulfilled(Promise.resolve(function() {
                                        if (dir !== "/") {
                                            return new Promise(function(gen2_onFulfilled) {
                                                gen2_onFulfilled(Promise.resolve(findParentWhere(newDir, p)));
                                            });
                                        }
                                    }()));
                                });
                            } else {
                                return dir;
                            }
                        }());
                    }));
                });
            };
            gen2_onFulfilled(Promise.resolve(findParentWhere(process.cwd(), predicate)));
        });
    };
    findQo = function() {
        var gen5_asyncResult, foundDir;
        return new Promise(function(gen2_onFulfilled) {
            gen2_onFulfilled(Promise.resolve(findParentDirectoryWhere(function(dir) {
                return new Promise(function(onSuccess) {
                    return fs.exists(path.join(dir, "qo.pogo"), function(e) {
                        return onSuccess(e);
                    });
                });
            })).then(function(gen5_asyncResult) {
                foundDir = gen5_asyncResult;
                if (foundDir) {
                    return path.join(foundDir, "qo.pogo");
                }
            }));
        });
    };
    defineTasks = function() {
        var tasks;
        tasks = {};
        global.task = function(name, $function, gen6_options) {
            var self = this;
            var description, desc;
            description = gen6_options !== void 0 && Object.prototype.hasOwnProperty.call(gen6_options, "description") && gen6_options.description !== void 0 ? gen6_options.description : void 0;
            desc = gen6_options !== void 0 && Object.prototype.hasOwnProperty.call(gen6_options, "desc") && gen6_options.desc !== void 0 ? gen6_options.desc : void 0;
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
        var args, opts, s;
        args = argv._.slice(0);
        opts = {};
        for (s in argv) {
            (function(s) {
                if (argv.hasOwnProperty(s) && s !== "_" && s !== "$0") {
                    opts[s] = argv[s];
                }
            })(s);
        }
        return {
            arguments: args,
            options: opts
        };
    };
    runTaskFromWithArgs = function(name, tasks, args) {
        var task, gen7_asyncResult;
        return new Promise(function(gen2_onFulfilled) {
            task = tasks[name];
            gen2_onFulfilled(Promise.resolve(function() {
                if (task) {
                    return new Promise(function(gen2_onFulfilled) {
                        gen2_onFulfilled(new Promise(function(gen2_onFulfilled) {
                            result = task.function(args.arguments, args.options);
                            gen2_onFulfilled(Promise.resolve(function() {
                                if (result && result.then instanceof Function) {
                                    return new Promise(function(gen2_onFulfilled) {
                                        gen2_onFulfilled(Promise.resolve(result));
                                    });
                                }
                            }()));
                        }).then(void 0, function(e) {
                            process.stderr.write(util.inspect(e));
                            return process.exit(1);
                        }));
                    });
                } else {
                    process.stderr.write("could not find task `" + name + "'");
                    return process.exit(1);
                }
            }()));
        });
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
    exports.run = function() {
        var self = this;
        var gen8_asyncResult, qo, gen9_asyncResult;
        return new Promise(function(gen2_onFulfilled) {
            gen2_onFulfilled(Promise.resolve(findQo()).then(function(gen8_asyncResult) {
                qo = gen8_asyncResult;
                return Promise.resolve(function() {
                    if (qo) {
                        return new Promise(function(gen2_onFulfilled) {
                            tasks = defineTasks();
                            process.chdir(path.dirname(qo));
                            require(qo);
                            taskName = argv._.shift();
                            gen2_onFulfilled(Promise.resolve(function() {
                                if (taskName) {
                                    return new Promise(function(gen2_onFulfilled) {
                                        gen2_onFulfilled(Promise.resolve(runTaskFromWithArgs(taskName, tasks, parseArgs())));
                                    });
                                } else {
                                    return displayTasks(tasks);
                                }
                            }()));
                        });
                    } else {
                        process.stderr.write("couldn't find `qo.pogo` in any parent directory");
                        return process.exit(1);
                    }
                }());
            }));
        });
    };
}).call(this);