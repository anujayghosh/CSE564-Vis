function drawHistogram(data, field, xLabel) {

    var margin = { top: 40, right: 40, bottom: 60, left: 120 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

        
    d3.select("svg").remove();

    var yLabel = "Number of Customers/Users";

    // append the svg object to the chart class
    var svg = d3.select(".chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    //data
    d3.csv("data.csv", function (data) {
  
        console.log(data);
        data.forEach(function (d) {
            d[field] = +d[field];
        });

        var x = d3.scaleLinear()
            .domain([0, d3.max(data, function (d) { return +d[field] })])     
            .range([0, width]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));



        // set the parameters for the histogram
        var histogram = d3.histogram()
            .value(function (d) { return d[field]; })  
            .domain(x.domain()) 
            .thresholds(x.ticks(10)); 

        // And apply this function to data to get the bins
        var bins = histogram(data);

        var binMeans = bins.map(function (d) {
            var sum = d3.sum(d, function (e) { return e.value; });
            return sum / d.length;
        });
        let orient = "vertical";
        drawChart(orient);

        // added toggle button functionality
        d3.select(".toggle-btn").on("click", function () {
            console.log("Toggle button clicked!");
            if (orient === "vertical") {
                orient = "horizontal";
                d3.select(this).classed("vertical", false);
            } else {
                orient = "vertical";
                d3.select(this).classed("vertical", true);
            }
            console.log("Orientation : " + orient);
            drawChart(orient);
        });

        function drawChart(orientation) {
            // update chart dimensions based on orientation
            if (orientation === "vertical") {

                d3.select("svg").remove();
                var svg = d3.select(".chart")
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")");

                var x = d3.scaleLinear()
                    .domain([0, d3.max(data, function (d) { return +d[field] })])
                    .range([0, width]);
                svg.append("g")
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(x));


                var y = d3.scaleLinear()
                    .range([height, 0]);
                y.domain([0, d3.max(bins, function (d) { return d.length; })]);   
                svg.append("g")
                    .call(d3.axisLeft(y));



                svg.append("text")
                    .attr("class", "x-axis")
                    .attr("text-anchor", "middle")
                    .attr("y", 6)
                    .attr("dy", "-3.50em")
                    .attr("transform", "rotate(-90)")
                    .attr("stroke", "black")
                    .style("font-size", "14")
                    .text(yLabel);

                svg.append("text")
                    .attr("class", "y-axis")
                    .attr("text-anchor", "middle")
                    .attr("x", width / 2)
                    .attr("y", height + margin.bottom)
                    .attr("stroke", "black")
                    .style("font-size", "14")
                    .text(xLabel);

                svg.append("text")
                    .attr("x", width / 2 + 300)
                    .attr("y", margin.top / 2 - 35)
                    .attr("text-anchor", "middle")
                    .attr("stroke", "black")
                    .style("font-size", "18px")
                    .text(xLabel + " vs " + yLabel);

                svg.selectAll("rect")
                    .data(bins)
                    .enter()
                    .append("rect")
                    .attr("x", 1)
                    .attr("transform", function (d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
                    .attr("width", function (d) { return x(d.x1) - x(d.x0) - 1; })
                    .transition()
                    .duration(1000)
                    .attr("height", function (d) { return height - y(d.length); })
                    .style("fill", "rgb(102,0,204)")
                    
            }
            else {
                d3.select("svg").remove();
                var svg = d3.select(".chart")
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")");

                var y = d3.scaleLinear()
                    .domain([0, d3.max(data, function (d) { return +d[field] })])
                    .range([height, 0]);
                svg.append("g")
                    .call(d3.axisLeft(y));

                var x = d3.scaleLinear()
                    .range([0, width]);
                x.domain([0, d3.max(bins, function (d) { return d.length; })]);  
                svg.append("g")
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(x));

                svg.append("text")
                    .attr("class", "x-axis")
                    .attr("text-anchor", "middle")
                    .attr("x", width / 2)
                    .attr("y", height + margin.bottom)
                    .attr("stroke", "black")
                    .style("font-size", "14")
                    .text(yLabel);


                svg.append("text")
                    .attr("class", "y-axis")
                    .attr("text-anchor", "middle")
                    .attr("transform", "rotate(-90)")
                    .attr("x", -height / 2 +100)
                    .attr("y", -margin.left +50)
                    .attr("stroke", "black")
                    .style("font-size", "14")
                    .text(xLabel);

                svg.append("text")
                    .attr("x", width / 2 + 300)
                    .attr("y", margin.top / 2 - 35)
                    .attr("text-anchor", "middle")
                    .attr("stroke", "black")
                    .style("font-size", "18px")
                    .text(xLabel + " vs " + yLabel);


                svg.selectAll("rect")
                    .data(bins)
                    .enter()
                    .append("rect")
                    .attr("y", 1)
                    .attr("transform", function (d) { return "translate(0," + y(d.x1) + ")"; })
                    .attr("height", function (d) { return y(d.x0) - y(d.x1) - 1; })
                    .transition()
                    .duration(1000)
                    .attr("width", function (d) { return x(d.length); })
                    .attr("x", 0)
                    .style("fill", "rgb(102,0,204)");
            }
        }

    });
}