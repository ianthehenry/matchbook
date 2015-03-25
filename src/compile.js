"use strict";

let all = require('./all');
let PredicatePattern = require('./predicate-pattern');

let zipSameLength = function*(list1, list2) {
  for (let i = 0; i < list1.length; i++) {
    yield [list1[i], list2[i]];
  }
};

let call = ([f, x]) => f(x);

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
  } else if (pattern === String) {
    return isString;
  } else if (pattern === Boolean) {
    return isBoolean;
  } else if (pattern === Number) {
    return isNumber;
  } else if (pattern === Function) {
    return isFunction;
  } else if (pattern === Array) {
    return Array.isArray;
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

module.exports = compile;
