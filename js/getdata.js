var publicSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1xQMQh27-_YzE88IlIAqTg0RRYU3tPpTBTLKzw3FGwrU/edit?usp=sharing';
var myData = [];
var margin = { top: 25, right: 25, bottom: 110, left: 50 },
    width = 1200 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    focusHeight = 100;
//'https://docs.google.com/spreadsheets/d/15C6TAyBmkJSd0aFSrEirw7OZLlAb1VHpchxllIY9oDo/pubhtml';
//'https://docs.google.com/spreadsheets/d/1sbyMINQHPsJctjAtMW0lCfLrcpMqoGMOJj6AN-sNQrc/pubhtml';


$(document).ready(function () {
    init();
  })

function init() {
  Tabletop.init( { key: publicSpreadsheetUrl,
                   callback: loadData,
                   simpleSheet: false } )
}

function loadData(data, tabletop) {
  myData = data['Assembly/Senate Totals'].elements
  myData = myData.slice(1);
  myData.forEach(function(d){
    d.name = d['Name'];
    d.party = d['Party'];
    d.totalTaken = parseInt(d['Total Taken'].replace('$','').replace(',',''));
    d.moneyReclaimed = parseInt(d["Money Reclaimed"].replace('$','').replace(',',''));
    d.area = d['Area'];
    d.district = d['District'];
    d.email = d["Email"];
    d.social = d["Twitter"];


    /*
    2020 # Taken: "6"
    2020 $ Taken: "$34,300.00"
    # Taken: "6"
    Area: "Redding"
    District: "AD-01"
    District Office #: ""
    Email: ""
    Money Reclaimed: ""
    Name: "Megan Dahle"
    Office: "Assembly"
    Party: "R"
    Response?: ""
    Total Taken: "$33,600.00"
    Twitter: "https://www.facebook.com/voteMeganAD1/"
    name: "Megan Dahle"

    */
    myData = myData.slice().sort((a, b) => d3.descending(a.totalTaken, b.totalTaken));
  });

  console.log(myData);
  senateTotals(myData);
}


function senateTotals(myData) {
  var svg = d3.select("#chart").append("svg")
  //later change this to be dynamic
    .attr("width", 4*width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("id", "testing")
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

    const brush = d3.brushX()
          .extent([[margin.left, 0.5], [width - margin.right, focusHeight - margin.bottom + 0.5]]);
          //.on("brush", brushed)
          //.on("end", brushended);
//  const defaultSelection = [x(d3.utcYear.offset(x.domain()[1], -1)), x.range()[1]];
  /*  svg.append("path")
        .datum(myData)
        .attr("fill", "steelblue")
        .attr("d", area(x, y.copy().range([focusHeight - margin.bottom, 4]))); */

    const gb = svg.append("g")
        .call(brush);
    //    .call(brush.move, defaultSelection);
  //create toolTip
  var tooltip = d3.select("body").append("div").attr("class", "toolTip");
  // set the ranges
  var x = d3.scaleBand()
            .range([0, 4*width])
            .padding(0.1);
  var y = d3.scaleLinear()
            .range([height, 0]);

  // Scale the range of the data in the domains
  x.domain(myData.map(function(d) { return d.name; }));
  y.domain([0, d3.max(myData, function(d) { return d.totalTaken; })]);

  svg.selectAll(".bar")
      .data(myData)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.name); })
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return y(d.totalTaken); })
      .attr("height", function(d) { return height - y(d.totalTaken); })
      .attr("fill", function(d) {
        if(d.party == 'D') {return 'blue'}
        else if (d.party =='R') {return 'red'}
        else if (d.party == 'I') {return 'green'}
      })
      .on("mouseover", function(d) {
              d3.select(this).attr("opacity", ".7");
              tooltip
                .style("left", d3.event.pageX + "px")
                .style("top", d3.event.pageY + "px")
                .style("display", "inline-block")
                .html("<b>" +(d.name) +  " (" + (d.district)+ ")" + "</b> <br> " + (d.area) );
            })
            .on("mouseout", function(d) {
              d3.select(this).attr("opacity", "1");
              tooltip.style("display", "none");
            });


  // add the x Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
        .style("text-anchor", "end")
        .style("font-size", "1.3em")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-90)", "translate(0," + (-100) + ")");
        //.attr("transform", "rotate(-65)", "translate(0," + (90) + ")");

  // add the y Axis
  svg.append("g")
    .call(d3.axisLeft(y)
    .tickFormat(d3.format("$.2s")));
    //.ticks(10, "~s")); //.render()); //.tickValues([]));

//  append y label
  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("x", 0)
      .attr("dy", "1em")
      .style("text-anchor", "middle");


      }
//window.addEventListener('DOMContentLoaded', init)
