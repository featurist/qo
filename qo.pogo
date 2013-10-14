ps = require './ps'
pogo = require 'pogo'

task 'build'
    pogo.compile file! 'index.pogo'

task 'test' (description: 'test with mocha')
    ps.spawn! 'mocha'
