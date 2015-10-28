'use strict';

module.exports = wrap;

function wrap (fn) {
  var is_async = false;

  function async () {
    var self = Object(this) === this
      ? clone(this)
      : {};

    var args = Array.prototype.slice.call(arguments);
    var callback = args.pop();

    function done (err) {
      var args = arguments;

      function real_done () {
        if (err) {
          return callback(err);
        }

        callback.apply(null, args);
      }
      
      if (is_async) {
        setImmediate(real_done);
        return;
      }

      real_done();
    }

    var is_async;
    self.async = function () {
      is_async = true;
      return done;
    };

    var result = fn.apply(self, args);

    if (is_async) {
      return true;
    }

    if (result instanceof Error) {
      done(result);
    } else {
      done(null, result);
    }

    return false;
  }

  return async;
}

function clone (obj) {
  function F () {
  }
  F.prototype = obj;
  return new F;
}
