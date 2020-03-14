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

var tooltip = d3
    .select("#chart")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("font-family", "Poppins")
    .style("padding", "10px")
    .style("border-radius", "5px")
    .style("background-color", "WhiteSmoke")
    .style("box-shadow", "10px 10px 28px 0px rgba(0,0,0,0.75)")
    .style("position", "absolute")
    .style("color", "black");

// -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
var showTooltip = function (d) {
    tooltip.transition().duration(100);
    // root
    if (d.height == 2) {
        tooltip
            .style("opacity", 1)
            .html("Root")
            .style("left", d3.mouse(this)[0] + 250 + "px")
            .style("top", d3.mouse(this)[1] + 100 + "px");
        // category
    } else if (d.height == 1) {
        percentage = Math.round(1000 * (sumChildren(d) / 2321192)) / 1000;

        tooltip
            .style("opacity", 1)
            .html("Category: " + d.data.key + "<br/>Number of diseases: " + d.children.length + "<br/>Percentage of total trials: " + percentage)
            .style("left", d3.mouse(this)[0] + 250 + "px")
            .style("top", d3.mouse(this)[1] + 100 + "px");
    } else {
        percentage = Math.round(10000 * (d.value / 2321192)) / 10000;
        tooltip
            .style("opacity", 1)
            .html("Disease: " + d.data.key + "<br/>Number of trials: " + d.data.value + "<br/>Percentage of total trials: " + percentage)
            .style("left", d3.mouse(this)[0] + 250 + "px")
            .style("top", d3.mouse(this)[1] + 100 + "px");
    }

};

function sumChildren(d) {
    sum = 0;
    for (i = 0; i < d.children.length; i++) {
        sum += d.children[i].value;
    }
    return sum;
}

var moveTooltip = function (d) {
    tooltip
        .style("left", d3.mouse(this)[0] + "px")
        .style("top", d3.mouse(this)[1] + 100 + "px");
};

var hideTooltip = function (d) {
    tooltip
        .transition()
        .duration(500)
        .style("opacity", 0);
};

var rect = vis.selectAll("rect");
var fo = vis.selectAll("foreignObject");
var totalSize = 0;

