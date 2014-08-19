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
.syphon(stop.addManifest('/app.manifest', {addLinks: true}))
.on('data', function (page) {
  if (page.url === 'http://localhost:3000/style/files/3/glyphicons-halflings-regular.eot?' && page.statusCode === 404) {
    //todo: fix this
  } else if (page.statusCode !== 200) {
    throw new Error('Unexpected status code ' + page.statusCode +
                    ' for ' + page.url);
  }
  console.log(page.statusCode + ' - ' + page.url);
})
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
