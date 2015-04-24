"use strict";

let PredicatePattern = require('./predicate-pattern');
let overload = require('./overload');
let compile = require('./compile');
let all = require('./all');

overload.Any = require('./any-pattern');
overload.If = (pred) => new PredicatePattern(pred);
overload.Or = (pattern1, pattern2) => {
  pattern1 = compile(pattern1);
  pattern2 = compile(pattern2);
  return new PredicatePattern(x => pattern1(x) || pattern2(x));
};
overload.And = (pattern1, pattern2) => {
  pattern1 = compile(pattern1);
  pattern2 = compile(pattern2);
  return new PredicatePattern(x => pattern1(x) && pattern2(x));
};

let isList = x => Array.isArray(x) || (typeof Symbol !== 'undefined' && x[Symbol.iterator]);

overload.List = (pattern) => new PredicatePattern(list => isList(list) && all(compile(pattern), list));
overload.compile = compile;
overload.overload = overload;

module.exports = overload;
