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

    function initMapDiv() {
    	var wrMap = $($("iframe#document")[0].contentDocument).find("wr-map");
        return wrMap;
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
    	if (window.top.google === undefined){
	        var script = document.createElement('script');
	        script.type = 'text/javascript';
	        script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp' + '&callback=gmapinitialize';
	        $('body').append(script);
	    } else {
	    	log("google api already loaded");
	    }
    }

    function onMarkerEvent(eventName, id, position) {
    	var wrMap = $($("iframe#document")[0].contentDocument).find("wr-map");
    	var map = plugin.google.maps.Map.getMap(wrMap[0]);
        map._onMarkerEvent(eventName, id, position);
    }

	function log() {
        var args = [].slice.call(arguments, 0);
        args.unshift("[Google Maps]");
        console.log.apply(console, args);
    }
    
    var Map = {
        "moveCamera": function() {
        	var successCallback = arguments[0];
            var errorCallback = arguments[1];
        	var options = arguments[2][0];
        	
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
            
            successCallback();
        },
        "getCameraPosition" : function() {
            return {
                "zoom": map.getZoom(),
                "tilt": map.getTilt()
        	};
		},
        "clear": function() {
            var successCallback = arguments[0];
            var errorCallback = arguments[1];

            markers.forEach(function(marker) {
                marker.setMap(null);
            });
            markers = [];
            markersId = [];
            infoWindows = [];

            successCallback();
        },
		"resizeMap": function() {
			var successCallback = arguments[0];
			var errorCallback = arguments[1];
			
			var dim = arguments[2];
			if (dim && dim.width && dim.height)
            	setDimension(dim);
            
            successCallback();
        },
        "setDiv": function(dim) {
            var successCallback = arguments[0];
			var errorCallback = arguments[1];
			
            mapView.show();
            mapView[0].style.background = "transparent";
            
            successCallback();
        },
        "setVisible": function() {
        	var isVisible = arguments[2][0];
            if (isVisible) {
                mapView.show();
                mapView[0].style.background = "transparent";
            } else {
                mapView.hide();
                window.frameElement.style.background = "";
                window.frameElement.style.pointerEvents = "";
            }
        },
        "loadPlugin": function(){
        	var successCallback = arguments[0];
        	var errorCallback = arguments[1];
        	var params = arguments[2];
        	
        	var pluginName = params[0];
        	var pluginOptions = params[1];
        	
        	var result = {};
        	if (pluginName === "Marker"){
        		result = Marker.createMarker(pluginOptions);
        	}
        	
        	successCallback(result);
        },
        "setActiveMarkerId": function(){
        	log("setActiveMarkerId");
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
                var position = {
                	"lat": marker.position.lat(),
                	"lng": marker.position.lng()
                };
                onMarkerEvent(plugin.google.maps.event.MARKER_CLICK, uuid, position)
            });

            google.maps.event.addDomListener(contentString[0], "click", function(event) {
                onMarkerEvent(plugin.google.maps.event.INFO_CLICK, uuid, {});
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
        "setPosition": function() {
        	var successCallback = arguments[0];
        	var errorCallback = arguments[1];
        	var params = arguments[2];
        	
        	var id = params[0];
        	var lat = params[1];
        	var lng = params[2];
        	
            var index = markersId.indexOf(id);
            if (index >= 0) {
                var marker = markers[index];
                var infoWindow = infoWindows[index];
                var pos = new google.maps.LatLng(lat, lng);
                marker.setPosition(pos);
                infoWindow.setPosition(pos);
            }
        },
        "showInfoWindow": function(){
        	log("showInfoWindow");
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
                	// register the runtime map instance as new ripple service
                	var mapId = arguments[0];
                	var mapOptions = arguments[1];
					var bridge = getRippleCordovaBridge();
					bridge.add(mapId, Map);
					bridge.add(mapId + "-marker", Marker);
                    mapInit["mappromise"].then(function() {
                        mapView = initMapDiv();
                        map = new google.maps.Map(mapView[0], mapOptions);
                        mapView.mouseleave(function(e) {
                            window.frameElement.style.pointerEvents = "";
                        });
                        if (mapOptions.center === undefined){
                        	navigator.geolocation.getCurrentPosition(
                        		function(result){
                        			var center = {
                        				"lat": result.coords.latitude,
                        				"lng": result.coords.longitude
                        			};
                        			map.setCenter(center);
                        		}, 
                        		function(error){
                        			console.log(error);
                        		});
                        }
                        if (mapOptions.zoom === undefined){
                        	map.setZoom(10);
                        }
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
                    log(e);
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
            	log("pause");
            },
            pauseResizeTimer: function(){
            	log("pauseResizeTimer");
            },
            resume: function(){
            	log("resume");
            },
            resumeResizeTimer: function(){
            	log("resumeResizeTimer");
            },
            putHtmlElements: function(finalDomPositions){
            	/*
            	log("putHtmlElements(" + finalDomPositions + ")");
            	for (var key in finalDomPositions) {
				    if (finalDomPositions.hasOwnProperty(key)) {
				        var element = finalDomPositions[key];
	            		var elemId = element.size.elemId;
	            		var elem = $($("iframe#document")[0].contentDocument).find("[__plugindomid='" + elemId + "']");
	            		if (elem.length > 0 && elem[0].style != undefined){
		            		elem[0].style.setProperty("top", element.size.top);
		            		elem[0].style.setProperty("left", element.size.left);
		            		elem[0].style.setProperty("bottom", element.size.bottom);
		            		elem[0].style.setProperty("right", element.size.right);
		            		elem[0].style.setProperty("width", element.size.width + "px");
		            		elem[0].style.setProperty("height", element.size.height + "px");
		            		elem[0].style.setProperty("z-index", element.zIndex);
		            	}
				    }
				}
				*/
            },
            backHistory: function(){
            	log("backHistory");
            }
        },
        Geocoder: {
            geocode: function(address) {
                geocoder = new google.maps.Geocoder();

				delete address.idx; // otherwise google maps service complains about unknown attribute 'idx'
				
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
                	var result = {};
                	result.results = position;
                	
                    return result;
                }, function(e) {
                    log(e);
                });
            }
        }
    };
};