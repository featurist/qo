var Promise = require("bluebird");
var fs = require("fs");
var path = require("path");
var argv = require("optimist").argv;
var util = require("util");
var glob = require('glob');

function findFirstParentDirectory(predicate) {
  function findParentWhere(dir, p) {
    return p(dir).then(function(predicateResult) {
      if (!predicateResult) {
        var newDir = path.normalize(path.join(dir, ".."));
        if (dir !== "/") {
          return findParentWhere(newDir, p);
        }
      } else {
        return predicateResult;
      }
    });
  }

  return findParentWhere(process.cwd(), predicate);
}

function findQo() {
  return findFirstParentDirectory(function(dir) {
    return new Promise(function(fulfil, reject) {
      glob(dir + '/@(qo|qo.*)', function (err, result) {
        if (err) {
          reject(err);
        } else {
          fulfil(result[0]);
        }
      });
    });
  });
}

function defineTasks() {
  var tasks = {};

  global.task = function(name, fn, options) {
    if (typeof options === 'function') {
      var tmp = fn;
      fn = options;
      options = tmp;
    }

    var description = options && options.hasOwnProperty('description') && options.description !== undefined? options.description: undefined;
    var desc = options && options.hasOwnProperty('desc') && options.desc !== undefined? options.desc: undefined;

    tasks[name] = {
      "function": fn,
      description: desc || description,
      name: name
    };
  };

  return tasks;
}

function parseArgs() {
  var args = argv._.slice(0);
  var opts = {};

  Object.keys(argv).forEach(function (s) {
    if (s !== "_" && s !== "$0") {
      opts[s] = argv[s];
    }
  });

  return {
    arguments: args,
    options: opts
  };
}

function runTaskFromWithArgs(name, tasks, args) {
  var task = tasks[name];

  if (task) {
    function handleError(e) {
      if (e.stack) {
        process.stderr.write(e.stack + '\n');
      } else {
        process.stderr.write(util.inspect(e) + '\n');
      }
      process.exit(1);
    }

    var result;

    try {
      result = task.function(args.arguments, args.options);
    } catch (e) {
      handleError(e);
    }

    if (result && typeof result.then === 'function') {
      return result.then(undefined, handleError);
    }
  } else {
      process.stderr.write("could not find task `" + name + "'");
      return process.exit(1);
  }
}

function displayTasks(tasks) {
  console.log("tasks:");
  console.log();

  Object.keys(tasks).forEach(function (tn) {
    var task = tasks[tn];
    var description =
      task.description
        ? ', ' + task.description
        : '';

    console.log("    " + task.name + "" + description);
    console.log();
  });
}

function requireQo(filename) {
  var extension = path.extname(filename);

  if (extension && extension != '.js') {
    require(extension.substring(1));
  }

  require(filename);
}

exports.run = function() {
  return findQo().then(function(qo) {
    if (qo) {
      var tasks = defineTasks();
      process.chdir(path.dirname(qo));
      requireQo(qo);
      var taskName = argv._.shift();

      if (taskName) {
        return runTaskFromWithArgs(taskName, tasks, parseArgs());
      } else {
        displayTasks(tasks);
      }
    } else {
      process.stderr.write("couldn't find `qo.js` or `qo.pogo` in any parent directory");
      process.exit(1);
    }
  });
};
