//https://github.com/Sushanthece/D3-Zoomable-icicle
//https://gist.github.com/andrea2910/19a5a788a575f41801e9ee72058806b6

var width = window.innerWidth - 200,
  height = window.innerHeight - 180;

var x = d3.scaleLinear().range([0, width]);

var y = d3.scaleLinear().range([0, height]);

var color = d3.scaleOrdinal(d3.schemeCategory20c);

var vis = d3
  .select("#chart")
  .append("svg:svg")
  .attr("width", width)
  .attr("height", height);

var partition = d3
  .partition()
  .size([width, height])
  .padding(0)
  .round(true);

// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
var b = {
  w: 150,
  h: 50,
  s: 3,
  t: 10
};

var rect = vis.selectAll("rect");
var fo = vis.selectAll("foreignObject");
var totalSize = 0;

d3.json("data/dataX.json", function(error, root) {
  if (error) throw error;
  root = d3
    .hierarchy(d3.entries(root)[0], function(d) {
      return d3.entries(d.value);
    })
    .sum(function(d) {
      return d.value;
    })
    .sort(function(a, b) {
      return b.value - a.value;
    });

  partition(root);

  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  //add breadcrumb
  initializeBreadcrumbTrail();
  var valueString = numberWithCommas(root.value);
  d3.select("#value").text(valueString);
  d3.select("#explanation").style("visibility", "");
  var sequenceArray = root.ancestors().reverse();

  updateBreadcrumbs(sequenceArray, valueString);

  rect = rect
    .data(root.descendants())
    .enter()
    //.filter(d => d.x1 - d.x0 > 1)
    .append("rect")
    .attr("x", function(d) {
      return d.x0;
    })
    .attr("y", function(d) {
      return d.y0;
    })
    .attr("width", function(d) {
      if (d.x1 - d.x0 >= 0) {
        return d.x1 - d.x0;
      } else {
        0;
      }
    })
    .attr("height", function(d) {
      return d.y1 - d.y0;
    })
    .attr("fill", function(d) {
      return color((d.children ? d : d.parent).data.key);
    })
    .attr("stroke", "white")
    .on("click", switchData);

  fo = fo
    .data(root.descendants())
    .enter()
    .filter(d => d.x1 - d.x0 > 5)
    .append("foreignObject")
    .attr("x", function(d) {
      if (d.x1 - d.x0 <= 80) {
        return 0;
      } else {
        return d.x0;
      }
    })
    .attr("y", function(d) {
      if (d.x1 - d.x0 <= 80) {
        return 0;
      } else {
        return d.y0;
      }
    })

    .attr("width", function(d) {
      if (d.x1 - d.x0 <= 20) {
        return;
      }
      if (d.x1 - d.x0 <= 80) {
        return 400;
      } else {
        return d.x1 - d.x0;
      }
    })
    .attr("height", function(d) {
      return d.y1 - d.y0;
    })
    .attr("text-anchor", "middle")
    .attr("transform", function(d) {
      if (d.x1 - d.x0 <= 80) {
        var transformproperty =
          "translate(" + d.x1 + " " + (d.y0 + 10) + ") rotate(90)";
        console.log(transformproperty);
        return transformproperty;
      } else {
        ("none");
      }
    })
    .style("cursor", "pointer")
    .text(function(d) {
      if (d.x1 - d.x0 > 5) {
        return d.data.key;
      } else {
        return;
      }
    });
  //get total size from rect
  totalSize = rect.node().__data__.value;
});

