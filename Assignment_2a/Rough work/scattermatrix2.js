function scatterplotmatrix2(_data, options) {
    const margin = { top: 40, right: 20, bottom: 30, left: 40 };
    const width = 800 - margin.left - margin.right;
    const height = 800 - margin.top - margin.bottom;

    const columns = options.columns;
    const z = options.z;

    const x = d3.scaleLinear().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);
    const zScale = d3.scaleOrdinal(d3.schemeCategory10);

    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    const chart = function (selection) {
        selection.each(function (data) {

            // Filter out any columns that are not numeric
            const numericColumns = columns.filter((col) => {
                return !isNaN(_data[0][col]);
            }).slice(0, 4);

            // Initialize the matrix of scatterplots
            const matrix = numericColumns.map((col, i) => {
                return numericColumns.map((row, j) => {
                    return { x: col, y: row };
                }).slice(0, 4);
            });

            x.domain(d3.extent(_data, d => parseFloat(d[numericColumns[0]]))).nice();
            y.domain(d3.extent(_data, d => parseFloat(d[numericColumns[1]]))).nice();

            const svg = d3
            .select("#scatterplotmatrix")
            .append("svg")
            .attr("width", 800)
            .attr("height", 800)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
            const gEnter = svg.append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            gEnter.append("text")
                .attr("x", width / 2)
                .attr("y", 0 - (margin.top / 2))
                .attr("text-anchor", "middle")
                .text(`${numericColumns[1]} vs ${numericColumns[0]}`);

            gEnter.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            gEnter.append("g")
                .attr("class", "y axis")
                .call(yAxis);

            // Add the scatterplots to the matrix
            const cell = gEnter.selectAll(".cell").data(matrix).enter().append("g")
                .attr("class", "cell")
                .attr("transform", (d, i) => "translate(0," + i * height / matrix.length + ")")
                .each(plot);

            // Add a label to each row/column
            cell.filter((d, i) => i === matrix.length - 1).append("text")
                .attr("x", margin.right)
                .attr("y", height / matrix.length / 2)
                .attr("dy", ".71em")
                .text(d => d.y);

            cell.filter((d, i) => i === 0).append("text")
                .attr("x", -margin.left)
                .attr("y", height / matrix.length / 2)
                .attr("dy", ".71em")
                .attr("text-anchor", "end")
                .text(d => d.x);

                function plot(p) {
                    const cell = d3.select(this);
                
                    x.domain(d3.extent(_data, (d) => parseFloat(d[p.x]))).nice();
                    y.domain(d3.extent(_data, (d) => parseFloat(d[p.y]))).nice();
                
                    cell
                        .append("rect")
                        .attr("class", "frame")
                        .attr("x", margin.left)
                        .attr("y", margin.top)
                        .attr("width", width - margin.left - margin.right)
                        .attr("height", height - margin.top - margin.bottom);
                
                    cell
                        .selectAll("circle")
                        .data(_data)
                        .join("circle")
                        .attr("cx", (d) => x(parseFloat(d[p.x])))
                        .attr("cy", (d) => y(parseFloat(d[p.y])))
                        .attr("r", 3)
                        .style("fill", (d) => zScale(d[z]))
                        .filter((d, i) => i < 4);
                }
                
    });
};

return chart;
}



