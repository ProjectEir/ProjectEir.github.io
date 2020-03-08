// Need disease,
// NEW 1
var margin = { top: 66, right: 110, bottom: 20, left: 188 },
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

// can't select body
var container = d3.select("#chart svg").append("div")
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

var output = d3.select("#chart svg").append("pre");

format = selectedOption.split(" ").join("+");
url = makeUrl(format);
ajax(url)
    .then(function (result) {
        // Here we can build the parallel coordinate system
        myData = trim(result);
        myDimensions = makeDimensions();
        // use d3.csvParse(myData){...}
        // see https://stackoverflow.com/questions/42285441/how-to-read-in-csv-with-d3-v4
        //                    console.log(types, "check1");
        dimensions = myDimensions;
        //                    console.log(dimensions, "check2");
        //                    console.log(yAxis, "check3");

        var xscale = d3.scalePoint()
            .domain(d3.range(dimensions.length))
            .range([0, width]);

        var axes = svg.selectAll(".axis")
            .data(dimensions)
            .enter().append("g")
            .attr("class", function (d) { return "axis " + d.key.replace(/ /g, "_"); })
            .attr("transform", function (d, i) { return "translate(" + xscale(i) + ")"; });

        //                    console.log(axes, "check4");
        //                    console.log(d3_functor, "check5");

        d3.csvParse(myData, function (error, data) {
            data = d3.csvParse(myData);
            console.log(data, "check6");

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

            output.text(d3.tsvFormat(data.slice(0, 24)));

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

                output.text(d3.tsvFormat(selected.slice(0, 24)));
            }
        });
        console.log("final check");


    })
    .catch(function () {
        // An error occurred
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
    return "https://clinicaltrials.gov/api/query/study_fields?expr=" + disease + "%0D%0A&fields=BriefTitle%2C+Condition%2C+Phase%2C+EnrollmentCount%2C+StartDate%2C+CompletionDate%2C+LastUpdatePostDate%2C+OutcomeMeasureAnticipatedPostingDate%2C+ResultsFirstPostDate%2C+ResultsFirstSubmitDate&min_rnk=1&max_rnk=1000&fmt=csv";
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
                            