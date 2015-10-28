[![Build Status](https://travis-ci.org/kaelzhang/node-wrap-as-async.svg?branch=master)](https://travis-ci.org/kaelzhang/node-wrap-as-async)
<!-- optional npm version
[![NPM version](https://badge.fury.io/js/wrap-as-async.svg)](http://badge.fury.io/js/wrap-as-async)
-->
<!-- optional npm downloads
[![npm module downloads per month](http://img.shields.io/npm/dm/wrap-as-async.svg)](https://www.npmjs.org/package/wrap-as-async)
-->
<!-- optional dependency status
[![Dependency Status](https://david-dm.org/kaelzhang/node-wrap-as-async.svg)](https://david-dm.org/kaelzhang/node-wrap-as-async)
-->

# wrap-as-async

Utility method to wrap function into an asynchronous method using the common `this.async()` style.

## Install

```sh
$ npm install wrap-as-async --save
```

## Synopsis

```js
var wrap = require('wrap-as-async');

// Wrap a synchronous function into an asynchronous one.
// Or wrap a function that using the `this.async()` style 
//   into a normal asynchronous function.
// `wrapped` is an asynchronous function.
var wrapped = wrap(fn);

// The return value of function `wrapped` indicates
//   whether the original function is asynchronous,
//   which might be useful.
var is_async = wrapped(args, function(err, result){
  // The callback of either sync or async function
  //   will always has the `err` as the first argument. 
});
```

#### Wrap a sync method into async

```js
var wrapped = wrap(function (n){
  return n + 1;
});

var is_async = wrapped(1, function(err, result){
  console.log(err); // null
  console.log(result); // 2
});

is_async; // false
```

#### Wrap a function using `this.async()`

```js
var wrapped = wrap(function(n){
  var done = this.async();
  setTimeout(function(){
    if (n < 0) {
      return done(new Error('n should not less than 0'));
    }
    done(null, n + 1);
  }, 10)
});

var is_async = wrapped(1, function(err, result){
  console.log(err); // null
  console.log(result); // 2
});

is_async; // true

wrapped(-1, function(err){
  console.log(err); // Error
});
```

#### Asign `this` object by using `call`

```js
wrap(function(n){
  return n + this.base

}).call({
  base: 2
}, 1, function(err, result){
  // result -> 3
});


wrap(function(n){
  // You could still use `this.async()` even with `call`
  var done = this.async();
  var base = this.base;
  setTimeout(function(){
    done(null, n + base)
  }, 10)

}).call({
  base: 2
}, 1, function(err, result){
  // result -> 3
});
```

So that you can assign a `wrap()`ped method onto an object or a prototype object, which will be really helpful.

#### Multiple arguments and `done` result

```js
wrap(function(n, m){
  var done = this.async();
  done(null, n + 1, m + 1);

})(1, 2, function(err, result1, result2){
  // result1 -> 2
  // result2 -> 3
});
```

## Synchronous and asynchronous Methods

```js
function sync_method (arg...){
  return something 
}
```

If the method to be wrapped returns an instance of `Error`, it will be treated as a failure instead, or the `returnValue` will be the result.  

```js
function async_method (arg...) {
  var done = this.async();
  someAsyncProcess(function(...){
    ...
    done(err, result);
  });
}
```
You could use `this.async()` to turn the method into an asynchonous method, and `this.async` will return the callback function.

## License

MIT
