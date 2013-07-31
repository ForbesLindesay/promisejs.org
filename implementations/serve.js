var fs = require('fs')
var read = fs.createReadStream
var write = fs.createWriteStream

var browserify = require('browserify')
var express = require('express')
var app = express()

var implementations = require('./')

var versions = require('../package.json').dependencies

Object.keys(implementations)
  .forEach(function (name) {
    var imp = implementations[name]
    Function('require,browserify,read', 'return ' + imp.build)(require, browserify, read)
      .pipe(write(__dirname + '/' + name + '/' + name + '-' + versions[name] + '.js'))

    app.use('/' + name, express.static(__dirname + '/' + name))
  })

module.exports = app