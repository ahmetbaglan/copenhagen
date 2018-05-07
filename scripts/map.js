// TODO: auto fit to screen size
var w = 1000,
  h = 1000,
  metric = 'no_inhabitants',
  year = '2008',
  colors = ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'],
  path, paths, districts, json, dataset;

// helper to get correct value from data set
var getColorValue = function (d) {
  var [row] = dataset.filter(function (obj) {
    return parseInt(obj.district_id) === d.properties.bydel_nr && obj.aar === year;
  });
  return parseInt(row[metric]);
}
// helper to set the metric here through action in html in other file
var setMetric = function (value) {
  metric = value;
}

// threshold scale
var thresholdScale = d3.scaleThreshold()
  .range(colors);

// initialize svg
var svg = d3.select('.map')
  .append('svg')
  .attr('width', w)
  .attr('height', h);

// update the color domain to match the metric selected
var setColorDomain = function () {

  // min / max values
  var min = dataset.reduce(function (prev, curr) {
    return prev[metric] < curr[metric] ? prev : curr;
  })[metric];

  var max = dataset.reduce(function (prev, curr) {
    return prev[metric] > curr[metric] ? prev : curr;
  })[metric];

  console.log('min:', min, 'max:', max);
  // divide up the domain and update scale
  var l = (max - min) / thresholdScale.range().length,
    breaks = d3.range(0, thresholdScale.range().length).map(function (i) {
      return parseInt(min) + Math.round(i * l);
    });
  thresholdScale.domain(breaks)

  // append legend
  svg.append("g")
    .attr("class", "legendQuant")
    .attr("transform", "translate(20,20)");

  var legend = d3.legendColor()
    .labelFormat(d3.format(".0f"))
    .labels(d3.legendHelpers.thresholdLabels)
    .scale(thresholdScale)

  svg.select(".legendQuant")
    .call(legend);
}


var drawMap = function () {

  // remove elements if exist
  if (paths) {
    paths.remove();
  }
  if (districts) {
    districts.remove()
  }

  //Bind data and create one path per GeoJSON feature
  paths = svg.selectAll("path")
    .data(json.features)
    .enter()
    .append("path")
    .attr("d", path)
    .style("fill", function (d) {
      return thresholdScale(getColorValue(d));
    });

  // Add names to the districts
  districts = svg.selectAll('text')
    .data(json.features)
    .enter()
    .append("text")
    .text(function (d) {
      // TODO: not displaying all names
      console.log(d.properties.navn);
      return d.properties.navn;
    })
    .attr("x", function (d) {
      return path.centroid(d)[0];
    })
    .attr("y", function (d) {
      return path.centroid(d)[1];
    })
    .attr("text-anchor", "middle")
    .attr('font-size', '8pt')
    .attr('fill', '#2F4F4F');
}

// load map asynchronously
d3.json("data/copenhagen.geojson", function (geodata) {
  json = geodata;

  // scale and center
  var center = d3.geoCentroid(json)
  var scale = 200000;
  var offset = [-627.8 * w, 470.4 * h];
  var projection = d3.geoMercator()
    .center(center)
    .translate(offset)
    .scale([scale]);

  // set projection
  path = d3.geoPath().projection(projection)

  // load dataset
  d3.csv('data/merged_socia_ecomic_per_year_per_district_EN_with_ID.csv', function (err, demodata) {
    if (err) {
      console.log('errr loading data', err);
    }
    console.log(demodata['avg_income']);
    dataset = demodata;
    setColorDomain();
    drawMap();

  })
});
