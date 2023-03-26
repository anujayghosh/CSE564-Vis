const tooltip = d3.select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

d3.json('/compute_eigenvectors').then(function (data) {
    // Create data structures
    var eigenvalues = data.eigenvalues;
    var eigenvectors = data.eigenvectors;
    var variance_ratio = data.variance_ratio;
    var cumulative_variance_ratio = data.cumulative_variance_ratio;
    var num_components = eigenvalues.length;

    // Create SVG element
    const margin = { top: 100, right: 120, bottom: 100, left: 120 };
    const width = 960 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    var svg = d3.select('#biplot')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Create x and y scales
    var xScale = d3.scaleLinear()
        .domain([d3.min(eigenvectors, function (d) { return d[0]; }), d3.max(eigenvectors, function (d) { return d[0]; })])
        .range([0, width]);

    var yScale = d3.scaleLinear()
        .domain([d3.min(eigenvectors, function (d) { return d[1]; }), d3.max(eigenvectors, function (d) { return d[1]; })])
        .range([height, 0]);

    // Create x and y axes
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    svg.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)
        .append('text')
        .attr('fill', '#000')
        .attr('x', width / 2)
        .attr('y', 40)
        .attr('text-anchor', 'middle')
        .text('PC 1');

    svg.append('g')
        .call(yAxis)
        .append('text')
        .attr('fill', '#000')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '-3em')
        .attr('text-anchor', 'end')
        .text('PC 2');

    // Create circles for eigenvectors
    const circles = svg.selectAll('circle')
        .data(eigenvectors)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d[0]))
        .attr('cy', d => yScale(d[1]))
        .attr('r', 5)
        .style('fill', 'blue')
        .style('stroke', 'white')
        .style('stroke-width', '2px')
        .on('mouseover', function (d, i) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('r', 10);
            tooltip.transition()
                .duration(200)
                .style('opacity', .9);
            tooltip.html(num_cols[i])
                .style('left', (d3.event.pageX + 10) + 'px')
                .style('top', (d3.event.pageY - 28) + 'px');
        })
        .on('mouseout', function (d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('r', 5);
            tooltip.transition()
                .duration(200)
                .style('opacity', 0);
        });
})