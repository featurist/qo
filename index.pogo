fs = require 'fs'
path = require 'path'
pogo = require 'pogo'
argv = require 'optimist'.argv

findParentDirectoryWhere (predicate) =
    findParent (dir) where (p)! =
        if (@not p (dir)!)
            newDir = path.normalize (path.join (dir, '..'))
            if (dir != '/')
                findParent (newDir) where (p)!
        else
            dir

    findParent (process.cwd()) where (predicate)!

findQo()! =
    foundDir = findParentDirectoryWhere! @(dir)
        fs.exists (path.join (dir, 'qo.pogo')) @(e)
            continuation (nil, e)

    if (foundDir)
        path.join (foundDir, 'qo.pogo')

defineTasks () =
    tasks = {}

    global.task (name, function, description: nil, desc: nil) =
        tasks.(name) = {
            function = function
            description = desc @or description
            name = name
        }

    tasks

isFunction (f) asynchronous =
    r/function(.*continuation)/.test (f.toString ())

parseArgs () =
    args = argv._.slice 0

    for @(s) in (argv)
        if (argv.hasOwnProperty (s))
            args.(s) = argv.(s)

    args

runTask (name) from (tasks) withArgs (args)! =
    task = tasks.(name)

    if (task)
        task.function (args)!
    else
        process.stderr.write "could not find task `#(name)'"
        process.exit 1

displayTasks (tasks) =
    console.log "tasks:"
    console.log ()
    for @(tn) in (tasks)
        if (tasks.hasOwnProperty (tn))
            task = tasks.(tn)

            description =
                if (task.description)
                    ", #(task.description)"
                else
                    ''

            console.log "    #(task.name)#(description)"
            console.log ()

exports.run () =
    qo = findQo()!

    if (qo)
        tasks = defineTasks ()
        process.chdir (path.dirname (qo))
        require (qo)

        taskName = argv._.shift ()
        if (taskName)
            runTask (taskName) from (tasks) withArgs (parseArgs ())!
        else
            displayTasks (tasks)
    else
        process.stderr.write "couldn't find `qo.pogo` in any parent directory"
        process.exit 1
