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
			ctx.strokeStyle = '#27FB6B'
			ctx.stroke()
			ctx.beginPath()
			ctx.moveTo(Math.round(point.x), Math.round(point.y))
		}
		ctx.lineTo(Math.round(point.x), Math.round(point.y))
	})

	ctx.strokeStyle = '#27FB6B'
	ctx.stroke()

	//                       _
	//                      | |
	//     __ _    ___   _  | |   __ _   _ __
	//    / _` |  / __| | | | |  / _` | | '__|
	//   | (_| | | (__  | | | | | (_| | | |
	//    \__,_|  \_  | |_| |_|  \__,_| |_|
	//             \_\
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
			ctx.strokeStyle = '#27FB6B'
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

	// Show intersection points on the chart
	pinPoint(1, A1)
	pinPoint(2, A2)
	pinPoint(3, A3)
	pinPoint(4, A4)
	pinPoint(5, A5)
	pinPoint(6, A6)

	// Check current emotion using rulebase
	checkEmotion()
}

let rulebase = {
	HAPPY: [
		{ A1: 'SMALL', A2: 'SMALL', A3: 'MEDIUM', A4: 'MEDIUM', A5: 'LARGE', A6: 'LARGE' },
		{ A1: 'SMALL', A2: 'MEDIUM', A3: 'MEDIUM', A4: 'MEDIUM', A5: 'LARGE', A6: 'LARGE' }
	],
	NEUTRAL: [
		{ A1: 'MEDIUM', A2: 'MEDIUM', A3: 'MEDIUM', A4: 'MEDIUM', A5: 'LARGE', A6: 'MEDIUM' },
		{ A1: 'MEDIUM', A2: 'MEDIUM', A3: 'MEDIUM', A4: 'MEDIUM', A5: 'LARGE', A6: 'LARGE' }
	],
	SAD: [
		{ A1: 'MEDIUM', A2: 'MEDIUM', A3: 'LARGE', A4: 'MEDIUM', A5: 'LARGE', A6: 'MEDIUM' },
		{ A1: 'MEDIUM', A2: 'MEDIUM', A3: 'LARGE', A4: 'LARGE', A5: 'LARGE', A6: 'MEDIUM' }
	],
	SURPRISED: [
		{ A1: 'LARGE', A2: 'LARGE', A3: 'LARGE', A4: 'MEDIUM', A5: 'MEDIUM', A6: 'SMALL' },
		{ A1: 'LARGE', A2: 'LARGE', A3: 'LARGE', A4: 'LARGE', A5: 'SMALL', A6: 'SMALL' }
	]
}

function getMax(tId) {
	if (Object.keys(IntersectionDatabase[tId]).length > 0) {
		let maxIntersect = Object.keys(IntersectionDatabase[tId]).reduce((a, b) =>
			IntersectionDatabase[tId][a] > IntersectionDatabase[tId][b] ? a : b
		)
		return maxIntersect
	}
	return 0
}

function textify(point) {
	let TEXTS = {
		μ0: 'SMALL',
		μ1: 'MEDIUM',
		μ2: 'LARGE'
	}
	return TEXTS[point]
}

function muify(text) {
	let MU = {
		SMALL: 'μ0',
		MEDIUM: 'μ1',
		LARGE: 'μ2'
	}
	return MU[text]
}

function fie(emotion) {
	let ruleArray = []

	rulebase[emotion].forEach((rule) => {
		Object.keys(rule).forEach((key, idx) => {
			let value = rule[key]
			ruleArray[idx] = IntersectionDatabase[key][muify(value)] ? IntersectionDatabase[key][muify(value)] : 0
		})
	})

	if (ruleArray.length > 0) {
		// TODO?
		return Math.min(...ruleArray)
	}
	return 0
}

function changeOutputChart() {
	outputChart.myChart.data = createDatasetFromMembership(() => {
		let [SADLIMIT, NEUTRALLIMIT, HAPPYLIMIT, SURPRISEDLIMIT] = [
			fie('SAD'),
			fie('NEUTRAL'),
			fie('HAPPY'),
			fie('SURPRISED')
		]

		return {
			SAD: limitMax(trimf([0, 45, 90]), SADLIMIT),
			NEUTRAL: limitMax(trimf([70, 90, 110]), NEUTRALLIMIT),
			HAPPY: limitMax(trimf([90, 135, 180]), HAPPYLIMIT),
			SURPRISED: limitMax(trimf([30, 90, 150]), SURPRISEDLIMIT)
		}
	}, [...mainColors]).ordersChartData

	outputChart.myChart.update()
}

