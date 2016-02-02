var highlight = require('highlight.js').highlight;

module.exports = function (options, utils) {
  return (
    '<pre><code>' +
    highlight(options.lang, options.content).value +
    '</code></pre>'
  );
}
