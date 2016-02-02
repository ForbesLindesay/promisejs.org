'use strict';

module.exports = function(options, utils) {
  return '<small>' + utils.render(options.content) + '</small>';
};
