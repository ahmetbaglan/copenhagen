var fillBubble = d3.scaleOrdinal(d3.schemeCategory20);
var bubbleFunction = function(year, district)
{
  d3.select("#bubbleChart").selectAll("*").remove()
  console.log("year",year)
  console.log("district",district)
  var r = 960,
      format = d3.format(",d");

  var bubble = d3.pack()
      //.sort(null)
      .size([r, r]);

  var vis = d3.select("#bubbleChart").append("svg:svg")
      .attr("width", r)
      .attr("height", r)
      .attr("class", "bubble");
      console.log("data/"+year + "_final.json")
  d3.json("data/"+year + "_final.json", function(json) {
    json = json[district];
    json = {"name":"a", "children":json}


    var root = d3.hierarchy(classes(json))
      .sum(function(d) { return d.value; });
    console.log(json)
    var node = vis.selectAll("g.node")
        .data(bubble(root).leaves())
      .enter().append("svg:g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    node.append("svg:title")
        .text(function(d) { return d.data.className + ": " + format(d.data.value); });

    node.append("svg:circle")
        .attr("r", function(d) { return d.r; })
        .style("fill", function(d) { return fillBubble(d.data.className); });

    node.append("svg:text")
        .attr("text-anchor", "middle")
        .attr("dy", ".3em")
        .text(function(d) { return d.data.className.substring(0, d.r / 3); });
  });

  // Returns a flattened hierarchy containing all leaf nodes under the root.
  function classes(root) {
    var classes = [];

    function recurse(name, node) {
      if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
      else classes.push({packageName: name, className: node.name, value: node.total});
    }

    recurse(null, root);
    return {children: classes};
  }
}

var selectedYearOnRadio = "2013";
var radio;
var radios = document.forms["formA"].elements["myradio"];
for(radio in radios) {
    radios[radio].onclick = function(){selectedYearOnRadio=this.value;bubbleFunction(this.value,lastClickedDistrict)} ;
}
// bubbleFunction("2017",2)
