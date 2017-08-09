var scatter_container = document.getElementById("tab2-left");


function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


d3.json("data/semantic2.json", function (data) {

    var color_status = 0;

    function preloadImages() {
        modal.style.display = "block";

        if (!preloadImages.list) {
            preloadImages.list = [];
        }
        var list = preloadImages.list;
        for (var i = 0; i < data.length; i++) {
            var img = new Image();
            img.onload = function () {
                var index = list.indexOf(this);
                if (index !== -1) {
                    // remove image from the array once it's loaded
                    // for memory consumption reasons
                    list.splice(index, 1);
                }
            }
            list.push(img);
            img.src = data[i].url;
            console.log(img.src)
            bar.animate(i / data.length);  // Number from 0.0 to 1.0
        }
        console.log('Done PreLoading Images from External Source')
        //modal.style.display = "none";
    }

    // Get the modal

    // Get the button that opens the modal
    var pbutton = document.getElementById("preload-button");
    pbutton.onclick = preloadImages;


    var damage = document.getElementById("damage");
    var image_container = document.getElementById("tab2-image-container");
    var contents_div = document.getElementById("tab2-contents");

    var current_index = -1;

// outer svg dimensions


    var width = 750;
    var height = 570;

// padding around the chart where axes will go
    var padding = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 40,
    };

// inner chart dimensions, where the dots are plotted
    var plotAreaWidth = width - padding.left - padding.right;
    var plotAreaHeight = height - padding.top - padding.bottom;

// radius of points in the scatterplot
    var pointRadius = 3;

// initialize scales
    var xScale = d3.scaleLinear().domain([0, 1]).range([0, plotAreaWidth]);
    var yScale = d3.scaleLinear().domain([0, 1]).range([plotAreaHeight, 0]);

// select the root container where the chart will be added
    var container = d3.select('#tab2-left');

// initialize main SVG
    var svg = container.append('svg')
        .attr('width', width)
        .attr('height', height);

// the main <g> where all the chart content goes inside
    var g = svg.append('g')
        .attr('transform', ("translate(" + (padding.left) + " " + (padding.top) + ")"));

// add in axis groups
    var xAxisG = g.append('g').classed('x-axis', true)
        .attr('transform', ("translate(0 " + (plotAreaHeight + pointRadius) + ")"));


// add in circles
    var circles = g.append('g').attr('class', 'circles');
    var binding = circles.selectAll('.data-point').data(data, function (d) {
        return d.key;
    });
    binding.enter().append('circle')
        .classed('data-point', true)
        .attr('r', pointRadius)
        .attr('cx', function (d) {
            return xScale(d.x);
        })
        .attr('cy', function (d) {
            return yScale(d.y);
        })
        .attr('fill', function (d) {
            return d.color[0];
        });


// add in interaction via voronoi
// initialize text output for highlighted points
    //var highlightOutput = container.append('div')
    //    .attr('class', 'highlight-output')
    //   .style('padding-left', ((padding.left) + "px"))
    //  .style('float', 'right')
    //  .style('min-height', '100px');

// create a voronoi diagram based on the data and the scales
    var voronoiDiagram = d3.voronoi()
        .x(function (d) {
            return xScale(d.x);
        })
        .y(function (d) {
            return yScale(d.y);
        })
        .size([plotAreaWidth, plotAreaHeight])(data);

// limit how far away the mouse can be from finding a voronoi site
    var voronoiRadius = plotAreaWidth / 50;


// add a circle for indicating the highlighted point
    g.append('circle')
        .attr('class', 'highlight-circle')
        .attr('r', pointRadius + 2) // slightly larger than our points
        .style('fill', 'none')
        .style('display', 'none');


    /**---------------------------- Doughnut SVG ----------------------------**/
    console.log("Doughnut Initializing")
    var dsvg = d3.select("#doughnut")
        .append("svg")
        .append("g")

    dsvg.append("g")
        .attr("class", "slices");
    dsvg.append("g")
        .attr("class", "labelName");
    dsvg.append("g")
        .attr("class", "labelValue");
    dsvg.append("g")
        .attr("class", "lines");

    var dwidth = $("#doughnut").outerHeight(),
        dheight = $("#doughnut").outerHeight(),
        dradius = Math.min(dwidth, dheight) / 2;

    var pie = d3.layout.pie()
        .sort(null)
        .value(function (d) {
            return d.value;
        });

    var legendRectSize = (dradius * 0.05);
    var legendSpacing = dradius * 0.02;

    var arc = d3.svg.arc()
        .outerRadius(dradius * 0.9)
        .innerRadius(dradius * 0.65);

    var outerArc = d3.svg.arc()
        .innerRadius(dradius * 0.95)
        .outerRadius(dradius * 0.95);

    var div = d3.select("#doughnut").append("div").attr("class", "toolTip");

    dsvg.attr("transform", "translate(" + dwidth / 0.9 + "," + dheight / 2 + ")");

    var colorRange = d3.scale.category20c();
    var color = d3.scale.ordinal()
        .range(colorRange.range());

    function change(data, mycolors) {

        console.log(mycolors);

        /* ------- PIE SLICES -------*/
        var slice = dsvg.select(".slices").selectAll("path.slice")
            .data(pie(data), function (d) {
                return d.data.label
            });

        slice.enter()
            .insert("path")
            .style("fill", function (d) {
                return mycolors[d.data.index];
            })
            .attr("class", "slice");

        slice
            .transition().duration(1000)
            .attrTween("d", function (d) {
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function (t) {
                    return arc(interpolate(t));
                };
            })
        slice
            .on("mousemove", function (d) {
                div.style("left", d3.event.pageX + 10 + "px");
                div.style("top", d3.event.pageY - 25 + "px");
                div.style("display", "inline-block");
                div.html((d.data.label) + "<br>" + ((d.value * 100).toPrecision(2)) + "%");
            });
        slice
            .on("mouseout", function (d) {
                div.style("display", "none");
            });

        slice.exit()
            .remove();


        /* ------- TEXT LABELS -------*/

        var text = dsvg.select(".labelName").selectAll("text")
            .data(pie(data), function (d) {
                return d.data.label
            });


        text.enter()
            .append("text")
            .attr("dy", ".35em")
            .style('fill', function (d) {
                return mycolors[d.data.index];
            })
            .text(function (d) {
                return (d.data.label + ": " + (d.value * 100).toPrecision(2) + "%");
            })

        function midAngle(d) {
            return d.startAngle + (d.endAngle - d.startAngle) / 2;
        }

        text
            .transition().duration(500)
            .attrTween("transform", function (d) {
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function (t) {
                    var d2 = interpolate(t);
                    var pos = outerArc.centroid(d2);
                    pos[0] = dradius * (midAngle(d2) < Math.PI ? 1 : -1);
                    return "translate(" + pos + ")";
                };
            })
            .styleTween("text-anchor", function (d) {
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function (t) {
                    var d2 = interpolate(t);
                    return midAngle(d2) < Math.PI ? "start" : "end";
                };
            })
            .text(function (d) {
                return (d.data.label + ": " + (d.value * 100).toPrecision(2) + "%");
            });

        text.exit()
            .remove();


        /* ------- SLICE TO TEXT POLYLINES -------*/

        var polyline = dsvg.select(".lines").selectAll("polyline")
            .data(pie(data), function (d) {
                return d.data.label
            });

        polyline.enter()
            .append("polyline")
            .attr("stroke", function (d) {
                return mycolors[d.data.index];
            });

        polyline.transition().duration(500)
            .attrTween("points", function (d) {
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function (t) {
                    var d2 = interpolate(t);
                    var pos = outerArc.centroid(d2);
                    pos[0] = dradius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                    return [arc.centroid(d2), outerArc.centroid(d2), pos];
                };
            });

        polyline.exit()
            .remove();
    };


    // callback to highlight a point
    function highlight(d) {
        // no point to highlight - hide the circle and clear the text
        if (!d) {
            d3.select('.highlight-circle').style('display', 'none');
            // otherwise, show the highlight circle at the correct position
        } else {
            console.log(d)
            change(d.labels, d.color)
            d3.select('.highlight-circle')
                .style('display', '')
                .style('stroke', function (myd) {
                    if (color_status == 0) {
                        var newcolor = d.color[0]
                        console.log(d.labels)
                    } else if (color_status == 1) {
                        var newcolor = "yellow"
                        console.log(newcolor)
                    }
                    return newcolor;
                })
                .attr('cx', xScale(d.x))
                .attr('cy', yScale(d.y));

            // format the highlighted data point for inspection
            var ind = d.url.indexOf(".jpg");
            var imurl = d.url.substring(0, ind - 1) + 'h' + d.url.substring(ind, d.url.length);
            damage.src = imurl;//.innerHTML = "<img  id=\"damage\" src=\"" + imurl + "\">";
            //var newcolor = getRandomColor();
            damage.style.backgroundColor = d.color[0];
            image_container.style.backgroundColor = d.color[0];
            contents_div.style.backgroundColor = d.color[0];
        }
    }

// add the overlay on top of everything to take the mouse events
    g.append('rect')
        .attr('class', 'overlay')
        .attr('width', plotAreaWidth)
        .attr('height', plotAreaHeight)
        .style('fill', 'white')
        .style('opacity', 0)
        .on('mousemove', function mouseMoveHandler() {
            // get the current mouse position
            var ref = d3.mouse(this);
            var mx = ref[0];
            var my = ref[1];
            // use the new diagram.find() function to find the voronoi site closest to
            // the mouse, limited by max distance defined by voronoiRadius
            var site = voronoiDiagram.find(mx, my, voronoiRadius);
            // highlight the point if we found one, otherwise hide the highlight circle
            // Only caall highlight again if the index has changed
            try {
                if (site.index != current_index) {
                    highlight(site && site.data);
                    current_index = site.index;
                }
            } catch (err) {
            }
        })
        .on('mouseleave', function () {
            // hide the highlight circle when the mouse leaves the chart
            highlight(null);
        });


    /**
     * Zooming Functionality
     */


    /**
     * Add/remove a visible voronoi diagram and a circle indicating the radius used
     * in the voronoi find function
     */


    /**
     * COLOR Change Code
     *
     */


    function changeColorBy() {
        console.log('Color By')
    }

    var cbutton = document.getElementById("colorby-button")
    cbutton.onclick = changeColorBy;


    var voroni_status = 0;

    function toggleVoronoiDebug() {
        if (voroni_status == 0) {
            vbutton.innerHTML = "<i class=\"fa fa-eye-slash\" aria-hidden=\"true\" ></i> &ensp;Hide Voroni";
            voroni_status = 1;
        }
        else if (voroni_status == 1) {
            vbutton.innerHTML = "<i class=\"fa fa-eye\" aria-hidden=\"true\" ></i> &ensp;View Voroni";
            voroni_status = 0;
        }
        // remove if there
        if (!g.select('.voronoi-polygons').empty()) {
            g.select('.voronoi-polygons').remove();
            g.select('.voronoi-radius-circle').remove();
            g.select('.overlay').on('mousemove.voronoi', null).on('mouseleave.voronoi', null);
            // otherwise, add the polygons in
        } else {
            // add a circle to follow the mouse to draw the voronoi radius
            g.append('circle')
                .attr('class', 'voronoi-radius-circle')
                .attr('r', voronoiRadius)
                .style('fill', 'none')
                .style('stroke', 'white')
                .style('stroke-dasharray', '3,2')
                .style('display', 'none');


            // move the voronoi radius mouse circle with the mouse
            g.select('.overlay')
                .on('mousemove.voronoi', function mouseMoveVoronoiHandler() {
                    var ref = d3.mouse(this);
                    var mx = ref[0];
                    var my = ref[1];
                    d3.select('.voronoi-radius-circle')
                        .style('display', '')
                        .attr('cx', mx)
                        .attr('cy', my);
                })
                .on('mouseleave.voronoi', function () {
                    d3.select('.voronoi-radius-circle').style('display', 'none');
                });


            // draw the polygons
            var voronoiPolygons = g.append('g')
                .attr('class', 'voronoi-polygons')
                .style('pointer-events', 'none');

            var binding = voronoiPolygons.selectAll('path').data(voronoiDiagram.polygons());
            binding.enter().append('path')
                .style('stroke', 'white')
                .style('fill', 'none')
                .style('opacity', 0.15)
                .attr('d', function (d) {
                    return ("M" + (d.join('L')) + "Z");
                });
        }
    }

// turn on and off voronoi debugging with click
    //svg.on('click', toggleVoronoiDebug);

    var vbutton = document.getElementById("voroni-button")
    vbutton.onclick = toggleVoronoiDebug;


    var bar = new ProgressBar.Circle(preloadbar, {
        color: 'yellow',
        // This has to be the same size as the maximum width to
        // prevent clipping
        strokeWidth: 4,
        trailWidth: 1,
        easing: 'easeInOut',
        duration: 1400,
        text: {
            autoStyleContainer: false
        },
        from: {color: "#ffffff", width: 1},
        to: {color: '#ffff22', width: 4},
        // Set default step function for all animate calls
        step: function (state, circle) {
            circle.path.setAttribute('stroke', state.color);
            circle.path.setAttribute('stroke-width', state.width);

            var value = Math.round(circle.value() * 100);
            if (value === 0) {
                circle.setText('');
            } else {
                circle.setText(value);
            }

        }
    });
    bar.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
    bar.text.style.fontSize = '2rem';

    var modal = document.getElementById('myModal');
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

})


var rbutton = document.getElementById("reset-button")
rbutton.onclick = resetView;

function resetView() {
    console.log('Reset View')
}

