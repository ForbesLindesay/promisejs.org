var fs = require('fs')
var read = fs.createReadStream
var write = fs.createWriteStream

var browserify = require('browserify')
var express = require('express')
var app = express()

var versions = require('../package.json').dependencies

browserify([require.resolve('promise')]).bundle({standalone: 'Promise'})
  .pipe(write(__dirname + '/promise/promise-' + versions.promise + '.js'))

app.use('/promise', express.static(__dirname + '/promise'))

read(require.resolve('q'))
  .pipe(write(__dirname + '/q/q-' + versions.q + '.js'))

app.use('/q', express.static(__dirname + '/q'))

module.exports = app