function defuzzify() {
	let maxData = new Array(xPrecision).fill(0)
	let whos = new Array(xPrecision).fill('')
	outputChart.myChart.data.datasets.forEach((el) => {
		el.data.forEach((val, i) => {
			if (maxData[i] < val) {
				maxData[i] = val
				whos[i] = el.label
			}
		})
	})

	// (discrete) center of gravity
	let ns = {}
	whos.forEach((who, idx) => {
		if (ns[who] === undefined) {
			ns[who] = 0
		}

		ns[who] = ns[who] + maxData[idx]
	})

	delete ns['']

	let sum = 0
	Object.values(ns).forEach((val) => {
		sum += val
	})
	Object.keys(ns).forEach((key) => {
		ns[key] = parseFloat(ns[key] / sum).toPrecision(4)
	})

	return ns
}

function checkEmotion(crisp) {
	let convertedRuleBase = []
	Object.keys(rulebase).forEach((key) => {
		rulebase[key].forEach((obj) => {
			convertedRuleBase.push({ emotion: key, ...obj })
		})
	})

	if (crisp) {
		let now = getCurrentFuzzyCluster()
		convertedRuleBase.forEach((old) => {
			if (
				old.A1 === now.A1 &&
				old.A2 === now.A2 &&
				old.A3 === now.A3 &&
				old.A4 === now.A4 &&
				old.A5 === now.A5 &&
				old.A6 === now.A6
			) {
				document.getElementById('emotion').innerHTML = old.emotion
			} else {
				document.getElementById('emotion').innerHTML += ''
			}
		})
	} else {
		changeOutputChart()
		let percentages = defuzzify()

		if (Object.keys(percentages).length) {
			let winner = Object.keys(percentages).reduce((a, b) => (percentages[a] > percentages[b] ? a : b))
			document.getElementById('emotion').innerText = `${winner}\n${parseFloat(percentages[winner]).toFixed(2)}`
		}
	}
}

function getCurrentFuzzyCluster() {
	let k = {}
	for (let i = 0; i < 6; i++) {
		k['A' + (i + 1)] = textify(getMax('A' + (i + 1)))
	}
	return k
}

function getCurrentValues(Ax) {
	return IntersectionDatabase[Ax]
}

function getCurrentDegree(Ax) {
	let get = (u) => (DegreeDatabase[Ax][u] ? DegreeDatabase[Ax][u] : -1)
	let values = [get('μ0'), get('μ1'), get('μ2')]
	return Math.max(...values)
}

function printEmotionCluster() {
	console.log(JSON.stringify(getCurrentFuzzyCluster()))
}

let boundaries = { A1: [38, 136], A2: [128, 152], A3: [90, 148], A4: [138, 150], A5: [70, 156], A6: [54, 128] }
let boundaryInterval

function startLimitBoundaries() {
	boundaries = {
		A1: [180, 0],
		A2: [180, 0],
		A3: [180, 0],
		A4: [180, 0],
		A5: [180, 0],
		A6: [180, 0]
	}
	boundaryInterval = setInterval(function() {
		for (let i = 1; i <= 6; i++) {
			let curVal = getCurrentDegree('A' + i)
			console.log(curVal)
			if (boundaries['A' + i][0] > curVal) {
				boundaries['A' + i][0] = curVal
			}
			if (boundaries['A' + i][1] < curVal) {
				boundaries['A' + i][1] = curVal
			}
		}
		console.log(boundaries)
	}, 10)
}

function stopLimitBoundaries() {
	clearInterval(boundaryInterval)
	//round up numbers
	for (let i = 1; i <= 6; i++) {
		boundaries['A' + i][0] = Math.floor(boundaries['A' + i][0] / 2) * 2
		boundaries['A' + i][1] = Math.ceil(boundaries['A' + i][1] / 2) * 2
	}
	setBoundaries()
}

function setBoundaries() {
	inputCharts.forEach((chart, idx) => {
		let membership = () => {
			let [min, max] = [boundaries[chart.cId][0], boundaries[chart.cId][1]]
			let [SMALL, MEDIUM, LARGE] = [
				trapmf([0, 0, min, (max + min) / 2]),
				trimf([min, (min + max) / 2, max]),
				trapmf([(max + min) / 2, max, 180, 180])
			]

			return {
				μ0: SMALL,
				μ1: MEDIUM,
				μ2: LARGE
			}
		}

		chart.myChart.data = createDatasetFromMembership(membership, [...mainColors]).ordersChartData
		chart.myChart.update()
		inputCharts[idx].MFS = convertArrayToObject(membership())
	})
}

