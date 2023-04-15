var margin = { top: 50, right: 60, bottom: 50, left: 80 };
var width = 960 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

var svg1 = d3.select("#datamds_chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg1.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-weight", "bold")
    .style("text-decoration", "underline")
    .text("Indian Card Payments - MDS Data Plot with K-Means Clustering");

d3.json("/mds_dataplot").then(function (data) {

    // Define scales for x and y axes
    var xScale = d3.scaleLinear()
        .domain([d3.min(data, function (d) { return d.x; }), d3.max(data, function (d) { return d.x; })])
        .range([50, width - 50]);
    var yScale = d3.scaleLinear()
        .domain([d3.min(data, function (d) { return d.y; }), d3.max(data, function (d) { return d.y; })])
        .range([height - 50, 50]);

    // Define color scale for clusters
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Add circles to plot
    svg1.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return xScale(d.x); })
        .attr("cy", function (d) { return yScale(d.y); })
        .attr("r", 5)
        .style("fill", function (d) { return color(d.cluster); })
        .style("opacity", 0.3)
        .style("stroke", function (d) { return color(d.cluster); });

    // Add x-axis
    var xAxis1 = d3.axisBottom(xScale);
    svg1.append("g")
        .attr("transform", "translate(-20," + (height - 50) + ")")
        .call(xAxis1)
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .attr("text-anchor", "end");

    // Add y-axis
    svg1.append("g")
        .attr("transform", "translate(50, 0)")
        .call(d3.axisLeft(yScale));

    // Add x-axis label
    svg1.append("text")
        .attr("x", (width / 2) + 50)
        .attr("y", height - (margin.bottom / 2) + 50)
        .attr("text-anchor", "middle")
        .text("MDS Dimension 1");

    // Add y-axis label
    svg1.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", margin.left / 2 - 90)
        .attr("text-anchor", "middle")
        .text("MDS Dimension 2");

    // Add legend for clusters
    var legend1 = svg1.selectAll(".legend")
        .data(color.domain())
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

    legend1.append("circle")
        .attr("cx", width - margin.right / 2)
        .attr("cy", margin.top / 2 + 10 + 200)
        .attr("r", 5)
        .style("fill", color);

    legend1.append("text")
        .attr("x", width - (margin.right * 1.5) + 70)
        .attr("y", margin.top + 10 - 25 + 200)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function (d) { return "Cluster " + (d+1); });

    // Add a border around the legend
    var legendBox1 = legend1.node().getBBox();
    svg1.append("rect")
        .attr("x", legendBox1.x - 10)
        .attr("y", legendBox1.y - 10)
        .attr("width", legendBox1.width + 20)
        .attr("height", legendBox1.height + 20 + 20)
        .style("stroke", "black")
        .style("stroke-width", "1")
        .style("fill", "none");

});