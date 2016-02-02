'use strict';

module.exports = function(options, utils) {
  return '<ul class="pager">' + utils.render(options.content) + '</ul>';
};
