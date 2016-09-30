'use strict';

var url = require('url');
var fs = require('fs');
var stop = require('stop');

var promiseVersion = require('./package.json').dependencies.promise;
var server = require('./server.js');


stop.getWebsiteStream('http://localhost:3000', {
  filter: function (currentURL) {
    return url.parse(currentURL).hostname === 'localhost';
  },
  parallel: 1
})
.syphon(stop.addFavicon())
.syphon(stop.minifyJS({filter: function (url) {
  console.dir(url);
  return url.indexOf('static') !== -1;
}}))
.syphon(stop.minifyCSS({deadCode: true, ignore: ['carbon'], silent: true}))
.syphon(stop.addManifest('/app.manifest', {addLinks: true}))
.syphon(stop.log())
.syphon(stop.checkStatusCodes([200]))
.syphon(stop.writeFileSystem(__dirname + '/out'))
.wait().done(function () {
  server.close();

  // todo: support source maps properly
  copy('/polyfills/output/promise-' + promiseVersion + '.js.map',
       '/out/polyfills/promise-' + promiseVersion + '.js.map');
  copy('/polyfills/output/promise-' + promiseVersion + '.min.js.map',
       '/out/polyfills/promise-' + promiseVersion + '.min.js.map');
  copy('/polyfills/output/promise-done-' + promiseVersion + '.min.js.map',
       '/out/polyfills/promise-done-' + promiseVersion + '.min.js.map');
  function copy(src, dest) {
    fs.writeFileSync(__dirname + dest, fs.readFileSync(__dirname + src));
  }

  console.log('success');
});
