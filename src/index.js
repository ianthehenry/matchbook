"use strict";

let AnyPattern = {};

class PredicatePattern {
  constructor(pred) {
    this.matches = pred;
    Object.freeze(this);
  }
}

let all = (f, list) => {
  if (!list || !list[Symbol.iterator]) {
    return false;
  }

  for (let x of list) {
    if (!f(x)) {
      return false;
    }
  }
  return true;
};

let zipSameLength = function*(list1, list2) {
  for (let i = 0; i < list1.length; i++) {
    yield [list1[i], list2[i]];
  }
};

let call = ([f, x]) => f(x);

let constTrue = () => true;
let isString = x => typeof x === 'string';
let isBoolean = x => typeof x === 'boolean';
let isNumber = x => typeof x === 'number';
let isFunction = x => typeof x === 'function';

let compile;

let compileArray = pattern => {
  let predicates = pattern.map(compile);
  return target => {
    return Array.isArray(target)
        && pattern.length === target.length
        && all(call, zipSameLength(predicates, target));
  };
};

let compileObject = pattern => {
  let compiled = [];
  for (let key in pattern) {
    if (pattern.hasOwnProperty(key)) {
      compiled.push([key, compile(pattern[key])]);
    }
  }
  return target => {
    if (typeof target !== 'object') {
      return false;
    }
    for (let [key, pattern] of compiled) {
      if (!(key in target) || !pattern(target[key])) {
        return false;
      }
    }
    return true;
  };
};

compile = (pattern) => {
  if (pattern instanceof PredicatePattern) {
    return pattern.matches;
  } else if (pattern === AnyPattern) {
    return constTrue;
  } else if (pattern === String) {
    return isString;
  } else if (pattern === Boolean) {
    return isBoolean;
  } else if (pattern === Number) {
    return isNumber;
  } else if (pattern === Function) {
    return isFunction;
  } else if (Array.isArray(pattern)) {
    return compileArray(pattern);
  } else if (typeof pattern === 'object') {
    return compileObject(pattern);
  } else if (typeof pattern === 'function') {
    return x => x instanceof pattern;
  } else {
    return x => x === pattern;
  }
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
    patterns.push([compile(pattern), implementation]);
  };

  matchSetup(function() { matchImplementation.apply(this, arguments); });
  matchImplementation = () => {
    throw new Error("Cannot call match outside of a pattern invocation.");
  };

  return function(...args) {
    for (let [pattern, implementation] of patterns) {
      if (pattern(args)) {
        return implementation.apply(this, args);
      }
    }
    throw new Error("No matching pattern");
  };
};

pattern.Any = AnyPattern;
pattern.If = (pred) => new PredicatePattern(pred);
pattern.Or = (pattern1, pattern2) => {
  pattern1 = compile(pattern1);
  pattern2 = compile(pattern2);
  return new PredicatePattern(x => pattern1(x) || pattern2(x));
};
pattern.And = (pattern1, pattern2) => {
  pattern1 = compile(pattern1);
  pattern2 = compile(pattern2);
  return new PredicatePattern(x => pattern1(x) && pattern2(x));
};
pattern.List = (pattern) => new PredicatePattern(list => all(compile(pattern), list));
pattern.compile = compile;
pattern.overload = pattern;

module.exports = pattern;
