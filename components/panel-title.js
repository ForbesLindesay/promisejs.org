'use strict';

module.exports = function(options, utils) {
  return '<div class="panel-heading"><h3 class="panel-title">' + utils.render(options.content) + '</h3></div>';
};