d3.json("data/dataX.json", function (error, root) {
    if (error) throw error;

    function parallelcoordinatesBySearch(d) {

        var margin = { top: 66, right: 110, bottom: 20, left: 288 },
            width = document.body.clientWidth - margin.left - margin.right,
            height = 340 - margin.top - margin.bottom,
            innerHeight = height - 2;

        var devicePixelRatio = window.devicePixelRatio || 1;

        var color = d3.scaleOrdinal()
            .domain(["Radial Velocity", "Imaging", "Eclipse Timing Variations", "Astrometry", "Microlensing", "Orbital Brightness Modulation", "Pulsar Timing", "Pulsation Timing Variations", "Transit", "Transit Timing Variations"])
            .range(["#DB7F85", "#50AB84", "#4C6C86", "#C47DCB", "#B59248", "#DD6CA7", "#E15E5A", "#5DA5B3", "#725D82", "#54AF52", "#954D56", "#8C92E8", "#D8597D", "#AB9C27", "#D67D4B", "#D58323", "#BA89AD", "#357468", "#8F86C2", "#7D9E33", "#517C3F", "#9D5130", "#5E9ACF", "#776327", "#944F7E"]);

        var types = {
            "Number": {
                key: "Number",
                coerce: function (d) { return +d; },
                extent: d3.extent,
                within: function (d, extent, dim) { return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1]; },
                defaultScale: d3.scaleLinear().range([innerHeight, 0])
            },
            "String": {
                key: "String",
                coerce: String,
                extent: function (data) { return data.sort(); },
                within: function (d, extent, dim) { return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1]; },
                defaultScale: d3.scalePoint().range([0, innerHeight])
            },
            "Date": {
                key: "Date",
                coerce: function (d) { return new Date(d); },
                extent: d3.extent,
                within: function (d, extent, dim) { return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1]; },
                defaultScale: d3.scaleTime().range([innerHeight, 0])
            }
        };

        // New
        var yAxis = d3.axisLeft();

        var container = d3.select("body").append("div")
            .attr("class", "parcoords")
            .style("width", width + margin.left + margin.right + "px")
            .style("height", height + margin.top + margin.bottom + "px");

        var svg = container.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var canvas = container.append("canvas")
            .attr("width", width * devicePixelRatio)
            .attr("height", height * devicePixelRatio)
            .style("width", width + "px")
            .style("height", height + "px")
            .style("margin-top", margin.top + "px")
            .style("margin-left", margin.left + "px");

        var ctx = canvas.node().getContext("2d");
        ctx.globalCompositeOperation = 'darken';
        ctx.globalAlpha = 0.15;
        ctx.lineWidth = 1.5;
        ctx.scale(devicePixelRatio, devicePixelRatio);

        var output = d3.select("body").append("pre")
            .style("width", width + margin.right + "px")
            .style("margin-left", margin.left - 50 + "px");

        selectedOption = d.data.key;
        format = selectedOption.split(" ").join("+");
        url = makeUrl(format);
        ajax(url).then(function (result) {
            // Here we can build the parallel coordinate system
            myData = trim(result);
            myDimensions = makeDimensions();
            // use d3.csvParse(myData){...}
            // see https://stackoverflow.com/questions/42285441/how-to-read-in-csv-with-d3-v4
            //                    console.log(types, "check1");
            dimensions = myDimensions;

            var xscale = d3.scalePoint()
                .domain(d3.range(dimensions.length))
                .range([0, width]);

            var axes = svg.selectAll(".axis")
                .data(dimensions)
                .enter().append("g")
                .attr("class", function (d) { return "axis " + d.key.replace(/ /g, "_"); })
                .attr("transform", function (d, i) { return "translate(" + xscale(i) + ")"; });

            d3.csvParse(myData, function (error, data) {
                data = d3.csvParse(myData);

                data.forEach(function (d) {
                    dimensions.forEach(function (p) {
                        d[p.key] = !d[p.key] ? null : p.type.coerce(d[p.key]);
                    });

                    // truncate long text strings to fit in data table
                    for (var key in d) {
                        if (d[key] && d[key].length > 35) d[key] = d[key].slice(0, 36);
                    }
                });

                // type/dimension default setting happens here
                dimensions.forEach(function (dim) {
                    if (!("domain" in dim)) {
                        // detect domain using dimension type's extent function
                        dim.domain = d3_functor(dim.type.extent)(data.map(function (d) { return d[dim.key]; }));
                    }
                    if (!("scale" in dim)) {
                        // use type's default scale for dimension
                        dim.scale = dim.type.defaultScale.copy();
                    }
                    dim.scale.domain(dim.domain);
                });

                var render = renderQueue(draw).rate(30);

                ctx.clearRect(0, 0, width, height);
                ctx.globalAlpha = d3.min([1.15 / Math.pow(data.length, 0.3), 1]);
                render(data);

                axes.append("g")
                    .each(function (d) {
                        var renderAxis = "axis" in d
                            ? d.axis.scale(d.scale)  // custom axis
                            : yAxis.scale(d.scale);  // default axis
                        d3.select(this).call(renderAxis);
                    })
                    .append("text")
                    .attr("class", "title")
                    .attr("text-anchor", "start")
                    .text(function (d) { return "description" in d ? d.description : d.key; });

                // Add and store a brush for each axis.
                axes.append("g")
                    .attr("class", "brush")
                    .each(function (d) {
                        d3.select(this).call(d.brush = d3.brushY()
                            .extent([[-10, 0], [10, height]])
                            .on("start", brushstart)
                            .on("brush", brush)
                            .on("end", brush)
                        )
                    })
                    .selectAll("rect")
                    .attr("x", -8)
                    .attr("width", 16);

                d3.selectAll(".axis.Rank .tick text")
                    .style("fill", color);


                //create a deep copy of the data
                let filteredSelected = JSON.parse(JSON.stringify(data));
                //slice the date data
                filteredSelected = sliceDates(filteredSelected);
                //print
                output.text(d3.tsvFormat(sliceDates(filteredSelected).slice(0, 24)));
                //clean copy just in case
                filteredSelected = {};

                function project(d) {
                    return dimensions.map(function (p, i) {
                        // check if data element has property and contains a value
                        if (
                            !(p.key in d) ||
                            d[p.key] === null
                        ) return null;

                        return [xscale(i), p.scale(d[p.key])];
                    });
                };
                //slices the dates string to right size
                function sliceDates(container) {
                    for (j = 0; j < container.length; j++) {
                        //set to 10 due to the date format yyyy-mm-dd
                        if (container[j].StartDate) container[j].StartDate = container[j].StartDate.toString().slice(0, 10);
                        if (container[j].CompletionDate) container[j].CompletionDate = container[j].CompletionDate.toString().slice(0, 10);
                        if (container[j].LastUpdatePostDate) container[j].LastUpdatePostDate = container[j].LastUpdatePostDate.toString().slice(0, 10);
                        if (container[j].OutcomeMeasureAnticipatedPostingDate) container[j].OutcomeMeasureAnticipatedPostingDate = container[j].OutcomeMeasureAnticipatedPostingDate.toString().slice(0, 10);
                        if (container[j].ResultsFirstPostDate) container[j].ResultsFirstPostDate = container[j].ResultsFirstPostDate.toString().slice(0, 10);
                        if (container[j].ResultsFirstSubmitDate) container[j].ResultsFirstSubmitDate = container[j].ResultsFirstSubmitDate.toString().slice(0, 10);

                    }

                    return container;
                }
                function draw(d) {
                    ctx.strokeStyle = color(d.pl_discmethod);
                    ctx.beginPath();
                    var coords = project(d);
                    coords.forEach(function (p, i) {
                        // this tricky bit avoids rendering null values as 0
                        if (p === null) {
                            // this bit renders horizontal lines on the previous/next
                            // dimensions, so that sandwiched null values are visible
                            if (i > 0) {
                                var prev = coords[i - 1];
                                if (prev !== null) {
                                    ctx.moveTo(prev[0], prev[1]);
                                    ctx.lineTo(prev[0] + 6, prev[1]);
                                }
                            }
                            if (i < coords.length - 1) {
                                var next = coords[i + 1];
                                if (next !== null) {
                                    ctx.moveTo(next[0] - 6, next[1]);
                                }
                            }
                            return;
                        }

                        if (i == 0) {
                            ctx.moveTo(p[0], p[1]);
                            return;
                        }

                        ctx.lineTo(p[0], p[1]);
                    });
                    ctx.stroke();
                }

                function brushstart() {
                    d3.event.sourceEvent.stopPropagation();
                }

                // Handles a brush event, toggling the display of foreground lines.
                function brush() {
                    render.invalidate();

                    var actives = [];
                    svg.selectAll(".axis .brush")
                        .filter(function (d) {
                            return d3.brushSelection(this);
                        })
                        .each(function (d) {
                            actives.push({
                                dimension: d,
                                extent: d3.brushSelection(this)
                            });
                        });

                    var selected = data.filter(function (d) {
                        if (actives.every(function (active) {
                            var dim = active.dimension;
                            // test if point is within extents for each active brush
                            return dim.type.within(d[dim.key], active.extent, dim);
                        })) {
                            return true;
                        }
                    });
                    ctx.clearRect(0, 0, width, height);
                    ctx.globalAlpha = d3.min([0.85 / Math.pow(selected.length, 0.3), 1]);
                    render(selected);


                    //create a deep copy of the data
                    let filteredSelected = JSON.parse(JSON.stringify(selected));
                    //slice the date data
                    filteredSelected = sliceDates(filteredSelected);
                    //print
                    output.text(d3.tsvFormat(sliceDates(filteredSelected).slice(0, 24)));
                    //clean copy just in case
                    filteredSelected = {};

                }

            });
        });
        // New
        function d3_functor(v) {
            return typeof v === "function" ? v : function () { return v; };
        };

        // Returns csv of selected query
        function ajax(url) {
            return new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    resolve(this.responseText);
                };
                xhr.onerror = reject;
                xhr.open('GET', url);
                xhr.send();
            });
        };

        // Formatting needed to have pure csv
        function trim(s) {
            var lines = s.split('\n');
            lines.splice(0, 10);
            for (i = 0; i < lines.length; i++) {
                line = lines[i].split(',');
                for (j = 0; j < line.length; j++) {
                    if (line[j] == "") {
                        line[j] = '"' + 0 + '"';
                    }
                }
                lines[i] = line.join(',');
            }
            lines.splice(lines.length - 1, lines.length);
            var newlines = lines.join('\n');

            return newlines;
        };

        function makeUrl(disease) {
            // Grab title and trial name of diseases
            return "https://clinicaltrials.gov/api/query/study_fields?expr=" + disease + "%0D%0A&fields=BriefTitle%2C+Condition%2C+Phase%2C+EnrollmentCount%2C+StartDate%2C+CompletionDate%2C+LastUpdatePostDate%2C+OutcomeMeasureAnticipatedPostingDate%2C+ResultsFirstPostDate%2C+ResultsFirstSubmitDate&min_rnk=1&max_rnk=50&fmt=csv";
        }

        function makeDimensions() {
            dim = []
            if (document.getElementById("Phase").checked) {
                dim = dim.concat({
                    key: "Phase",
                    description: "Phase",
                    type: types["String"]
                })
            }

            if (document.getElementById("EnrollmentCount").checked) {
                dim = dim.concat({
                    key: "EnrollmentCount",
                    description: "Enrollment Count",
                    type: types["Number"]
                });
            }
            if (document.getElementById("StartDate").checked) {
                dim = dim.concat({
                    key: "StartDate",
                    description: "Start Date",
                    type: types["Date"]
                });
            }
            if (document.getElementById("CompletionDate").checked) {
                dim = dim.concat({
                    key: "CompletionDate",
                    description: "Completion Date",
                    type: types["Date"]
                });
            }
            if (document.getElementById("LastUpdatePostDate").checked) {
                dim = dim.concat({
                    key: "LastUpdatePostDate",
                    description: "Last Update Post Date",
                    type: types["Date"]
                });
            }
            if (document.getElementById("OutcomeMeasureAnticipatedPostingDate").checked) {
                dim = dim.concat({
                    key: "OutcomeMeasureAnticipatedPostingDate",
                    description: "Outcome Measure Anticipated Posting Date",
                    type: types["Date"]
                });
            }
            if (document.getElementById("ResultsFirstPostDate").checked) {
                dim = dim.concat({
                    key: "ResultsFirstPostDate",
                    description: "Results First Post Date",
                    type: types["Date"]
                });
            }
            if (document.getElementById("ResultsFirstSubmitDate").checked) {
                dim = dim.concat({
                    key: "ResultsFirstSubmitDate",
                    description: "Results First Submit Date",
                    type: types["Date"]
                });
            }

            return dim;
        }
    }
    function f_search() {
        var disease = $('#search_disease').val();
        if (disease != "") {
            var obj;
            var found = false;
            var i = 0;
            //search json object by key
            while (!found && i < root.descendants().length) {
                if (root.descendants()[i].data.key == disease) {
                    obj = root.descendants()[i];
                    found = true;
                }
                i++;
            }

            switchData(obj, 1212);
            parallelcoordinatesBySearch(obj);
            $('#search_disease').val("");
        } else {
            alert("Empty search!");
        }
    }

    $(function () {
        $("#btn_src").click(function () {
            f_search();
        });
    });

    root = d3
        .hierarchy(d3.entries(root)[0], function (d) {
            return d3.entries(d.value);
        })
        .sum(function (d) {
            return d.value;
        })
        .sort(function (a, b) {
            return b.value - a.value;
        });

    partition(root);
    switchData(root);

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
        .append("rect")
        .attr("x", function (d) {
            return d.x0;
        })
        .attr("y", function (d) {
            return d.y0;
        })
        .attr("width", function (d) {
            if (d.x1 - d.x0 >= 0) {
                return d.x1 - d.x0;
            } else {
                0;
            }
        })
        .attr("height", function (d) {
            return d.y1 - d.y0;
        })
        .attr("fill", function (d) {
            return color((d.children ? d : d.parent).data.key);
        })
        .attr("stroke", "white")
        .style("cursor", "pointer")
        .on("mouseover", showTooltip)
        .on("mouseleave", hideTooltip)
        .on("click", switchData);

    /*div = div
        .data(root.descendants())
        .enter()
        .append("div")
        .attr("x", function (d) {
            return d.x0;
        })
        .attr("y", function (d) {
            return d.y0;
        })
        .attr("width", function (d) {
            if (d.x1 - d.x0 >= 0) {
                return d.x1 - d.x0;
            } else {
                0;
            }
        })
        .attr("height", function (d) {
            return d.y1 - d.y0;
        })
        .attr("fill", function (d) {
            return color((d.children ? d : d.parent).data.key);
        })
        .attr("stroke", "white")
        .on("mouseover", showTooltip)
        .on("mouseleave", hideTooltip);*/

    fo = fo
        .data(root.descendants())
        .enter()
        .append("foreignObject")
        .attr("x", function (d) {
            return d.x0;
        })
        .attr("y", function (d) {
            return d.y0;
        })
        .attr("width", function (d) {
            if (d.x1 - d.x0 >= 20) {
                return d.x1 - d.x0;
            } else {
                0;
            }
        })
        .attr("height", function (d) {
            return d.y1 - d.y0;
        })
        .attr("fill", function (d) {
            return color((d.children ? d : d.parent).data.key);
        })
        .style("cursor", "pointer")
        .attr("text-size", 10)
        .text(function (d) {
            return d.data.key;
        })
        .attr("stroke", "white")
        .on("mouseover", showTooltip)
        .on("mousemove", showTooltip)
        .on("mouseleave", hideTooltip)
        .on("click", switchData);

    //get total size from rect
    totalSize = rect.node().__data__.value;
});



