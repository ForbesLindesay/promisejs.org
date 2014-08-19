if (!Promise.prototype.done) {
  Promise.prototype.done = function (cb, eb) {
    var promise = (typeof cb === 'function' || typeof eb === 'function') ?
        this.then(cb, eb) : this;
    promise.then(null, function (err) {
      setTimeout(function () {
        throw err;
      }, 0);
    });
  };
}
