

// Defines size of graph
// Padding references the area around the actual graph including the legend, title and axis
var padding = { left: 100, right: 200, top:30, bottom:100};
var chartHeight = 550;
var chartWidth = 900;

//Distinct colors, these are just the rainbow.  Feel free to add more. These limit the number
//of lines that can be defined on a single chart
var rainbow = [
               "#D80032",
               "#00b9e4",
               "#92d400",
               "#efea1f",
               "#f0ab01",
               "#ff00ae",
               "#883955",
               "#2F52E0",
               "#6457A6",
               "#000000",
               "#666666",
               "#a5742a"
             ]

//Sends GET request to a given link and returns a JS object
function getJSONfile(fileName) {
  var request = new XMLHttpRequest();
  request.open("GET", fileName, false);
  request.send(null)
  var my_JSON_object = JSON.parse(request.responseText);
  return my_JSON_object;
}


//Gets cookies from current page.  This should be reworked to be a more general solution
function getCookies() {
  cookies = {};
  cookieArr = document.cookie.split("; ");
  for(i in cookieArr) {
    [key,val] = cookieArr[i].split("=");
    if( val ) {
      val = val.split(",");
      if( !(key in cookies)) {
        cookies[key] = val;
      } else {
        cookies[key] = cookies[key] + (val);
      }
    }
  }
  return cookies
}

// Gets a specific cookie by name
function getCookie(name) {
  return getCookies()[name];
}

