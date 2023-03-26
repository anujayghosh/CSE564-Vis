// Set up the dimensions of the plot
var margin3 = { top: 50, right: 60, bottom: 50, left: 80 },
    width3 = 1900 - margin3.left - margin3.right,
    height3 = 600 - margin3.top - margin3.bottom;

// Create a color scale for the clusters
var color3 = d3.scaleOrdinal(d3.schemeCategory10);

// Create the x-axis scale for each column
var x = d3.scalePoint()
    .range([0, width3])
    .padding(1);

// Create the y-axis scale for each column
var y = {};

// Create the line generator for the plot
var line = d3.line();

// Create the SVG container for the plot
var svg3 = d3.select("#parallel_chart")
    .append("svg")
    .attr("width", width3 + margin3.left + margin3.right)
    .attr("height", height3 + margin3.top + margin3.bottom)
    .append("g")
    .attr("transform", `translate(${margin3.left},${margin3.top})`);

// Load the JSON data from Flask server
d3.json("/parallel_data").then(function (data) {

    // Extract the names of the columns from the data
    const dimensions = Object.keys(data[0]).filter(d => d !== "cluster_id");

    var categoricalCols = ["month", "year", "month_number", "start_date", "end_date", "bank_name"];
    var categoricalScales = {};
    categoricalCols.forEach(function (dimension) {
        categoricalScales[dimension] = d3.scalePoint()
            .domain([...new Set(data.map(d => d[dimension]))])
            .range([0, height3]);
    });

    function isCategorical(dimension) {
        return categoricalCols.includes(dimension);
    }

    // Set the domain of each x-axis scale
    x.domain(dimensions);

    // Create a y-axis scale for each column
    dimensions.forEach(function (dimension) {
        if (isCategorical(dimension)) {
            y[dimension] = categoricalScales[dimension];
        } else {
            y[dimension] = d3.scaleLinear()
                .domain(d3.extent(data, function (d) { return +d[dimension]; }))
                .range([0, height3]); // reverse the range
        }
    });

    // Add the cluster id value to each data point
    data.forEach(function (d) {
        d.cluster_id = +d.cluster_id;
    });

    // Create the lines for the plot
    var lines = svg3.selectAll(".line")
        .data(data)
        .join("path")
        .attr("class", "line")
        // pass the data to the line function
        .attr("d", function (d) { return path(d); })
        .style("stroke", function (d) { return color3(d.cluster_id); })
        .style("opacity", 0.2)
        .attr("fill", "none");

    // Create the axes for each column
    var axes = svg3.selectAll(".axis")
        .data(dimensions)
        .join("g")
        .attr("class", "axis")
        .attr("transform", function (d) { return `translate(${x(d)})`; })
        .each(function (d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
        .append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("y", -9)
        .text(function (d) { return d; });

    // Create the tooltip for the lines
    var tooltip = d3.select("#parallel_chart") // use the correct ID for the tooltip
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0) // set initial opacity to 0
        // Add a mouseover event to the lines
        .on("mouseover", function (d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltip.html("Cluster ID: " + d.cluster_id)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 30) + "px");
        })
        // Add a mouseout event to the lines
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Define the path for the lines
    function path(d) {
        return line(
          dimensions.map(function(p) {
            if (isCategorical(p)) {
              return [x(p), y[p](d[p])];
            } else {
              var value = +d[p];
              return [x(p), isNaN(value) || value == null ? null : y[p](value)];
            }
          })
        );
      }
});
