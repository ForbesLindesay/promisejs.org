module.exports = {
  promise: {
    name: "Promise",
    home: "https://github.com/then/promise",
    description: "Promise, by Forbes Lindesay, is a very simple, high performance promise library. It is designed to just provide the bare bones required to use promises in the wild.",
    require: "var Promise = require('promise')",
    create: "var myPromise = new Promise(function (resolve, reject) {\n  // call resolve(value) to fulfill the promise with that value\n  // call reject(error) if something goes wrong\n})",
    build: "browserify([require.resolve('promise')]).bundle({standalone: 'Promise'})"
  },
  q: {
    name: "Q",
    home: "https://github.com/kriskowal/q",
    description: "Q, by Kris Kowal, is an advanced, fully featured promise library.  It is designed to be fully featured and has lots of helper methods to make certain common tasks easier.  It is somewhat slower than Promise, but can make up for this with support for better stack traces and additional features.",
    require: "var Q = require('q')",
    create: "var myPromise = Q.promise(function (resolve, reject) {\n  // call resolve(value) to fulfill the promise with that value\n  // call reject(error) if something goes wrong\n})",
    build: "read(require.resolve('q'))"
  },
  when: {
    name: "When",
    home: "https://github.com/cujojs/when/wiki",
    description: "A solid, fast Promises/A+ and when() implementation, plus other async goodies.",
    require: "var when = require('when');",
    create: "var deferred = when.defer()\nvar myPromise = deferred.promise\n// call deferred.resolve(value) to fulfill the promise with that value\n// call deferred.reject(error) if something goes wrong",
    build: "browserify([require.resolve('when')]).bundle({standalone: 'when'})"
  },
  rsvp: {
    name: "rsvp.js",
    home: "https://github.com/tildeio/rsvp.js",
    description: "A tiny implementation of Promises/A+ and a mixin for turning objects into event targets.",
    require: "var RSVP = require('rsvp');",
    create: "var myPromise = new RSVP.Promise(function (resolve, reject) {\n  // call resolve(value) to fulfill the promise with that value\n  // call reject(error) if something goes wrong\n})",
    build: "browserify([require.resolve('rsvp')]).bundle({standalone: 'RSVP'})"
  },
  vow: {
    name: "Vow",
    home: "https://github.com/dfilatov/vow",
    description: "A Promises/A+ implementation.",
    require: "var Vow = require('vow');",
    create: "var myPromise = Vow.promise()\n// call myPromise.fulfill(value) to fulfill the promise with that value\n// call myPromise.reject(error) if something goes wrong",
    build: "browserify([require.resolve('vow')]).bundle({standalone: 'Vow'})"
  }
}