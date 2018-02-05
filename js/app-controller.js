// initialize all marker location on the map and define Map variable
var  map,i;
// Multiple Locations And Markers
var locations_map = [

    {
        name: 'Canada',
        location: {
            lat: 56.130366,
            lng: -106.346771
        }
    },
    {
        name: 'Anguilla',
        location: {
            lat: 18.220554,
            lng: -63.068615
        }
    },
    {
        name: 'Japan ',
        location: {
            lat: 36.204824,
            lng: 138.252924
        }
    },
    {
        name: 'United States',
        location: {
            lat: 36.778259,
            lng: -119.417931
        }
    },
    {
        name: 'Egypt',
        location: {
            lat: 30.047503,
            lng: 31.233702
        }
    },
    {
        name: 'Portugal',
        location: {
            lat: 38.736946,
            lng: -9.142685
        }
    },
    {
        name: 'Spain',
        location: {
            lat: 40.416775,
            lng: -3.703790
        }
    },
    {
        name: 'India',
        location: {
            lat: 21.7679,
            lng: 78.8718
        }
    },

];
// initialize map styles include color
var styles = [
    {
        featureType: 'water',
        stylers: [
            { color: '#19a0d8' }
        ]
    },{
        featureType: 'administrative',
        elementType: 'labels.text.stroke',
        stylers: [
            { color: '#ffffff' },
            { weight: 6 }
        ]
    },{
        featureType: 'administrative',
        elementType: 'labels.text.fill',
        stylers: [
            { color: '#e85113' }
        ]
    },{
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [
            { color: '#efe9e4' },
            { lightness: -40 }
        ]
    },{
        featureType: 'transit.station',
        stylers: [
            { weight: 9 },
            { hue: '#e85113' }
        ]
    },{
        featureType: 'road.highway',
        elementType: 'labels.icon',
        stylers: [
            { visibility: 'off' }
        ]
    },{
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [
            { lightness: 100 }
        ]
    },{
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [
            { lightness: -100 }
        ]
    },{
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [
            { visibility: 'on' },
            { color: '#f0e4d3' }
        ]
    },{
        featureType: 'road.highway',
        elementType: 'geometry.fill',
        stylers: [
            { color: '#efe9e4' },
            { lightness: -25 }
        ]
    }
];

// method that set important data in each marker
var Location = function(data) {
    this.name = data.name;
    this.location = data.location;
};
// view Model map javaScript that defines the data and behavior of your User Interface
function ViewModelMap() {
    var self = this;
    this.MarkerList = ko.observableArray([]);
    this.filter = ko.observable();
    this.currentLocation = ko.observable(
        this.MarkerList()[0]);
// loop all marker list
    locations_map.forEach(function(locationItem) {
        self.MarkerList.push(new Location(locationItem));
    });
// Display multiple markers and included infowindow on a map
    var infowindoww = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();
    self.MarkerList().forEach(function (locationMarker) {
        var marker = new google.maps.Marker({
            map: map,
            position: locationMarker.location,
            title: locationMarker.name,
            url:locationMarker.url,
            animation: google.maps.Animation
                .DROP
        });
        locationMarker.marker = marker;
        locationMarker.marker.addListener(
            'click',
            function() {
                populateInfoWindow(this, infowindoww);
                AnimationMarker(this);
            });
        bounds.extend(locationMarker.marker.position);
    });
    map.fitBounds(bounds);
// filter all marker
    this.filterMarker = ko.computed(
        function() {
            var filter = self.filter();
            if (!self.filter()) {
                self.MarkerList().forEach(
                    function(locationMarker) {
                        locationMarker.marker.setMap(map);
                    });
                return self.MarkerList();
            } else {
                return ko.utils.arrayFilter(self.MarkerList(),
                    function(locationsMap) {
                        if (locationsMap.name.toLowerCase().indexOf(
                                filter.toLowerCase()) !== -1) {
                            locationsMap.marker.setMap(map);
                        } else {
                            locationsMap.marker.setMap(null);
                        }
                        return locationsMap.name.toLowerCase()
                                .indexOf(filter.toLowerCase()) !==
                            -1;
                    });
            }
        }, self);
    //Animate the marker when set Location
    function AnimationMarker(marker) {
        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        } else {
            for (var i = 0; i < self.MarkerList()
                .length; i++) {
                var mark = self.MarkerList()[i].marker;
                if (mark.getAnimation() !== null) {
                    mark.setAnimation(null);
                }
            }
            marker.setAnimation(google.maps.Animation
                .BOUNCE);
        }
    }
    // function that load when click on the list Marker and direct to show infowindow
    this.directLocation = function(clickedLocation) {
        // call the populate function when click on the list marker
        populateInfoWindow(clickedLocation.marker, infowindoww);
        // call the Animation function
        AnimationMarker(clickedLocation.marker);
        self.currentLocation(
            clickedLocation);
    };
}

// this populates method the infoWindow for each marker and also include title and url for each marker
function populateInfoWindow(marker, infowindow) {
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title +
            '&format=json&callback=wikiCallback';

        var wikiRequestTimeout = setTimeout(
            function() {
                infowindow.setContent(
                    "failed to load wikipedia page"
                );
            }, 800);

        $.ajax({
            url: wikiUrl,
            dataType: 'jsonp'
        }).done(function(response) {
            var articleresponse = response[1];
            for (var i = 0; i < articleresponse.length; i++) {
                var articleStr = articleresponse[i];
                var url =
                    'https://www.wikipedia.org/wiki/' +
                    articleStr;
                infowindow.setContent(
                    '<div><h3>' +
                    marker.title +
                    '</h3><p>Wiki Info: <a href="' +
                    url + '">' + articleStr +
                    '</a></p></div>');
            }

            clearTimeout(wikiRequestTimeout);
        });

        infowindow.open(map, marker);

        infowindow.addListener('closeclick',
            function() {
                infowindow.close();
                marker.setAnimation(null);
            });
    }
}
// function load map
function init() {
    // Create a map object and specify the DOM element for display on the page.
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: locations_map[0].location,
        draggable: true,
        styles: styles,
        zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_BOTTOM,
            style: google.maps.ZoomControlStyle.DEFAULT,
        },
        panControllOptions: {
            position: google.maps.ControlPosition.LEFT_BOTTOM
        }
    });
    // call the ViewMode Object
    ko.applyBindings(new ViewModelMap());
}
// method that set map handel error that occoure on the map
function ErrorLoading(){
    alert("Google Maps has failed to load. Please check your internet connection and try again.");
}