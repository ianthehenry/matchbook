"use strict";

let compile = require('./compile');
let AnyPattern = require('./any-pattern');

module.exports = (matchSetup) => {
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
