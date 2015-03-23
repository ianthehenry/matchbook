"use strict";

let AnyPattern = {};

class PredicatePattern {
  constructor(pred) {
    this.matches = pred;
    Object.freeze(this);
  }
}

let all = (list) => {
  for (let x of list) {
    if (!x) {
      return false;
    }
  }
  return true;
};

let zipWith = function*(f, list1, list2) {
  let len = Math.min(list1.length, list2.length);
  for (let i = 0; i < len; i++) {
    yield f(list1[i], list2[i]);
  }
};

let matches = function(pattern, target) {
  if (pattern === AnyPattern) return true;

  if (pattern === String)   return typeof target === 'string';
  if (pattern === Boolean)  return typeof target === 'boolean';
  if (pattern === Number)   return typeof target === 'number';
  if (pattern === Function) return typeof target === 'function';

  if (Array.isArray(pattern)) {
    return Array.isArray(target)
        && pattern.length === target.length
        && all(zipWith(matches, pattern, target));
  }

  if (pattern instanceof PredicatePattern) return pattern.matches(target);
  if (typeof pattern === 'function') return target instanceof pattern;

  return pattern === target;
};

let pattern = (matchSetup) => {
  if (typeof matchSetup !== 'function') {
    throw new Error("Pass a function to pattern.");
  }
  let patterns = [];

  let matchImplementation = function(pattern, implementation) {
    if (arguments.length === 0) {
      throw new Error("Cannot call match without arguments.");
    }
    if (arguments.length === 1) {
      implementation = pattern;
      pattern = AnyPattern;
    }
    if (typeof implementation !== 'function') {
      throw new Error("Final argument to match must be a function implementation.");
    }
    patterns.push([pattern, implementation]);
  };

  matchSetup(function() { matchImplementation.apply(this, arguments); });
  matchImplementation = () => {
    throw new Error("Cannot call match outside of a pattern invocation.");
  };

  return function(...args) {
    for (let [pattern, implementation] of patterns) {
      if (matches(pattern, args)) {
        return implementation.apply(this, args);
      }
    }
    throw new Error("No matching pattern");
  };
};

pattern.Any = AnyPattern;
pattern.If = (pred) => new PredicatePattern(pred);
pattern.Or = (pattern1, pattern2) => new PredicatePattern(x => matches(pattern1, x) || matches(pattern2, x));
pattern.And = (pattern1, pattern2) => new PredicatePattern(x => matches(pattern1, x) && matches(pattern2, x));
pattern.List = (pattern) => new PredicatePattern(list => {
  if (!list || !list[Symbol.iterator]) {
    return false;
  }
  for (let x of list) {
    if (!matches(pattern, x)) {
      return false;
    }
  }
  return true;
});
pattern.matches = matches;
pattern.overload = pattern;

module.exports = pattern;
