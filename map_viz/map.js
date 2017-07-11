/**
 * Created by nate on 7/5/2017.
 */


function googlemapvis(jsonpath) {


    var album_div = document.getElementById("album");
    var album_title = document.getElementById("album-title-text");
    var album_text = document.getElementById("big-image-content-text");
    var album_block = document.getElementById("album_block");
    var album_a = document.getElementById("album_a");


// Create the Google Map…
    var map = new google.maps.Map(d3.select("#map").node(), {
        styles: [{
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{"color": "#333739"}]
        }, {
            "featureType": "landscape",
            "elementType": "geometry",
            "stylers": [{"color": "var(--accent)"}]
        }, {"featureType": "poi", "stylers": [{"color": "#f44627"}, {"lightness": -7}]}, {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [{"color": "#f44627"}, {"lightness": -28}]
        }, {
            "featureType": "road.arterial",
            "elementType": "geometry",
            "stylers": [{"color": "#f44627"}, {"visibility": "on"}, {"lightness": -15}]
        }, {
            "featureType": "road.local",
            "elementType": "geometry",
            "stylers": [{"color": "#f44627"}, {"lightness": -18}]
        }, {"elementType": "labels.text.fill", "stylers": [{"color": "#ffffff"}]}, {
            "elementType": "labels.text.stroke",
            "stylers": [{"visibility": "off"}]
        }, {
            "featureType": "transit",
            "elementType": "geometry",
            "stylers": [{"color": "#f44627"}, {"lightness": -34}]
        }, {
            "featureType": "administrative",
            "elementType": "geometry",
            "stylers": [{"visibility": "on"}, {"color": "#333739"}, {"weight": 0.8}]
        }, {"featureType": "poi.park", "stylers": [{"color": "#f44627"}]}, {
            "featureType": "road",
            "elementType": "geometry.stroke",
            "stylers": [{"color": "#333739"}, {"weight": 0.3}, {"lightness": 10}]
        }],
        mapTypeId: google.maps.MapTypeId.TERRAIN
    });

    d3.selection.prototype.moveToFront = function () {
        return this.each(function () {
            this.parentNode.appendChild(this);
        });
    };
    d3.selection.prototype.moveToBack = function () {
        return this.each(function () {
            var firstChild = this.parentNode.firstChild;
            if (firstChild) {
                this.parentNode.insertBefore(this, firstChild);
            }
        });
    };

// Load the station data. When the data comes back, create an overlay.
    d3.json(jsonpath, function (data) {
        // fit the map to the boundaries of all available data points and
        // ONCE generate google LatLng objects to be re-used repeatedly

        d3.entries(data).sort(function (d) {
            return d3.descending(d.value.lng);
        });

        var bounds = new google.maps.LatLngBounds();
        d3.entries(data).forEach(function (d) {
            bounds.extend(d.value.lat_lng = new google.maps.LatLng(d.value.lat, d.value.lng));
        });
        map.fitBounds(bounds);

        var overlay = new google.maps.OverlayView(),
            r = 30,
            m = 6,
            padding = r * m;
        // Add the container when the overlay is added to the map.
        overlay.onAdd = function () {
            var layer = d3.select(this.getPanes().overlayMouseTarget)
                .append("svg")
                .attr('class', 'stations');
            overlay.draw = function () {
                var projection = this.getProjection(),
                    sw = projection.fromLatLngToDivPixel(bounds.getSouthWest()),
                    ne = projection.fromLatLngToDivPixel(bounds.getNorthEast());
                // extend the boundaries so that markers on the edge aren't cut in half
                sw.x -= padding;
                sw.y += padding;
                ne.x += padding;
                ne.y -= padding;

                d3.select('.stations')
                    .attr('width', (ne.x - sw.x) + 'px')
                    .attr('height', (sw.y - ne.y) + 'px')
                    .style('position', 'absolute')
                    .style('left', sw.x + 'px')
                    .style('top', ne.y + 'px');

                var marker = layer.selectAll('.marker')
                    .data(d3.entries(data))
                    .each(transform)
                    .each(transformc);


                var image = marker.enter().append('svg:image')
                    .attr('class', 'marker')
                    .attr("xlink:href", function (d) {
                        return d.value.img;
                    })
                    .attr("height", r)
                    .attr("width", r)
                    .attr("style", "outline: thin solid white;")

                    .attr("preserveAspectRatio", "xMidYMid slice")
                    .attr("clip-path", function (d) {
                        return "url(#" + d.key + "_clip)";
                    }) // clip the image
                    .on("mouseover", function (d) {
                        d3.select(this)
                        //.moveToFront()
                            .transition()
                            .attr("height", r * m)
                            .attr("width", r * m)

                        //dd = projection.fromLatLngToDivPixel(d.value.lat_lng)
                        //.attr('x',dd.x - sw.x - (r * m / 2))
                        //.attr('y',dd.y - ne.y - (r * m / 2))
                        //.attr('x',function(d) {
                        //dd = projection.fromLatLngToDivPixel(d.value.lat_lng);
                        //return dd.x - sw.x - (r * m / 2);
                        //})
                        //.attr('y',function(d) {
                        //dd = projection.fromLatLngToDivPixel(d.value.lat_lng);
                        //return dd.y - ne.y - (r * m / 2);
                        //})
                    })
                    .on("mouseout", function (d) {
                        d3.select(this)
                            .transition()
                            .attr("height", r)
                            .attr("width", r)
                        //dd = projection.fromLatLngToDivPixel(d.value.lat_lng)
                        //.attr('x',dd.x - sw.x - (r / 2))
                        //.attr('y',dd.y - ne.y - (r / 2))
                        //.attr('x',function(d) {
                        //dd = projection.fromLatLngToDivPixel(d.value.lat_lng);
                        //return dd.x - sw.x - (r / 2);
                        //})
                        //.attr('y',function(d) {
                        //dd = projection.fromLatLngToDivPixel(d.value.lat_lng);
                        //return dd.y - ne.y - (r / 2);
                        //})
                    })
                    .on('click', function (d) {
                        d3.select(this)
                        //console.log('Clicked: ' + d.key)

                        //console.log('.' + d.value.albumid)
                        // Update Sliders
                        $('#slider').slick('slickUnfilter')
                        $('#big-image').slick('slickUnfilter')
                        $('#slider').slick('slickFilter', '.' + d.value.albumid)
                        $('#big-image').slick('slickFilter', '.' + d.value.albumid)
                        //console.log('Slider Filtered!')


                        // Update Text
                        album_text.textContent = d.key
                        album_title.textContent = d.key
                        //console.log('Text Updated!')
                        ;
                    })
                    .attr('x', function (d) {
                        d = projection.fromLatLngToDivPixel(d.value.lat_lng);
                        return d.x - sw.x - (r / 2);
                    })
                    .attr('y', function (d) {
                        d = projection.fromLatLngToDivPixel(d.value.lat_lng);
                        return d.y - ne.y - (r / 2);
                    });

                function transform(d) {
                    d = projection.fromLatLngToDivPixel(d.value.lat_lng);
                    return d3.select(this)
                        .attr('x', d.x - sw.x)
                        .attr('y', d.y - ne.y);
                }

                function transformc(d) {
                    d = projection.fromLatLngToDivPixel(d.value.lat_lng);
                    return d3.select(this)
                        .attr('cx', d.x - sw.x)
                        .attr('cy', d.y - ne.y);
                }
            };
        };

        // Bind our overlay to the map…
        overlay.setMap(map);
    });
};
