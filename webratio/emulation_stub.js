function createStubs() {

    var $ = window.top.jQuery;
    var mapInit = null;
    var google = null;
    var map = null;
    var mapView = null;
    //var directionsMapView = null;
    //var directionsService = null;
    //var directionsDisplay = null;
    //var directionsMap = null;
    var markers = [];
    var markersId = [];
    var infoWindows = [];
    var lastBound = null;
    var clusterMarkers = [];
    var clusterMarkersId = [];
    var clusterMarkersEventListeners = {};
    var myLocationMarkerId = null;
	
    /* Bug #10131 */
    var curCenter = null;

	/**
	 * The MyLocationControl adds a control to the map that recenters the map on device current location
	 * This constructor takes the control DIV as an argument.
	 * @constructor
	 */
	function MyLocationControl(controlDiv, map) {
		
		// control border.
		var controlUI = document.createElement('div');
		controlDiv.style.padding = '0px 10px 0px 0px';
		controlDiv.appendChild(controlUI);
		
		//  control interior.
		var controlButton = document.createElement('button');
		controlButton.draggable = false;
		controlButton.title = 'My location';
		controlButton.type = 'button';
		controlButton.style.background = 'none'; 
		controlButton.style.display = 'block'; 
		controlButton.style.border = '0px'; 
		controlButton.style.margin = '0px'; 
		controlButton.style.padding = '0px'; 
		controlButton.style.position = 'relative'; 
		controlButton.style.cursor = 'pointer'; 
		controlButton.style.width = '28px'; 
		controlButton.style.height = '27px'; 
		controlButton.style.top = '0px'; 
		controlButton.style.left = '0px';
		controlUI.appendChild(controlButton);
		
		// button image
		var controlImage = document.createElement('img');
		controlImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAAdCAYAAABWk2cPAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4gUKCh8KEB0dawAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAC3klEQVRIx+2WMUhjWRSGv/d8xMSs2ShKQCvTaLGkfo1phFRWgr2FCBKIkMbGUgi2gWhjIykFm7XKahEeDGm2W0hsAoEYJsXgy2bju3nJy9liNtkZcDbJoG4zf3k59/wczv//92q3pU+y+cvPhIIzvDX+7HhYf7TQWu2ehH4yeC+0/uqhiYjwztD5H/CDdCyUUiil3p5UROj3+wDk83ny+TwA/X6fafRoTEOoaRqG8flKp9P5t8k/Z8OacZjIMsNmjuNQKBQolUo0m00AIpEIpmmSSCQIBAITEY8lHTZpNBpcXFzQbDbZ3NxkY2MDgEqlgmVZRCIRDg8PWVlZGUs80aSdTofT01MCgQCpVIpwOMzj4yMAq6ur2LZNNpvFcRxOTk4IBoPfP2m/32dmZoabmxsKhQJnZ2copbi8vKRarQIQjUbZ39/H7/dzfHxMIpFgZ2cHz/NGu55KvYZhoGkalmURj8cJh8Pkcjnq9fqopl6vk8vlCIfDxONxLMv6SnBTqbfb7XJ1dYVSilarRSwWo1ar0Wg0EJGRRVzXpdFoUKvViMVi3N3dkc1m8fv97O3t4fP5pvfpYDAYicLzvBf9KCJ4nvd5X5o21rPfnHR2dpaDgwMAUqkUlUqF3d1dFhcXabfbuK47WkEoFCIajXJ9fU0wGOTo6Oj7E6nX6yEimKZJsVjEcRySySTLy8vouo6u6ywtLZFMJnEch2KxiGmaiAi9Xu8/ffhNDAYDERGxbVvS6bRkMhlRSomISLlclnK5LCIiSinJZDKSTqfFtu2v7r6EicOhWq1yfn6O67psbW2xvr4OwMPDA/f39/h8PpLJJGtra68TDsMmT09P3N7eUiqVeH5+BmBubg7TNNne3mZhYeF1YvBLFeu6PgqNbDY7EtnQk1/WvMoro+v6yJ+GYTA/Pz9S79BWkxBONelL4TG01rT48Rt8W1Lleu9KaLe76L9+qGO3u+9G+NvvH/kbcivTqDjxm1kAAAAASUVORK5CYII=';
		controlImage.draggable = false; 
		controlImage.style.position = 'absolute'; 
		controlImage.style.left = '0px'; 
		controlImage.style.top = '0px'; 
		controlImage.style.border = '0px'; 
		controlImage.style.padding = '0px'; 
		controlImage.style.margin = '0px'; 
		controlButton.appendChild(controlImage);
		
		// Setup the click event listeners
		controlUI.addEventListener('click', function() {
			if (navigator.geolocation) { 
				navigator.geolocation.getCurrentPosition(function(pos) {
					var me = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
					map.setCenter(me);
					map.setZoom(14);
				}, function(error) {
				
				});
			}
		});
		
	}
	
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
	        script.src = 'https://maps.googleapis.com/maps/api/js?v=3.31' + '&callback=gmapinitialize';
	        $('body').append(script);
	    } else {
	    	log("google api already loaded");
	    }
    }

    function onMarkerEvent(eventName, id, position) {
    	var wrMap = $($("iframe#document")[0].contentDocument).find("wr-map");
    	var map = plugin.google.maps.Map.getMap(wrMap[0]);
        var mapElement = $( map.getDiv() );
		var mapId = mapElement[0].getAttribute("__pluginmapid");
		if(window.cordova){
			var params = [
				id, new plugin.google.maps.LatLng(position.lat, position.lng)
			];
			cordova.fireDocumentEvent(mapId, {evtName: eventName, callback:'_onMarkerEvent', args:params});
		}
    }

	function log() {
        //var args = [].slice.call(arguments, 0);
        //args.unshift("[Google Maps]");
        //console.log.apply(console, args);
    }
    
    var Map = {
		"animateCamera": function() {
			var successCallback = arguments[0];
            var errorCallback = arguments[1];
        	var options = arguments[2][0];
        	
            if (options.target) {
                if (options.target.length) {
                    fitBounds(options.target)
                } else {
                    /* Bug #10131 */
                    curCenter = options.target;
                    map.setCenter(curCenter);
                }
            }
			Map.cameraEventCallback();
            successCallback();
		},
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
			Map.cameraEventCallback();
            successCallback();
        },
        "getCameraPosition" : function() {
            return {
                "zoom": map.getZoom(),
                "tilt": map.getTilt()
        	};
		},
		"setCameraZoom": function(){
			var successCallback = arguments[0];
            var errorCallback = arguments[1];
			var zoom = arguments[2][0];
			
			map.setZoom(zoom);
			
			Map.cameraEventCallback();
            successCallback();
		},
        "clear": function() {
            var successCallback = arguments[0];
            var errorCallback = arguments[1];
			var params = arguments[2];
			
			var fullClean = false;
			if (typeof params === 'boolean'){
				fullClean = params;
			}
			// take care of myLocation marker, if any
			var survivorMarkers = [];
			var survivorMarkersId = [];
			var survivorInfoWindows = [];
			for (var index = 0; index < markers.length; ++index){
				var marker = markers[index];
				var markerId = markersId[index];
				var infoWindow = infoWindows[index];
				if (!fullClean && markerId === myLocationMarkerId){
					survivorMarkers.push(marker);
					survivorMarkersId.push(markerId);
					survivorInfoWindows.push(infoWindow);
					continue;
				}
				marker.setMap(null);
			}
            clusterMarkers.forEach(function(clusterMarker) {
                clusterMarker.setMap(null);
            });
            markers = survivorMarkers;
            markersId = survivorMarkersId;
            infoWindows = survivorInfoWindows;
			clusterMarkers = [];
			clusterMarkersId = [];
			
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
        	var successCallback = arguments[0];
			var errorCallback = arguments[1];
			
        	var isVisible = arguments[2][0];
            if (isVisible) {
                mapView.show();
                mapView[0].style.background = "transparent";
            } else {
                mapView.hide();
                window.frameElement.style.background = "";
                window.frameElement.style.pointerEvents = "";
            }
            
            successCallback();
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
        	} else if (pluginName === "MarkerCluster"){
				result = MarkerCluster.createMarkerCluster(pluginOptions);
			}
        	
        	successCallback(result);
        },
        "setActiveMarkerId": function(){
			var successCallback = arguments[0];
			var errorCallback = arguments[1];
			var markerId = arguments[2][0];
			
        	log("setActiveMarkerId = " + markerId);
			
			successCallback();
        },
        "fromLatLngToPoint": function(){
        	var successCallback = arguments[0];
        	var errorCallback = arguments[1];
        	var lat = arguments[2][0];
        	var lng = arguments[2][1];
        	
        	log("fromLatLngToPoint - " + lat + ", " + lng);
        	
        	successCallback([0, 0]);
        },
		"setOptions": function(){
			log("setOptions");
		},
		"cameraEventCallback": function() {
			var params = {
				"bearing": map.getHeading(),
                "zoom": map.getZoom(),
                "tilt": map.getTilt(),
				"target": {
					"lat": map.getCenter().lat(),
					"lng": map.getCenter().lng()
				},
				"northeast": {
					"lat": map.getBounds().getNorthEast().lat(),
					"lng": map.getBounds().getNorthEast().lng()
				},
				"southwest": {
					"lat": map.getBounds().getSouthWest().lat(),
					"lng": map.getBounds().getSouthWest().lng()
				},
				"nearLeft": {
					"lat": map.getBounds().getSouthWest().lat(),
					"lng": map.getBounds().getSouthWest().lng()
				},
				"nearRight": {
					"lat": map.getBounds().getNorthEast().lat(),
					"lng": map.getBounds().getNorthEast().lng()
				},
				"farLeft": {
					"lat": map.getBounds().getSouthWest().lat(),
					"lng": map.getBounds().getSouthWest().lng()
				},
				"farRight": {
					"lat": map.getBounds().getNorthEast().lat(),
					"lng": map.getBounds().getNorthEast().lng()
				}
			};
			
			var projection = map.getProjection();
			var mapElement = $( map.getDiv() );
			var mapId = mapElement[0].getAttribute("__pluginmapid");
			if(window.cordova){
				cordova.fireDocumentEvent(mapId, {evtName:'camera_move_end', callback:'_onCameraEvent', args: [params]});
			}
		}
    };

    var Marker = {
        "createMarker": function(options) {
            var uuid = options.id || generateUUID();
            var newOptions = {
                "title": options.title,
                "position": new google.maps.LatLng(options.position.lat, options.position.lng),
				"icon": options.icon
            }
            var marker = new google.maps.Marker(newOptions);

            var contentString = $("<div style=\"cursor: pointer\"><strong>" + (options.title || "") + "</strong></div>");
			if (options.html){
				contentString.append($(options.html));
			} else if (options.snippet) {
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
                var position = {
                	"lat": marker.position.lat(),
                	"lng": marker.position.lng()
                };
				onMarkerEvent(plugin.google.maps.event.INFO_CLICK, uuid, position);
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
        "remove": function() {
        	var successCallback = arguments[0];
        	var errorCallback = arguments[1];
        	var id = arguments[2][0];
        	
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
            
            successCallback();
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
            
            successCallback();
        },
        "showInfoWindow": function(){
        	var successCallback = arguments[0];
        	var errorCallback = arguments[1];
        	var id = arguments[2][0];
        	
        	log("showInfoWindow " + id);
        	
        	successCallback();
        },
		"hideInfoWindow": function(){
			var successCallback = arguments[0];
			var errorCallback = arguments[1];
			var id = arguments[2][0];
			
			log("hideInfoWindow " + id);
			
			var index = markersId.indexOf(id);
			if (index >= 0) {
				var infoWindow = infoWindows[index];
				if (infoWindow){
					infoWindow.close();
				}
			}
			
			successCallback();
		},
        "setIcon": function(){
        	var successCallback = arguments[0];
        	var errorCallback = arguments[1];
        	var id = arguments[2][0];
        	var newIconUrl = arguments[2][1];
        	
        	log("setIcon - " + id + ", " + newIconUrl);
        	
        	var index = markersId.indexOf(id);
            if (index >= 0) {
                var marker = markers[index];
                marker.setIcon(newIconUrl);
            }
                
        	successCallback();
        }
    };

	var MarkerCluster = {
		"createMarkerCluster": function(options) {
			var uuid = generateUUID();
			var id = "markercluster_" + uuid;
			var positionList = options.positionList;
			var geocellList = [];
			for (var i = 0; i < positionList.length; i++) {
				position = positionList[i];
				geocellList.push(MarkerCluster.getGeocell(position.lat, position.lng, 12));
			}
			
			var zoomChangedHandler = google.maps.event.addListener(map, 'zoom_changed', function() {
				Map.cameraEventCallback();
			});
			var boundsChangedHandler = google.maps.event.addListener(map, 'bounds_changed', function() {
				Map.cameraEventCallback();
			});
			
			clusterMarkersEventListeners = {
				"id": id,
				"zoom_changed": zoomChangedHandler,
				"bounds_changed": boundsChangedHandler
			}; 
			
			return {
				"geocellList": geocellList,
				"hashCode": uuid,
				"id": id
			};
		},
		"getGeocell": function(lat, lng, resolution) {
			var GEOCELL_GRID_SIZE = 4;
			var GEOCELL_ALPHABET = "0123456789abcdef";

			var cell = "";
			var north = 90.0;
			var south = -90.0;
			var east = 180.0;
			var west = -180.0;
			var subcell_lng_span, subcell_lat_span;
			var x, y;
			while(cell.length < resolution + 1) {
			  subcell_lng_span = (east - west) / GEOCELL_GRID_SIZE;
			  subcell_lat_span = (north - south) / GEOCELL_GRID_SIZE;

			  x = Math.min(Math.floor(GEOCELL_GRID_SIZE * (lng - west) / (east - west)), GEOCELL_GRID_SIZE - 1);
			  y = Math.min(Math.floor(GEOCELL_GRID_SIZE * (lat - south) / (north - south)), GEOCELL_GRID_SIZE - 1);
			  cell = cell.concat(GEOCELL_ALPHABET.charAt((y & 2) << 2 | (x & 2) << 1 | (y & 1) << 1 | (x & 1) << 0));

			  south += subcell_lat_span * y;
			  north = south + subcell_lat_span;

			  west += subcell_lng_span * x;
			  east = west + subcell_lng_span;
			}
			return cell;
		},
		"remove": function(){
			var successCallback = arguments[0];
        	var errorCallback = arguments[1];
			var id = arguments[2][0];
			
			log("remove markerCluster " + id);
			
			google.maps.event.removeListener(clusterMarkersEventListeners.zoom_changed);
			google.maps.event.removeListener(clusterMarkersEventListeners.bounds_changed);
			
			clusterMarkersEventListeners = {};
			
			successCallback();
		},
		"redrawClusters": function() {
			var successCallback = arguments[0];
        	var errorCallback = arguments[1];
			var params = arguments[2];
			
			var mapMarkerClusterId = params[0];
			var addOrUpdateMarkerClusters = params[1].new_or_update;
			var deleteMarkerClusters = params[1].delete;
			
			log("redraw map cluster " + mapMarkerClusterId);
			
			for (var i = 0; i < addOrUpdateMarkerClusters.length; ++i){
				if (addOrUpdateMarkerClusters[i].isClusterIcon){
					MarkerCluster.addOrUpdateCluster(addOrUpdateMarkerClusters[i]);
				} else {
					Marker.createMarker(addOrUpdateMarkerClusters[i]);
				}
			}
			
			for (var i = 0; i < deleteMarkerClusters.length; ++i){
				var id = deleteMarkerClusters[i];
	        	if (clusterMarkersId.indexOf(id) >= 0) {
					MarkerCluster.deleteCluster(id);
				} else if (markersId.indexOf(id) >= 0) {
					Marker.remove(function() {}, function() {}, [id]);
				}
			}
			
			successCallback();
		},
		"addOrUpdateCluster": function(options) {
			var id = options.id;
			if (clusterMarkersId.indexOf(id) >= 0) {
			
				log("update cluster marker " + id);
				
                var clusterMarker = clusterMarkers[clusterMarkersId.indexOf(id)];
                
                clusterMarker.setPoistion(new google.maps.LatLng(options.position.lat, options.position.lng));
                clusterMarker.setLabel(options.count.toString());
                clusterMarker.setIcon(options.icon.url);
            } else {
            
            	log("add new cluster marker " + id);
            
	            var newOptions = {
	                "label": options.count.toString(),
	                "position": new google.maps.LatLng(options.position.lat, options.position.lng),
	                "icon": options.icon.url
	            }
	            var clusterMarker = new google.maps.Marker(newOptions);
	
	            google.maps.event.addListener(clusterMarker, 'click', function() {
	                log("cluster marker click " + id);
	                if(window.cordova){
	                	var marker = arguments[0];
	                    var mapElement = $( map.getDiv() );
						var mapId = mapElement[0].getAttribute("__pluginmapid");
	                	var clusterId = clusterMarkersEventListeners.id;
	                	
	                	var params = [
	                		clusterId, id, 
	                		new plugin.google.maps.LatLng(marker.latLng.lat(), marker.latLng.lng())
	                	];
	                	cordova.fireDocumentEvent(mapId, {evtName: 'cluster_click', callback:'_onClusterEvent', args:params});
					}
	            });
	
	            clusterMarker.setMap(map);
	            clusterMarkers.push(clusterMarker);
	            clusterMarkersId.push(id);
			}
        },
        "deleteCluster": function(id){
        	var index = clusterMarkersId.indexOf(id);
        	if (index >= 0) {
        		log("delete cluster marker " + id);
        		var clusterMarker = clusterMarkers[index];
                clusterMarker.setMap(null);
                clusterMarkers.splice(index, 1);
                clusterMarkersId.splice(index, 1);
                
                google.maps.event.clearListeners(clusterMarker, 'click');
        	}
        }
	};
	
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

	window.top["gmaps"] = {};
	
    setTimeout(loadScript, 400);

    return {
        CordovaGoogleMaps: {
            isAvailable: function() {
                return mapInit["mapinitialized"];
            },
            getMap: function(options) {
				var mapId = arguments[0];
				map = window.top["gmaps"][mapId];
				if (!map) {
                	// register the runtime map instance as new ripple service
                	var mapOptions = arguments[1];
					
					// WR 12922
					mapOptions.fullscreenControl = false;
					// END WR
					
					// WR 12925
					if (mapOptions.controls && mapOptions.controls.zoom){
						mapOptions.zoomControl = mapOptions.controls.zoom;
					} else {
						mapOptions.zoomControl = false;
					}
					// WR END
					
					var bridge = getRippleCordovaBridge();
					bridge.add(mapId, Map);
					bridge.add(mapId + "-marker", Marker);
					bridge.add(mapId + "-markercluster", MarkerCluster);
                    mapInit["mappromise"].then(function() {
                        mapView = initMapDiv();
                        map = new google.maps.Map(mapView[0], mapOptions);
						
						// WR #12918
						if (mapOptions.controls && mapOptions.controls.myLocation){
							// Creates the DIV to hold the myLocation control and call the MyLocationControl()
							// constructor passing in this DIV.
							var myLocationControlDiv = document.createElement('div');
							var myLocationControl = new MyLocationControl(myLocationControlDiv, map);
							
							myLocationControlDiv.index = 1;
							map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(myLocationControlDiv);
						}
						// WR END
						
                        mapView.mouseleave(function(e) {
                            window.frameElement.style.pointerEvents = "";
                        });
						navigator.geolocation.getCurrentPosition(
							function(result){
								var center = {
									"lat": result.coords.latitude,
									"lng": result.coords.longitude
								};
								if (mapOptions.center === undefined){
									map.setCenter(center);
								}
								if (mapOptions.controls.myLocation){
									if (myLocationMarkerId){
										// there is already a my-location maker, so reset it
										Map.clear(() => {}, () => {}, true);
										myLocationMarkerId = null;
									}
									var myLocationMarkerInfo = Marker.createMarker({
										position: center,
										draggable: false,
										icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAfCAYAAACGVs+MAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4gQSDDQgEZYDpgAAAbVJREFUSMftlr2KFFEUhL+69qzKMGbCJhqIoKAbaWKyCkY+gWBoZmBktys+gD9Mm/sEghgKspkgBquZILhGBoKYusiCy8wpg54ZNRn6Z8y64AYNh1tF3VPnNPTo0aMtSi//rgk1qn5iuKM5mQBhZ0AAQZHi/wkYBxQJSh8j1x6lL2JfBU4i7RDxHGkd+EamCRNX9SsUcJikNcL3gNvAqLpB4IX9r4BH2O+4e+igzrWpgVtHMO+R7iONkCryuYjqXEN6Q0pXFq51dqA0RAyQdpFO1ZJqg3SJXDvdHBgH5IKUbtYmnzsCL1fXhOP4iTRskbJb2E+XNWOqQX4WGLYKub2JNOjahOcXzdY45BoB7tID6jgvp0yn0/YCimTgbUtyY/9gK3O3JyjSd+BLqzEvveiWgmrmHwU2sbcb9YL9kSJtrCaGDw/EYPAauFzL+krAOWAXyeTqFEPIMrCvYz+bXb7sXb8ScYYifSJiKXl9Bx5PYCuD0qexN5BK7BNI2awigD1gm1w3/tmeK5qEMBTsw2z/X0D6DKzPyPeB48AHIHC9Vdwcf2+30n/EP/gFpdf638QePdrgNz4PlmSM8oVDAAAAAElFTkSuQmCC'
									});
									myLocationMarkerId = myLocationMarkerInfo.id;
								}
							}, 
							function(error){
								console.log(error);
							});
                        
                        if (mapOptions.zoom === undefined){
                        	map.setZoom(10);
                        }
                        window.top["gmaps"][mapId] = map;
                    });
                } else {
                    map.setOptions(options);
                }
            },
            removeMap: function() {
            	var mapId = arguments[0];
            	delete window.top["gmaps"][mapId];
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
        },
		PluginEnvironment: {
			isAvailable: function(){
				log("isAvailable");
			}
		}
    };
};