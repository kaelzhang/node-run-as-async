'use strict';

module.exports = wrap;

function wrap (fn) {
  function async () {
    var self = Object(this) === this
      ? clone(this)
      : {};

    var args = Array.prototype.slice.call(arguments);
    var callback = args.pop();

    function done (err) {
      if (err) {
        return callback(err);
      }

      callback.apply(null, arguments);
    }

    var is_async;
    self.async = function () {
      is_async = true;
      return done;
    };

    var result = fn.apply(self, args);

    if (is_async) {
      return;
    }

    if (result instanceof Error) {
      return done(result);
    }

    done(null, result);
  }

  return async;
}

function clone (obj) {
  function F () {
  }
  F.prototype = obj;
  return new F;
}
