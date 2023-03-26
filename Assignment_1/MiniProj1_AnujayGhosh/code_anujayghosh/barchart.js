function drawBarChart(data, field) {
    const margin = { top: 40, right: 40, bottom: 60, left: 120 };
    let width = 960 - margin.left - margin.right;
    let height = 500 - margin.top - margin.bottom;

    let x = d3.scaleBand().range([0, width]).padding(0.1);
    let y = d3.scaleLinear().range([height, 0]);

    let yLabel = field === "no_debit_cards" ? "Total Number of Debit Cards issued from 2011-2019" : "Total Number of Credit Cards issued from 2011-2019";
    let xLabel = "Bank Name";

    d3.select("svg").remove();

    let svg = d3.select(".chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`);


    svg.append("g")
        .attr("class", "y-axis");


    // load the data
    d3.csv("data.csv", function (data) {
        // format the data
        // console.log(data);
        var nestedData = d3.nest()
            .key(function (d) { return d.bank_name; })
            .rollup(function (v) { return d3.sum(v, function (d) { return +d[field]; }); })
            .entries(data);
        console.log(nestedData);


        x.domain(nestedData.map(function (d) { return d.key; }));
        y.domain([0, d3.max(nestedData, function (d) { return d.value; })]);


        var colorScale = d3.scaleLinear()
            .domain([d3.min(nestedData, function (d) { return d.value; }),
            d3.max(nestedData, function (d) { return d.value; })])
            .range([0.3, 1]); // range of lightness values


        var colorInterpolator = d3.interpolateRgb("rgb(255,102,178)", "rgb(153,0,76)");

        // draw initial chart
        let orient = "vertical";
        drawChart(orient);

        // add toggle button functionality
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
                width = 960 - margin.left - margin.right;
                height = 500 - margin.top - margin.bottom;
                x.range([0, width]).padding(0.1);
                y.range([height, 0]);

                // Remove any existing svg element
                d3.select("svg").remove();

                svg = d3.select(".chart")
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", `translate(${margin.left},${margin.top})`);

                svg.append("g")
                    .attr("class", "x-axis")
                    .attr("transform", `translate(0,${height})`);

                svg.append("g")
                    .attr("class", "y-axis");

                svg.append("text")
                    .attr("class", "x-axis")
                    .attr("text-anchor", "middle")
                    .attr("x", width / 2)
                    .attr("y", height + margin.bottom)
                    .attr("stroke", "black")
                    .style("font-size", "14")
                    .text(xLabel);


                svg.append("text")
                    .attr("class", "y-axis")
                    .attr("text-anchor", "middle")
                    .attr("y", 6)
                    .attr("dy", "-8em")
                    .attr("transform", "rotate(-90)")
                    .attr("stroke", "black")
                    .style("font-size", "14")
                    .text(yLabel);

                svg.append("text")
                    .attr("x", width / 2 + 300)
                    .attr("y", margin.top / 2 - 35)
                    .attr("text-anchor", "middle")
                    .attr("stroke", "black")
                    .style("font-size", "18px")
                    .text(xLabel + " vs " + yLabel);



                // update svg element with new dimensions
                svg.attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom);

                svg.select(".x-axis")
                    .transition()
                    .duration(1000)
                    .call(d3.axisBottom(x));

                svg.select(".y-axis")
                    .transition()
                    .duration(1000)
                    .call(d3.axisLeft(y));

                let bars = svg.selectAll("rect")
                    .data(nestedData);

                bars.exit().remove();


                bars.enter().append("rect")
                    .attr("x", function (d) { return x(d.key); })
                    .attr("width", x.bandwidth())
                    .attr("y", height)
                    .attr("height", 0)
                    .merge(bars)
                    .transition()
                    .duration(1000)
                    .attr("x", function (d) { return x(d.key); })
                    .attr("y", function (d) { return y(d.value); })
                    .attr("width", x.bandwidth())
                    .attr("height", function (d) {
                        return height - y(d.value);
                    })
                    .style("fill", function (d) {
                        return colorInterpolator(colorScale(d.value));
                    })
                    .each(function(d) {
                        var bar = d3.select(this);
                        var text = svg.append("text")
                            .attr("class", "label")
                            .attr("x", parseFloat(bar.attr("x")) + x.bandwidth() / 2)
                            .attr("y", y(d.value) - 10)
                            .attr("dy", ".75em")
                            .text(d.value);
                    });



            }
            else {

                const margin = { top: 40, right: 40, bottom: 60, left: 120 };
                const width = 960 - margin.left - margin.right;
                const height = 500 - margin.top - margin.bottom;

                d3.select("svg").remove();

                const svg = d3.select(".chart")
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", `translate(${margin.left},${margin.top})`);

                const xScale = d3.scaleLinear()
                    .domain([0, d3.max(nestedData, d => d.value)])
                    .range([0, width]);

                const yScale = d3.scaleBand()
                    .domain(nestedData.map(d => d.key))
                    .range([0, height])
                    .padding(0.1);

                const yAxis = d3.axisLeft(yScale);
                const xAxis = d3.axisBottom(xScale);

                svg.append("g")
                    .attr("class", "y-axis")
                    .call(yAxis);

                svg.append("g")
                    .attr("class", "x-axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);

                svg.append("text")
                    .attr("class", "x-axis")
                    .attr("text-anchor", "middle")
                    .attr("y", -6)
                    .attr("dy", "-7.25em")
                    .attr("transform", "rotate(-90)")
                    .attr("stroke", "black")
                    .style("font-size", "14")
                    .text(xLabel);

                svg.append("text")
                    .attr("class", "y-axis")
                    .attr("text-anchor", "middle")
                    .attr("x", width / 2)
                    .attr("y", height + margin.bottom)
                    .attr("stroke", "black")
                    .style("font-size", "14")
                    .text(yLabel);

                svg.append("text")
                    .attr("x", width / 2 + 300)
                    .attr("y", margin.top / 2 - 35)
                    .attr("text-anchor", "middle")
                    .attr("stroke", "black")
                    .style("font-size", "18px")
                    .text(xLabel + " vs " + yLabel);

                const bars = svg.selectAll(".bar")
                    .data(nestedData, d => d.key);

                bars.exit().remove();

                bars.enter()
                    .append("rect")
                    .attr("class", "bar")
                    .attr("x", 0)
                    .attr("y", d => yScale(d.key))
                    .attr("width", 0)
                    .style("fill", function (d) {
                        return colorInterpolator(colorScale(d.value));
                    })

                    .attr("height", yScale.bandwidth())
                    .merge(bars)
                    .attr("x", 0)
                    .attr("y", d => yScale(d.key))
                    .transition()
                    .duration(1000)
                    .attr("width", d => xScale(d.value))
                    .attr("height", yScale.bandwidth())
                    .on("end", function(d) {
                        svg.append("text")
                          .attr("class", "bar-label")
                          .attr("x", xScale(d.value) + 15)
                          .attr("y", yScale(d.key) + yScale.bandwidth() / 2)
                          .attr("dy", "0.35em")
                          .text(d.value);
                      });




            }
        }
    });
}