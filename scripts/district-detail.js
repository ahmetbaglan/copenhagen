var paddingLeft = 255,
  padding = 25,
  widthStack = 650,
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
  age: ['no_age_0_5', 'no_age_6_17', 'no_age_18_29', 'no_age_30_39', 'no_age_40_49', 'no_age_50_64', 'no_age_over_65'],
  income: ['no_low_income', 'no_middle_income', 'no_high_income'],
  profession: ['no_entrepreneurs', 'no_trade_transport',
    'no_information_communication', 'no_finance_insurance',
    'no_real_estate_rental', 'no_business_service',
    'no_public_administration', 'no_teaching',
    'no_health_social_service', 'no_cultural_services',
    'no_agriculture'
  ],
  migration: ['no_danish', 'no_western', 'no_non_western'],
};

//Set up stack method
var stack = d3.stack();

//For converting strings to Dates
var parseTime = d3.timeParse("%Y");
//For converting Dates to strings
var formatTime = d3.timeFormat("%b %Y");

var xScale = d3.scaleTime()
  .range([padding, widthStack - paddingLeft]);

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

  var colors = values.map(function (d, i) {
    return d3.schemeCategory20[i];
  });


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

  var colorScale = d3.scaleOrdinal()
    .domain(values.map(function (c) {
      var splitted = c.split('_')
      console.log('splitted', splitted);
      return splitted.slice(1, splitted.length).join(' ')
    }))
    .range(colors);

  var legendOffset = widthStack - 32 * values.length;


  var legend = d3.legendColor()
    .shapeWidth(30)
    .cells(values.length)
    .orient("vertical")
    .scale(colorScale)

  svgDistrict.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(" + 400 + ",0)");

  var legend = svgDistrict.select(".legend")
    .call(legend);
  console.log('legend', legend);

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
    .attr("transform", "translate(" + (widthStack - padding + paddingLeft) + ",0)")
    .call(yAxis);
}
