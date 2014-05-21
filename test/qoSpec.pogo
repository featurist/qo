mkdirp = require 'mkdirp'
rimraf = require 'rimraf'
ps = require '../../qo-ps'
fs = require 'fs'
path = require 'path'
require 'chai'.should ()
childProcess = require 'child_process'

describe 'qo'
  writeQoFile (fn) thatDoes (s) on (task)! =
    source = "task '#(task)'
                  #(s)"

    fs.writeFile (fn, source, ^)!

  writeQoFile (fn) containing (source)! =
    if (source :: Function)
      source := source()!
        
    fs.writeFile (fn, source, ^)!
      
      
  qo (task, cwd: nil)! =
    qoExe = path.join (process.cwd (), 'bin/qo')
    ps.exec 'bash' '-c' "#(qoExe) #(task)" {cwd = cwd} ^!

  beforeEach
    rimraf 'test/scratch' ^!

  describe 'runs the nearest qo.pogo'
    beforeEach
      mkdirp 'test/scratch/a/b/c' ^!

    context "when there is a qo.pogo file two directories up"
      beforeEach
        writeQoFile 'test/scratch/a/qo.pogo' thatDoes 'console.log (process.cwd())' on 'run'!

      it 'runs that file, with the files directory as the current directory'
        qo ('run', cwd: 'test/scratch/a/b/c')!.should.match r/\/test\/scratch\/a$/m

    context 'when there is no qo.pogo'
      it 'reports an error' @(done)
        childProcess.exec (path.join (process.cwd (), 'bin/qo'), {cwd = '/'}) @(e, out, err)
          err.should.match r/couldn't find/
          done ()

  describe 'arguments'
    describe 'argument list'
      beforeEach
        mkdirp 'test/scratch' ^!
        writeQoFile 'test/scratch/qo.pogo' containing!
          'task "run" @(args)
             console.log [args.0, args.1]'

      it 'can get command line arguments'
        qo 'run a b' (cwd: 'test/scratch')!.should.equal "[ 'a', 'b' ]\n"

      it 'integers are parsed as integers'
        qo 'run 1 2' (cwd: 'test/scratch')!.should.equal "[ 1, 2 ]\n"

    describe 'switches'
      beforeEach
        mkdirp 'test/scratch' ^!
        writeQoFile 'test/scratch/qo.pogo' containing!
          'task "run" @(args)
             console.log [args.cat, args.dog]'

      it 'passes switch values to the task'
        qo 'run --cat c --dog d' (cwd: 'test/scratch')!.should.equal "[ 'c', 'd' ]\n"

      it 'integers are parsed as integers'
        qo 'run --cat 1 --dog 2' (cwd: 'test/scratch')!.should.equal "[ 1, 2 ]\n"

      it 'presence indicates true'
        qo 'run --cat' (cwd: 'test/scratch')!.should.equal "[ true, undefined ]\n"

  describe 'descriptions'
    beforeEach
      mkdirp 'test/scratch' ^!
      writeQoFile 'test/scratch/qo.pogo' containing!
        'task "a"
           console.log "running stuff"

         task "b" (desc: "runs b")
           console.log "running stuff"

         task "c" (description: "runs c")
           console.log "running stuff"'
    
    it 'prints the tasks and their descriptions'
      output =
        'tasks:

             a

             b, runs b

             c, runs c
         
         '

      qo '' (cwd: 'test/scratch')!.should.equal (output)
