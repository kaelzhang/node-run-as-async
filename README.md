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

Utility method to wrap function either synchronously or asynchronously into an async method using the common this.async() style.

## Install

```sh
$ npm install wrap-as-async --save
```

## Usage

```js
var wrap = require('wrap-as-async');
```

### Wrap a sync method into async

```
var wrapped = wrap(function (n){
  return n + 1;
});

wrapped(1, function(err, result){
  console.log(err); // null
  console.log(result); // 2
});
```

### Wrap a function using `this.async()`

```js
var wrapped = wrap(function(n){
  var done = this.async();
  setTimeout(function(){
    if (n < 0) {
      return new Error('n should not less than 0')
    }
    done(null, n + 1);
  }, 10)
});

wrapped(1, function(err, result){
  console.log(err); // null
  console.log(result); // 2
});

wrapped(-1, function(err){
  console.log(err); // Error
});
```

### Asign `this` object by using `call`

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

So that you can assign a `wrap()`ped method onto an object, which will be really helpful.

### Multiple arguments and `done` result

wrap(function(n, m){
  var done = this.async();
  done(null, n + 1, m + 1);

})(1, 2, function(err, result1, result2){
  // result1 -> 2
  // result2 -> 3
});

## License

MIT
