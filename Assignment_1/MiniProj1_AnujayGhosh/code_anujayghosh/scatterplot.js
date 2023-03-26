function drawScatterPlot(xaxis, yaxis)
{

const margin = {top: 70, right: 30, bottom: 70, left: 120},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    d3.select("svg").remove();
// Append the svg object to the body of the page
const svg = d3.select(".scatterchart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.csv("data.csv", function(data) {

  // Add X axis
  const x = d3.scaleLinear()
    .domain([d3.min(data, d => d[xaxis]), d3.max(data, d => d[xaxis])])
    .range([ 0, width ]);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add Y axis
  const y = d3.scaleLinear()
    .domain([d3.min(data, d => d[yaxis]), d3.max(data, d => d[yaxis])])
    .range([ height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y));

    svg.append("text")
    .attr("class", "x-axis")
    .attr("text-anchor", "middle")
    .attr("y", 6)
    .attr("dy", "-5.50em")
    .attr("transform", "rotate(-90)")
    .attr("stroke", "black")
    .style("font-size", "14")
    .text(yaxis);

svg.append("text")
    .attr("class", "y-axis")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom/2)
    .attr("stroke", "black")
    .style("font-size", "14")
    .text(xaxis);

svg.append("text")
    .attr("x", width / 2 + 100)
    .attr("y", margin.top / 2 - 35)
    .attr("text-anchor", "middle")
    .attr("stroke", "black")
    .style("font-size", "18px")
    .text(xaxis + " v/s " + yaxis);

  // Add dots
  svg.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
      .attr("cx", d => x(d[xaxis]))
      .attr("cy", d => y(d[yaxis]))
      .attr("r", 3)
      .style("fill", "#69b3a2")


})

}

