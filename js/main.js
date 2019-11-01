function draw(result, dims) {
	let all = [...result.landmarks.positions]
	let mouth = result.landmarks.positions.splice(48, 68)
	let rEye = result.landmarks.positions.splice(42, 48)
	let lEye = result.landmarks.positions.splice(36, 42)
	let nose = result.landmarks.positions.splice(27, 36)
	let rEyebrow = result.landmarks.positions.splice(22, 27)
	let lEyebrow = result.landmarks.positions.splice(17, 22)
	let jaw = result.landmarks.positions.splice(0, 17)
	let eyebrows = lEyebrow.concat(rEyebrow)
	let eyes = lEye.concat(rEye)

	let highestPoint = Math.min(...eyebrows.map((el) => el.y))
	let lowestPoint = Math.max(...jaw.map((el) => el.y))
	let leftPoint = Math.min(...all.map((el) => el.x))
	let rightPoint = Math.max(...all.map((el) => el.x))

	let maxCircleRadius = Math.max(lowestPoint - highestPoint, rightPoint - leftPoint)

	let rotationAngle = 180 - calcAngleDegrees(jaw[0].x - jaw[16].x, jaw[0].y - jaw[16].y)
	rotationAngle = rotationAngle < 180 ? rotationAngle + 360 : rotationAngle

	document.getElementById('wrapper').style.cssText = styleFactory({
		transform: `rotate(${rotationAngle}deg)`,
		'transform-origin': `${(leftPoint + rightPoint) / 2}px ${(highestPoint + lowestPoint) / 2}px`
	})

	/*
	document.getElementById('highPoint').style.cssText = styleFactory({
		top: `${Math.round(highestPoint)}px`
	})

	document.getElementById('lowPoint').style.cssText = styleFactory({
		top: `${Math.round(lowestPoint)}px`
	})

	document.getElementById('leftPoint').style.cssText = styleFactory({
		left: `${Math.round(leftPoint)}px`
	})

	document.getElementById('rightPoint').style.cssText = styleFactory({
		left: `${Math.round(rightPoint)}px`
	})
  */

	document.getElementById('fitter').style.cssText = styleFactory({
		top: `${-((highestPoint + lowestPoint) / 2) + maxCircleRadius / 1.5}px`,
		left: `${-((leftPoint + rightPoint) / 2) + maxCircleRadius / 1.5}px`
	})

	document.getElementById('hider').style.cssText = styleFactory({
		width: `${(maxCircleRadius * 4) / 3}px`,
		height: `${(maxCircleRadius * 4) / 3}px`,
		transform: `scale(${250 / (maxCircleRadius / 1.5)})`
	})

	/*
	document.getElementById('inputVideo').style.cssText = styleFactory({
		'clip-path': `circle(${maxCircleRadius / 1.6}px at ${(leftPoint + rightPoint) / 2}px ${(highestPoint +
			lowestPoint) /
			2}px)`
  })
  */
}
