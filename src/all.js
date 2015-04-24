"use strict";

module.exports = (f, list) => {
  for (let x of list) {
    if (!f(x)) {
      return false;
    }
  }
  return true;
};
