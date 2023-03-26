function drawScatterPlot(data, attr1, attr2,scatterplotid) {

  
        // Set up the SVG element
        var margin = { top: 60, right: 60, bottom: 60, left: 60 };
        var width = 250 - margin.left - margin.right;
        var height = 250 - margin.top - margin.bottom;
  
        var svg = d3.select(`#${scatterplotid}`)
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
        // Set up the x and y scales
        var xScale = d3.scaleLinear()
          .domain(d3.extent(data, function(d) { return d[attr1]; }))
          .range([0, width]);
  
        var yScale = d3.scaleLinear()
          .domain(d3.extent(data, function(d) { return d[attr2]; }))
          .range([height, 0]);
  
        // Add the x and y axes
        var xAxis = d3.axisBottom(xScale);
        var yAxis = d3.axisLeft(yScale);
  
        svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);
  
        svg.append("g")
          .call(yAxis);
  
        // Add the x and y axis labels
        svg.append("text")
          .attr("text-anchor", "middle")
          .attr("transform", "translate(" + (width / 2) + "," + (height + margin.bottom) + ")")
          .text(attr1);
  
        svg.append("text")
          .attr("text-anchor", "middle")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - margin.left)
          .attr("x", 0 - (height / 2))
          .attr("dy", "1em")
          .text(attr2);
  
        // Add the data points to the scatter plot
        svg.selectAll(".dot")
          .data(data)
          .enter().append("circle")
          .attr("class", "dot")
          .attr("cx", function(d) { return xScale(d[attr1]); })
          .attr("cy", function(d) { return yScale(d[attr2]); })
          .attr("r", 5)
          .style("fill", "steelblue");
  
      }