module.exports = function*(count, seq) {
  for (var x of seq) {
    if (count == 0) {
      break;
    }
    yield x;
    count--;
  }
}
