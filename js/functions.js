function styleFactory(obj) {
	return Object.keys(obj)
		.map((key) => key + ':' + obj[key] + ';')
		.join('')
}

function calcAngleDegrees(x, y) {
	return (Math.atan2(y, x) * 180) / Math.PI
}

function rotate(cx, cy, x, y, angle) {
	var radians = (Math.PI / 180) * angle,
		cos = Math.cos(radians),
		sin = Math.sin(radians),
		nx = cos * (x - cx) + sin * (y - cy) + cx,
		ny = cos * (y - cy) - sin * (x - cx) + cy
	return [Math.round(nx * 10000) / 10000, Math.round(ny * 10000) / 10000]
}
