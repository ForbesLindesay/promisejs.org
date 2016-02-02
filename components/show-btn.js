'use strict';

module.exports = function(options, utils) {
  var cls = 'class="btn btn-default btn-xs"';
  var style = 'style="outline: none; display: none;"';
  var action = 'data-action="show-polyfill"';
  var target = 'data-target="' + options.target + '"';
  return (
    '<button ' + cls + ' ' + style + ' ' + action + ' ' + target + '>' +
      options.text +
    '</button>'
  );
};
