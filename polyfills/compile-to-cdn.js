'use strict';

var fs = require('fs');
var path = require('path');
var Promise = require('promise');
var browserify = require('browserify');
var ujs = require('uglify-js');
var convert = require('convert-source-map');

var stat = Promise.denodeify(fs.stat);
var read = Promise.denodeify(fs.readFile);
var write = Promise.denodeify(fs.writeFile);

function compileBrowserify(options) {
  if (Array.isArray(options)) {
    options = {entries: options};
  } else if (typeof options === 'string') {
    options = {entries: [options]};
  }
  options.debug = true;
  options.basedir = path.resolve(__dirname, '../');
  return new Promise(function (resolve, reject) {
    browserify(options).bundle(function (err, res) {
      if (err) reject(err);
      else resolve(res.toString());
    });
  });
}

function output(str, location, filename, minify) {
  return stat(filename).then(function () {
    console.log('Not re-building ' + location + ' as it already exists.');
  }, function () {
    if (process.env.CI) {
      console.error('You must rebuild locally, refusing to write ' + location + ' on CI.');
      process.exit(1);
    }
    var sourceMaps = /\/\/[#@] ?sourceMappingURL=data:application\/json;(?:charset:utf-8;)?base64,([a-zA-Z0-9+\/]+)={0,2}$/m.exec(str);

    if (!minify && !sourceMaps) {
      return write(filename, str);
    }
    var opts = {};
    opts.fromString = true;
    opts.outSourceMap = location + '.map';
    if (sourceMaps) {
      opts.inSourceMap = sourceMaps && convert.fromJSON(
        new Buffer(sourceMaps[1], 'base64').toString()
      ).sourcemap;
    }
    if (!minify) {
      opts.mangle = false;
      opts.compress = false;
      opts.output = {
        beautify: true,
        indent_level: 2
      };
    }

    var min = ujs.minify(str, opts);

    var map = convert.fromJSON(min.map)
    var base = minify ?
        location.replace(/.*\//, '').replace(/\.min\.js$/, '.js') :
        location.replace(/.*\//, '') + '-sources';
    if (sourceMaps) {
      map.setProperty('sources', opts.inSourceMap.sources.map(function (source) {
        return source.replace(/\\/g, '/')
                     .replace(path.resolve(__dirname, '..').replace(/\\/g, '/'), base);
      }));
    } else {
      map.setProperty('sources', [base]);
    }
    map.setProperty('sourcesContent', sourceMaps
      ? opts.inSourceMap.sourcesContent
      : [str]
    );


    return Promise.all([
      write(filename, min.code),
      write(filename + '.map', map.toJSON())
    ]);
  });
}


exports.fromNode = function (from, location, to) {
  return compileBrowserify(from).then(function (src) {
    return Promise.all([
      output(src, location, to, false),
      output(src, location.replace(/\.js$/, '.min.js'), to.replace(/\.js$/, '.min.js'), true)
    ]);
  });
};
exports.fromFile = function (from, location, to) {
  return read(from, 'utf8').then(function (src) {
    return Promise.all([
      output(src, location, to, false),
      output(src, location.replace(/\.js$/, '.min.js'), to.replace(/\.js$/, '.min.js'), true)
    ]);
  });
};