function switchData(d) {
  var basecolor = d3.select(this).style("fill"); //This is the object we clicked, save that color

  d3.select("#chart")
    .select("svg")
    .remove(); //Remove existing viz the limit the amount of data as one

  //Define new domains (Fill the page again)

  x.domain([d.x0, d.x1]);
  y.domain([d.y0, height]).range([d.depth ? 20 : 0, height]);

  //New chart area
  var vis = d3
    .select("#chart")
    .append("svg:svg")
    .attr("width", width)
    .attr("height", height);

  var partition = d3
    .partition()
    .size([width, height])
    .padding(0)
    .round(true);

  var rect = vis.selectAll("rect");
  var fo = vis.selectAll("foreignObject");
  var totalSize = 0;

  //new rectangles
  rect = rect
    .data(d.descendants())
    .enter()
    .append("rect")
    .attr("x", function(d) {
      return x(d.x0);
    })
    .attr("y", function(d) {
      return y(d.y0);
    })
    .attr("width", function(d) {
      if (x(d.x1) - x(d.x0) >= 0) {
        return x(d.x1) - x(d.x0);
      } else {
        return;
      }
    })
    .attr("height", function(d) {
      return y(d.y1) - y(d.y0);
    })
    .attr("fill", basecolor) //same as the one you clicked on
    .attr("stroke", "white")
    .style("cursor", "pointer")
    .on("click", switchData);

  //new text
  fo = fo
    .data(d.descendants())
    .enter()
    .append("foreignObject")
    .attr("x", function(d) {
      if (x(d.x1) - x(d.x0) <= 80) {
        return 0;
      } else {
        return x(d.x0);
      }
    })
    .attr("y", function(d) {
      if (x(d.x1) - x(d.x0) <= 80) {
        return 0;
      } else {
        return y(d.y0);
      }
    })
    .attr("width", function(d) {
      if (x(d.x1) - x(d.x0) <= 20) {
        return;
      }
      if (x(d.x1) - x(d.x0) <= 80) {
        return 400;
      } else {
        return x(d.x1) - x(d.x0);
      }
    })
    .attr("height", function(d) {
      var h = y(d.y1 - d.y0);
      if (h >= 18) {
        return y(d.y1 - d.y0);
      } else {
        return 18;
      }
    })
    .attr("text-anchor", "middle")
    .attr("transform", function(d) {
      if (x(d.x1) - x(d.x0) <= 80) {
        var transformproperty =
          "translate(" + x(d.x0) + " " + (y(d.y0) + 10) + ") rotate(90)";
        console.log(transformproperty);
        return transformproperty;
      } else {
        ("none");
      }
    })
    .style("cursor", "pointer")
    .text(function(d) {
      if (x(d.x1) - x(d.x0) > 5) {
        return d.data.key;
      } else {
        return;
      }
    });

  //Breadcrumb (from clicked function)//
  // code to update the BreadcrumbTrail();
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  var valueString = numberWithCommas(d.value);

  d3.select("#value").text(valueString);

  d3.select("#explanation").style("visibility", "");

  var sequenceArray = d.ancestors().reverse();
  //sequenceArray.shift(); // remove root node from the array
  updateBreadcrumbs(sequenceArray, valueString);
}

function initializeBreadcrumbTrail() {
  // Add the svg area.
  var trail = d3
    .select("#breadcrumb")
    .append("svg:svg")
    .attr("width", width)
    .attr("height", 50)
    .attr("id", "trail");
  // Add the label at the end, for the value.
  trail
    .append("svg:text")
    .attr("id", "endlabel")
    .style("fill", "#000");

  // Make the breadcrumb trail visible, if it's hidden.
  d3.select("#trail").style("visibility", "visible");
}

// Generate a string that describes the points of a breadcrumb polygon.
function breadcrumbPoints(d, i) {
  var points = [];
  points.push("0,0");
  points.push(b.w + ",0");
  points.push(b.w + b.t + "," + b.h / 2);
  points.push(b.w + "," + b.h);
  points.push("0," + b.h);
  if (i > 0) {
    // Leftmost breadcrumb; don't include 6th vertex.
    points.push(b.t + "," + b.h / 2);
  }
  return points.join(" ");
}

// Update the breadcrumb trail to show the current sequence and value.
function updateBreadcrumbs(nodeArray, valueString) {
  // Data join; key function combines name and depth (= position in sequence).
  var trail = d3
    .select("#trail")
    .selectAll("g")
    .data(nodeArray, function(d) {
      return d.data.key + d.depth;
    });

  // Remove exiting nodes.
  trail.exit().remove();

  // Add breadcrumb and label for entering nodes.
  var entering = trail.enter().append("svg:g");

  entering
    .append("svg:polygon")
    .attr("points", breadcrumbPoints)
    .style("fill", function(d) {
      return color((d.children ? d : d.parent).data.key);
    })
    .style("cursor", "pointer")
    .on("click", switchData);

  entering
    .append("svg:text")
    .attr("x", b.t * 2)
    .attr("y", b.h / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "start")
    .text(function(d) {
      if (!d.data.key) {
        return "Overview";
      } else {
        return d.data.key;
      }
    })
    .style("cursor", "pointer")
    .call(wrap, b.w - b.t);

  // Merge enter and update selections; set position for all nodes.
  entering.merge(trail).attr("transform", function(d, i) {
    return "translate(" + i * (b.w + b.s) + ", 0)";
  });

  // Now move and update the value at the end.
  d3.select("#trail")
    .select("#endlabel")
    .attr("x", 100 + (nodeArray.length + 0.5) * (b.w + b.s))
    .attr("y", b.h / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .text("Total number of trails " + valueString);

  function wrap(text, width) {
    text.each(function() {
      var text = d3.select(this),
        words = text
          .text()
          .split(/\s+/)
          .reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text
          .text(null)
          .append("tspan")
          .attr("x", b.t * 1.2)
          .attr("y", b.t * 1.5)
          .attr("dy", dy + "em");
      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text
            .append("tspan")
            .attr("x", b.t * 1.2)
            .attr("y", b.t * 2)
            .attr("dy", ++lineNumber * lineHeight + dy + "em")
            .text(word);
        }
      }
    });
  }
}
