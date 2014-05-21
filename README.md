# qo

A task runner for insect people. And for people who use [pogoscript](http://pogoscript.org/).

## install

    npm install qo

## how to use

Write a file `qo.pogo`:

    task 'hi'
        console.log 'hi!'

Then

    # qo hi
    hi!

### named arguments

    task 'hi' @(args, name: nil)
        console.log "hi #(name)"

Then

    # qo hi --name jack
    hi jack

### lists of arguments

    task 'hi' @(args)
        console.log "hi #(args.join ', ')"

Then

    # qo hi jack jill jesse
    hi jack, jill, jesse

### asynchrony

Inevitably your tasks will need to be asynchronous.

    ncp = require 'ncp'

    task 'copy'
        ncp 'original.txt' 'copy.txt' ^!
        console.log 'all done'

Then

    # qo copy
    all done

### task descriptions

    task 'hi' (desc: 'says hi')
        console.log 'hi'

Then

    # qo
    tasks:

        hi, says hi

# pogoscript

`qo` uses pogoscript because it does asynchronous stuff very nicely. Learn more about pogoscript from pogoscript's [cheatsheet](http://pogoscript.org/cheatsheet.html).
