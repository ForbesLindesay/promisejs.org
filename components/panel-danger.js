'use strict';

module.exports = function(options, utils) {
  return '<div class="panel panel-danger">' + utils.render(options.content) + '</div>';
};
