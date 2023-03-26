var margin = { top: 10, right: 30, bottom: 30, left: 40 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// set the ranges
var x = d3.scaleBand()
    .range([0, width])
    .padding(0.1);

var y = d3.scaleLinear()
    .range([height, 0]);

// append the svg object to the body of the page
var svg = d3.select(".chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// load the data
d3.csv("data.csv", function (data) {

    // format the data
    data.forEach(function (d) {
        d.value = +d.value;
    });

    // create bins
    var histogram = d3.histogram()
    .value(function(d) { return d.value; })   // I need to give the vector of value
    .domain(x.domain())  // then the domain of the graphic
    .thresholds(x.ticks(10)); // then the numbers of bins

    var bins = histogram(data);

    // set the domains
    x.domain(bins.map(function (d) { return d.x0; }));
    y.domain([0, d3.max(bins, function (d) { return d.length; })]);

    // append the bars
    svg.selectAll(".bar")
        .data(bins)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) { return x(d.x0); })
        .attr("y", function (d) { return y(d.length); })
        .attr("width", x.bandwidth())
        .attr("height", function (d) { return height - y(d.length); });

    // add the x Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y));
});

// toggle between vertical and horizontal layout
var isVertical = true;

d3.select(".toggle-btn")
    .on("click", function () {
        // Update the boolean
        isVertical = !isVertical;

        // Update the X scale
        x.range([0, isVertical ? width : height]);

        // Update the X axis
        svg.select(".x.axis")
            .attr("transform", isVertical ? "translate(0," + height + ")" : "");

        // Update the Y scale
        y.range([isVertical ? height : width, 0]);

        // Update the bars
        svg.selectAll("rect.bar")
            .attr("x", function (d) { return isVertical ? x(d.x0) : y(d.length); })
            .attr("y", function (d) { return isVertical ? y(d.length) : x(d.x0); })
            .attr("width", isVertical ? x.bandwidth() : function (d) { return y(d.length); })
            .attr("height", isVertical ? function (d) { return height - y(d.length); } : x.bandwidth());


        // Update the X axis label
        svg.select(".x.axis-label")
        svg.select(".x.axis-label")
            .attr("transform", isVertical ? "translate(" + (width / 2) + "," + (height + 30) + ")" : "translate(-30," + (height / 2) + ")rotate(-90)")
            .attr("text-anchor", "middle")
            .text("X axis")

        // Add Y axis label:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 20)
            .attr("x", -margin.top)
            .text("Value")

        // Add the bar rectangles to the graph
        svg.selectAll("rect")
            .data(bins)
            .enter()
            .append("rect")
            .attr("x", 1)
            .attr("transform", function (d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
            .attr("width", function (d) { return x(d.x1) - x(d.x0) - 1; })
            .attr("height", function (d) { return height - y(d.length); })
            .style("fill", "#69b3a2")

    });