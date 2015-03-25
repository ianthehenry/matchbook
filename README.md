[![Build Status](https://travis-ci.org/ianthehenry/matchbook.svg)](https://travis-ci.org/ianthehenry/matchbook)

# Matchbook

Like `switch` on runtime steroids, for easily creating overloaded functions.

```coffeescript
# CoffeeScript
pattern = 'matchbook'

myFunc = pattern (match) ->
  # TODO: interesting example
```

```javascript
// ES 6
let pattern = require('matchbook');

let myFunc = pattern(match => {
  // TODO: interesting example
});
```

```javascript
// ES 5
var pattern = require('matchbook');

var myFunc = pattern(function(match) {
  // TODO: interesting example
});
```

# Patterns

Valid patterns are:

- "classes" (constructor functions)
    - The built-in functions `Number`, `String`, `Boolean`, `Function`, and `Array` are special-cased.
- arbitrary predicates: `If(x => x > 0)`
- arrays of patterns: `[String, Number, Int]`
- objects of patterns: `{ foo: String, bar: Function }`
- literal values: `1`, `null`, `true`, `void 0`, etc.

Note that the special-cased primitive patterns (like `Number` and `String`) only match primitive values (like `123` and `foo`), *not* boxed values (like `new Number(123)` and `new String('foo')`).

# API

Matchbook exports a function, which I'll call `pattern`.

```javascript
let pattern = require('matchbook');
```

Attached to `pattern` are some other functions:

- `pattern.compile(pattern)`
    - converts a pattern into a predicate -- a function that tests that pattern on the given value
    - this is not necessary if you're using the `pattern` function directly, but can be useful in other cases
- `pattern.Any`
     - a pattern that matches any value, including `undefined`
- `pattern.If(predicate)`
    - returns a predicate-based function
- `pattern.List(pattern)`
    - returns a pattern that matches on iterators (such as `Array`s, and generators) only if each element matches the supplied pattern
- `pattern.Or(pattern1, pattern2)`
    - returns a pattern that succeeds if either supplied pattern matches
- `pattern.And(pattern1, pattern2)`
    - returns a pattern that matches if both supplied patterns match
    - example: `And(Number, If(x => x > 0))`
- `pattern.overload`
    - a synonym for `pattern`, for more convenient destructuring imports.

### Extracting values from patterns

This is not supported, and cannot be implemented in vanilla JavaScript without some horrible abuse of `eval`. If it's an option for you, consider a [SweetJS]()-based pattern matcher like [Sparkler](https://github.com/natefaubion/sparkler) instead.

### Default values, spreads, and views

There is no support yet for default values of functions, nor for spreads, nor for [views](https://ghc.haskell.org/trac/ghc/wiki/ViewPatterns). But these would not be hard to add, and I'd be happy to do so if there's interest. Or I'll just go ahead and do it if I encounter a need myself.

### Compatibility

Matchbook will not work in IE 8 or below.

### [Changelog](./CHANGELOG.md)
### [License](./LICENSE)
