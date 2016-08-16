// #Chapter 1

function lessOrEqual(x, y) {
  return x <= y;
}

function comparator(pred) {
  return function (x, y) {
    if (truthy(pred(x, y))) return -1;
    else if (truthy(pred(y, x)))
      return 1; else
      return 0;
  };
};

function existy(x) { return x != null };

function truthy(x) { return (x !== false) && existy(x) };

// In JavaScript, it’s sometimes useful to perform some action only if a 
// condition is true and return something like undefined or null otherwise.
//  The general pattern is as follows:
//
// {
//   if(condition)
//     return _.isFunction(doSomething) ? doSomething() : doSomething; 
//   else
//     return undefined;
// }
//


// Functional "99 Bottles"
function lyricSegment(n) {
  return _.chain([])
    .push(n + " bottles of beer on the wall")
    .push(n + " bottles of beer")
    .push("Take one down, pass it around")
    .tap(function (lyrics) {
      if (n > 1)
        lyrics.push((n - 1) + " bottles of beer on the wall.");
      else
        lyrics.push("No more bottles of beer on the wall!");
    })
    .value();
}

function song(start, end, lyricGen) {
  return _.reduce(_.range(start, end, -1),
    function (acc, n) {
      return acc.concat(lyricGen(n));
    }, []);
}

// #Chapter 2

function average(array) {
  var sum = _.reduce(array, function (a, b) { return a + b });
  return sum / _.size(array);
}

// Application functions
// * Map
// * Reduce
// * Filter
// * reduceRight
// * Find
// * Reject (opposite of filter)
// * All 
// * Any 
// * sortBy 
// * groupBy
// * countBy

// Application-style cat
function mapcat(fun, coll) {
  return cat.apply(null, _.map(coll, fun));
}

// Example usage
// mapcat(function(e) {
//  return construct(e, [","]);
// }, [1,2,3]);
//=> [1, ",", 2, ",", 3, ","]


function butLast(coll) {
  return _.toArray(coll).slice(0, -1);
}

function interpose(inter, coll) {
  return butLast(mapcat(function (e) {
    return construct(e, [inter]);
  },
    coll));
}
// Example call
// interpose(",", [1,2,3]);
//=> [1, ",", 2, ",", 3]

// ##Manipulating Objects
// * _.keys
// * _.values
// * _.pluck
// * _.pairs
// * _.invert
// * _.defaults
// * _.pick <Object> => <Object>
// * _.omit
// * _.findWhere
// * _.where
// 
// Want to maintain abstractions with e.g. object queries

//  Stand in for SQL SELECT
function project(table, keys) {
  return _.map(table, function (obj) {
    return _.pick.apply(null, construct(obj, keys));
  });
};

// SELECT ... AS
function rename(obj, newNames) {
  // reconstruct object using Underscore reduce
  // traverse over key/value pairs that preserves
  // "mappiness" of the accumulator
  return _.reduce(newNames, function (o, nu, old) {
    if (_.has(obj, old)) {
      o[nu] = obj[old];
      return o;
    }
    else
      return o;
  },
    _.omit.apply(null, construct(obj, _.keys(newNames))));
};

function as(table, newNames) {
  return _.map(table, function (obj) {
    return rename(obj, newNames);
  });
};

// WHERE 
function restrict(table, pred) {
  return _.reduce(table, function (newTable, obj) {
    if (truthy(pred(obj)))
      return newTable;
    else
      return _.without(newTable, obj);
  }, table);
};

// Example chain
restrict(
  project(
    as(library, { ed: 'edition' }),
    ['title', 'isbn', 'edition']),
  function (book) {
    return book.edition > 1;
  });


// Equivalent SQL statement
// SELECT title, isbn, edition FROM (
//  SELECT ed AS edition FROM library
// ) EDS
// WHERE edition > 1;

// #Chapter 3
// ##Dynamic scope

var globals = {};

function makeBindFun(resolver) {
  return function (k, v) {
    var stack = globals[k] || [];
    globals[k] = resolver(stack, v);
    return globals;
  };
}

var stackBinder = makeBindFun(function (stack, v) {
  stack.push(v);
  return stack;
});

