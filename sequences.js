var nodesLol;
var dataLol;
var barChartYScale;
var barChartXScale;
var svgBar;
var barMargin ={top: 20, right: 20, bottom: 30, left: 40};
var widthBar = 500 - barMargin.left - barMargin.right;
var heightBar = 300 - barMargin.top - barMargin.bottom;

var updateCoolPieChart = function(year, met)
{
  if (met == "no_inhabitants") {
    var colors = {
      "couple": "#5687d1",
      "other": "#7b615c",
      "single": "#de783b",
      "Without Kids": "#6ab975",
      "With Kids": "#a173d1",
      "amager_vest": "#93707E",
      "bispebjerg": "#8E94F2",
      "brønshøj husum": "#ADFFC9"
    };
    showCoolPie(year, colors, 'no_inhabitantsDistribution.csv')
  } else if (met == "avg_age") {

    var colors = {
      "couple": "#5687d1",
      "other": "#7b615c",
      "single": "#de783b",
      "Without Kids": "#6ab975",
      "With Kids": "#a173d1",
      "amager_vest": "#93707E",
      "bispebjerg": "#8E94F2",
      "brønshøj husum": "#ADFFC9"
    };
    showCoolPie(year, colors, 'no_ageDistribution.csv')
  }
  else if (met == "no_apartments") {

    var colors = {
      "couple": "#5687d1",
      "other": "#7b615c",
      "single": "#de783b",
      "Without Kids": "#6ab975",
      "With Kids": "#a173d1",
      "amager_vest": "#93707E",
      "bispebjerg": "#8E94F2",
      "brønshøj husum": "#ADFFC9"
    };
    showCoolPie(year, colors, 'no_apartmentsDistribution.csv')

  }
  else if (met == "avg_income") {

    var colors = {
      "couple": "#5687d1",
      "other": "#7b615c",
      "single": "#de783b",
      "Without Kids": "#6ab975",
      "With Kids": "#a173d1",
      "amager_vest": "#93707E",
      "bispebjerg": "#8E94F2",
      "brønshøj husum": "#ADFFC9"
    };
    showCoolPie(year, colors, 'avg_incomeDistribution.csv')

  }

}

