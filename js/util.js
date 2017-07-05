const Util = {

  // Generate random number within given range
  randomInt: function (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    result = Math.floor(Math.random() * (max - min + 1)) + min;
    return result;
  },

  // Calculate distance btwn 2 points
  calculateDist: function (x1, y1, x2, y2) {
    var withinRoot = Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2);
    var dist = Math.pow(withinRoot, 0.5);
    return dist;
  }
};
