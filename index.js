'use strict'

module.exports = wrap

var _setImmediate = typeof setImmediate === 'function'
  ? setImmediate
  : function (fn) {
    setTimeout(fn, 0)
  }


function wrap (fn) {
  var is_async = false

  function async () {
    var self = Object(this) === this
      ? clone(this)
      : {}

    var args = Array.prototype.slice.call(arguments)
    var callback = args.pop()

    var already_done
    function done (err) {
      if (already_done) {
        return
      }

      already_done = true

      var args = arguments

      function real_done () {
        callback.apply(null, args)
      }

      if (is_async) {
        // if is async method, always set timer
        // so that we could get the return value of `is_async`.
        _setImmediate(real_done)
        return
      }

      real_done()
    }

    var is_async
    self.async = function () {
      is_async = true
      return done
    }

    var result = fn.apply(self, args)

    if (is_async) {
      return true
    }

    // It is not that easy to detect if a value is:
    // - a vanilla `Promise`
    // - or a polyfilled `Promise`
    // - or a `Promise`-like object
    // So, just detect if it has a method `then`
    if (typeof result.then === 'function') {
      _setImmediate(function (){
        result.then(
          function (value){
            done(null, value)
          },

          function (err) {
            done(err)
          }
        )
      })

      return true
    }

    if (result instanceof Error) {
      done(result)
    } else {
      done(null, result)
    }

    return false
  }

  return async
}


function clone (obj) {
  function F () {
  }
  F.prototype = obj
  return new F
}
