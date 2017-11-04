@title
  @primary
    API Reference
  @secondary
    by Forbes Lindesay (with many examples taken from @mdn)

## Methods

###[Promise_all] Promise.all(iterable)

Returns a Promise that waits for all promises in the `iterable` to be fulfilled and is then
fulfilled with an array of those resulting values (in the same order as the input).

:js-example
  var promise = Promise.resolve(3);
  Promise.all([true, promise]).then(values => {
    console.log(values); // [true, 3]
  });

:js-polyfill
  Promise.all = function (arr) {
    // TODO: this polyfill only supports array-likes
    //       it should support all iterables
    var args = Array.prototype.slice.call(arr);

    return new Promise(function (resolve, reject) {
      if (args.length === 0) return resolve([]);
      var remaining = args.length;
      function res(i, val) {
        if (val && (typeof val === 'object' || typeof val === 'function')) {
          var then = val.then;
          if (typeof then === 'function') {
            var p = new Promise(then.bind(val));
            p.then(function (val) {
              res(i, val);
            }, reject);
            return;
          }
        }
        args[i] = val;
        if (--remaining === 0) {
          resolve(args);
        }
      }
      for (var i = 0; i < args.length; i++) {
        res(i, args[i]);
      }
    });
  };

###[Promise_denodeify] Promise.denodeify(fn, length) @non-standard

Some promise implementations provide a `.denodeify` method to make it easier to interoperate
with node.js code.  It will add a `callback` to any calls to the function, and use that to
fullfill or reject the promise.

If the function returns a Promise, the state of that Promise will be used instead of the callback.

If `length` is specified and more arguments are passed than `length`, the remaining arguments
will not be passed down to fn.

:js-example
  var Promise = require('promise');
  var readFile = Promise.denodeify(require('fs').readFile);

  module.exports = function readJson(filename) {
    return readFile(filename, 'utf8').then(JSON.parse);
  };

:js-polyfill
  Promise.denodeify = function (fn, argumentCount) {
    argumentCount = argumentCount || Infinity;
    return function () {
      var self = this;
      var args = Array.prototype.slice.call(arguments);
      return new Promise(function (resolve, reject) {
        while (args.length && args.length > argumentCount) {
          args.pop();
        }
        args.push(function (err, res) {
          if (err) reject(err);
          else resolve(res);
        })
        var res = fn.apply(self, args);
        if (res &&
          (
            typeof res === 'object' ||
            typeof res === 'function'
          ) &&
          typeof res.then === 'function'
        ) {
          resolve(res);
        }
      })
    }
  }

###[Promise_race] Promise.race(iterable)

Returns a promise that resolves or rejects as soon as any of the promises in `iterable` have
been resolved or rejected (with the corresponding reason or value).

:js-example
  var p1 = new Promise(function(resolve, reject) {
    setTimeout(resolve, 500, "one");
  });
  var p2 = new Promise(function(resolve, reject) {
    setTimeout(resolve, 100, "two");
  });

  Promise.race([p1, p2]).then(function(value) {
    console.log(value); // "two"
    // Both resolve, but p2 is faster
  });

  var p3 = new Promise(function(resolve, reject) {
    setTimeout(resolve, 100, "three");
  });
  var p4 = new Promise(function(resolve, reject) {
    setTimeout(reject, 500, "four");
  });

  Promise.race([p3, p4]).then(function(value) {
    console.log(value); // "three"
    // p3 is faster, so it resolves
  }, function(reason) {
    // Not called
  });

  var p5 = new Promise(function(resolve, reject) {
    setTimeout(resolve, 500, "five");
  });
  var p6 = new Promise(function(resolve, reject) {
    setTimeout(reject, 100, "six");
  });

  Promise.race([p5, p6]).then(function(value) {
    // Not called
  }, function(reason) {
    console.log(reason); // "six"
    // p6 is faster, so it rejects
  });

:js-polyfill
  Promise.race = function (values) {
    // TODO: this polyfill only supports array-likes
    //       it should support all iterables
    return new Promise(function (resolve, reject) {
      values.forEach(function(value){
        Promise.resolve(value).then(resolve, reject);
      });
    });
  };

###[Promise_reject] Promise.reject(reason)

Returns a promise that is rejected with the given `reason`.

:js-example
  Promise.reject(new Error("fail")).then(function(error) {
    // not called
  }, function(error) {
    console.log(error); // Stacktrace
  });

:js-polyfill
  Promise.reject = function (value) {
    return new Promise(function (resolve, reject) {
      reject(value);
    });
  };

###[Promise_resolve] Promise.resolve(value)

Returns a promise that is resolved with the given `value`.

If the `value` is a promise, then it is unwrapped so that the resulting promise adopts
the state of the promise passed in as `value`.  This is useful for converting promises
created by other libraries.

:js-example
  Promise.resolve("Success").then(function(value) {
    console.log(value); // "Success"
  }, function(value) {
    // not called
  });
  var p = Promise.resolve([1,2,3]);
  p.then(function(v) {
    console.log(v[0]); // 1
  });
  var original = Promise.resolve(true);
  var cast = Promise.resolve(original);
  cast.then(function(v) {
    console.log(v); // true
  });

:js-polyfill
  Promise.resolve = function (value) {
    return new Promise(function (resolve) {
      resolve(value);
    });
  };

## Prototype Methods

