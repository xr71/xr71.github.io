// get locations data from data.js
const poiList = data;

// API id and secret for foursquare
const fsclientid = "PD20WNTAHBJ5TXO0M5D5Z0UDNDDFG2IHR0DQ5OZ5DDUNO5TY";
const fsclientsecret = "N0TGF05SMGOU0ALYEXKVLYE2JTUAHWG513N3F4ZMQFHGB21L";


// customized map style, inspired from Snazzy Maps
// from: https://snazzymaps.com/style/38/shades-of-grey
// adding orange geometry to all transits, as my goal for after moving to 
// Charlotte is to use public transport and the airport
let mapsStyle = [
    {
        "featureType": "all",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "saturation": 36
            },
            {
                "color": "#000000"
            },
            {
                "lightness": 40
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#000000"
            },
            {
                "lightness": 16
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 20
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 17
            },
            {
                "weight": 1.2
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 20
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 21
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 17
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 29
            },
            {
                "weight": 0.2
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 18
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 16
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#e67e22"
            },
            {
                "lightness": 19
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 17
            }
        ]
    }
];


function ViewModel() {
    var self = this;
    
    // initialize in charlotte area
    var map;
    var markers = [];
    const lat = 35.2037595;
    const lng = -80.859919;
    var zm = 13;

    // // initially, flush out session storage
    // sessionStorage.clear()

    // for search query in POI list (side bar)
    self.query = ko.observable(''); 
    
    // map my model to poiArray to work with Knockout observable
    this.poiArray = ko.observableArray([]);
    poiList.forEach(d => self.poiArray.push(d));
    
    // console.log(self.poiArray());
    
    // filter inputs section
    self.filteredPOI = ko.computed(function () {
        var search = self.query().toLowerCase();
        var result = ko.observableArray([]);

        if (!search) {
            markers.forEach(i => i.setVisible(true))
            result = self.poiArray();
        }
        else {
            result = ko.utils.arrayFilter(self.poiArray(), function(item) {
                for (var i = 0; i < markers.length; i++) {
                    markers[i].setVisible(false);
                    if (markers[i].title.toLowerCase().indexOf(search) !== -1){
                        markers[i].setVisible(true);      
                    }
                } 

                return item.name.toLowerCase().indexOf(search) !== -1;
            });
        }

        

        return result;
    });

    // end filter section



    // create markers and push to observable array 
    // draw from examples in Udacity 864 Window Shopping
    var largeInfowindow = new google.maps.InfoWindow();
    
    self.markerMaker = function(poi) {
        var _marker = {};

        _marker.position = {"lat": poi.lat, "lng": poi.lng};

        _marker.title = poi.name;
        _marker.category = poi.category; 
        _marker.map = map;
        _marker.fsid = poi.fsid;
        _marker.animation = google.maps.Animation.DROP;

        gmarker = new google.maps.Marker(_marker);
        
        return gmarker;
    }

    // maps section


    map = new google.maps.Map(document.getElementById("map"), {
        center: {lat: lat, lng: lng},
        zoom: zm,
        styles: mapsStyle
    });

    self.poiArray().forEach(d => {
        var m = self.markerMaker(d);
        // console.log(m);
        markers.push(m)
        m.addListener('click', function() {
            self.populateInfoWindow(this, largeInfowindow)
        });

        
    });

    console.log(markers);

    self.setLocation = function(clickedPOI){
        // console.log(this);
        for (var i = 0; i < markers.length; i++) {
            markers[i].setVisible(false);
            if (markers[i].title == clickedPOI.name){
                markers[i].setVisible(true);
                self.populateInfoWindow(markers[i], largeInfowindow);
            }
        } 
    };


    // display one info window for the marker
    self.populateInfoWindow = function(marker, infowindow) {

        // console.log("running populate info window");

        marker.setAnimation(google.maps.Animation.BOUNCE);

        // make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
            infowindow.marker = marker;
            setTimeout(function() {
                marker.setAnimation(null);
            }, 1337);

            console.log(marker);

            // make foursquare part
            const fsurl = "https://api.foursquare.com/v2/venues/"; 
            var poiid = marker.fsid
            console.log(`${fsurl}${poiid}?client_id=${fsclientid}&client_secret=${fsclientsecret}&v=20180815`);
            
            $.ajax(
                {
                    url: `${fsurl}${poiid}?client_id=${fsclientid}&client_secret=${fsclientsecret}&v=20180815`,
                    data: {format: 'json'},
                    dataType: 'json'
                }
                ).done(function(d) {

                    venue_res = d.response.venue;
                    console.log(venue_res);
                    
                    // infowindow_html = `this is coming from inside populateInfoWindow`
                    infowindow_html = `<h3>${venue_res.name}</h3>
                                       <hr>
                                       <p>Address: ${venue_res.location.formattedAddress[0]}</p>
                                       <p>City: ${venue_res.location.formattedAddress[1]}</p> 
                                       <hr>
                                       <p>Category: ${venue_res.categories[0]["name"]}</p> 
                                       <hr>
                                       <p>Description: ${venue_res.description}</p>
                    ` 

                    infowindow.setContent(infowindow_html);

                }).fail(function() {
                    friendlyFSErr()
                });

            infowindow.setContent(`<div>
                <p>${marker.title}</p>
                <p>Description: ${marker.contentString}</p>
            </div>`);

            infowindow.open(map, marker);
            
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });

            map.setZoom(15);
            map.setCenter(marker.getPosition());
        }
    }



}



// run app 
function initMap() {
    console.log("Running initMap");
    ko.applyBindings(new ViewModel());
}
