# qo [![npm version](https://img.shields.io/npm/v/qo.svg)](https://www.npmjs.com/package/qo) [![npm](https://img.shields.io/npm/dm/qo.svg)](https://www.npmjs.com/package/qo) [![Build Status](https://travis-ci.org/featurist/qo.svg?branch=master)](https://travis-ci.org/featurist/qo)

A task runner for insect people.

## install

    npm install qo

## how to use

Write a file `qo.js`:

```js
task('hi', function () {
  console.log('hi!');
});
```

Then

```bash
# qo hi
hi!
```

### named arguments

```js
task('hi', function (args, options) {
  console.log("hi " + options.name);
});
```

Then

```bash
# qo hi --name jack
hi jack
```

### lists of arguments

```js
task('hi', function (args) {
  console.log("hi " + args.join(', '));
});
```

Then

```bash
# qo hi jack jill jesse
hi jack, jill, jesse
```

### promises

If you return a promise, and it's rejected, then `qo` will print the error exit with `1`.

```js
var fs = require('fs-promise');

task('print', function (args) {
  return fs.readFile(args[0], 'utf-8').then(function (contents) {
    console.log(contents);
  });
});
```

Then

```bash
# qo print some-file.txt
Error: ENOENT, open 'some-file.txt'
    at Error (native)
```

### task descriptions

```js
task('hi', {desc: 'says hi'}, function () {
  console.log('hi');
});
```

Then

```bash
# qo
tasks:

    hi, says hi
```

You can also put descriptive arguments into the task name:

```js
task('hi <name>', {desc: 'says hi to <name>'}, function (args) {
  console.log('hi ' + args[0]);
});
```

Then

```bash
# qo
tasks:

    hi <name>, says hi to <name>
```

# pogoscript

you can write a `qo.pogo` file too. Pogoscript happens to be very useful for writing heavily asynchronous code, and great for little scripts that get things done.
