'use strict'

var filters = require('jade').filters
var highlight = require('highlight.js').highlight
var jade = require('transform')('jade')
var less = require('transform')('less')
var browserify = require('browserify-middleware')
var express = require('express')
var app = express()

filters.js = function (src, options) {
  return '<pre><code>' + highlight('javascript', src).value + '</code></pre>'
}

jade.settings('versions', require('./package.json').dependencies)

app.use(express.favicon(__dirname + '/favicon.ico'))

app.get('/', jade('./views/index.jade'))
app.get('/intro', jade('./views/intro.jade'))
app.get('/style.css', less('./style/style.less'))
app.use('/implementations', require('./implementations'))

app.listen(3000)
console.log('listening on http://localhost:3000')