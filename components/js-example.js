var showButton = require('./show-btn');
var code = require('./code');

module.exports = function (options, utils) {
  var id = 'e' + Math.random().toString(35).substr(2, 7);
  var text = utils.read('/strings/show-example.txt');
  var target = '#' + id;

  return (
    showButton({text: utils.render(text), target: target}, utils) +
    '<div id="' + id + '">' +
      code({lang: 'javascript', content: options.content}, utils) +
    '</div>'
  );
};
