function createBiplot(score, coef, labels) {
    const width = 960;
    const height = 600;

    const xs = score.map(d => d[0]);
    const ys = score.map(d => d[1]);
    const n = coef.length;
    const scalex = 1.0 / (d3.max(xs) - d3.min(xs));
    const scaley = 1.0 / (d3.max(ys) - d3.min(ys));


    const svg = d3.select("#biplot")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // plot scores
    svg.selectAll("circle")
        .data(score)
        .enter()
        .append("circle")
        .attr("cx", d => (d[0] + (Math.random() - 0.5) * 0.1) * scalex * width)
        .attr("cy", d => (d[1] + (Math.random() - 0.5) * 0.1) * scaley * height)
        .attr("r", 5)
        .attr("fill", "orange")
        .attr("opacity", 0.2)
        .style("stroke", "red")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);


    // create separate x and y scales for the projections
    const projectionScale = d3.scaleLinear()
        .domain([-1, 1])
        .range([-1, 1]);

    const xProjectionScale = projectionScale.copy()
        .range([0, width]);

    const yProjectionScale = projectionScale.copy()
        .range([height, 0]);

    // calculate projections of variables on PC1 and PC2
    // const projections = coef.map(c => [d3.sum(xs.map((x, i) => x * c[i])), d3.sum(ys.map((y, i) => y * c[i]))]);
    const projections = coef.map(c => [d3.sum(xs.map((x, i) => -0.6 * x * c[i])), d3.sum(ys.map((y, i) => y * c[i]))]);

    // plot variables
    for (let i = 0; i < n; i++) {
        svg.append("line")
            .attr("x1", xProjectionScale(0))
            .attr("y1", yProjectionScale(0))
            .attr("x2", xProjectionScale(projections[i][0]))
            .attr("y2", yProjectionScale(projections[i][1]))
            .attr("stroke", "purple")
            .attr("stroke-width", 1)
            .attr("opacity", 0.5);

        svg.append("text")
            .attr("x", xProjectionScale(projections[i][0]))
            .attr("y", yProjectionScale(projections[i][1]))
            .text(labels[i])
            .attr("fill", "darkblue")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "central");
    }

    const xScale = d3.scaleLinear()
        .domain([d3.min(xs), d3.max(xs)])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([d3.min(ys), d3.max(ys)])
        .range([height, 0]);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${height / 2})`)
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", `translate(${width / 2}, 0)`)
        .call(yAxis);

    // plot axis labels
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 20)
        .text("PC1")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "central");

    svg.append("text")
        .attr("x", 20)
        .attr("y", height / 2)
        .text("PC2")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "central")
        .attr("transform", "rotate(-90, 20," + height / 2 + ")");

    // plot title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 20)
        .text("Biplot of PCA")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "central");
}