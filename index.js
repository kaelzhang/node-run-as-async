'use strict';

module.exports = wrap;

var clone = require('clone').clonePrototype;

function wrap (fn) {
  function async () {
    var self = Object(this) === this
      ? clone(this)
      : {};

    var args = make_array(arguments);
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


function make_array (args) {
  return Array.prototype.slice.call(args);
}
