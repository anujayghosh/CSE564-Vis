// Define the dimensions of the canvas / graph
const margin = { top: 100, right: 120, bottom: 100, left: 120 };
const width = 960 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// Set the ranges
var x = d3.scaleLinear().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// Define the line
var valueline = d3.line()
    .x(function (d) { return x(d[0]); })
    .y(function (d) { return y(d[1]); });

// Adds the svg canvas
var svg = d3.select("#linechart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Get the data
d3.json("/get_ssq_values")
    .then(function (data) {

        // Determine the x domain based on the min and max values of the x data
        var xMin = d3.min(data.data, function (d) { return d[0]; });
        var xMax = d3.max(data.data, function (d) { return d[0]; });
        x.domain([xMin, xMax]);

        // Determine the y domain based on the min and max values of the y data
        var yMin = 0;
        var yMax = d3.max(data.data, function (d) { return d[1]; });
        y.domain([yMin, yMax]);

        // Extract the cluster numbers and sse values into separate arrays
        var clusterNums = data.data.map(function (d) { return d[0]; });
        var sseValues = data.data.map(function (d) { return d[1]; });

        // Define the line
        var valueline = d3.line()
            .x(function (d) { return x(d[0]); })
            .y(function (d) { return y(d[1]); });

        // Add the valueline path
        svg.append("path")
            .datum(data.data)
            .attr("class", "line")
            .style("fill", "none")  // Remove default fill
            .style("stroke", "steelblue")  // Set stroke color
            .style("stroke-width", "2px")  // Set stroke width
            .attr("d", valueline);

        // Add the X Axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // Add the Y Axis
        svg.append("g")
            .call(d3.axisLeft(y));

        // Add the X Axis label
        svg.append("text")
            .attr("transform",
                "translate(" + (width / 2) + " ," +
                (height - margin.top + 130) + ")")
            .style("text-anchor", "middle")
            .text("Number of Clusters");

        // Add the Y Axis label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left/2)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Sum of Squared Loadings");

        // Use the elbow method to determine the optimal number of clusters
        var numClusters = elbowMethod(data);

        console.log(data.data[numClusters-1][1]);

        var optHeight = data.data[numClusters-1][1];


        // Draw a vertical bar at the optimal number of clusters
        // Draw a bar at the optimal number of clusters
        svg.append("rect")
            .attr("x", x(numClusters) - 5) // Shift the bar to center it on the tick mark
            .attr("y", y(optHeight))
            .attr("width", 10) // Set the width of the bar to 20 pixels
            .attr("height", height - y(optHeight))
            .attr("fill", "red")
            .attr("opacity", 0.3);

    });

function elbowMethod(data) {
    // Extract SSE values from data
    const sseValues = data.data.map(d => d[1]);

    // Define range of cluster sizes to test
    const numClusters = d3.range(1, sseValues.length + 1);

    // Calculate total SSE for each cluster size
    const totalSSE = numClusters.map(k => {
        const clusterSSE = sseValues.slice(0, k).reduce((acc, val) => acc + val, 0);
        return clusterSSE;
    });

    // Calculate percentage of variance explained by each cluster size
    const varExp = totalSSE.map((sse, i) => {
        if (i === 0) {
            return 0;
        } else {
            return 1 - (sse / totalSSE[i - 1]);
        }
    });

    // Determine the optimal number of clusters using the elbow method
    let elbowPoint = 0;
    for (let i = 0; i < varExp.length; i++) {
        if (varExp[i] < varExp[i + 1]) {
            elbowPoint = i;
            break;
        }
    }

    // Return the optimal number of clusters
    return elbowPoint + 1;
}