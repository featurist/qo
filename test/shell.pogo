childProcess = require 'child_process'
shellQuote = require 'shell-quote'
glob = require 'glob'

module.exports = shell (cmd, args, opts) =
  if (@not (args :: Array))
    shell('sh', ['-c', cmd], args)
  else
    args := args @or []
    opts := opts @or {}
    if (opts.env)
      opts.env = JSON.parse(JSON.stringify(opts.env))
      
      Object.keys(process.env).forEach @(key)
        opts.env.(key) = process.env.(key)

    captureStdout = opts @and opts.stdout

    if (@not captureStdout)
      opts.stdio = opts.stdio @or 'inherit'

    p = childProcess.spawn(cmd, args, opts)

    stdout = []

    if (captureStdout)
      p.stdout.on 'data' @(data)
        stdout.push(data)

    promise! @(result, error)
      p.on 'exit' @(exitCode, signal)
        if (exitCode == 0)
          result(stdout.join(''))
        else
          error(new (Error "#(shellQuote.quote [cmd, args, ...]), exit code #(exitCode)"))
