var fs = require('fs')
var assert = require('assert')
var imps = Object.keys(require('./index.js'))
var versions = require('../package.json').dependencies
for (var i = 0; i < imps.length; i++) {
  var imp = __dirname + '/../out/implementations/' + imps[i] + '/' + imps[i] + '-' + versions[imps[i]] + '.js'
  //check valid js
  require(imp)
  //check non-empty
  assert(fs.readFileSync(imp, 'utf8').length > 50, imps[i] + ' is empty.')
}