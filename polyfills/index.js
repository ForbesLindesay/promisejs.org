'use strict';

var assert = require('assert');
var Promise = require('promise');
var express = require('express');
var compile = require('./compile-to-cdn.js');
var version = require('../package.json').dependencies.promise;
var actualVersion = require('promise/package.json').version;
assert(version === actualVersion);

var app = express();

var compiledPromise = compile.fromNode(require.resolve('promise/polyfill'), '/polyfills/promise-' + version + '.js', __dirname + '/output/promise-' + version + '.js');
var compiledPromiseDone = compile.fromFile(require.resolve('promise/polyfill-done.js'), '/polyfills/promise-done-' + version + '.js', __dirname + '/output/promise-done-' + version + '.js');
var compiled = Promise.all([compiledPromise, compiledPromiseDone]);

compiled.done();
app.use(function (req, res, next) {
  return compiled.nodeify(next);
});
app.use('/', express.static(__dirname + '/output'))

module.exports = app
