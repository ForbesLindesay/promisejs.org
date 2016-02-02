'use strict';

module.exports = function(options, utils) {
  return '<div class="panel-body">' + utils.render(options.content) + '</div>';
};
