'use strict';

var fs = require('fs');
var createMarkdown = require('markdown-it');
var Plugin = require('markdown-it-regexp');

module.exports = function getContent(url, options) {
  function read(filename) {
    var filePath = __dirname + '/translations/' + options.locale + filename
    var exists = fs.existsSync(filePath)
    if (!exists) {
      var fallbackLocale = 'en'
      var fallbackFilePath = __dirname + '/translations/' + fallbackLocale + filename
      filePath = fallbackFilePath
    }
    return fs.readFileSync(
      filePath,
      'utf8'
    ).trim();
  }
  var src;
  try {
    src = read('/pages' + url + '.md');
  } catch (ex) {
    if (ex.code !== 'ENOENT') throw ex;
    src = read('/pages' + url + '/index.md');
  }

  src = src.replace(/\$([A-Za-z\.\-\_]+)\$/g, function (_, path) {
    return path.split('.').reduce(function (obj, part) {
      return obj[part];
    }, options);
  });
  function render(src, renderOptions) {
    var pluginResults = {};
    var pluginResultID = 0;
    var plugins = [];
    function preparePlugins(src) {
      plugins.forEach(function (plugin) {
        src = src.replace(plugin.regexp, function (_) {
          var id = 'pluginplaceholdervalue' + (pluginResultID++) + 'pluginplaceholdervalue';
          pluginResults[id] = plugin.replacer.apply(this, arguments);
          var end = '';
          while (end.length < (_.length - _.trim().length)) {
            end += '\n';
          }
          return id + end;
        });
      });
      return src;
    }
    function applyPlugins(src) {
      var oldSrc = '';
      while (src !== oldSrc) {
        oldSrc = src;
        src = src.replace(/\<p\>\s*(pluginplaceholdervalue\d+pluginplaceholdervalue)\s*\<\/p\>/g, '$1');
        src = src.replace(/pluginplaceholdervalue\d+pluginplaceholdervalue/g, function (id) {
          return pluginResults[id];
        });
      }
      return src;
    }
    function plugin(regexp, replacer) {
      plugins.push({regexp: regexp, replacer: replacer});
    }
    plugin(
      /\:([a-z\-]+)((?:\n(?:  .*)?)*)/g,
      function (_, name, content) {
        return require('./components/' + name)({
          content: content.split('\n').map(function (line) {
            return line.substr(line.length >= 2 ? 2 : 0);
          }).join('\n').trim()
        }, {
          read: read,
          render: render
        });
      }
    );
    plugin(
      /\@([a-z\-]+)(\(.*\))?((?:\n(?:  .*)?)*)/g,
      function (_, name, attrs, content) {
        return require('./components/' + name)({
          attrs: attrs,
          content: (
            content.split('\n').map(function (line) {
              return line.substr(line.length >= 2 ? 2 : 0);
            }).join('\n').trim()
          )
        }, {
          read: read,
          render: render
        });
      }
    );
    plugin(
      /(\#+)\[([A-Za-z\_]+)\] (.*)/g,
      function (_, level, label, content) {
        return (
          '<h' + level.length + ' id="' + label + '">' +
          content +
          '</h' + level.length + '>'
        );
      }
    );
    var md = createMarkdown();
    return applyPlugins(md[renderOptions && renderOptions.block ? 'render' : 'renderInline'](preparePlugins(src)));
  }
  options.content = render(src, {block: true});
  options.read = read;
  return options;
}
