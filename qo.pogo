ps = require 'qo-ps'
pogo = require 'pogo'

task 'build'
    pogo.compile file! 'index.pogo'

task 'test' (description: 'test with mocha')
    ps.spawn! 'mocha' 'test/qoSpec.pogo'

task 'haha' @(args, opts)
  console.log (args)
  console.log (opts)

task 'blah'
  promise! @(result, error)
    error (new (Error 'asdlfksdf'))