function pushIfNotExists(arr, obj) {
	let g = (o, t) => o[t]['text']
	let c = (o1, o2, over) => g(o1, over) === g(o2, over)
	let maxBy = (over, o1, o2) => (o1[over].by > o2[over].by ? o1[over].by : o2[over].by)
	let existant
	arr.some((el, idx) => {
		if (
			c(el, obj, 'A1') &&
			c(el, obj, 'A2') &&
			c(el, obj, 'A3') &&
			c(el, obj, 'A4') &&
			c(el, obj, 'A5') &&
			c(el, obj, 'A6')
		) {
			existant = [idx, el]
			return true
		}
	})
	if (existant) {
		// en yüksek kestiği değeri döndür
		existant[1] = {
			A1: { text: g(existant[1], 'A1'), by: maxBy('A1', existant[1], obj) },
			A2: { text: g(existant[1], 'A2'), by: maxBy('A2', existant[1], obj) },
			A3: { text: g(existant[1], 'A3'), by: maxBy('A3', existant[1], obj) },
			A4: { text: g(existant[1], 'A4'), by: maxBy('A4', existant[1], obj) },
			A5: { text: g(existant[1], 'A5'), by: maxBy('A5', existant[1], obj) },
			A6: { text: g(existant[1], 'A6'), by: maxBy('A6', existant[1], obj) }
		}
		return ['update', ...existant]
	} else {
		return ['add', obj]
	}
}

let learnedEmotionRulebase = {}
let learnInterval

function startLearningEmotion(emotion) {
	learnedEmotionRulebase[emotion] = []
	learnInterval = setInterval(
		function() {
			let cfc = getCurrentFuzzyCluster()
			for (let i = 1; i <= 6; i++) {
				cfc['A' + i] = { text: cfc['A' + i], by: getCurrentValues('A' + i)[getMax('A' + i)] }
			}
			let decision = pushIfNotExists(learnedEmotionRulebase[emotion], cfc)
			if (decision[0] === 'add') {
				learnedEmotionRulebase[emotion].push(decision[1])
			} else if (decision[0] === 'update') {
				learnedEmotionRulebase[emotion][decision[1]] = decision[2]
			}
		}.bind(emotion),
		10
	)
}

function stopLearningEmotion() {
	clearInterval(learnInterval)
}

function saveLearnedEmotion() {
	// compare emotions, if any of them has duplicate, compare by values and
	// calculate differences. If differences sum is negative, remove a's rule,
	// if sum is positive, remove b's rule. By doing that, you achieve probable
	// outcome by values.

	let unbiasedRulebase = []

	Object.keys(learnedEmotionRulebase).forEach((key) => {
		let rules = learnedEmotionRulebase[key]
		rules.forEach((values) => {
			values['emotion'] = key

			let found
			unbiasedRulebase.some((rule, idx) => {
				if (
					values['A1'] === rule['A1'] &&
					values['A2'] === rule['A2'] &&
					values['A3'] === rule['A3'] &&
					values['A4'] === rule['A4'] &&
					values['A5'] === rule['A5'] &&
					values['A6'] === rule['A6']
				) {
					console.log(values)
					found = { rule, idx }
					return true
				}
			})

			if (found) {
				let average = 0
				console.log(found)
				average += found.rule['A1'].by - values['A1']
				average += found.rule['A2'].by - values['A2']
				average += found.rule['A3'].by - values['A3']
				average += found.rule['A4'].by - values['A4']
				average += found.rule['A5'].by - values['A5']
				average += found.rule['A6'].by - values['A6']
				// TODO CONTROL
				if (average < 0) {
					learnedEmotionRulebase[found.idx] = values
				}
			} else {
				unbiasedRulebase.push({ ...values, emotion: key })
			}
		})
	})

	let newRulebase = {
		SAD: [],
		NEUTRAL: [],
		HAPPY: [],
		SURPRISED: []
	}

	unbiasedRulebase.forEach((el) => {
		if (newRulebase[el.emotion] === undefined) {
			newRulebase[el.emotion] = []
		}
		newRulebase[el.emotion].push({
			A1: el.A1.text,
			A2: el.A2.text,
			A3: el.A3.text,
			A4: el.A4.text,
			A5: el.A5.text,
			A6: el.A6.text
		})
	})

	rulebase = newRulebase
}
