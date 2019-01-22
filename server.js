'use strict'

var fs = require('fs')
var less = require('less-file')
var express = require('express')
var getContent = require('./content');

var app = express();
app.set('views', __dirname + '/views');

var staticFiles = app.locals.staticFiles = '/static/' + (process.env.CIRCLE_SHA1 ? process.env.CIRCLE_SHA1.substr(0, 10) : 'dev');

app.use(require('static-favicon')(__dirname + '/favicon.ico'))

app.use('/polyfills', require('./polyfills'))

app.use(staticFiles + '/style', less('./style/style.less'))

app.get(staticFiles + '/show-polyfill/client.js', function (req, res, next) {
  var src = fs.readFileSync(__dirname + '/show-polyfill/client.js', 'utf8');
  res.type('js');
  res.send(src);
});
app.use(function (req, res, next) {
  var url = req.url.replace(/\/$/, '');

  res.render('page.jade', getContent(url, {
    versions: require('./package.json').dependencies,
    locale: 'en'
  }));
});

module.exports = app.listen(3000);
console.log('listening on http://localhost:3000')
