function draw(result, videoEl, canvas, ctx) {
	if (!result) return
	let canvasSize = 380

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

	//BR : Before Rotation
	let highestPointBR = Math.min(...all.map((el) => el.y))
	let lowestPointBR = Math.max(...all.map((el) => el.y))
	let leftPointBR = Math.min(...all.map((el) => el.x))
	let rightPointBR = Math.max(...all.map((el) => el.x))

	let rotationAngle = 180 - calcAngleDegrees(jaw[0].x - jaw[16].x, jaw[0].y - jaw[16].y)
	let rotateOrigin = [(leftPointBR + rightPointBR) / 2, (highestPointBR + lowestPointBR) / 2]

	let rotatedPoints = all.map((point) => {
		let rotatedPoints = rotate(rotateOrigin[0], videoEl.height - rotateOrigin[1], point.x, point.y, -rotationAngle)
		return {
			x: rotatedPoints[0],
			y: rotatedPoints[1]
		}
	})

	let highestPoint = Math.min(...rotatedPoints.map((el) => el.y))
	let lowestPoint = Math.max(...rotatedPoints.map((el) => el.y))
	let leftPoint = Math.min(...rotatedPoints.map((el) => el.x))
	let rightPoint = Math.max(...rotatedPoints.map((el) => el.x))

	// check if rotated correctly. If close to zero, it rotated correctly.
	//console.log(Math.abs(rotatedPoints[0].y - rotatedPoints[16].y))

	let trimmedPoints = rotatedPoints.map((point) => {
		return {
			x: point.x - leftPoint,
			y: point.y - highestPoint
		}
	})

	// check if how close the face is to camera
	//console.log(trimmedAll[16].x - trimmedAll[0].x)

	let scaleFactor = canvasSize / (Math.max(rightPoint - leftPoint, highestPoint - lowestPoint) + 25)

	let scaledPoints = trimmedPoints.map((point) => {
		return {
			x: point.x * scaleFactor + 70,
			y: point.y * scaleFactor + 50
		}
	})

	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.beginPath()
	ctx.moveTo(scaledPoints[0].x, scaledPoints[0].y)
	let stopArr = [17, 22, 27, 36, 42, 48, 55, 60, 68]
	let afterStopArr = [16, 17, 22, 30, 36, 42, 55, 48, 60]

	scaledPoints.concat({ x: scaledPoints[67].x, y: scaledPoints[67].y }).forEach((point, i) => {
		if (stopArr.includes(i)) {
			ctx.lineTo(
				Math.round(scaledPoints[afterStopArr[stopArr.findIndex((e) => e === i)]].x),
				Math.round(scaledPoints[afterStopArr[stopArr.findIndex((e) => e === i)]].y)
			)
			ctx.strokeStyle = '#72B01D'
			ctx.stroke()
			ctx.beginPath()
			ctx.moveTo(Math.round(point.x), Math.round(point.y))
		}
		ctx.lineTo(Math.round(point.x), Math.round(point.y))
	})

	ctx.strokeStyle = '#72B01D'
	ctx.stroke()
}
