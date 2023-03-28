// // Define a variable to store the JSON response
// let data;

// // Call the JSON file when the window loads
// window.addEventListener("load", () => {
//   d3.json("/parallel_data").then(response => {
//     data = response;
//     // Call any functions that rely on the data here
//     console.log(data);
//   });
// });

// Set up the dimensions of the plot
var margin3 = { top: 150, right: 60, bottom: 50, left: 80 },
    width3 = 1900 - margin3.left - margin3.right,
    height3 = 950 - margin3.top - margin3.bottom;

// Create a color scale for the clusters
var color3 = d3.scaleOrdinal(d3.schemeCategory10);

// Create the x-axis scale for each column
var x = d3.scalePoint()
    .range([0, width3])
    .padding(1);

// Create the y-axis scale for each column
var y = {};

var dragging = {};

// Create the line generator for the plot
var line = d3.line(),
axis = d3.axisLeft(),
background,
foreground;

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
    var dimensions = Object.keys(data[0]).filter(d => d !== "cluster_id");

    var categoricalCols = ["month", "year", "month_number", "start_date", "end_date", "bank_name"];
    var categoricalScales = {};
    categoricalCols.forEach(function (dimension) {
      categoricalScales[dimension] = d3.scalePoint()
        .domain([...new Set(data.map(function (d) { return d[dimension]; }))])
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
          .range([height3, 0]); // reverse the range
      }
    });

    // Add the cluster id value to each data point
    data.forEach(function (d) {
      d.cluster_id = +d.cluster_id;
    });

    // Add grey background lines for context.
    background = svg3.append("g")
      .attr("class", "background")
      .selectAll("path")
      .data(data)
      .enter().append("path")
      .attr("d", path);

    // Add blue foreground lines for focus.
    foreground = svg3.append("g")
      .attr("class", "foreground")
      .selectAll("path")
      .data(data)
      .enter().append("path")
      .attr("d", path)
      .style("stroke", function (d) { return color3(d.cluster_id); })
      .style("opacity", 0.3);

    // Add a group element for each dimension.
    var g = svg3.selectAll(".dimension")
      .data(dimensions)
      .enter().append("g")
      .attr("class", "dimension")
      .attr("transform", function (d) { return "translate(" + x(d) + ")"; })
      .call(d3.drag()
        .on("start", function (event, d) {
          dragging[d] = x(d);
          background.attr("visibility", "hidden");
        })
        .on("drag", function (event, d) {
          dragging[d] = Math.min(width3, Math.max(0, event.x));
          foreground.attr("d", path);
          dimensions.sort(function (a, b) { return position(a) - position(b); });
          x.domain(dimensions);
          g.attr("transform", function (d) { return "translate(" + position(d) + ")"; })
        })
        .on("end", function (event, d) {
          delete dragging[d];
          transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
          transition(foreground).attr("d", path);
          background
            .attr("d", path)
            .transition()
            .delay(500)
            .duration(0)
            .attr("visibility", null);
        }));

    // Add an axis and title.
    g.append("g")
      .attr("class", "axis")
      .each(function (d) { d3.select(this).call(axis.scale(y[d])); })
      .append("text")
      .style("text-anchor", "start")
      .style("color", "black")
      .attr("y", -9)
      .attr("transform", "rotate(-45)")
      .text(function (d) { return d; });

    // // Add and store a brush for each axis.
    // g.append("g")
    //   .attr("class", "brush")
    //   .each(function (d) {
    //     d3.select(this).call(y[d].brush = d3.brushY(y[d]).extent([[0, 0], [width, height]]).on("start", brushstart).on("brush", brush));
    //   })
    //   .selectAll(".selection")
    //   .attr("x", -8)
    //   .attr("width", 16);



    function position(d) {
      var v = dragging[d];
      return v == null ? x(d) : v;
    }

    function transition(g) {
      return g.transition().duration(500);
    }

    // Returns the path for a given data point.
    // Define the path for the lines
    function path(d) {
      return line(
        dimensions.map(function (p) {
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

//     function brushstart() {
//       if (d3.event.sourceEvent) {
//   d3.event.sourceEvent.stopPropagation();
// }
//     }

//     // Handles a brush event, toggling the display of foreground lines.
//     function brush() {
//       var actives = dimensions.filter(function (p) { return !y[p].brush.empty(); }),
//         extents = actives.map(function (p) { return y[p].brush.extent(); });
//       foreground.style("display", function (d) {
//         return actives.every(function (p, i) {
//           return extents[i][0] <= d[p] && d[p] <= extents[i][1];
//         }) ? null : "none";
//       });
//     }