'use strict'

var fs = require('fs')
var filters = require('jade').filters
var highlight = require('highlight.js').highlight
var less = require('less-file')
var express = require('express')
var app = express()

filters.js = function (src, options) {
  return '<pre><code>' + highlight('javascript', src).value + '</code></pre>'
}
filters.html = function (src, options) {
  return '<pre><code>' + highlight('xml', src).value + '</code></pre>'
}

var staticFiles = app.locals.staticFiles = '/static/' + require('./package.json').version;

app.set('views', __dirname + '/views');
function jade(path, locals) {
  return function (req, res) {
    locals.versions = require('./package.json').dependencies;
    locals.js = filters.js;
    locals.html =filters.html;
    res.render(path, locals);
  };
}

app.use(require('static-favicon')(__dirname + '/favicon.ico'))

app.get('/', jade('./index.jade', {activePath: '/'}))
app.get('/patterns', jade('./patterns.jade', {activePath: '/patterns/'}))
app.get('/generators', jade('./generators.jade', {activePath: '/generators/'}))
app.get('/implementing', jade('./implementing.jade', {activePath: '/implementing/'}))

app.use('/polyfills', require('./polyfills'))

app.use(staticFiles + '/style', less('./style/style.less'))
app.get(staticFiles + '/gittip-widget/client.js', function (req, res, next) {
  var src = fs.readFileSync(__dirname + '/gittip-widget/client.js', 'utf8');
  res.type('js');
  res.send(src);
});

module.exports = app.listen(3000);
console.log('listening on http://localhost:3000')
