var colors = [
	'#8BC34A',
	'#7CB342',
	'#689F38',
	'#80CBC4',
	'#26A69A',
	'#00897B',
	'#B2FF59',
	'#C6FF00',
	'#AEEA00',
	'#64FFDA',
	'#1DE9B6',
	'#00BFA5',
	'#66BB6A',
	'#43A047',
	'#2E7D32',
	'#69F0AE',
	'#00E676',
	'#00C853'
]

let rulebase = {
	HAPPY: [
		{ a0: 'SMALL', a1: 'MEDIUM', a2: 'MEDIUM', a3: 'MEDIUM', a4: 'LARGE', a5: 'LARGE' },
		{ a0: 'SMALL', a1: 'MEDIUM', a2: 'LARGE', a3: 'LARGE', a4: 'LARGE', a5: 'LARGE' }
	],
	SAD: [
		{ a0: 'MEDIUM', a1: 'MEDIUM', a2: 'LARGE', a3: 'MEDIUM', a4: 'LARGE', a5: 'MEDIUM' },
		{ a0: 'LARGE', a1: 'MEDIUM', a2: 'LARGE', a3: 'MEDIUM', a4: 'LARGE', a5: 'MEDIUM' }
	],
	NEUTRAL: [
		{ a0: 'MEDIUM', a1: 'MEDIUM', a2: 'MEDIUM', a3: 'MEDIUM', a4: 'LARGE', a5: 'LARGE' },
		{ a0: 'MEDIUM', a1: 'SMALL', a2: 'MEDIUM', a3: 'MEDIUM', a4: 'LARGE', a5: 'LARGE' }
	],
	SCARED: [
		{ a0: 'LARGE', a1: 'LARGE', a2: 'LARGE', a3: 'LARGE', a4: 'MEDIUM', a5: 'SMALL' },
		{ a0: 'MEDIUM', a1: 'MEDIUM', a2: 'LARGE', a3: 'LARGE', a4: 'MEDIUM', a5: 'MEDIUM' }
	]]
}

var xPrecision = 180

Chart.defaults.global.defaultFontColor = 'grey'
Chart.defaults.global.defaultFontFamily = 'Fira Code'
Chart.defaults.global.defaultFontSize = 11
Chart.defaults.global.defaultFontStyle = 'normal'

function trimf(arr) {
	let mx = new Array(xPrecision).fill(0)
	for (var i = arr[0] + 1; i <= arr[1]; i++) {
		mx[i] = (i - arr[0]) * (1 / (arr[1] - arr[0]))
	}
	for (var i = arr[2] - 1; i > arr[1]; i--) {
		mx[i] = (i - arr[2]) * (1 / (arr[1] - arr[2]))
	}
	return mx
}

function trapmf(arr) {
	let mx = new Array(xPrecision).fill(0)
	if (arr[0] === arr[1]) {
		mx[0] = 1
	} else {
		for (var i = arr[0] + 1; i <= arr[1]; i++) {
			mx[i] = (i - arr[0]) * (1 / (arr[1] - arr[0]))
		}
	}
	for (var i = arr[1] + 1; i <= arr[2]; i++) {
		mx[i] = 1
	}
	for (var i = arr[3] - 1; i > arr[2]; i--) {
		mx[i] = (i - arr[3]) * (1 / (arr[2] - arr[3]))
	}
	return mx
}

function strimf(center, width) {
	trimf([center - width / 2, center, center + width / 2])
}

function findIntersects(runIndex, line) {
	var intersects = []

	line.forEach(function(val, idx) {
		var lineStartX = idx
		var lineStartY = line[idx]
		var lineEndX = idx + 1
		var lineEndY = line[idx + 1]

		result = checkLineIntersection(runIndex, lineStartX, lineStartY, lineEndX, lineEndY, idx)

		if (result.intersect) {
			intersects.push(result)
		}
	})

	return intersects
}

function checkLineIntersection(runIndex, lineStartX, lineStartY, lineEndX, lineEndY, idx) {
	var result = {
		x: null,
		y: null,
		intersect: false
	}

	if (idx === Math.floor(runIndex)) {
		let pX = runIndex - idx
		result.x = lineStartX + pX
		result.y = lineStartY + (lineEndY - lineStartY) * pX
	}

	if (result.y > 0) {
		result.intersect = true
	}

	return result
}

function convertArrayToObject(array) {
	const initialValue = {}
	return array.reduce((obj, item, idx) => {
		return {
			...obj,
			['μ' + idx]: item
		}
	}, initialValue)
}

let zart = {}

