module.exports = function (options, utils) {
  return (
    '<span style="font-size: 0.6em; float: right">' +
      '<span class="label label-danger">' +
      utils.read('/strings/non-standard.txt') +
      '</span>' +
    '</span>'
  );
};
