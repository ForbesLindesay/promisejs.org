'use strict';

var url = require('url');
var stop = require('stop');

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
  console.log('success');
});