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
    .tap(function(lyrics) {
      if (n>1)
        lyrics.push((n - 1) + " bottles of beer on the wall.");
      else
        lyrics.push("No more bottles of beer on the wall!");
    })
  .value();
}

function song(start, end, lyricGen) { 
  return _.reduce(_.range(start,end,-1),
    function(acc,n) {
      return acc.concat(lyricGen(n));
    }, []);
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

function interpose (inter, coll) {
  return butLast(mapcat(function(e) {
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
  return _.map(table, function(obj) {
    return _.pick.apply(null, construct(obj, keys));
  });
};

// SELECT ... AS
function rename(obj, newNames) {
  // reconstruct object using Underscore reduce
  // traverse over key/value pairs that preserves
  // "mappiness" of the accumulator
  return _.reduce(newNames, function(o, nu, old) {
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
  return _.map(table, function(obj) {
    return rename(obj, newNames);
  });
};

// WHERE 
function restrict(table, pred) {
  return _.reduce(table, function(newTable, obj) {
    if (truthy(pred(obj)))
      return newTable;
  else
    return _.without(newTable, obj);
  }, table); 
};

// Example chain
restrict(
  project(
    as(library, {ed: 'edition'}),
    ['title', 'isbn', 'edition']),
  function(book) {
    return book.edition > 1; 
});


// Equivalent SQL statement
// SELECT title, isbn, edition FROM (
//  SELECT ed AS edition FROM library
// ) EDS
// WHERE edition > 1;