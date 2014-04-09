if (typeof Promise === 'undefined') {
  Promise = require('promise');
} else {
  require('./polyfill-done.js');
}