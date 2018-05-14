var padding = 25,
  widthStack = 450,
  heightStack = 400,
  dataset, xAxis, yAxis, xAxisViz, yAxisViz, area, dataRaw, svgDistrict, districtPaths;

var stackMetric = 'income';
var currentDistrictID = 1

var getStackMetric = function () {
  return stackMetric;
}

var setStackMetric = function (metric) {
  stackMetric = metric;
}

var setCurrentDistrict = function (id) {
  currentDistrictID = id;
}

var getCurrentDistrict = function () {
  return currentDistrictID;
}

var variables = {
  age: ['no_age_6_17', 'no_age_6_17', 'no_age_18_29', 'no_age_30_39', 'no_age_40_49', 'no_age_50_64', 'no_age_over_65'],
  income: ['no_low_income', 'no_middle_income', 'no_high_income'],
  profession: ['']
};

//Set up stack method
var stack = d3.stack();

//For converting strings to Dates
var parseTime = d3.timeParse("%Y");
//For converting Dates to strings
var formatTime = d3.timeFormat("%b %Y");

var xScale = d3.scaleTime()
  .range([padding, widthStack - padding * 2]);

var yScale = d3.scaleLinear()
  .range([heightStack - padding, padding / 2])

//Define axes
xAxis = d3.axisBottom()
  .scale(xScale)
  .ticks(10)
  .tickFormat(formatTime);

//Define Y axis
yAxis = d3.axisRight()
  .scale(yScale)
  .ticks(5);

//Define area generator
area = d3.area()
  .x(function (d) {
    return xScale(parseTime(d.data.aar));
  })
  .y0(function (d) {
    return yScale(d[0]);
  })
  .y1(function (d) {
    return yScale(d[1]);
  });

d3.csv('data/merged_socia_ecomic_per_year_per_district_EN_with_ID.csv', function (data) {
  dataRaw = data;
  drawDistrictDetail()
})
var drawDistrictDetail = function () {
  dataset = dataRaw.filter(function (d) {
    return parseInt(d.district_id) === currentDistrictID;
  });

  console.log('drawing district detail for ', currentDistrictID);

  var keys = ['aar'].concat(variables[stackMetric])
  var values = variables[stackMetric];
  console.log(stackMetric, values);

  //Tell stack function where to find the keys
  stack.keys(values)
    .value(function value(d, key) {
      return d[key];
    });

  //Stack the data and log it out
  var series = stack(dataset);
  xScale.domain([
    d3.min(dataset, function (d) {
      // console.log(d.aar);
      return parseTime(d.aar);
    }),
    d3.max(dataset, function (d) {
      return parseTime(d.aar);
    })
  ])

  yScale.domain([
      0,
      d3.max(dataset, function (d) {
        var sum = 0;

        //Loops once for each row, to calculate
        //the total (sum) of sales of all vehicles
        for (var i = 0; i < values.length; i++) {
          sum += parseInt(d[variables[stackMetric][i]]);
        };
        return sum;
      })
    ])
    .nice();

  if (svgDistrict) {
    svgDistrict
      .remove();

    yAxisViz
      .transition()
      .duration(1000)
      .call(d3.axisLeft(yScale));

  }
  svgDistrict = d3.select('.district-detail')
    .append('svg')
    .attr('width', widthStack)
    .attr('height', heightStack);

  //Create areas
  districtPaths = svgDistrict.selectAll("path")
    .data(series)
    .enter()
    .append("path")
    .attr("class", "area")
    .attr("d", area)
    .attr("fill", function (d, i) {
      return d3.schemeCategory20[i];
    })
    .append("text")
    .attr("dy", 5)
    .text(d => d.key)
    .append("title") //Make tooltip
    .text(function (d) {
      return d.key;
    });

  //Create axes
  xAxisViz = svgDistrict.append("g")
    .attr("class", "axis x")
    .attr("transform", "translate(0," + (heightStack - padding) + ")")
    .call(xAxis);

  yAxisViz = svgDistrict.append("g")
    .attr("class", "axis y")
    .attr("transform", "translate(" + (widthStack - padding * 2) + ",0)")
    .call(yAxis);
}
