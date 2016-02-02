'use strict';

module.exports = function(options, utils) {
  var href = /\(href\=\"([^\"]+)\"\)/.exec(options.attrs)[1];
  return (
    '<li class="previous"><a href="' + href + '">&larr; ' + utils.render(options.content) + '</a></li>'
  );
};
