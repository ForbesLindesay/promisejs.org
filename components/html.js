var code = require('./code');

module.exports = function (options, utils) {
  return (
    '<div class="small-code">' +
    code({lang: 'xml', content: options.content}, utils) +
    '</div>'
  );
};