function switchData(d, isSearch = 0) {
    d3.select(".parcoords").remove();
    d3.selectAll("pre").remove();

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
        .attr("height", function (a) {
            if (d.height == 0) {
                return 40;
            }
            return height;
        });

    var partition = d3
        .partition()
        .size([width, height])
        .padding(0)
        .round(true);

    var rect = vis.selectAll("rect");
    var fo = vis.selectAll("foreignObject");
    var totalSize = 0;


    // -1- Create a tooltip div that is hidden by default:
    var tooltip = d3
        .select("#chart")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("font-family", "Poppins")
        .style("padding", "10px")
        .style("border-radius", "5px")
        .style("background-color", "WhiteSmoke")
        .style("box-shadow", "10px 10px 28px 0px rgba(0,0,0,0.75)")
        .style("position", "absolute")
        .style("color", "black");



    //new rectangles
    rect = rect
        .data(d.descendants())
        .enter()
        .append("rect")
        .attr("x", function (d) {
            return x(d.x0);
        })
        .attr("y", function (a) {
            if (d.height == 1 && a.height == 0) { return y(a.y0) - (height / 2 - 40); }
            return y(a.y0);
        })
        .attr("width", function (d) {
            if (isSearch == 1212) { //called from search bar
                return 1080;
            } else {
                if (x(d.x1) - x(d.x0) >= 0) {
                    return x(d.x1) - x(d.x0);
                } else {
                    return;
                }
            }
        })
        .attr("height", function (a) {
            if (d.height == 1 && a.height == 1) { return 40 }
            return y(a.y1) - y(a.y0);
        })
        .attr("fill", function (d) {
            //same as the one you clicked on
            return color((d.children ? d : d.parent).data.key);
        })
        .attr("stroke", "white")
        .style("cursor", "pointer")
        .attr("stroke", "white")
        .on("mouseover", showTooltip)
        .on("mousemove", showTooltip)
        .on("mouseleave", hideTooltip)
        .on("click", function (d) {
            d3.select("pre").remove();
            switchData(d);
            if (d.height == 0) {

                var margin = { top: 66, right: 110, bottom: 20, left: 288 },
                    width = document.body.clientWidth - margin.left - margin.right,
                    height = 340 - margin.top - margin.bottom,
                    innerHeight = height - 2;

                var devicePixelRatio = window.devicePixelRatio || 1;

                var color = d3.scaleOrdinal()
                    .domain(["Radial Velocity", "Imaging", "Eclipse Timing Variations", "Astrometry", "Microlensing", "Orbital Brightness Modulation", "Pulsar Timing", "Pulsation Timing Variations", "Transit", "Transit Timing Variations"])
                    .range(["#DB7F85", "#50AB84", "#4C6C86", "#C47DCB", "#B59248", "#DD6CA7", "#E15E5A", "#5DA5B3", "#725D82", "#54AF52", "#954D56", "#8C92E8", "#D8597D", "#AB9C27", "#D67D4B", "#D58323", "#BA89AD", "#357468", "#8F86C2", "#7D9E33", "#517C3F", "#9D5130", "#5E9ACF", "#776327", "#944F7E"]);

                var types = {
                    "Number": {
                        key: "Number",
                        coerce: function (d) { return +d; },
                        extent: d3.extent,
                        within: function (d, extent, dim) { return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1]; },
                        defaultScale: d3.scaleLinear().range([innerHeight, 0])
                    },
                    "String": {
                        key: "String",
                        coerce: String,
                        extent: function (data) { return data.sort(); },
                        within: function (d, extent, dim) { return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1]; },
                        defaultScale: d3.scalePoint().range([0, innerHeight])
                    },
                    "Date": {
                        key: "Date",
                        coerce: function (d) { return new Date(d); },
                        extent: d3.extent,
                        within: function (d, extent, dim) { return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1]; },
                        defaultScale: d3.scaleTime().range([innerHeight, 0])
                    }
                };

                // New
                var yAxis = d3.axisLeft();

                var container = d3.select("body").append("div")
                    .attr("class", "parcoords")
                    .style("width", width + margin.left + margin.right + "px")
                    .style("height", height + margin.top + margin.bottom + "px");

                var svg = container.append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                var canvas = container.append("canvas")
                    .attr("width", width * devicePixelRatio)
                    .attr("height", height * devicePixelRatio)
                    .style("width", width + "px")
                    .style("height", height + "px")
                    .style("margin-top", margin.top + "px")
                    .style("margin-left", margin.left + "px");

                var ctx = canvas.node().getContext("2d");
                ctx.globalCompositeOperation = 'darken';
                ctx.globalAlpha = 0.15;
                ctx.lineWidth = 1.5;
                ctx.scale(devicePixelRatio, devicePixelRatio);

                var output = d3.select("body").append("pre")
                    .style("width", width + margin.right + "px")
                    .style("margin-left", margin.left - 50 + "px");

                selectedOption = d.data.key;
                format = selectedOption.split(" ").join("+");
                url = makeUrl(format);
                ajax(url).then(function (result) {
                    // Here we can build the parallel coordinate system
                    myData = trim(result);
                    myDimensions = makeDimensions();
                    // use d3.csvParse(myData){...}
                    // see https://stackoverflow.com/questions/42285441/how-to-read-in-csv-with-d3-v4
                    //                    console.log(types, "check1");
                    dimensions = myDimensions;

                    var xscale = d3.scalePoint()
                        .domain(d3.range(dimensions.length))
                        .range([0, width]);

                    var axes = svg.selectAll(".axis")
                        .data(dimensions)
                        .enter().append("g")
                        .attr("class", function (d) { return "axis " + d.key.replace(/ /g, "_"); })
                        .attr("transform", function (d, i) { return "translate(" + xscale(i) + ")"; });

                    d3.csvParse(myData, function (error, data) {
                        data = d3.csvParse(myData);

                        data.forEach(function (d) {
                            dimensions.forEach(function (p) {
                                d[p.key] = !d[p.key] ? null : p.type.coerce(d[p.key]);
                            });

                            // truncate long text strings to fit in data table
                            for (var key in d) {
                                if (d[key] && d[key].length > 35) d[key] = d[key].slice(0, 36);
                            }
                        });

                        // type/dimension default setting happens here
                        dimensions.forEach(function (dim) {
                            if (!("domain" in dim)) {
                                // detect domain using dimension type's extent function
                                dim.domain = d3_functor(dim.type.extent)(data.map(function (d) { return d[dim.key]; }));
                            }
                            if (!("scale" in dim)) {
                                // use type's default scale for dimension
                                dim.scale = dim.type.defaultScale.copy();
                            }
                            dim.scale.domain(dim.domain);
                        });

                        var render = renderQueue(draw).rate(30);

                        ctx.clearRect(0, 0, width, height);
                        ctx.globalAlpha = d3.min([1.15 / Math.pow(data.length, 0.3), 1]);
                        render(data);

                        axes.append("g")
                            .each(function (d) {
                                var renderAxis = "axis" in d
                                    ? d.axis.scale(d.scale)  // custom axis
                                    : yAxis.scale(d.scale);  // default axis
                                d3.select(this).call(renderAxis);
                            })
                            .append("text")
                            .attr("class", "title")
                            .attr("text-anchor", "start")
                            .text(function (d) { return "description" in d ? d.description : d.key; });

                        // Add and store a brush for each axis.
                        axes.append("g")
                            .attr("class", "brush")
                            .each(function (d) {
                                d3.select(this).call(d.brush = d3.brushY()
                                    .extent([[-10, 0], [10, height]])
                                    .on("start", brushstart)
                                    .on("brush", brush)
                                    .on("end", brush)
                                )
                            })
                            .selectAll("rect")
                            .attr("x", -8)
                            .attr("width", 16);

                        d3.selectAll(".axis.Rank .tick text")
                            .style("fill", color);


                        //create a deep copy of the data
                        let filteredSelected = JSON.parse(JSON.stringify(data));
                        //slice the date data
                        filteredSelected = sliceDates(filteredSelected);
                        //print
                        output.text(d3.tsvFormat(sliceDates(filteredSelected).slice(0, 24)));
                        //clean copy just in case
                        filteredSelected = {};


                        function project(d) {
                            return dimensions.map(function (p, i) {
                                // check if data element has property and contains a value
                                if (
                                    !(p.key in d) ||
                                    d[p.key] === null
                                ) return null;

                                return [xscale(i), p.scale(d[p.key])];
                            });
                        };
                        //slices the dates string to right size
                        function sliceDates(container) {
                            for (j = 0; j < container.length; j++) {
                                //set to 10 due to the date format yyyy-mm-dd
                                if (container[j].StartDate) container[j].StartDate = container[j].StartDate.toString().slice(0, 10);
                                if (container[j].CompletionDate) container[j].CompletionDate = container[j].CompletionDate.toString().slice(0, 10);
                                if (container[j].LastUpdatePostDate) container[j].LastUpdatePostDate = container[j].LastUpdatePostDate.toString().slice(0, 10);
                                if (container[j].OutcomeMeasureAnticipatedPostingDate) container[j].OutcomeMeasureAnticipatedPostingDate = container[j].OutcomeMeasureAnticipatedPostingDate.toString().slice(0, 10);
                                if (container[j].ResultsFirstPostDate) container[j].ResultsFirstPostDate = container[j].ResultsFirstPostDate.toString().slice(0, 10);
                                if (container[j].ResultsFirstSubmitDate) container[j].ResultsFirstSubmitDate = container[j].ResultsFirstSubmitDate.toString().slice(0, 10);

                            }

                            return container;
                        }

                        function draw(d) {
                            ctx.strokeStyle = color(d.pl_discmethod);
                            ctx.beginPath();
                            var coords = project(d);
                            coords.forEach(function (p, i) {
                                // this tricky bit avoids rendering null values as 0
                                if (p === null) {
                                    // this bit renders horizontal lines on the previous/next
                                    // dimensions, so that sandwiched null values are visible
                                    if (i > 0) {
                                        var prev = coords[i - 1];
                                        if (prev !== null) {
                                            ctx.moveTo(prev[0], prev[1]);
                                            ctx.lineTo(prev[0] + 6, prev[1]);
                                        }
                                    }
                                    if (i < coords.length - 1) {
                                        var next = coords[i + 1];
                                        if (next !== null) {
                                            ctx.moveTo(next[0] - 6, next[1]);
                                        }
                                    }
                                    return;
                                }

                                if (i == 0) {
                                    ctx.moveTo(p[0], p[1]);
                                    return;
                                }

                                ctx.lineTo(p[0], p[1]);
                            });
                            ctx.stroke();
                        }

                        function brushstart() {
                            d3.event.sourceEvent.stopPropagation();
                        }

                        // Handles a brush event, toggling the display of foreground lines.
                        function brush() {
                            render.invalidate();

                            var actives = [];
                            svg.selectAll(".axis .brush")
                                .filter(function (d) {
                                    return d3.brushSelection(this);
                                })
                                .each(function (d) {
                                    actives.push({
                                        dimension: d,
                                        extent: d3.brushSelection(this)
                                    });
                                });

                            var selected = data.filter(function (d) {
                                if (actives.every(function (active) {
                                    var dim = active.dimension;
                                    // test if point is within extents for each active brush
                                    return dim.type.within(d[dim.key], active.extent, dim);
                                })) {
                                    return true;
                                }
                            });
                            ctx.clearRect(0, 0, width, height);
                            ctx.globalAlpha = d3.min([0.85 / Math.pow(selected.length, 0.3), 1]);
                            render(selected);

                            //create a deep copy of the data
                            let filteredSelected = JSON.parse(JSON.stringify(selected));
                            //slice the date data
                            filteredSelected = sliceDates(filteredSelected);
                            //print
                            output.text(d3.tsvFormat(sliceDates(filteredSelected).slice(0, 24)));
                            //clean copy just in case
                            filteredSelected = {};

                        }

                    });
                });
                // New
                function d3_functor(v) {
                    return typeof v === "function" ? v : function () { return v; };
                };

                // Returns csv of selected query
                function ajax(url) {
                    return new Promise(function (resolve, reject) {
                        var xhr = new XMLHttpRequest();
                        xhr.onload = function () {
                            resolve(this.responseText);
                        };
                        xhr.onerror = reject;
                        xhr.open('GET', url);
                        xhr.send();
                    });
                };

                // Formatting needed to have pure csv
                function trim(s) {
                    var lines = s.split('\n');
                    lines.splice(0, 10);
                    for (i = 0; i < lines.length; i++) {
                        line = lines[i].split(',');
                        for (j = 0; j < line.length; j++) {
                            if (line[j] == "") {
                                line[j] = '"' + 0 + '"';
                            }
                        }
                        lines[i] = line.join(',');
                    }
                    lines.splice(lines.length - 1, lines.length);
                    var newlines = lines.join('\n');

                    return newlines;
                };

                /*
                 * Make Url
                 * Take query and URL it:
                 * "Expression: AREA[Condition]Abscess AND AREA[StartDate]RANGE[01/01/2015, MAX] AND AREA[Gender]Female AND AREA[StdAge](Child OR Adult)"
                 *      all ' ' -> +
                 *      all ',' -> %2C
                 *      all '[' -> %5B ; all ']' -> %5D
                 *      all '(' -> %28 ; all ')' ->
                 *      all '/' -> %2F
                 */
                function makeUrl(disease) {
                    // Grab title and trial name of diseases
                    url = "https://clinicaltrials.gov/api/query/study_fields?expr="
                    query = "AREA[Condition]" + disease;

                    // Check for Start Date - Done
                    dateFilter = document.getElementById("FilterbyDate");
                    if (dateFilter.checked) {
                        query = query.concat(" AND AREA[StartDate]RANGE[");
                        //year, month, day
                        rangeStart = document.getElementById("rangeDateStart").value.split('-');
                        rangeEnd = document.getElementById("rangeDateEnd").value.split('-');
                        if (rangeStart == [""]) {
                            query = query.concat("MIN, ");
                        } else {
                            query = query.concat(rangeStart[2] + "/" + rangeStart[1] + "/" + rangeStart[0] + ", ");
                        };
                        if (rangeEnd[0] == "") {
                            query = query.concat("MAX]");

                        } else {
                            query = query.concat(rangeEnd[2] + "/" + rangeEnd[1] + "/" + rangeEnd[0] + "]");
                        };
                    }

                    // Check for Enrollment Count - Done
                    enrollmentFilter = document.getElementById("FilterbyEnrollment");
                    if (enrollmentFilter.checked) {
                        query = query.concat(" AND AREA[EnrollmentCount]RANGE[");
                        
                        minEnrollment = document.getElementById("minEnrollment").value;
                        maxEnrollment = document.getElementById("maxEnrollment").value;
                        if (minEnrollment == "") {
                            query = query.concat("MIN, ");
                        } else {
                            query = query.concat(minEnrollment + ", ");
                        };
                        if (maxEnrollment == "") {
                            query = query.concat("MAX]");

                        } else {
                            query = query.concat(maxEnrollment + "]");
                        };
                    }

                    // Check for Age Group - Done
                    ageValue = document.getElementById("age").value
                    if (ageValue != "") {
                        query = query.concat(" AND AREA[StdAge]");
                        if (ageValue == "child") { query = query.concat("Child"); }
                        if (ageValue == "childadult") { query = query.concat("(Child OR Adult)"); }
                        if (ageValue == "adult") { query = query.concat("Adult"); }
                        if (ageValue == "adultold") { query = query.concat("(Adult OR Older Adult)"); }
                        if (ageValue == "old") { query = query.concat("Older Adult"); }
                    }

                    // Check for Gender - Done
                    genderValue = document.getElementById("gender").value
                    if (genderValue != "") {
                        query = query.concat(" AND AREA[Gender]");
                        if (genderValue == "female") { query = query.concat("(Female OR All)"); }
                        if (genderValue == "male") { query = query.concat("(Male OR All)"); }
                        if (genderValue == "onlyfemale") { query = query.concat("Female"); }
                        if (genderValue == "onlymale") { query = query.concat("Male"); }
                    }
                    // Swap out special characters
                    for (i = 0; i < query.length; i++) {
                        char = query[i];
                        if (char == ' ') { url = url.concat("+"); }
                        else if (char == ',') { url = url.concat("%2C"); }
                        else if (char == '[') { url = url.concat("%5B"); }
                        else if (char == ']') { url = url.concat("%5D"); }
                        else if (char == '(') { url = url.concat("%28"); }
                        else if (char == ')') { url = url.concat("%29"); }
                        else if (char == '/') { url = url.concat("%2F"); }
                        else { url = url.concat(char); }
                    }
                    // Check for number of trials
                    url = url.concat("&fields=BriefTitle%2C+Condition%2C+Phase%2C+EnrollmentCount%2C+StartDate%2C+CompletionDate%2C+LastUpdatePostDate%2C+OutcomeMeasureAnticipatedPostingDate%2C+ResultsFirstPostDate%2C+ResultsFirstSubmitDate&min_rnk=1&max_rnk=50&fmt=csv");
                    console.log(url);
                    return url;
                }


                function makeDimensions() {
                    dim = []
                    if (document.getElementById("Phase").checked) {
                        dim = dim.concat({
                            key: "Phase",
                            description: "Phase",
                            type: types["String"]
                        })
                    }

                    if (document.getElementById("EnrollmentCount").checked) {
                        dim = dim.concat({
                            key: "EnrollmentCount",
                            description: "Enrollment Count",
                            type: types["Number"]
                        });
                    }
                    if (document.getElementById("StartDate").checked) {
                        dim = dim.concat({
                            key: "StartDate",
                            description: "Start Date",
                            type: types["Date"]
                        });
                    }
                    if (document.getElementById("CompletionDate").checked) {
                        dim = dim.concat({
                            key: "CompletionDate",
                            description: "Completion Date",
                            type: types["Date"]
                        });
                    }
                    if (document.getElementById("LastUpdatePostDate").checked) {
                        dim = dim.concat({
                            key: "LastUpdatePostDate",
                            description: "Last Update Post Date",
                            type: types["Date"]
                        });
                    }
                    if (document.getElementById("OutcomeMeasureAnticipatedPostingDate").checked) {
                        dim = dim.concat({
                            key: "OutcomeMeasureAnticipatedPostingDate",
                            description: "Outcome Measure Anticipated Posting Date",
                            type: types["Date"]
                        });
                    }
                    if (document.getElementById("ResultsFirstPostDate").checked) {
                        dim = dim.concat({
                            key: "ResultsFirstPostDate",
                            description: "Results First Post Date",
                            type: types["Date"]
                        });
                    }
                    if (document.getElementById("ResultsFirstSubmitDate").checked) {
                        dim = dim.concat({
                            key: "ResultsFirstSubmitDate",
                            description: "Results First Submit Date",
                            type: types["Date"]
                        });
                    }

                    return dim;
                }
            } else {
                d3.select(".parcoords").remove();
                d3.select("pre").remove();
            }
        });

    //new text
    fo = fo
        .data(d.descendants())
        .enter()
        .append("foreignObject")
        .attr("x", function (d) {
            return x(d.x0);
        })
        .attr("y", function (d) {
            return y(d.y0);
        })
        .attr("width", function (d) {
            if (isSearch == 1212) { //called from search bar
                return d.x0;
            } else {
                if (x(d.x1) - x(d.x0) >= 20) {
                    return x(d.x1) - x(d.x0);
                } else {
                    return 0;
                }
            }
        })
        .attr("height", function (d) {
            var h = y(d.y1 - d.y0);
            if (h >= 18) {
                return y(d.y1 - d.y0);
            } else {
                return 18;
            }
        })
        .style("cursor", "pointer")
        .text(function (d) {
            return d.data.key;
        })
        .attr("stroke", "white")
        .on("mouseover", showTooltip)
        .on("mousemove", showTooltip)
        .on("mouseleave", hideTooltip);
    if (isSearch != 1212) {
        fo = fo.on("click", switchData);
    }

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
        .data(nodeArray, function (d) {
            return d.data.key + d.depth;
        });

    // Remove exiting nodes.
    trail.exit().remove();

    // Add breadcrumb and label for entering nodes.
    var entering = trail.enter().append("svg:g");

    entering
        .append("svg:polygon")
        .attr("points", breadcrumbPoints)
        .style("fill", function (d) {
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
        .text(function (d) {
            if (!d.data.key) {
                return "Overview";
            } else {
                return d.data.key;
            }
        })
        .style("cursor", "pointer")
        .call(wrap, b.w - b.t)
        .on("click", switchData);

    // Merge enter and update selections; set position for all nodes.
    entering.merge(trail).attr("transform", function (d, i) {
        return "translate(" + i * (b.w + b.s) + ", 0)";
    });

    // Now move and update the value at the end.
    d3.select("#trail")
        .select("#endlabel")
        .attr("x", 100 + (nodeArray.length + 0.5) * (b.w + b.s))
        .attr("y", b.h / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text("Total number of trials " + valueString);

    function wrap(text, width) {
        text.each(function () {
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
