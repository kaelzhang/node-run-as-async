'use strict';

var expect = require('chai').expect;
var wrap = require('../');

require('es6-promise').polyfill();

var cases = [
{
  d: 'sync with no error',
  is_async: false,
  f: function (n) {
    return n + 1
  },
  e: 2
},
{
  d: 'sync with error',
  is_async: false,
  f: function (n) {
    return new Error('123')
  },
  err: true
},
{
  d: 'async with no error',
  is_async: true,
  f: function (n) {
    var done = this.async();
    setTimeout(function () {
      done(null, n + 1);
    })
  },
  e: 2
},
{
  d: 'async with error',
  is_async: true,
  f: function (n) {
    var done = this.async();
    setTimeout(function () {
      done(new Error('123'), n + 1);
    })
  },
  err: true
},
{
  d: 'sync call with context',
  is_async: false,
  f: function (n) {
    return n + this.n
  },
  c: {
    n: 1
  },
  e: 2
},
{
  d: 'async all with context',
  is_async: true,
  f: function (n) {
    var done = this.async();
    done(null, n + this.n)
  },
  c: {
    n: 1
  },
  e: 2
},
{
  d: 'sync multiple argument',
  is_async: false,
  f: function (n, m) {
    return n + m
  },
  e: 2
},
{
  d: 'async multiple argument and result',
  is_async: true,
  f: function (n, m) {
    var done = this.async();
    done(null, n, m);
  },
  e: function (err, n, m) {
    expect(err).to.equal(null);
    expect(n).to.equal(1);
    expect(m).to.equal(1);
  }
},
{
  d: 'you are late',
  is_async: false,
  f: function (n) {
    setTimeout(function(){
      this.async()();
    }.bind(this), 10)
  }
},
{
  d: '#1: if this.async() called, it should always returns true',
  is_async: true,
  f: function () {
    this.async()();
  }
},
{
  d: '#2: done should only calls once, immediate call',
  is_async: true,
  f: function (n) {
    var done = this.async();
    done(null, 1);
    done(null, 2);
    done(true, 3)
  },
  e: function (err, n) {
    expect(err).to.equal(null);
    expect(n).to.equal(1);
  }
},
{
  d: '#2: done should only calls once',
  is_async: true,
  f: function (n) {
    var done = this.async();
    setTimeout(function () {
      done(null, 1);
      done(null, 2);
      done(true, 3);
    }, 10);
  },
  e: function (err, n) {
    expect(err).to.equal(null);
    expect(n).to.equal(1);
  }
},
{
  d: '#4, vanilla Promise: Promise.resolve',
  is_async: true,
  f: function (n) {
    return Promise.resolve(n + 1)
  },
  e: function (err, n) {
    expect(err).to.equal(null)
    expect(n).to.equal(2)
  }
},
{
  d: '#4, vanilla Promise: Promise.reject',
  is_async: true,
  f: function (n) {
    return Promise.reject('blah')
  },
  e: function (err, n) {
    expect(err).to.equal('blah')
    expect(n).to.equal(2)
  }
},
{
  d: '#4, Promise-like object',
  is_async: true,
  f: function (n) {
    return {
      then: function (fn) {
        setTimeout(function () {
          fn(n + 1)
        }, 1)
      }
    }
  },
  e: function (err, n) {
    expect(err).to.equal('blah')
    expect(n).to.equal(2)
  }
}
];

describe("wrap()", function(){
  cases.forEach(function (c) {
    var i = c.only
      ? it.only
      : it;

    i(c.d, function(done){
      var wrapped = wrap(c.f);

      function callback (err, result) {
        done();

        if (typeof c.e === 'function') {
          return c.e.apply(null, arguments);
        }

        if (c.err) {
          expect(err).not.to.equal(null);
          return;
        }

        expect(err).to.equal(null);
        expect(result).to.equal(c.e);
      }

      var is_async;
      if (c.f.length === 2) {
        if (c.c) {
          is_async = wrapped.call(c.c, 1, 1, callback);
        } else {
          is_async = wrapped(1, 1, callback);
        }
        return;
      }

      if (c.c) {
        is_async = wrapped.call(c.c, 1, callback);
      } else {
        is_async = wrapped(1, callback);
      }

      expect(is_async).to.equal(c.is_async);
    });
  });

  it("#3, should not ignore other parameters", function(done){
    var wrapped = wrap(function () {
      var done = this.async();
      setTimeout(function () {
        done(1, 2);
      }, 10);
    });

    wrapped(function (a, b) {
      expect(a).to.equal(1);
      expect(b).to.equal(2);
      done()
    });
  });
});
