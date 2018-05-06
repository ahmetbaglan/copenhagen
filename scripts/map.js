// TODO: auto fit to screen size
var w = 1000,
  h = 1000,
  metric = 'no_inhabitants',
  year = '2008',
  colors = ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'];

var getColorValue = function (d, dataset) {
  var [row] = dataset.filter(function (obj) {
    return parseInt(obj.district_id) === d.properties.bydel_nr && obj.aar === year;
  });
  console.log(row, metric, row[metric]);
  return parseInt(row[metric]);
}


var color = d3.scaleQuantize()
  .range(colors);

var svg = d3.select('.map')
  .append('svg')
  .attr('width', w)
  .attr('height', h);

var setColorDomain = function (data) {

  var min = data.reduce(function (prev, curr) {
    return prev[metric] < curr[metric] ? prev : curr;
  })[metric];

  var max = data.reduce(function (prev, curr) {
    return prev[metric] > curr[metric] ? prev : curr;
  })[metric];
  console.log('min', min, 'max', max);
  // color scheme
  color.domain([
    min, max
  ]);
}


var drawMap = function (json, path, dataset) {


  //Bind data and create one path per GeoJSON feature
  var paths = svg.selectAll("path")
    .data(json.features)
    .enter()
    .append("path")
    .attr("d", path)
    .style("fill", function (d) {
      return color(getColorValue(d, dataset));
    });

}

d3.json("data/copenhagen.geojson", function (json) {
  console.log(json);
  var center = d3.geoCentroid(json)
  var scale = 200000;
  var offset = [-627.8 * w, 470.4 * h];
  var projection = d3.geoMercator()
    .center(center)
    .translate(offset)
    .scale([scale]);

  var path = d3.geoPath().projection(projection)


  d3.csv('data/merged_socia_ecomic_per_year_per_district_EN_with_ID.csv', function (dataset) {
    console.log(dataset);
    setColorDomain(dataset);
    drawMap(json, path, dataset);

  })
});
