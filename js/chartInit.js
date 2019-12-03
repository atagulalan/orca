var mainColors = ['#036D19', '#14CC60', '#27FB6B', '#00A676']

var xPrecision = 180

Chart.defaults.global.defaultFontColor = 'grey'
Chart.defaults.global.defaultFontFamily = 'Fira Code'
Chart.defaults.global.defaultFontSize = 11
Chart.defaults.global.defaultFontStyle = 'normal'

function limitMax(arr, max) {
	return arr.map((e) => (e > max ? max : e))
}

function trimf(arr, limits) {
	let mx, minLimit, middleLimit, maxLimit
	if (limits) {
		mx = []
		minLimit = limits[0] - 1
		middleLimit = arr[1]
		maxLimit = limits[1] + 1
	} else {
		mx = new Array(xPrecision).fill(0)
		minLimit = arr[0]
		middleLimit = arr[1]
		maxLimit = arr[2]
	}

	for (var i = minLimit + 1; i <= middleLimit; i++) {
		mx[i] = (i - arr[0]) * (1 / (arr[1] - arr[0]))
	}
	for (var i = maxLimit - 1; i > middleLimit; i--) {
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
	if (Array.isArray(array)) {
		const initialValue = {}
		return array.reduce((obj, item, idx) => {
			return {
				...obj,
				['μ' + idx]: item
			}
		}, initialValue)
	} else {
		return array
	}
}

let IntersectionDatabase = {}
let DegreeDatabase = {}

function drawIntersection(runIndex, tId, MFS, ordersChartData, chartInstance) {
	var canvas = document.getElementById(tId + 'Intersection')
	var context = canvas.getContext('2d')
	context.clearRect(0, 0, canvas.width, canvas.height)

	IntersectionDatabase[tId] = {}
	DegreeDatabase[tId] = {}
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
				8,
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
			IntersectionDatabase[tId][k] = parseFloat(result.y).toPrecision(4)
			DegreeDatabase[tId][k] = parseFloat(result.x).toPrecision(4)
		})
	})

	document.getElementById(tId + 'Text').innerHTML = textify(getMax(tId))
}

function createDatasetFromMembership(runMemberships, colors) {
	var MFS = convertArrayToObject(runMemberships())
	var ordersChartData = {
		labels: Array.from(Array(xPrecision).keys()),
		datasets: []
	}
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
	return { ordersChartData, MFS }
}

function createChart(cId, iId, title, runMemberships, colors) {
	var { ordersChartData, MFS } = createDatasetFromMembership(runMemberships, colors)
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
						},
						ticks: {
							suggestedMax: 1,
							suggestedMin: 0,
							beginAtZero: true
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

function pinPoint(i, x) {
	drawIntersection(x, `A${i}`, inputCharts[i - 1].MFS, inputCharts[i - 1].ordersChartData, inputCharts[i - 1].myChart)
}
