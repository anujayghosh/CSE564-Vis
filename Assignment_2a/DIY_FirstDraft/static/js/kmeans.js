function createKMeansChart(data) {
    const margin = { top: 100, right: 120, bottom: 100, left: 120 };
    const width = 960 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const svg = d3.select("#kmeanschart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const x = d3.scaleLinear()
      .range([0, width])
      .domain(d3.extent(data, d => d.no_atms_on_site))
      .nice();

    const y = d3.scaleLinear()
      .range([height, 0])
      .domain(d3.extent(data, d => d.no_pos_on_line))
      .nice();

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    svg.selectAll("circle")
      .data(data)
      .enter().append("circle")
      .attr("cx", d => x(d.no_atms_on_site))
      .attr("cy", d => y(d.no_pos_on_line))
      .attr("r", 4)
      .style("fill", d => color(d.cluster_label))
      .style("opacity", 0.7)
      .style("stroke", "black");

    // Add the x-axis
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .append("text")
      .attr("class", "axis-label")
      .attr("x", width / 2)
      .attr("y", margin.bottom / 2)
      .text("Number of ATMs On Site");

      svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + 50)
      .text("Number of ATMs On Site")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "central");

    // Add the y-axis
    svg.append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left / 2)
      .text("Number of POS online");

      svg.append('text')
      .attr('transform', `rotate(-90) translate(${(height / 2) - 350}, ${ margin.left -200})`)
      .style('text-anchor', 'middle')
      .text('Number of POS online');

    // Add chart title
    svg.append("text")
      .attr("class", "chart-title")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .style("text-anchor", "middle")
      .text("K-Means Clustering of ATM offline and POS online");
}