var showCoolPie = function (year, colors, dataName) {

  // de.select("#barChart").selectAll("svg").remove()
  // Dimensions of sunburst.
  var width = 750;
  var height = 600;
  var radius = Math.min(width, height) / 2;

  // Breadcrumb dimensions: width, height, spacing, width of tip/tail.
  var b = {
    w: 75,
    h: 30,
    s: 3,
    t: 10
  };


  // Total size of all segments; we set this later, after loading the data.
  var totalSize = 0;

  var vis = d3.select("#chart").append("svg:svg")
    .attr("id","pieSVG")
    .attr("width", width)
    .attr("height", height)
    .append("svg:g")
    .attr("id", "container")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var partition = d3.partition()
    .size([2 * Math.PI, radius * radius]);

  var arc = d3.arc()
    .startAngle(function (d) {
      return d.x0;
    })
    .endAngle(function (d) {
      return d.x1;
    })
    .innerRadius(function (d) {
      return Math.sqrt(d.y0);
    })
    .outerRadius(function (d) {
      return Math.sqrt(d.y1);
    });

  // Use d3.text and d3.csvParseRows so that we do not need to have a header
  // row, and can receive the csv as an array of arrays.
  d3.text(dataName, function (text) {
    var dsv = d3.dsvFormat(',')
    var dataFull = dsv.parse(text)
    var data = dataFull.filter(function (d) {
      return d['year'] == year
    })
    dataLol = dataFull;
    var csv = data.map(function (d) {
      return ([d["depthInfo"], d["val"]])
    })

    // var csv = d3.csvParseRows(text);
    var json = buildHierarchy(csv);

    createVisualization(json,dataFull);

  });
  // Main function to draw and set up the visualization, once we have the data.
  function createVisualization(json, wholeData) {

    // Basic setup of page elements.
    initializeBreadcrumbTrail();
    drawLegend();
    d3.select("#togglelegend").on("click", toggleLegend);
    // Bounding circle underneath the sunburst, to make it easier to detect
    // when the mouse leaves the parent g.
    vis.append("svg:circle")
      .attr("r", radius)
      .style("opacity", 0);

    // Turn the data into a d3 hierarchy and calculate the sums.
    var root = d3.hierarchy(json)
      .sum(function (d) {
        return d.size;
      })
      .sort(function (a, b) {
        return b.value - a.value;
      });

    // For efficiency, filter nodes to keep only those large enough to see.
    var nodes = partition(root).descendants()
      .filter(function (d) {
        return (d.x1 - d.x0 > 0.005); // 0.005 radians = 0.29 degrees
      });
    nodesLol = nodes;
    var path = vis.data([json]).selectAll("path")
      .data(nodes)
      .enter().append("svg:path")
      .attr("display", function (d) {
        return d.depth ? null : "none";
      })
      .attr("d", arc)
      .attr("fill-rule", "evenodd")
      .style("fill", function (d) {
        return colors[d.data.name];
      })
      .style("opacity", 1)
      .on("mouseover", mouseover)
      .on("click", function(d){var data = showHistoryData(getStringFromNode(d), wholeData); updateBarChart(data, colors[d.data.name])});
      console.log(json)
    // Add the mouseleave handler to the bounding circle.
    d3.select("#container").on("mouseleave", mouseleave);

    // Get total size of the tree = value of root node from partition.
    totalSize = path.datum().value;

    var firstData  = showHistoryData(getStringFromNode(nodesLol[10]), dataLol)
    createBarChart(firstData);



  };

  // Fade all but the current sequence, and show it in the breadcrumb trail.
  function mouseover(d) {

    var percentage = (100 * d.value / totalSize).toPrecision(3);
    var percentageString = percentage + "%";
    if (percentage < 0.1) {
      percentageString = "< 0.1%";
    }

    d3.select("#percentage")
      .text(percentageString);

    d3.select("#explanation")
      .style("visibility", "");

    var sequenceArray = d.ancestors().reverse();
    sequenceArray.shift(); // remove root node from the array
    updateBreadcrumbs(sequenceArray, percentageString);

    // Fade all the segments.
    d3.selectAll("path")
      .style("opacity", 0.3);

    // Then highlight only those that are an ancestor of the current segment.
    vis.selectAll("path")
      .filter(function (node) {
        return (sequenceArray.indexOf(node) >= 0);
      })
      .style("opacity", 1);
  }

  // Restore everything to full opacity when moving off the visualization.
  function mouseleave(d) {

    // Hide the breadcrumb trail
    d3.select("#trail")
      .style("visibility", "hidden");

    // Deactivate all segments during transition.
    d3.selectAll("path").on("mouseover", null);

    // Transition each segment to full opacity and then reactivate it.
    d3.selectAll("path")
      .transition()
      .duration(1000)
      .style("opacity", 1)
      .on("end", function () {
        d3.select(this).on("mouseover", mouseover);
      });

    d3.select("#explanation")
      .style("visibility", "hidden");
  }

  function initializeBreadcrumbTrail() {
    // Add the svg area.
    var trail = d3.select("#sequence").append("svg:svg")
      .attr("width", width)
      .attr("height", 50)
      .attr("id", "trail");
    // Add the label at the end, for the percentage.
    trail.append("svg:text")
      .attr("id", "endlabel")
      .style("fill", "#000");
  }

  // Generate a string that describes the points of a breadcrumb polygon.
  function breadcrumbPoints(d, i) {
    var points = [];
    points.push("0,0");
    points.push(b.w + ",0");
    points.push(b.w + b.t + "," + (b.h / 2));
    points.push(b.w + "," + b.h);
    points.push("0," + b.h);
    if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
      points.push(b.t + "," + (b.h / 2));
    }
    return points.join(" ");
  }

  // Update the breadcrumb trail to show the current sequence and percentage.
  function updateBreadcrumbs(nodeArray, percentageString) {

    // Data join; key function combines name and depth (= position in sequence).
    var trail = d3.select("#trail")
      .selectAll("g")
      .data(nodeArray, function (d) {
        return d.data.name + d.depth;
      });

    // Remove exiting nodes.
    trail.exit().remove();

    // Add breadcrumb and label for entering nodes.
    var entering = trail.enter().append("svg:g");

    entering.append("svg:polygon")
      .attr("points", breadcrumbPoints)
      .style("fill", function (d) {
        return colors[d.data.name];
      });

    entering.append("svg:text")
      .attr("x", (b.w + b.t) / 2)
      .attr("y", b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(function (d) {
        return d.data.name;
      });

    // Merge enter and update selections; set position for all nodes.
    entering.merge(trail).attr("transform", function (d, i) {
      return "translate(" + i * (b.w + b.s) + ", 0)";
    });

    // Now move and update the percentage at the end.
    d3.select("#trail").select("#endlabel")
      .attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
      .attr("y", b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(percentageString);

    // Make the breadcrumb trail visible, if it's hidden.
    d3.select("#trail")
      .style("visibility", "");

  }

  function drawLegend() {

    // Dimensions of legend item: width, height, spacing, radius of rounded rect.
    var li = {
      w: 75,
      h: 30,
      s: 3,
      r: 3
    };

    var legend = d3.select("#legend").append("svg:svg")
      .attr("width", li.w)
      .attr("height", d3.keys(colors).length * (li.h + li.s));

    var g = legend.selectAll("g")
      .data(d3.entries(colors))
      .enter().append("svg:g")
      .attr("transform", function (d, i) {
        return "translate(0," + i * (li.h + li.s) + ")";
      });

    g.append("svg:rect")
      .attr("rx", li.r)
      .attr("ry", li.r)
      .attr("width", li.w)
      .attr("height", li.h)
      .style("fill", function (d) {
        return d.value;
      });

    g.append("svg:text")
      .attr("x", li.w / 2)
      .attr("y", li.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(function (d) {
        return d.key;
      });
  }

  function toggleLegend() {
    var legend = d3.select("#legend");
    if (legend.style("visibility") == "hidden") {
      legend.style("visibility", "");
    } else {
      legend.style("visibility", "hidden");
    }
  }

  // Take a 2-column CSV and transform it into a hierarchical structure suitable
  // for a partition layout. The first column is a sequence of step names, from
  // root to leaf, separated by hyphens. The second column is a count of how
  // often that sequence occurred.
  function buildHierarchy(csv) {
    var root = {
      "name": "root",
      "children": []
    };
    for (var i = 0; i < csv.length; i++) {
      var sequence = csv[i][0];
      var size = +csv[i][1];
      if (isNaN(size)) { // e.g. if this is a header row
        continue;
      }
      var parts = sequence.split("-");
      var currentNode = root;
      for (var j = 0; j < parts.length; j++) {
        var children = currentNode["children"];
        var nodeName = parts[j];
        var childNode;
        if (j + 1 < parts.length) {
          // Not yet at the end of the sequence; move down the tree.
          var foundChild = false;
          for (var k = 0; k < children.length; k++) {
            if (children[k]["name"] == nodeName) {
              childNode = children[k];
              foundChild = true;
              break;
            }
          }
          // If we don't already have a child node for this branch, create it.
          if (!foundChild) {
            childNode = {
              "name": nodeName,
              "children": []
            };
            children.push(childNode);
          }
          currentNode = childNode;
        } else {
          // Reached the end of the sequence; create a leaf node.
          childNode = {
            "name": nodeName,
            "size": size
          };
          children.push(childNode);
        }
      }
    }
    return root;
  };



}

getStringFromNode = function(node)
{
  if(node.depth == 0)
  {
    return "";
  }
  else if (node.parent.data.name == "root") {
    return node.data.name;
  }
  var newNode = node.parent;
  var totalString  =  node.data.name;
  while(newNode.data.name!='root')
  {
    totalString = newNode.data.name + "-" +totalString;
    newNode = newNode.parent;
  }
  return totalString;
}

showHistoryData = function(stringText,data)
{
   var filtered = data.filter(function(d){return d.depthInfo.startsWith(stringText);})
   var byYearSum = d3.nest().key(function(d){return d.year})
                            .rollup(function(v){return{year:Math.round(d3.mean(v,function(d){return +d.year})), sum: d3.sum(v,function(d){return +d.val})}})
                            .entries(filtered);
   var i;
   var out = []
   for(i=0; i<byYearSum.length;i++)
   {
    out.push(byYearSum[i].value)
   }
   return out;
}

var createBarChart = function(data)
{

  // set the dimensions and margins of the graph
var margin = barMargin;

var width = widthBar;
var height = heightBar;

// set the ranges
 barChartXScale = d3.scaleBand()
          .range([0, width])
          .padding(0.2);

 barChartYScale = d3.scaleLinear()
          .range([height, 0]);

// append the svg object to the body of the page
// append a 'group' element to 'svg'
// moves the 'group' element to the top left margin
 svgBar = d3.select("body").select("#barChart").append("svg")
    .attr("id", "barSVG")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  var minYear  = d3.min(data, function(d) { return d.year; });
  var maxYear = d3.max(data, function(d) { return d.year; });
  // Scale the range of the data in the domains
  barChartXScale.domain(d3.ticks(minYear,maxYear,maxYear-minYear + 1));
  barChartYScale.domain([0, d3.max(data, function(d) { return d.sum; })]);

  // append the rectangles for the bar chart
  svgBar.selectAll("rect")
      .data(data)
    .enter().append("rect")
      .attr("x", function(d) { return barChartXScale(d.year); })
      .attr("width", barChartXScale.bandwidth())
      .attr("y", function(d) { return barChartYScale(d.sum); });

  // add the x Axis
  svgBar.append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("class", "x axis")
      .call(d3.axisBottom(barChartXScale));

  // add the y Axis
  svgBar.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(barChartYScale));
}


var updateBarChart = function(data, colorVal)
{
  var height = heightBar;
  var width = widthBar;

  barChartYScale.domain([0, d3.max(data, function(d) { return d.sum; })]);

  svgBar.select(".y.axis")
     .transition()
     .duration(1000)
     .call(d3.axisLeft(barChartYScale));

  svgBar.selectAll("rect")
     .data(data)
     .transition()
     .duration(1000)
     .attr("x", function(d) { return barChartXScale(d.year); })
     .attr("y", function(d) { console.log(barChartYScale(d.sum)); return barChartYScale(d.sum); })
     .attr("height", function(d) { return height - barChartYScale(d.sum); })
     .style("fill", colorVal);

}
