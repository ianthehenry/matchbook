"use strict";

module.exports = (f, list) => {
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