function drawIntersection(runIndex, tId, MFS, ordersChartData, chartInstance) {
	var canvas = document.getElementById(tId + 'Intersection')
	var context = canvas.getContext('2d')
	context.clearRect(0, 0, canvas.width, canvas.height)

	zart[tId] = {}

	Object.keys(MFS).forEach(function(k, i) {
		var intersects = findIntersects(runIndex, MFS[k])

		var Y = chartInstance.scales['y-axis-0']
		var X = chartInstance.scales['x-axis-0']

		zeroPointY = Y.top + ((Y.bottom - Y.top) / (Y.ticks.length - 1)) * Y.zeroLineIndex
		zeroPointX = Y.right
		yScale = (Y.bottom - Y.top) / (Y.end - Y.start)
		xScale = (X.right - X.left) / (X.ticks.length - 1)

		intersects.forEach(function(result, idx) {
			context.fillStyle = ordersChartData.datasets[i].borderColor
			context.beginPath()
			context.arc(
				result.x * xScale + zeroPointX,
				Y.end - Y.start - result.y * yScale - (Y.end - Y.start - zeroPointY),
				5,
				0,
				2 * Math.PI,
				true
			)
			context.fill()

			context.font = '12px Fira Code'
			context.fillStyle = 'white'
			context.fillText(
				parseFloat(result.y).toPrecision(4),
				result.x * xScale + zeroPointX + 10,
				2 + (Y.end - Y.start) - result.y * yScale - (Y.end - Y.start - zeroPointY)
			)
			zart[tId][k] = parseFloat(result.y).toPrecision(4)
		})
	})

	if (Object.keys(zart[tId]).length > 0) {
		let s = Object.keys(zart[tId]).reduce((a, b) => (zart[tId][a] > zart[tId][b] ? a : b))
		textify(tId, s)
	}
}

function textify(tId, point) {
	let TEXTS = {
		μ0: 'SMALL',
		μ1: 'MEDIUM',
		μ2: 'LARGE'
	}
	document.getElementById(tId + 'Text').innerHTML = TEXTS[point]
}

function checkEmotion() {
	let convertedRuleBase = []
	Object.keys(rulebase).forEach((key) => {
		rulebase[key].forEach((obj) => {
			convertedRuleBase.push({ emotion: key, ...obj })
		})
	})

	let now = getCurrentFuzzyCluster()

	convertedRuleBase.forEach((old) => {
		if (
			old.a0 === now.a0 &&
			old.a1 === now.a1 &&
			old.a2 === now.a2 &&
			old.a3 === now.a3 &&
			old.a4 === now.a4 &&
			old.a5 === now.a5
		) {
			document.getElementById('emotion').innerHTML = old.emotion
		}
	})
}

function getCurrentFuzzyCluster() {
	let k = {}
	for (let i = 0; i < 6; i++) {
		k['a' + i] = document.getElementById('A' + (i + 1) + 'Text').innerHTML
	}
	return k
}

function printEmotionCluster() {
	console.log(JSON.stringify(getCurrentFuzzyCluster()))
}

function createChart(cId, iId, title, runMemberships) {
	// Definning X
	var ordersChartData = {
		labels: Array.from(Array(xPrecision).keys()),
		datasets: []
	}
	var MFS = convertArrayToObject(runMemberships())

	Object.keys(MFS).forEach(function(key) {
		color = colors.shift()
		ordersChartData.datasets.push({
			label: key,
			lineTension: 0,
			type: 'line',
			backgroundColor: '' + color + '77',
			borderColor: '' + color + '',
			borderWidth: 2,
			pointHoverBorderWidth: 1,
			data: MFS[key],
			pointRadius: 0
		})
	})

	var ctx = document.getElementById(cId).getContext('2d')

	var myChart = new Chart(ctx, {
		type: 'line',
		data: ordersChartData,
		defaultFontSize: 11,
		options: {
			responsive: false,

			title: {
				display: true,
				text: title,
				fontColor: '#aaa',
				fontFamily: 'Fira Code',
				padding: 0
			},

			scales: {
				xAxes: [
					{
						gridLines: {
							display: true,
							drawBorder: false,
							drawOnChartArea: false
						}
					}
				],
				yAxes: [
					{
						gridLines: {
							display: true,
							drawBorder: false,
							drawOnChartArea: false
						}
					}
				]
			},

			legend: {
				display: true,
				labels: {
					fontColor: 'grey',
					usePointStyle: true
				}
			},
			tooltips: {
				enabled: false
			},
			animation: {
				duration: 1
			}
		}
	})

	return { myChart, MFS, ordersChartData, iId, cId }
}

var minArr = [Infinity, Infinity, Infinity, Infinity, Infinity, Infinity, Infinity]
var maxArr = [0, 0, 0, 0, 0, 0, 0]

function pinPoint(i, x) {
	minArr[i] = x < minArr[i] ? x : minArr[i]
	maxArr[i] = x > maxArr[i] ? x : maxArr[i]
	drawIntersection(x, `A${i}`, charts[i - 1].MFS, charts[i - 1].ordersChartData, charts[i - 1].myChart)
}
