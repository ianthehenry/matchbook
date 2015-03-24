"use strict";

module.exports = class PredicatePattern {
  constructor(pred) {
    this.matches = pred;
    Object.freeze(this);
  }
};
