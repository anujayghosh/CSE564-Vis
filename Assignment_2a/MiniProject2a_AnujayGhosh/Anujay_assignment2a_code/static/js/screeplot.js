function updateTable(i) {
    console.log('updateTable called');
    fetch(`/compute_loadings?bar=${i}`)
        .then(response => response.json())
        .then(data => {
            console.log('d3.json callback called');

            // Sort the loadings data by the sum of square loadings for PC1 to PCi
            const sortedData = data.attributes.map((attribute, index) => {
                return {
                    Attribute: attribute,
                    SS_Loadings: [data.ss_loadings[index]]
                }
            }).sort(function (a, b) {
                console.log('a.SS_Loadings', a.SS_Loadings);
                const sumA = d3.sum(a.SS_Loadings.map(l => l * l));
                const sumB = d3.sum(b.SS_Loadings.map(l => l * l));
                return d3.descending(sumA, sumB);
            });
            // Update the table with the new loadings data
            const loadingsData = sortedData.slice(0, 4);
            console.log('loadingsData', loadingsData);
            const table = d3.select("#screeloadingstable");
            console.log('table', table);
            table.select('table').remove(); // remove previous table if it exists
            const newTable = table.append('table');
            console.log('newTable', newTable);
            const thead = newTable.append('thead');
            const tbody = newTable.append('tbody');
            console.log('tbody', tbody);
            const columns = ["Attribute", "Sum of Squared Loadings (%)"];
            const header = thead.append('tr').selectAll('th').data(columns).enter().append('th').text(function (d) { return d; });
            const rows = tbody.selectAll('tr').data(loadingsData).enter().append('tr');
            console.log('rows', rows);
            rows.append('td').text((d) => { console.log('d.Attribute', d.Attribute); return d.Attribute; });
            rows.append('td').text((d) => { console.log('d.values', d.values); return d.SS_Loadings.slice(0, i + 1).reduce((a, b) => a + b ** 2, 0); });
        }
        )
        .catch(error => console.error(error));

}




function createScreePlot(screeData) {
    const margin = { top: 100, right: 120, bottom: 100, left: 120 };
    const width = 960 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const x = d3.scaleBand()
        .range([0, width])
        .padding(0.2)
        .domain(screeData.map(d => `PC${d.component}`));

    const y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(screeData, d => d.eigenvalue / (10 ** 15))]);

    const xAxis = d3.axisBottom(x);

    const yAxis = d3.axisLeft(y);

    const svg = d3.select('#screeplot')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    svg.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis)
        .selectAll('text')
        .attr('text-anchor', 'end')
        .attr('transform', 'rotate(-45)');

    svg.append('g')
        .call(yAxis)
        .append('text')
        .attr('fill', '#000')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '-3em')
        .attr('text-anchor', 'end')
        .style('font-size', '16')
        .text('Eigenvalues (x10^15)');

    var bars = svg.selectAll('.bar')
        .data(screeData)
        .enter()
        .append('g')
        .attr('class', 'bar');

    // Add the rectangles and text elements to the group
    bars.append('rect')
        .attr('x', d => x(`PC${d.component}`))
        .attr('y', d => y(d.eigenvalue / (10 ** 15)))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.eigenvalue / (10 ** 15)))
        .attr('fill', 'steelblue')
        .on("mouseover", function (d) {
            // Change color of bars on mouse hover
            d3.select(this).attr('fill', 'orange');

            // Show intrinsic value when hovering over bar chart
            d3.select(this.parentNode)
                .append('text')
                .attr('class', 'intrinsic')
                .attr('x', d => x(`PC${d.component}`) + x.bandwidth() / 2)
                .attr('y', d => y(d.eigenvalue / (10 ** 15)) - 10)
                .attr('text-anchor', 'middle')
                .attr('font-size', '14px')
                .attr('fill', 'black')
                .text(d => `Intrinsic: ${d.eigenvalue}`);
        })
        .on("mouseout", function (d) {
            // Revert color of bars and remove intrinsic value when mouse is out
            d3.select(this).attr('fill', 'steelblue');
            d3.select(this.parentNode).select("text.intrinsic").remove();
        })
        .on('click', function (d, i) {
            // Call the updateTable function with the index of the clicked bar
            updateTable(i.component);
        });


    // Prepare line data
    const lineData = screeData.map(d => ({ component: d.component, eigenvalue: d.eigenvalue / (10 ** 15) }));

    // Add scree line
    const line = d3.line()
        .x(d => x(`PC${d.component}`) + x.bandwidth() / 2)
        .y(d => y(d.eigenvalue));

    svg.append('path')
        .datum(lineData)
        .attr('class', 'line')
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', 'red')
        .attr('stroke-width', 2);

    // Highlight points on the line
    svg.selectAll('.dot')
        .data(lineData)
        .enter().append('circle')
        .attr('class', 'dot')
        .attr('cx', d => x(`PC${d.component}`) + x.bandwidth() / 2)
        .attr('cy', d => y(d.eigenvalue))
        .attr('r', 5)
        .attr('fill', 'red')
        .on('click', function (d, i) {
            // Call the updateTable function with the index of the clicked bar
            updateTable(i.component);
        });


    // Calculate the total variance
    const totalVariance = screeData.reduce((a, b) => a + b.variance, 0);


    // Define the y2 axis to show cumulative variability in percentage
    const y2 = d3.scaleLinear()
        .domain([0, 100])
        .range([height, 0]);

    const yAxis2 = d3.axisRight(y2)
        .tickFormat(d => `${d}%`);

    svg.append('g')
        .attr('class', 'axis y2')
        .attr('transform', `translate(${width}, 0)`)
        .call(yAxis2);

    // Define the line generator to show cumulative variability in percentage
    const lineData2 = screeData.map((d, i, arr) => ({
        component: +d.component,
        cumulativeVariance: (arr.slice(0, i + 1).reduce((a, b) => a + b.variance, 0) / totalVariance) * 100,
    }));

    const line2 = d3.line()
        .x(d => x(`PC${d.component}`) + x.bandwidth() / 2)
        .y(d => y2(d.cumulativeVariance))
        .curve(d3.curveMonotoneX);

    // Add the cumulative variance line to the SVG
    svg.append('path')
        .datum(lineData2)
        .attr('class', 'line')
        .attr('d', line2)
        .attr('fill', 'none')
        .attr('stroke', 'green')
        .attr('stroke-width', 2);

    // Add labels to chart
    svg.selectAll('text')
        .data(screeData)
        .enter()
        .append('text')
        .attr('x', d => x(`PC${d.component}`))
        .attr('y', d => y(d.eigenvalue / (10 ** 15)))
        .attr('text-anchor', 'middle')
        .text((d) => d.toFixed(2));

    // Append x axis label
    svg.append('text')
        .attr('class', 'axis-label')
        .attr('transform', `translate(${width / 2}, ${height + margin.top - 60})`)
        .style('text-anchor', 'middle')
        .text('Principal Components');

    // Append y2 axis label
    svg.append('text')
        .attr('transform', `rotate(-90) translate(${(height / 2) - 330}, ${width + margin.right / 2})`)
        .style('text-anchor', 'middle')
        .text('Percentage of cumulative variance');
}

