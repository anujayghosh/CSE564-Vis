var margin = { top: 50, right: 60, bottom: 50, left: 80 };
var width = 1920 - margin.left - margin.right;
var height = 900 - margin.top - margin.bottom;

var parcoords = d3.parcoords()("#parallel_chart2")
  .alpha(0.4)
  .mode("queue") // progressive rendering
  .height(height)
  .margin({
    top: margin.top,
    left: margin.left,
    right: margin.right,
    bottom: margin.bottom
  });

  d3.json("/parallel_data", function(data) {

    data.forEach(function(d,i) { d.id = d.id || i; });
    console.log(data)
    parcoords
      .data(data)
      .render()
      .reorderable();
  });