// data is an array of different label/card pairs and their corresponding data
function main(data) {


  cookies = getCookies();

  // Get data passed from the previous forms
  start = new Date(cookies["start"][0]);
  end = new Date(cookies["end"][0]);
  test = cookies["test"][0];
  subtest = cookies["subtest"][0];
  type = cookies["type"][0];
  tempExclude = [];
  if( cookies["exclude"] ) {
    tempExclude = cookies["exclude"].join(" ").split(/\s+/);
  }
  exclude = [];
  for( i in tempExclude ) {
    if( tempExclude[i] != "") {
      exclude.push(tempExclude[i]);
    }
  }
  console.log(exclude);
  cards = cookies["cards"];
  labels = cookies["labels"];

  data = {};
  title = test + ": " + subtest + ": " + type;  // Title of the graph


  // Request data for each card
  for( i in cards ) {
    request = "http://netqe-infra01.knqe.lab.eng.bos.redhat.com:8009/data?"
    request = request + "cardName=" + cards[i] + "&";
    request = request + "test=" + test + "&";
    request = request + "subtest=" + subtest + "&";
    request = request + "type=" + type;
    data[cards[i]] = getJSONfile(request)
  }

  minData = Infinity;
  maxData = -Infinity;



  /////////////////////////////////////////////////////////////////////////////

  graphData = {};
  for( card in data ) {
    for( item in data[card] ) {
      for( label in labels ) {
        key = card + ":" + labels[label]
        if( ! (key in graphData) ) {
          graphData[key] = []
        }
        if( data[card][item]["data"] && data[card][item]["data"][labels[label]]) {
          tempDate = new Date(data[card][item]["datetime"]*1000);
          if(! exclude.includes(data[card][item]["sheetId"]) ) {
	    console.log(data[card][item]);
            val = data[card][item]["data"][labels[label]];
            (graphData[key]).push({"x": tempDate, "y": val});
            minData = Math.min(val, minData);
            maxData = Math.max(val, maxData);
          }
        }
      }
    }
  }

 //////////////////////////////////////////////////////////////////////////////

  // #graph is an svg, this sets the size
  root = d3.select("#graph")
    .attr("width", chartWidth + padding.left + padding.right)
    .attr("height", chartHeight + padding.top + padding.bottom);



  /*                  Set all the starting values for x and y axis           */
  /////////////////////////////////////////////////////////////////////////////

  // Note maxData, minData, and range are only set once and then the zoom function
  // handles the data range
  range = maxData - minData

  dateRange = end - start


  // End and start are based on input values from the date page
  xScale = d3.time.scale()
              .domain([start.getTime(), end.getTime()])
              .range([padding.left, chartWidth + padding.left])

  xAxis = d3.svg.axis()
          .scale(xScale)
          .orient("bottom")
          .tickFormat(d3.time.format("%Y-%m-%d"))
          .ticks(10);

  root.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (chartHeight + padding.top) +  ")") // move x axis to the bottom of the chart
      .call(xAxis).selectAll("text")  //Rotate x axis labels and set size
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)" );

  yScale = d3.scale.linear()
                   .domain([minData - range*0.1, maxData + range*0.1])
                   .range([chartHeight + padding.top, padding.top]);

  yAxis = d3.svg.axis()
                .scale(yScale)
                .orient("left")
                .ticks(10);

  root.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .attr("transform", "translate(" + padding.left + ",0)");


  /* Generate line using xScale and yScale, which are subject to change from
     the onZoom function                                                    */
  /////////////////////////////////////////////////////////////////////////////

  var lineGenerator = d3.svg.line()
                        .x(function (d) { return xScale(d.x) - padding.left })
                        .y(function (d) { return yScale(d.y) - padding.top })
                        .interpolate("linear");

  /*           Create legend in the top right corner of the chart           */
  ////////////////////////////////////////////////////////////////////////////

  legend = root.append("g")
              .attr("class","legend")
              .attr("transform","translate(1025,50)")
              .style("font-size","16px");

  /////////////////////////////////////////////////////////////////////////////


  // This contains all points and lines which are in the chart, creates a view
  // window so only area between axis shows line graph
  var data = root.append("svg")
                .attr("class", "data")
                .attr("x", padding.left)
                .attr("y", padding.top)
                .attr("height", chartHeight)
                .attr("width", chartWidth);

  data.append("rect")
    .attr("class", "background");

  // Generate starting postions for each data point and the line graph
  // Add each entry to the legend
  var pos = 0
  for(key in graphData) {
    if(graphData.hasOwnProperty(key)) {
      curGroup = data.append("g")
                      .attr("id", key)
      // Points
      scatter = curGroup.selectAll("circle")
          .data(graphData[key])
          .enter().append("circle")
                .attr("class", "point")
                .attr("cy", function (d) { return yScale(d.y) - padding.top} )
                .attr("cx", function (d) { return xScale(d.x) - padding.left})
                .attr("r", 5)
                .attr("fill", rainbow[pos])

      // Line graph
      curGroup.append("path")
              .attr("class", "line")
              .attr("d", lineGenerator(graphData[key]))
              .attr("stroke", rainbow[pos])
              .attr("stroke-width", 2)
              .attr("fill", "none")
              .attr("data-legend", key);

      // Legend
      legend.append("circle")
            .attr("cx", 0)
            .attr("cy", pos * 25)
            .attr("r", 5)
            .attr("fill", rainbow[pos])

      legend.append("text")
            .text(key)
            .attr("text-anchor", "start")
            .attr("alignment-baseline", "middle")
            .attr("x", 8)
            .attr("y", pos * 25)

      pos = pos + 1
    }
  }

  /////////////////////////////////////////////////////////////////////////////

  // Create title
  title = root.append("text")
	      .attr("text-anchor", "middle")
	      .attr("alignment-baseline", "hanging")
              .attr("y", 10)
              .attr("x", 500)
              .text(title)
              .attr("class", "title");


  /*                 This is where the magic happens                         */
  /////////////////////////////////////////////////////////////////////////////

  var onZoom = function() {

    circles = root.selectAll(".point");
    paths = root.selectAll(".line");

    // xAxis is automatically rescaled by d3.zoom but the text needs to be fixed
    root.select(".x.axis").call(xAxis).selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("transform", "rotate(-65)" );

    // Move circles and path along the xAxis
    circles.attr("cx", function (d) { return xScale(d.x) - padding.left});
    paths.attr("d", function(d) { return lineGenerator(graphData[d3.select(this).attr("data-legend")])});

    // Set class to .point.visible if the date is in xScale domain
    circles.attr("class", function(d) { return d.x < xScale.domain()[1] && d.x > xScale.domain()[0] ? "point visible" : "point" } );

    visData = root.selectAll(".point.visible").data().map(function (d) { return d.y } ); // get data from points in class defined above
    minVis = Math.min(...visData);
    maxVis = Math.max(...visData);
    range = maxVis - minVis


    // only update yScale if at least two points are visible
    if(minVis != Infinity && minVis!=maxVis) {

      yScale.domain([minVis - 0.1*range,maxVis+0.1*range])  // update data domain

      root.select(".y.axis").call(yAxis);  // update axis with new domain

      // update y-portions of path and circles.  Use transitions to make it smooth.  Update image AFTER update transition finishes
      paths.transition().duration(250).attr("d", function(d) { return lineGenerator(graphData[d3.select(this).attr("data-legend")])}).each("end", updateImage);
      circles.transition().duration(250).attr("cy", function (d) { return yScale(d.y) - padding.top}).each("end", updateImage);

      data.selectAll(".horizontalGrid").remove();  // remove horizontalGrid

      // add horizontalGrid back with new positions
      data.selectAll(".horizontalGrid").data(yScale.ticks()).enter()
        .append("line")
            .attr(
		{
		    "class":"horizontalGrid",
		    "x1" : 0,
		    "x2" : chartWidth,
		    "y1" : function(d){ return yScale(d) - padding.top;},
		    "y2" : function(d){ return yScale(d) - padding.top;},
		    "fill" : "none",
		    "shape-rendering" : "crispEdges",
		    "stroke" : "black",
		    "stroke-width" : "1px"
		});

    }

    // remove vertical grid and add back in new positions
    data.selectAll(".verticalGrid").remove()
    data.selectAll(".verticalGrid").data(xScale.ticks()).enter()
          .append("line")
          .attr(
          {
              "class":"verticalGrid",
              "y1" : 0,
              "y2" : chartHeight,
              "x1" : function(d){ return xScale(d) - padding.left;},
              "x2" : function(d){ return xScale(d) - padding.left;},
              "fill" : "none",
              "shape-rendering" : "crispEdges",
              "stroke" : "black",
              "stroke-width" : "1px"
          });

    updateImage();
  }

  ///////////////////////////////////////////////////////////////////////


  zoom = d3.behavior.zoom()
    .x(xScale)
    .on("zoom", onZoom);

  root.call(zoom);
  onZoom();
}
