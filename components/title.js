'use strict';

module.exports = function(options, utils) {
  return '<div class="title">' + utils.render(options.content) + '</div>';
};
