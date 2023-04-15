var margin = { top: 50, right: 60, bottom: 50, left: 80 };
var width = 960 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

var svg2 = d3.select("#variablemds_chart2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg2.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-weight", "bold")
    .style("text-decoration", "underline")
    .text("MDS Variables Plot with K-Means Clustering");

d3.json("/mds_variableplot", function (error, data) {

    // Define scales for x and y axes
    var xScale = d3.scale.linear()
        .domain([d3.min(data, function (d) { return d.x; }), d3.max(data, function (d) { return d.x; })])
        .range([50, width - 50]);
    var yScale = d3.scale.linear()
        .domain([d3.min(data, function (d) { return d.y; }), d3.max(data, function (d) { return d.y; })])
        .range([height - 50, 50]);

    // Define color scale for clusters
    const color = d3.scale.category10();

    svg2.selectAll("triangle")
        .data(data)
        .enter()
        .append("path")
        .attr("d", d3.svg.symbol().type("triangle-up").size(50))
        .attr("transform", function (d) { return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")"; })
        .attr("id", function (d) { return "triangle_" + d.variable_name; })
        .style("fill", function (d) { return color(d.cluster); })
        .style("opacity", 1.0)
        .style("stroke", function (d) { return color(d.cluster); })
        .each(function (d) {
            // Add text element for each triangle
            svg2.append("text")
                .attr("x", xScale(d.x) + 10) // Position text to the right of triangle
                .attr("y", yScale(d.y))
                .text(d.variable_name); // Set text to ID
        });

    // Add x-axis
    var xAxis2 = d3.svg.axis().scale(xScale).orient("bottom");
    svg2.append("g")
        .attr("transform", "translate(-20," + (height - 50) + ")")
        .call(xAxis2)
        .selectAll("text")
        .attr("transform", "rotate(-45)");

    // Add y-axis
    svg2.append("g")
        .attr("transform", "translate(50, 0)")
        .call(d3.svg.axis().scale(yScale).orient("left"));

    // Add x-axis label
svg2.append("text")
    .attr("x", (width / 2) + 50)
    .attr("y", height - (margin.bottom / 2) + 50)
    .attr("text-anchor", "middle")
    .text("MDS Dimension 1");

// Add y-axis label
svg2.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", margin.left / 2 - 90)
    .attr("text-anchor", "middle")
    .text("MDS Dimension 2");

// Add legend for clusters
var legend2 = svg2.selectAll(".legend")
    .data(color.domain())
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

legend2.append("path")
    .attr("d", d3.svg.symbol().type("triangle-up").size(70))
    .attr("transform", function(d, i) { return "translate(" + (width - margin.right / 2) + "," + (margin.top / 2 + 10 ) + ")"; })
    .style("fill", color);

legend2.append("text")
    .attr("x", width - (margin.right * 1.5) + 70)
    .attr("y", margin.top + 10 - 25 )
    .attr("dy", ".35em")
    .style("text-anchor", "start")
    .text(function (d) { return "Cluster " + (d+1); });

// Add a border around the legend
var legendBox2 = legend2.node().getBBox();
svg2.append("rect")
    .attr("x", legendBox2.x - 10)
    .attr("y", legendBox2.y - 10)
    .attr("width", legendBox2.width + 20)
    .attr("height", legendBox2.height + 20 + 20)
    .style("stroke", "black")
    .style("stroke-width", "1")
    .style("fill", "none");

});