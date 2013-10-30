fs = require 'fs'
path = require 'path'
pogo = require 'pogo'
argv = require 'optimist'.argv

find parent directory where (predicate) =
    find parent! (dir) where (p) =
        if (@not p! (dir))
            new dir = path.normalize (path.join (dir, '..'))
            if (dir != '/')
                find parent! (new dir) where (p)
        else
            dir

    find parent! (process.cwd()) where (predicate)

find qo! =
    found dir = find parent directory where! @(dir)
        fs.exists (path.join (dir, 'qo.pogo')) @(e)
            continuation (nil, e)

    if (found dir)
        path.join (found dir, 'qo.pogo')

define tasks () =
    tasks = {}

    global.task (name, function, description: nil, desc: nil) =
        tasks.(name) = {
            function = function
            description = desc @or description
            name = name
        }

    tasks

is function (f) asynchronous =
    r/function(.*continuation)/.test (f.to string ())

parse args () =
    args = argv._.slice 0

    for @(s) in (argv)
        if (argv.has own property (s))
            args.(s) = argv.(s)

    args

run task (name) from (tasks) with args (args) =
    task = tasks.(name)

    if (task)
        if (is function (task.function) asynchronous)
            task.function! (args)
        else
            task.function (args)
    else
        process.stderr.write "could not find task `#(name)'"
        process.exit 1

display tasks (tasks) =
    console.log "tasks:"
    console.log ()
    for @(tn) in (tasks)
        if (tasks.has own property (tn))
            task = tasks.(tn)

            description =
                if (task.description)
                    ", #(task.description)"
                else
                    ''

            console.log "    #(task.name)#(description)"
            console.log ()

exports.run () =
    qo = find qo!

    if (qo)
        tasks = define tasks ()
        process.chdir (path.dirname (qo))
        require (qo)

        task name = argv._.shift ()
        if (task name)
            run task! (task name) from (tasks) with args (parse args ())
        else
            display tasks (tasks)
    else
        process.stderr.write "couldn't find `qo.pogo` in any parent directory"
        process.exit 1
