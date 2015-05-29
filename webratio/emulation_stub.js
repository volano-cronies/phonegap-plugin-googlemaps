function createStubs() {
    
    var $ = window.top.jQuery;
    var map = null;

    function initOpenMap(params) {
        
        var origin, destination;
        
        origin = encodeURI(params["from"]);
        destination = encodeURI(params["to"]);

        $('#wr-openMap-emulator').remove();

        /* Creates fake 'back' button and hides the original one */
        $('#platform-events-fire-back').css("display", "none");
        $('#platform-events-fire-suspend')
                .before(
                        "<button id=\"platform-events-fire-back-map\" class=\"ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only\"><span class=\"ui-button-text\">Back</span></button>");
        $('#platform-events-fire-back-map').css("width", "90px");

        var openMapTemplate = [
                "<section id=\"wr-openMap-emulator\" style=\"display:none; background: rgba(0, 0, 0, 00); position: absolute; width: 100%; height: 100%; z-index: 10000;\">",
                "<div style=\"background: #fff; height: 100%; width: 100%; overflow: hidden; \">", 
                "<iframe width=\"100%\" height=\"100%\" frameborder=\"0\" style=\"border:0\" scrolling=\"no\" src=\"https://www.google.com/maps/embed/v1/directions?key=AIzaSyAgKfPR6asBoJzEBMZc6UkPtb_By6rbn6s&origin=", origin, "&destination=", destination, "\">",
                "</iframe>", 
                "</div>", 
                "</section>" ].join("\n");

        var openMap = $(openMapTemplate);
        $('#overlay-views').append(openMap);
        return openMap;
    }
    
    return {
        GoogleMaps: {
            isAvailable: function() {}
        },
        External: {
            launchNavigation: function(params) {
                map = initOpenMap(params);
                var scanPromise = new Promise(function(resolve, reject) {

                    /* User clicks 'back' button */
                    $('#platform-events-fire-back-map').click(function(e) {

                        /* Restores original 'back' button */
                        $('#platform-events-fire-back-map').remove();
                        $('#platform-events-fire-back').css("display", "initial");

                        map.hide('slide', {
                            direction: 'left',
                            duration: 250
                        });

                        resolve();
                    });

                    map.show('slide', {
                        direction: 'right',
                        duration: 250
                    });
                })
                return scanPromise;
            }
        }
    };
};