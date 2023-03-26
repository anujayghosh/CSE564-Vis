function createScreePlot(screeData) {
// Define constants
const margin = {top: 50, right: 50, bottom: 50, left: 50};
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// Add SVG canvas to body
const svg = d3.select('body')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

// Load scree plot data
d3.json('/compute_eigenvectors')
  .then(function(data) {
    const eigenvalues = data.eigenvalues;
    const varianceRatio = data.variance_ratio;
    const cummulativeVarianceRatio = data.cumulative_variance_ratio;

    // Define X and Y scales
    const xScale = d3.scaleBand()
      .domain(d3.range(1, eigenvalues.length + 1))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(eigenvalues)])
      .range([height, 0]);

    // Define X and Y axes
    const xAxis = d3.axisBottom()
      .scale(xScale);

    const yAxis = d3.axisLeft()
      .scale(yScale);

    // Add X and Y axes to canvas
    svg.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis);

    svg.append('g')
      .call(yAxis);

    // Add bars to chart
    const bars = svg.selectAll('rect')
      .data(eigenvalues)
      .enter()
      .append('rect')
      .attr('x', (d, i) => xScale(i+1))
      .attr('y', (d) => yScale(d))
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => height - yScale(d))
      .attr('fill', 'steelblue')
      .on("mouseover", function(d) {
        // Show intrinsic value when hovering over bar chart
        d3.select(this)
          .append("text")
          .attr("class", "intrinsic")
          .attr("x", xScale(d.component) + 10)
          .attr("y", yScale(d.eigenvalue) - 5)
          .attr("text-anchor", "middle")
          .attr("font-size", "14px")
          .attr("fill", "black")
          .text((d.eigenvalue).toFixed(2));
      })
     .on("mouseout", function(d) {
        // Remove intrinsic value when mouse is out
        d3.select(this)
          .selectAll("text.intrinsic")
          .remove();
      });

    // Add scree line
    var line = d3.line()
               .x(function(d, i) { return xScale(i+1); })
               .y(function(d, i) { return yScale(d); });

    svg.append('path')
      .datum(cummulativeVarianceRatio)
      .attr('d', screeLine)
      .attr('fill', 'none')
      .attr('stroke', 'red')
      .attr('stroke-width', 2);

    // Add labels to chart
    svg.selectAll('text')
      .data(eigenvalues)
      .enter()
      .append('text')
      .attr('x', (d, i) => xScale(i+1) + xScale.bandwidth() / 2)
      .attr('y', (d) => yScale(d) - 10)
      .attr('text-anchor', 'middle')
      .text((d) => d.toFixed(2));
    }

  )  }