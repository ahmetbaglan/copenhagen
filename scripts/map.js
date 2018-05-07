// TODO: auto fit to screen size
var w = 1000,
  h = 1000,
  metric = 'no_inhabitants',
  year = '2008',
  colors = ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'],
  colorsDiverging = ['#c2a5cf', '#e7d4e8', '#f7f7f7', '#d9f0d3', '#a6dba0', '#5aae61', '#1b7837'],
  path, paths, districts, json, dataset, data;

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

// helper to set the metric here through action in html in other file
var setYear = function (value) {
  year = value;
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
    return parseInt(prev[metric]) < parseInt(curr[metric]) ? prev : curr;
  })[metric];

  var max = dataset.reduce(function (prev, curr) {
    return parseInt(prev[metric]) > parseInt(curr[metric]) ? prev : curr;
  })[metric];

  console.log('min:', min, 'max:', max);
  // divide up the domain and update scale
  var l = (max - min) / thresholdScale.range().length,
    breaks = d3.range(0, thresholdScale.range().length).map(function (i) {
      return parseInt(min) + i * l;
    });

  if (min < 0) {
    thresholdScale.range(colorsDiverging);
  } else {
    thresholdScale.range(colors);
  }
  if ((parseFloat(min) + parseFloat(max)) < 1) {
    console.log('removing legend');
    // remove legend
    svg.select(".legendQuant").remove()
    svg.append("g")
      .attr("class", "noData")
      .attr("transform", "translate(20,20)");
    svg.select(".noData")
      .append('text')
      .text('No data to display.')

  } else {
    console.log('not removing legend');
    svg.select(".noData").remove()
    thresholdScale.domain(breaks)

    var format = metric.indexOf('avg') > -1 ? '.2f' : '.0f';
    // append legend
    svg.append("g")
      .attr("class", "legendQuant")
      .attr("transform", "translate(20,20)");

    var legend = d3.legendColor()
      .labelFormat(d3.format(format))
      .labels(d3.legendHelpers.thresholdLabels)
      .scale(thresholdScale)

    svg.select(".legendQuant")
      .call(legend);
  }


}

var click = function (d) {
  console.log(d);
}

// filter dataset per years
var filterData = function () {
  console.log('year', year);
  dataset = data.filter(function (row) {
    return row['aar'] === year;
  });
  console.log('filterted dataset', dataset);
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
    .attr('class', 'district')
    .style("fill", function (d) {
      return thresholdScale(getColorValue(d));
    })
    .on('mouseover', function (d, i) {
      var currentState = this;
      d3.select(this)
        .style('fill-opacity', 1)
        .style("cursor", "pointer");
    })
    .on('mouseout', function (d, i) {
      d3.select(this)
        .style('fill-opacity', 0.8)
        .style("cursor", "default");
    })
    .on('click', click);

  // Add names to the districts
  districts = svg.selectAll('text district-names')
    .data(json.features)
    .enter()
    .append("text")
    .attr('class', 'district-names')
    .text(function (d) {
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
    // set original dataset as global var
    data = demodata;

    // filter the data for current year and use for the visualizations
    filterData()
    setColorDomain();
    drawMap();

  })
});