var stackUnbinder = makeBindFun(function (stack) {
  stack.pop();
  return stack;
});

var dynamicLookup = function (k) {
  var slot = globals[k] || [];
  return _.last(slot);
};

// In a dynamic scoping scheme, the value at the top of a stack in a binding is
// the current value. To retrieve the previous binding is as simple as 
// unbinding by popping the stack

function globalThis() { return this; }

globalThis();
//=> some global object, probably Window

globalThis.call('barnabas');
//=> 'barnabas'

globalThis.apply('orsulak', [])
//=> 'orsulak'

// _.bind lock the `this` reference from changing

var nopeThis = _.bind(globalThis, 'nope');

nopeThis.call('way');
// => 'nope';

// Use _.bindAll
var target = {
  name: 'the right value',
  aux: function () { return this.name; },
  act: function () { return this.aux(); }
};

target.act.call('wat');
// TypeError: Object [object String] has no method 'aux'

_.bindAll(target, 'aux', 'act');

target.act.call('wat');
//=> 'the right value'

// ##Closures

// Want to capture closed variables while maintaining access
function createWeirdScaleFunction(FACTOR) {
  return function (v) {
    this['FACTOR'] = FACTOR;
    var captures = this;
    return _.map(v, _.bind(function (n) {
      return (n * this['FACTOR']);
    }, captures));
  };
}
var scale10 = createWeirdScaleFunction(10);

scale10.call({}, [5, 6, 7]);
//=> [50, 60, 70];

// average defined above
function averageDamp(FUN) {
  return function (n) {
    return average([n, FUN(n)]);
  }
}

// ##Shadowing
// Shadowed variables are also carried along with closures

// ##Using Closures
// The PRED predicate is captured by the returned function
function complement(PRED) {
  return function () {
    return !PRED.apply(null, _.toArray(arguments));
  };
}
// Want to avoid this pattern using IIFE
// cannot access private variables within the scope

// ##Closures as an Abstraction
// Create a usable function based on configuration captured at creation

// #Chapter 4

// A higher-order function adheres to a very specific definition 
// * Takes a function as an argument
// * Returns a function as a result

// Use _.max on object by passing function that generates a numeric value

// _.identity(value) 
// Returns the same value that is used as the argument. In math: f(x) = x


function best(fun, coll) {
  return _.reduce(coll, function (x, y) {
    returnfun(x, y) ? x : y
  });
}

best(function (x, y) { return x > y }, [1, 2, 3, 4, 5]);
//=> 5

// ##More about passing functions

// Use functions, not values
// That is, while a func‐ tion that repeats a value some number of times is 
// good, a function that repeats a com‐ putation some number of times is better 

function repeatedly(times, fun) {
  return _.map(_.range(times), fun);
}

repeatedly(3, function () {
  return Math.floor((Math.random() * 10) + 1);
});

//=> [1, 3, 8]

// Defining repeatedly ablove still allows us to pass in a fixed value,
// just would have to be wrapped in a function

// Can make changes separate from input, generally this is not goof practice

// Choose not to pass in fixed calue for "times" above
function iterateUntil(fun, check, init) {
  var ret = [];
  var result = fun(init);
  while (check(result)) {
    ret.push(result); result = fun(result);
  }
  return ret;
};

iterateUntil(function (n) { return n + n }, function (n) { return n <= 1024 }, 1);
//=> [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024]

// iterateUntil is a "feed-foward" function: the result of some call to the 
// passed function is fed into the next call of the function as its argument

// ##Functions that return other Functions

// Denote a function returing a constant as "always"
function always(VALUE) {
  return function () {
    return VALUE;
  };
};

// important point about closures
var f = always(function () { });
f() === f();
//=> true

var g = always(function () { });
f() === g();
//=> false

// Use with repeatedly
repeatedly(3, always("Hello"));
//=> ["Hello","Hello","Hello"]

// invoker performs some action based on the value of the original call

function invoker(NAME, METHOD) {
  return function (target /* args ... */) {
    if (!existy(target)) fail("Must provide a target"); var targetMethod = target[NAME];
    var args = _.rest(arguments);
    return doWhen((existy(targetMethod) && METHOD === targetMethod), function () {
      return targetMethod.apply(target, args);
    });
  };
};