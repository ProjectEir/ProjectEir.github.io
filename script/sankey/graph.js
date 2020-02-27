
var units = "Widgets";

// set the dimensions and margins of the graph
var margin = { top: 100, right: 100, bottom: 100, left: 300 },
    width = 1200 - margin.left,
    height = 500; //- margin.top - margin.bottom;

// format variables
var formatNumber = d3.format(",.0f"),    // zero decimal places
    format = function (d) { return formatNumber(d) + " " + units; },
    color = d3.scaleOrdinal(d3.schemeCategory10);

// append the svg object to the body of the page
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Set the sankey diagram properties
var sankey = d3.sankey()
    .nodeWidth(50)
    .nodePadding(10) //padding between nodes
    .size([width, height]);

var path = sankey.link();

// load the data
d3.csv("data/data.csv", function (error, data) {

    //set up graph in same style as original example but empty
    graph = { "nodes": [], "links": [] };

    data.forEach(function (d) {
        graph.nodes.push({ "name": d.source });
        graph.nodes.push({ "name": d.target });
        graph.links.push({
            "source": d.source,
            "target": d.target,
            "value": +d.value,
            "color": d.color
        });
    });

    // return only the distinct / unique nodes
    graph.nodes = d3.keys(d3.nest()
        .key(function (d) { return d.name; })
        .object(graph.nodes));


    // loop through each link replacing the text with its index from node
    graph.links.forEach(function (d, i) {
        graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
        graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
    });

    // now loop through each nodes to make nodes an array of objects
    // rather than an array of strings
    graph.nodes.forEach(function (d, i) {
        graph.nodes[i] = { "name": d };
    });

    sankey
        .nodes(graph.nodes)
        .links(graph.links)
        .layout(32);

    // add in the links
    var link = svg.append("g").selectAll(".link")
        .data(graph.links)
        .enter().append("path")
        .attr("class", "link")
        .attr("d", path)
        .style("stroke-width", function (d) { return Math.max(1, d.dy); })
        .sort(function (a, b) { return b.dy - a.dy; });

    // add the link titles
    link.append("title")
        .text(function (d) {
            return d.source.name + " → " +
                d.target.name + "\n" + format(d.value);
        });

    // add in the nodes
    var node = svg.append("g").selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        })
        .call(d3.drag()
            .subject(function (d) {
                return d;
            })
            .on("start", function () {
                this.parentNode.appendChild(this);
            })
            .on("drag", dragmove));

    // add the rectangles for the nodes
    var i = -1;
    var colors = ["#af4262",
        "#ab4e89",
        "#966485",
        "#a56572",
        "#d44196",
        "#e44172",
        "#d940ba",
        "#e685b4",
        "#e1acc0",
        "#516964",
        "#366f5a",
        "#48948a",
        "#38a278",
        "#8aa39d",
        "#77b9a4",
        "#59e59f",
        "#57e3ca",
        "#aae5d6",
        "#aae5d6",
        "#aae5d6",
        "#aae5d6",
        "#aae5d6",
        "#aae5d6",
        "#aae5d6",
        "#aae5d6",
        "#aae5d6"];
    node.append("rect")
        .attr("height", function (d) { return d.dy; })
        .attr("width", sankey.nodeWidth())
        .style("fill", function (d) { //TODO: fix
            i++;
            return d.color = colors[i];
        })
        .append("title")
        .text(function (d) {
            return d.name + "\n" + format(d.value);
        });

    // add in the title for the nodes
    node.append("text")
        .attr("x", -6)
        .attr("y", function (d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function (d) { return d.name; })
        .filter(function (d) { return d.x < width / 2; })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");

    // the function for moving the nodes
    function dragmove(d) {
        d3.select(this)
            .attr("transform",
                "translate("
                + d.x + ","
                + (d.y = Math.max(
                    0, Math.min(height - d.dy, d3.event.y))
                ) + ")");
        sankey.relayout();
        link.attr("d", path);
    }

    // testing dynamicness
    var numLayouts = 1;
    d3.select("svg").on("click", moreLayouts);
    sankey.layout(numLayouts);

    function moreLayouts() {
        numLayouts += 200; sankey.layout(numLayouts);
        d3.selectAll(".link").transition().duration(500).attr("d", sankey.link())
        d3.selectAll(".node").transition().duration(500).attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
    }
});