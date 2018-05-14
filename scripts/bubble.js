var fillBubble = d3.scaleOrdinal(d3.schemeCategory20);
var bubbleFunction = function (year, district) {
  d3.select("#bubbleChart").selectAll("*").remove()

  var r = 450,
    format = d3.format(",d");

  var bubble = d3.pack()
    //.sort(null)
    .size([r, r]);

  var vis = d3.select("#bubbleChart").append("svg:svg")
    .attr("width", r)
    .attr("height", r)
    .attr("class", "bubble");

  d3.json('data/' + year + "_final.json", function (json) {

    json = json[district];
    json = {
      "name": "a",
      "children": json
    }
    var root = d3.hierarchy(classes(json))
      .sum(function (d) {
        return d.value;
      });
    console.log(json)

    var totalSum = 0;
    var iterI;
    for (iterI = 0; iterI < json.children.length; iterI++) {
      totalSum = totalSum + json.children[iterI].total
    }

    var nodeData = bubble(root).leaves().filter(function (d) {
      return (d.value * 100) / totalSum > 0.4;
    });
    console.log(nodeData)
    console.log(totalSum)
    var node = vis.selectAll("g.node")
      .data(nodeData)
      .enter().append("svg:g")
      .attr("class", "node")
      .attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
      });

    node.append("svg:title")
      .text(function (d) {
        return d.data.className + ": " + format(d.data.value);
      });

    node.append("svg:circle")
      .attr("r", function (d) {
        return d.r;
      })
      .style("fill", function (d) {
        return fillBubble(d.data.className);
      });

    node.append("svg:text")
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .text(function (d) {
        return d.data.className.substring(0, d.r / 3);
      });
    node.append("svg:text")
      .attr("text-anchor", "middle")
      .attr("dy", "2em")
      .text(function (d) {
        return ((d.data.value * 100) / totalSum).toFixed(2) + "%"
      });
  });

  // Returns a flattened hierarchy containing all leaf nodes under the root.
  function classes(root) {
    var classes = [];

    function recurse(name, node) {
      if (node.children) node.children.forEach(function (child) {
        recurse(node.name, child);
      });
      else classes.push({
        packageName: name,
        className: node.name,
        value: node.total
      });
    }

    recurse(null, root);
    return {
      children: classes
    };
  }
}

var selectedYearOnRadio = "2013";
var radio;
var radios = document.forms["formA"].elements["myradio"];
for (radio in radios) {
  radios[radio].onclick = function () {
    selectedYearOnRadio = this.value;
    bubbleFunction(this.value, lastClickedDistrict)
  };
}
bubbleFunction("2017", 1)
