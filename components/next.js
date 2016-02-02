'use strict';

module.exports = function(options, utils) {
  var href = /\(href\=\"([^\"]+)\"\)/.exec(options.attrs)[1];
  return (
    '<li class="next"><a href="' + href + '">' + utils.render(options.content) + ' &rarr;</a></li>'
  );
};
