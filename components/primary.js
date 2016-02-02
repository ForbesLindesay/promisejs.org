'use strict';

module.exports = function(options, utils) {
  return '<h1>' + utils.render(options.content) + '</h1>';
};
