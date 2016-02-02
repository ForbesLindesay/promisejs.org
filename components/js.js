var code = require('./code');

module.exports = function (options, utils) {
  return (
    code({lang: 'javascript', content: options.content}, utils)
  );
};
