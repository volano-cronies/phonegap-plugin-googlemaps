function createStubs() {

    var $ = window.top.jQuery;
    var mapInit = null;
    var google = null;
    var map = null;
    var mapView = null;
    var directionsMapView = null;
    directionsService = null;
    directionsDisplay = null;
    directionsMap = null;
    var markers = [];
    var markersId = [];
    var infoWindows = [];
    var lastBound = null;
    
    /* Bug #10131 */
    var curCenter = null;

    //function initOpenMapForDirections(params) {
    //
    //    $('#directions-map-canvas').remove();
    //
    //    wrapBackButton();
    //
    //    var viewMapTemplate = [
    //            "<section id=\"directions-map-canvas\" style=\"display:none; width:100%; height:100%; position: absolute;\">",
    //            "</section>" ].join("\n");
    //
    //    var viewMap = $(viewMapTemplate);
    //    $('#overlay-views').append(viewMap);
    //    return viewMap;
    //}

    //function wrapBackButton() {/* Creates fake 'back' button and hides the original one */
    //    $('#platform-events-fire-back').css("display", "none");
    //    $('#platform-events-fire-suspend')
    //            .before(
    //                    "<button id=\"platform-events-fire-back-map\" class=\"ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only\"><span class=\"ui-button-text\">Back</span></button>");
    //    $('#platform-events-fire-back-map').css("width", "90px");
    //}

    function initMapDiv() {

        $('#map-canvas').remove();

        var viewMapTemplate = [
                "<section id=\"map-window\" style=\"z-index:0;display:none; width:100%; height:100%; position: absolute;\">",
                //"<div id=\"map-canvas\">",
                "<div id=\"map-canvas\" style=\"position: absolute; width: 100%; height: 100%;\">", "</div>",
                //"</div>",
                "</section>"].join("\n");

        var viewMap = $(viewMapTemplate);
        $('#overlay-views').append(viewMap);
        $('#overlay-views').parent().css("z-index", 1);
        return viewMap;
    }

    function setDimension(dim) {
        if (dim && mapView) {
            mapView.width(dim.width).height(dim.height).css("top", dim.top).css("left", dim.left);
            google.maps.event.trigger(map, 'resize');

            setTimeout(function() {
                if (lastBound) {
                    !lastBound.equals(map.getBounds()) && map.fitBounds(lastBound);
                } else {
                    /* Bug #10131 */
                    map.setCenter(curCenter);
                }
            }, 150);
        }
    }

    function generateUUID() {
        var d = new Date().getTime();
        var uuid = 'xxxyxxyxxxyxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }
    ;

    function fitBounds(targets) {
        var bound = new google.maps.LatLngBounds();
        targets.forEach(function(pos) {
            bound.extend(new google.maps.LatLng(pos.lat, pos.lng));
        });
        lastBound = bound;
        setTimeout(function() {
            map.fitBounds(bound);
            setTimeout(function() {
                lastBound = null;
            }, 1500);
        }, 150);
    }

    function loadScript() {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp' + '&callback=gmapinitialize';
        $('body').append(script);
    }

    function onMarkerEvent(eventName, id) {
        plugin.google.maps.Map._onMarkerEvent(eventName, id);
    }

    var Map = {
        "moveCamera": function(options) {
            map.setZoom(options.zoom);
            if (options.target) {
                if (options.target.length) {
                    fitBounds(options.target)
                } else {
                    /* Bug #10131 */
                    curCenter = options.target;
                    map.setCenter(curCenter);
                }
            }
        },
        "getCameraPosition" : function() {
            return {
                "zoom": map.getZoom(),
                "tilt": map.getTilt()
        };
} 
    };

    var Marker = {
        "createMarker": function(options) {
            var uuid = generateUUID();
            var newOptions = {
                "title": options.title,
                "position": new google.maps.LatLng(options.position.lat, options.position.lng)
            }
            var marker = new google.maps.Marker(newOptions);

            var contentString = $("<div style=\"cursor: pointer\"><strong>" + (options.title || "") + "</strong></div>");
            if (options.snippet) {
                contentString.append($("<p>" + options.snippet + "</p>)"));
            }

            var infoWindow = new google.maps.InfoWindow({
                content: contentString[0]
            });
            google.maps.event.addListener(marker, 'click', function() {
                infoWindow.open(map, marker);
                onMarkerEvent(plugin.google.maps.event.MARKER_CLICK, uuid)
            });

            google.maps.event.addDomListener(contentString[0], "click", function(event) {
                onMarkerEvent(plugin.google.maps.event.INFO_CLICK, uuid);
                infoWindow.close();
            });

            marker.setMap(map);
            markers.push(marker);
            markersId.push(uuid);
            infoWindows.push(infoWindow);
            return {
                "id": uuid
            };
        },
        "remove": function(id) {
            var index = markersId.indexOf(id);
            if (index >= 0) {
                var marker = markers[index];
                marker.setMap(null);
                var infoWindow = infoWindows[index];
                infoWindow.setMap(null);
                infoWindow.close();
                markers.splice(index, 1);
                markersId.splice(index, 1);
                infoWindows.splice(index, 1);
            }
        },
        "setTitle": function(id, title) {
            if (markersId.indexOf(id) >= 0) {
                var marker = markers[markersId.indexOf(id)];
                var infoWindow = infoWindows[markersId.indexOf(id)];
                marker.setTitle(title);
                $("strong", infoWindow.getContent()).text(title);
            }
        },
        "setSnippet": function(id, snippet) {
            if (markersId.indexOf(id) >= 0) {
                var infoWindow = infoWindows[markersId.indexOf(id)];
                if ($("p", infoWindow.getContent()).length) {
                    if (snipppet) {
                        $("p", infoWindow.getContent()).text(snippet);
                    } else {
                        $("p", infoWindow.getContent()).remove();
                    }
                } else {
                    $(infoWindow.getContent()).append($("<p>" + snippet + "</p>)"));
                }
            }
        },
        "getPosition": function(id) {
            if (markersId.indexOf(id) >= 0) {
                var marker = markers[markersId.indexOf(id)];
                var pos = marker.getPosition();
                return {
                    "lat": pos.lat(),
                    "lng": pos.lng()
                };
            }
        },
        "setPosition": function(id, lat, lng) {
            var index = markersId.indexOf(id);
            if (index >= 0) {
                var marker = markers[index];
                var infoWindow = infoWindows[index];
                var pos = new google.maps.LatLng(lat, lng);
                marker.setPosition(pos);
                infoWindow.setPosition(pos);
            }
        }

    }

    window.top["gmapinitialize"] = function() {
        mapInit["mapinitialized"] = true;
        mapInit["resolve"]();
        google = window.top.google;
    };

    mapInit = {
        mapinitialized: false
    };
    mapInit["mappromise"] = new Promise(function(resolve) {
        mapInit["resolve"] = resolve;
    });

    setTimeout(loadScript, 400);

    return {
        CordovaGoogleMaps: {
            isAvailable: function() {
                return mapInit["mapinitialized"];
            },
            getMap: function(options) {

                if (!map) {
                    mapInit["mappromise"].then(function() {
                        mapView = initMapDiv();
                        map = new google.maps.Map(mapView[0], options);
                        mapView.mouseleave(function(e) {
                            window.frameElement.style.pointerEvents = "";
                        });
                    });
                } else {
                    map.setOptions(options);
                }
            },
            setVisible: function(isVisible) {
                if (isVisible) {
                    mapView.show();
                    mapView[0].style.background = "transparent";
                } else {
                    mapView.hide();
                    window.frameElement.style.background = "";
                    window.frameElement.style.pointerEvents = "";
                }
            },
            resizeMap: function(dim) {
                setDimension(dim);
            },
            setDiv: function(dim) {
                setDimension(dim);
                var elements = window.document.elementsFromPoint(dim.left, dim.top);
                var wrMap = $(elements).find("._gmaps_cdv_").get(0);
                wrMap.addEventListener("mouseover", function(e) {
                    window.frameElement.style.pointerEvents = "none";
                });

                mapView.show();
                mapView[0].style.background = "transparent";
            },
            pluginLayer_setClickable: function(clickable) {
            // clickable
            },
            remove: function() {
                mapView.hide('slide', {
                    direction: 'left',
                    duration: 250,
                    complete: function() {
                        window.frameElement.style.pointerEvents = "";
                    }
                });
                window.frameElement.style.pointerEvents = "";
                window.frameElement.style.background = "";
                this.clear();
            },
            clear: function() {
                markers.forEach(function(marker) {
                    marker.setMap(null);
                });
                markers = [];
                markersId = [];
                infoWindows = [];
            },
            getMyLocation: function(params, success_callback, error_callback) {

                var locationPromise = new Promise(function(resolve, reject) {
                    navigator.geolocation.getCurrentPosition(function(position) {
                        var location = {};
                        location["latLng"] = {
                            "lat": position.coords.latitude,
                            "lng": position.coords.longitude
                        };
                        resolve(location);
                    }, function() {
                        reject("error");
                    });
                });

                return locationPromise.then(function(result) {
                    return result;
                }, function(e) {
                    console.log(e);
                });

            },
            exec: function() {
                var calledMethod = arguments[0];
                if (calledMethod === "Marker.createMarker") {
                    return Marker.createMarker(arguments[1]);
                } else if (calledMethod === "Marker.getPosition") {
                    return Marker.getPosition(arguments[1]);
                } else if (calledMethod === "Marker.remove") {
                    return Marker.remove(arguments[1]);
                } else if (calledMethod === "Marker.setTitle") {
                    return Marker.setTitle(arguments[1], arguments[2]);
                } else if (calledMethod === "Marker.setSnippet") {
                    return Marker.setSnippet(arguments[1], arguments[2]);
                } else if (calledMethod === "Marker.setPosition") {
                    return Marker.setPosition(arguments[1], arguments[2], arguments[3]);
                } else if (calledMethod === "Map.moveCamera") {
                    return Map.moveCamera(arguments[1], arguments[2]);
                } else if (calledMethod === "Map.getCameraPosition") {
                    return Map.getCameraPosition();
                } else {
                    throw new Error("Unknown method " + calledMethod); 
                }
            },
            pause: function(){
            	console.log("[CordovaGoogleMaps] pause");
            },
            pauseResizeTimer: function(){
            	console.log("[CordovaGoogleMaps] pauseResizeTimer");
            },
            resume: function(){
            	console.log("[CordovaGoogleMaps] resume");
            },
            resumeResizeTimer: function(){
            	console.log("[CordovaGoogleMaps] resumeResizeTimer");
            },
            putHtmlElements: function(finalDomPositions){
            	console.log("[CordovaGoogleMaps] putHtmlElements(" + finalDomPositions + ")");
            },
            backHistory: function(){
            	console.log("[CordovaGoogleMaps] backHistory");
            }
        },
        Geocoder: {
            geocode: function(address) {
                geocoder = new google.maps.Geocoder();

                var geocoderPromise = new Promise(function(resolve, reject) {
                    geocoder.geocode(address, function(results, status) {

                        if (status == google.maps.GeocoderStatus.OK) {
                            var position = [];
                            var location = results[0].geometry.location;

                            position.push({
                                position: {
                                    "lat": location.lat(),
                                    "lng": location.lng()
                                }
                            });
                            resolve(position);
                        } else {
                            reject('Geocode was not successful for the following reason: ' + status);
                        }
                    });
                })

                return geocoderPromise.then(function(position) {
                    return position;
                }, function(e) {
                    console.log(e);
                });
            }
        }
    };
};