function updateMap(sliderValue) {
    var svgcheck = d3.select("#indiachart").select("svg");

    // Check if the SVG element exists
    if (!svgcheck.empty()) {
        // If it exists, remove it
        svgcheck.remove();
    }

    var svg = d3.select("#indiachart")
        .append("svg:svg")
        .attr("width", w)
        .attr("height", h)
        .call(initialize);

    var map = svg.append("svg:g")


    var india = map.append("svg:g")
        .attr("id", "india")
    .style('stroke', '#E65100')
    .style('stroke-width', '0.2');

    var selectedDate = new Date(sliderValue);
    var quarterEnd = new Date(selectedDate.getFullYear(), Math.floor(selectedDate.getMonth() / 3) * 3 + 3, 0);
    console.log("Quarter end" + quarterEnd);
    selectedDate = quarterEnd;
    console.log("Selected Dae:" + selectedDate);

    var isoString = selectedDate.toISOString(); // convert to ISO string
    var year = isoString.substring(0, 4); // extract year
    var month = isoString.substring(5, 7); // extract month
    var selectedMonth = d3.time.format("%B")(new Date(year, month - 1)); // format month as full month word
    var selectedQuarter = `${selectedMonth} ${year}`; // combine month and year

    // Update the map using the selected date


    var stateSum = {};

    banksData.forEach(function (d) {
        if (d["Quarter : Population Group"].startsWith(selectedQuarter)) {
            var state = d.State;
            var value = d.Value;
            if (stateSum[state]) {
                stateSum[state] += value;
            } else {
                stateSum[state] = value;
            }
        }
    });

    // var values = Object.values(stateSum);
    // var minValue = Math.min(...values);
    // var maxValue = Math.max(...values);


    india.selectAll("path")
        .data(json.features)
        .enter().append("path")
        .attr("d", path)
        .style("fill", function (d) {
            var stateName = d.id; // Get the name of the state from the GeoJSON data

            return colorScale(stateSum[stateName]); // Use the value to get the color from the color scale
        })
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)
        .append("title")
        .text(function (d) {
            var stateName = d.id;
            return "State : " + stateName + "\n No. of Bank Offices : " + stateSum[stateName];
        });




    aa = [80.9462, 26.8467];
    // add circles to svg
    india.selectAll("circle")
        .data([aa]).enter()
        .append("circle")
        .attr("cx", function (d) { console.log(proj(d)); return proj(d)[0]; })
        .attr("cy", function (d) { return proj(d)[1]; })
        .attr("r", "3px")
        .attr("fill", "black")
        .on("mouseover", function () {
            d3.select(this).attr("r", "6px").style('fill', "orange")
        })
        .on("mouseout", function () {
            d3.select(this).attr("r", "3px").style("fill", 'black')
        })
        .append("title")
        .text(function (d) {
            return "City : " + "Lucknow" + "\n Here goes the City data";
        })



    var defs = svg.append("defs");

    var linearGradient = defs.append("linearGradient")
        .attr("id", "legend-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");

    linearGradient.selectAll("stop")
        .data(colorScale.range())
        .enter().append("stop")
        .attr("offset", function (d, i) { return i / (colorScale.range().length - 1); })
        .attr("stop-color", function (d) { return d; });

    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (w - 270) + "," + (h - 200) + ")");

    legend.append("rect")
        .attr("width", 20)
        .attr("height", 150)
        .style("fill", "url(#legend-gradient)");

    legend.selectAll("text")
        .data(colorScale.domain())
        .enter().append("text")
        .attr("x", 25)
        .attr("y", function (d, i) { return i * 138 + 12; })
        .text(function (d) { return d; });



        function handleMouseOver() {
            d3.select(this).attr("stroke-width", "1.4")
        }
        function handleMouseOut() {
            d3.select(this).attr("stroke-width", "0.2")
        }



        function initialize() {
            proj.scale(6700);
            proj.translate([-1240, 750]);
        }

}