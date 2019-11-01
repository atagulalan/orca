function styleFactory(obj) {
  return Object.keys(obj).map(key=>key+":"+obj[key]+";").join("");
}

function calcAngleDegrees(x, y) {
  return Math.atan2(y, x) * 180 / Math.PI;
}

function realHeight(y, angle) {
  return Math.abs(y);
}