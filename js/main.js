function draw(result, videoEl, canvas, ctx) {
	if (!result) return
	let canvasSize = 380

	let all = [...result.landmarks.positions]

	//BR : Before Rotation
	let highestPointBR = Math.min(...all.map((el) => el.y))
	let lowestPointBR = Math.max(...all.map((el) => el.y))
	let leftPointBR = Math.min(...all.map((el) => el.x))
	let rightPointBR = Math.max(...all.map((el) => el.x))

	let rotationAngle = 180 - calcAngleDegrees(all[0].x - all[16].x, all[0].y - all[16].y)
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

	//                   _   _
	//                  (_) | |
	//     __ _    ___   _  | |   __ _   _ __
	//    / _` |  / __| | | | |  / _` | | '__|
	//   | (_| | | (__  | | | | | (_| | | |
	//    \__,_|  \___| |_| |_|  \__,_| |_|
	//
	//

	var eyeDots = [
		intersect(
			scaledPoints[37].x,
			scaledPoints[37].y,
			scaledPoints[40].x,
			scaledPoints[40].y,
			scaledPoints[38].x,
			scaledPoints[38].y,
			scaledPoints[41].x,
			scaledPoints[41].y
		),
		intersect(
			scaledPoints[43].x,
			scaledPoints[43].y,
			scaledPoints[46].x,
			scaledPoints[46].y,
			scaledPoints[44].x,
			scaledPoints[44].y,
			scaledPoints[47].x,
			scaledPoints[47].y
		)
	]

	eyeDots.forEach((dots) => {
		if (dots) {
			ctx.strokeStyle = '#72B01D'
			ctx.beginPath()
			ctx.arc(dots.x, dots.y, 8, 0, 2 * Math.PI)
			ctx.stroke()
		}
	})

	//console.log(scaledPoints)

	let tipOfNose = scaledPoints[30],
		leftIris = eyeDots[0],
		rightIris = eyeDots[1],
		upperLip = scaledPoints[51],
		lowerLip = scaledPoints[57],
		leftLip = scaledPoints[48],
		rightLip = scaledPoints[54],
		middleLeftEyebrow = scaledPoints[19],
		middleRightEyebrow = scaledPoints[24],
		innerLeftEyebrow = scaledPoints[21],
		innerRightEyebrow = scaledPoints[22]

	let A1, A2, A3m, A3, A4, A5s, A5, A6s, A6

	// Burun ucu ile dudak kenarları arasındaki açı (ne kadar gülümsediğini anlar)
	A1 = calcAngleBetweenLines(
		leftLip.x,
		leftLip.y,
		tipOfNose.x,
		tipOfNose.y,
		tipOfNose.x,
		tipOfNose.y,
		rightLip.x,
		rightLip.y
	)

	// Dudak altı ile göz bebeği arasındaki açı (ağzını ne kadar açtığını anlar)
	A2 = calcAngleBetweenLines(
		leftIris.x,
		leftIris.y,
		scaledPoints[56].x,
		scaledPoints[56].y,
		scaledPoints[56].x,
		scaledPoints[56].y,
		rightIris.x,
		rightIris.y
	)

	// Göz bebeği ile kaş arasındaki açı (Kaşlarını ne kadar kaldırdığını / indirdiğini anlar)
	A3m = [
		calcAngleBetweenLines(
			middleLeftEyebrow.x,
			middleLeftEyebrow.y,
			leftIris.x,
			leftIris.y,
			leftIris.x,
			leftIris.y,
			innerLeftEyebrow.x,
			innerLeftEyebrow.y
		),
		calcAngleBetweenLines(
			middleRightEyebrow.x,
			middleRightEyebrow.y,
			rightIris.x,
			rightIris.y,
			rightIris.x,
			rightIris.y,
			innerRightEyebrow.x,
			innerRightEyebrow.y
		)
	]

	A3 = averageOf(A3m)

	// Kaşların uçları ile burnun ucu arasındaki açı (Kaş ucunun ne kadar yukarı baktığını anlar)
	A4 = calcAngleBetweenLines(
		innerLeftEyebrow.x,
		innerLeftEyebrow.y,
		tipOfNose.x,
		tipOfNose.y,
		tipOfNose.x,
		tipOfNose.y,
		innerRightEyebrow.x,
		innerRightEyebrow.y
	)

	// Dudağın altıyla dudağın üstü arasındaki açı (ağzını ne kadar büzdüğünü anlar)
	A5m = [
		calcAngleBetweenLines(
			upperLip.x,
			upperLip.y,
			leftLip.x,
			leftLip.y,
			leftLip.x,
			leftLip.y,
			lowerLip.x,
			lowerLip.y
		),
		calcAngleBetweenLines(
			upperLip.x,
			upperLip.y,
			rightLip.x,
			rightLip.y,
			rightLip.x,
			rightLip.y,
			lowerLip.x,
			lowerLip.y
		)
	]

	A5 = averageOf(A5m)

	// Dudak altı ile burun ucu arasındaki açı
	A6m = [
		calcAngleBetweenLines(
			tipOfNose.x,
			tipOfNose.y,
			leftLip.x,
			leftLip.y,
			leftLip.x,
			leftLip.y,
			lowerLip.x,
			lowerLip.y
		),
		calcAngleBetweenLines(
			tipOfNose.x,
			tipOfNose.y,
			rightLip.x,
			rightLip.y,
			rightLip.x,
			rightLip.y,
			lowerLip.x,
			lowerLip.y
		)
	]

	A6 = averageOf(A6m)

	pinPoint(1, A1)
	pinPoint(2, A2)
	pinPoint(3, A3)
	pinPoint(4, A4)
	pinPoint(5, A5)
	pinPoint(6, A6)

	checkEmotion()
}
