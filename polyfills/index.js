'use strict';

var fs = require('fs');
var browserify = require('browserify');
var express = require('express');
var version = require('../package.json').dependencies.promise;

var app = express();

var read = fs.createReadStream;
var write = fs.createWriteStream;

var remaining = 2;
browserify(require.resolve('./polyfill.js')).bundle().pipe(write(__dirname + '/output/promise-' + version + '.js')).on('close', function () {
  remaining--;
});
read(require.resolve('./polyfill-done.js')).pipe(write(__dirname + '/output/promise-done-1.0.0.js')).on('close', function () {
  remaining--;
});

app.use(function (req, res, next) {
  function ready() {
    if (remaining === 0) return next();
    else setTimeout(ready, 100);
  }
  ready();
});
app.use('/', express.static(__dirname + '/output'))

module.exports = app