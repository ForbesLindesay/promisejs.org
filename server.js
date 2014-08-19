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

app.set('views', __dirname + '/views');
function jade(path) {
  return function (req, res) {
    res.render(path, {
      versions: require('./package.json').dependencies,
      js: filters.js,
      html: filters.html
    });
  };
}

app.use(require('static-favicon')(__dirname + '/favicon.ico'))

app.get('/', jade('./index.jade'))
app.get('/patterns', jade('./patterns.jade'))
app.get('/generators', jade('./generators.jade'))
app.get('/implementing', jade('./implementing.jade'))

app.use('/polyfills', require('./polyfills'))

app.use('/style', less('./style/style.less'))
app.get('/gittip-widget/client.js', function (req, res, next) {
  var src = fs.readFileSync(__dirname + '/gittip-widget/client.js', 'utf8');
  res.type('js');
  res.send(src);
});

module.exports = app.listen(3000);
console.log('listening on http://localhost:3000')