###[Promise_prototype_catch] Promise.prototype.catch(onRejected)

Equivalent to calling `Promise.prototype.then(undefined, onRejected)`

:js-example
  var p1 = new Promise(function(resolve, reject) {
    resolve("Success");
  });

  p1.then(function(value) {
    console.log(value); // "Success!"
    throw "oh, no!";
  }).catch(function(e) {
    console.log(e); // "oh, no!"
  });

  p1.then(function(value) {
    console.log(value); // "Success!"
    throw "oh, no!";
  }).then(undefined, function(e) {
    console.log(e); // "oh, no!"
  });

:js-polyfill
  Promise.prototype['catch'] = function (onRejected) {
    return this.then(null, onRejected);
  };

###[Promise_prototype_done] Promise.prototype.done(onFulfilled, onRejected) @non-standard

Calls `onFulfilled` or `onRejected` with the fulfillment value or
rejection reason of the promise (as appropriate).

Unlike `Promise.prototype.then` it does not return a Promise.  It will also throw any
errors that occur in the next tick, so they are not silenced.  In node.js they will then
crash your process (so it can be restarted in a clean state).  In browsers, this will cause
the error to be properly logged.

Note that `promise.done` has not been standardised. It is supported by most
major promise libraries though, and is useful for avoiding silencing errors by accident.
I recommend using it with the following polyfill (#[a(href="/polyfills/promise-done-" + versions.promise + ".min.js") minified] / #[a(href="/polyfills/promise-done-" + versions.promise + ".js") unminified]):

:html
  <script src="https://www.promisejs.org/polyfills/promise-done-#{versions.promise}.min.js"></script>

:js-example
  var Promise = require('promise');
  var p = Promise.resolve('foo');

  p.done(function (value) {
    console.log(value); // "foo"
  });

  p.done(function (value) {
    throw new Error('Ooops!'); // thrown in next tick
  });

:js-polyfill
  Promise.prototype.done = function (onFulfilled, onRejected) {
    var self = arguments.length ? this.then.apply(this, arguments) : this
    self.then(null, function (err) {
      setTimeout(function () {
        throw err
      }, 0)
    })
  }

###[Promise_prototype_finally] Promise.prototype.finally(onResolved) @non-standard

Some promise libraries implement a (non-standard) `.finally` method.  It takes a function,
which it calls whenever the promise is fulfilled or rejected.  It can be pollyfilled with:

:js-example
  var Promise = require('promise');
  var p = Promise.resolve('foo');
  var disposed = false;
  p.then(function (value) {
    if (Math.random() < 0.5) throw new Error('oops!');
    else return value;
  }).finally(function () {
    disposed = true; // always called
  }).then(function (value) {
    console.log(value); // => "foo"
  }, function (err) {
    console.log(err); // => oops!
  });

:js-polyfill
  Promise.prototype['finally'] = function (f) {
    return this.then(function (value) {
      return Promise.resolve(f()).then(function () {
        return value;
      });
    }, function (err) {
      return Promise.resolve(f()).then(function () {
        throw err;
      });
    });
  }

###[Promise_prototype_nodeify] Promise.prototype.nodeify(callback, ctx) @non-standard

Some promise implementations provide a `.nodeify` method to make it easier to ineroperate
with node.js code.  If the `callback` parameter is not a function, it simply returns the
promise without any changes.  If the callback is a function, it is called and `undefined`
is returned.

:js-example
  var Promise = require('promise');
  var readFile = Promise.denodeify(require('fs').readFile);

  // accepts an optional callback
  module.exports = function readJson(filename, callback) {
    return readFile(filename, 'utf8').then(JSON.parse).nodeify(callback);
  };

:js-polyfill
  Promise.prototype.nodeify = function (callback, ctx) {
    if (typeof callback != 'function') return this;

    this.then(function (value) {
      asap(function () {
        callback.call(ctx, null, value);
      });
    }, function (err) {
      asap(function () {
        callback.call(ctx, err);
      });
    });
  }

###[Promise_prototype_then] Promise.prototype.then(onFulfilled, onRejected)

Calls `onFulfilled` or `onRejected` with the fulfillment value or
rejection reason of the promise (as appropriate)
and returns a new promise resolving to the return value of the called handler.

If the handler throws an error, the returned Promise will be rejected with that error.

If the `onFulfilled` handler is not a function, it defaults to the identify function
(i.e. `function (value) { return value; }`).

If the `onRejected` handler is not a function, it defaults to a function that always throws
(i.e. `function (reason) { throw reason; }`).

:js-example
  var p1 = new Promise(function(resolve, reject) {
    resolve("Success!");
    // or
    // reject ("Error!");
  });

  p1.then(function(value) {
    console.log(value); // Success!
  }, function(reason) {
    console.log(reason); // Error!
  });

  var p2 = new Promise(function(resolve, reject) {
    resolve(1);
  });

  p2.then(function(value) {
    console.log(value); // 1
    return value + 1;
  }).then(function(value) {
    console.log(value); // 2
  });

##[apendix] Further Reading

 - [Promises Introduction](/) - explains why Promises are necessary and why we can't just use callbacks.
 - [Patterns](/patterns/) - patterns of promise use, introducing lots of helper methods that will save you time.
 - [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) - The mozilla developer network has great documentation on promises.

@pager
  @previous(href="/")
    introduction
  @next(href="/patterns/")
    patterns

