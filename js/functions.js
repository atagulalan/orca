function styleFactory(obj) {
	return Object.keys(obj)
		.map((key) => key + ':' + obj[key] + ';')
		.join('')
}

function calcAngleDegrees(x, y) {
	return (Math.atan2(y, x) * 180) / Math.PI
}

function calcAngleBetweenLines(x1, y1, x2, y2, x3, y3, x4, y4) {
	//find vector components
	var dAx = x2 - x1
	var dAy = y2 - y1
	var dBx = x4 - x3
	var dBy = y4 - y3
	var angle = Math.atan2(dAx * dBy - dAy * dBx, dAx * dBx + dAy * dBy)
	if (angle < 0) {
		angle = angle * -1
	}
	return angle * (180 / Math.PI)
}

// http://paulbourke.net/geometry/pointlineplane/javascript.txt
// line intercept math by Paul Bourke http://paulbourke.net/geometry/pointlineplane/
// Determine the intersection point of two line segments
// Return FALSE if the lines don't intersect
function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
	// Check if none of the lines are of length 0
	if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
		return false
	}

	denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1)

	// Lines are parallel
	if (denominator === 0) {
		return false
	}

	let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
	let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator

	// is the intersection along the segments
	if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
		return false
	}

	// Return a object with the x and y coordinates of the intersection
	let x = x1 + ua * (x2 - x1)
	let y = y1 + ua * (y2 - y1)

	return { x, y }
}

function averageOf(elmt) {
	var sum = 0
	for (var i = 0; i < elmt.length; i++) {
		sum += parseInt(elmt[i], 10) //don't forget to add the base
	}

	return sum / elmt.length
}

function averageOfArray(arr1, arr2) {
	if (arr1.length !== arr2.length) {
		return false
	}

	return arr1.map((ar1el, idx) => {
		let ar2el = arr2[idx]
		return ar1el + ar2el / 2
	})
}

function rotate(cx, cy, x, y, angle) {
	var radians = (Math.PI / 180) * angle,
		cos = Math.cos(radians),
		sin = Math.sin(radians),
		nx = cos * (x - cx) + sin * (y - cy) + cx,
		ny = cos * (y - cy) - sin * (x - cx) + cy
	return [Math.round(nx * 10000) / 10000, Math.round(ny * 10000) / 10000]
}
