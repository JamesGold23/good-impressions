var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var geocoder = new google.maps.Geocoder();
var current_coffee_selection = null;
var current_donut_selection = null;

google.maps.event.addDomListener(window, 'load', initialize);

// initialize sets up the panel that will house the directions. 

function initialize() {
  directionsDisplay = new google.maps.DirectionsRenderer();
  directionsDisplay.setPanel(document.getElementById("directionsPanel"));   
}

// initializePlaces converts the destination address to a LatLng object by calling the Geocode API.
// THis is done because the Places API requires a LatLng object to make a call. 

function initializePlaces() {  
  var destination_LatLng;
  var destination = document.getElementById("destination_address").value;
  geocoder.geocode({'address': destination}, placesCallback);
}

// placesCallback calls the Google Places API to find the closest coffee and donut shops to the destination.
// Why the closest shops? Because we want the coffee and donuts to arrive hot and fresh! Once the requests
// have been made, it makes the coffee and donuts lists visible and populates the lists by calling
// coffee_callback and donut_callback.

function placesCallback(results, status) {
  if (status == google.maps.GeocoderStatus.OK) {
    destination_LatLng = results[0].geometry.location;
        
    var coffee_request = {
        location: destination_LatLng,
        keyword: "coffee",
        types: ["restaurant", "cafe", "meal_takeaway"],
        rankBy: google.maps.places.RankBy.DISTANCE
      };

    var donut_request = {
      location: destination_LatLng,
      keyword: "donuts",
      types: ["restaurant", "cafe", "meal_takeaway"],
      rankBy: google.maps.places.RankBy.DISTANCE
    };

    var service = new google.maps.places.PlacesService(document.getElementById("attributionsPanel"));
    service.nearbySearch(coffee_request, coffee_callback);
    service.nearbySearch(donut_request, donut_callback);

    var hidden_elements = document.getElementsByClassName("hidden_on_load");
    if (hidden_elements.length > 0) {
      for (var i = 0; i < hidden_elements.length; i++) {
        hidden_elements[i].style.visibility = "visible";
      }
    }
  } else if (status == google.maps.GeocoderStatus.ZERO_RESULTS) {
      alert("Bad destination address.");
  } else {
      alert("Error calling Google Geocode API.");
  }  
}

// coffee_callback populates the information for the coffee shops by calling set_fields.
// Currently, the page only displays 5 coffee shops.

function coffee_callback(results, status) {
  coffee_slots = ["coffee1", "coffee2", "coffee3", "coffee4", "coffee5"];
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    set_fields(results, coffee_slots);
  }    
}

// donut_callback populates the information for the donut shops by calling set_fields.
// Currently, the page only displays 5 donut shops.

function donut_callback(results, status) {
  donut_slots = ["donuts1", "donuts2", "donuts3", "donuts4", "donuts5"];
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    set_fields(results, donut_slots);
  }
}

// set_fields populates the information (name, address, rating, open or closed) of every shop passed in.

function set_fields(results, slots) {
  for (var i = 0; i < slots.length; i++) {
      var place = results[i];
      if (place.opening_hours != null) {
        if (place.opening_hours.open_now) {
          document.getElementById(slots[i]).innerHTML = '<span class="place_name">' + place.name + "</span>" + '<span class="open_now"> OPEN</span>';
        } else {
          document.getElementById(slots[i]).innerHTML = '<span class="place_name">' + place.name + "</span>" + '<span class="closed_now"> CLOSED</span>';
        }
      } else {
        document.getElementById(slots[i]).innerHTML = '<span class="place_name">' + place.name + "</span>" + '<span class="hours_unavailable"> N/A</span>';
      }
      if (place.vicinity != null) {
        document.getElementById(slots[i] + "_address").innerHTML = place.vicinity;
      } else {
        document.getElementById(slots[i] + "_address").innerHTML = "Address: N/A";
      }
      if (place.rating != null) {
        document.getElementById(slots[i] + "_rating").innerHTML = "User rating: " + place.rating + "/5"; 
      } else {
        document.getElementById(slots[i] + "_rating").innerHTML = "User rating: N/A";
      }      
  }
}

// calcRoute calls Google's Directions service to generate directions from the user's start location to the
// destination. Transit directions currently aren't supported because the Directions API doesn't support waypoints
// for transit. If a coffee shop and/or a donut shop are selected, the directions include stops at those
// locations. If both a coffee shop and donut shop are selected, the "optimizeWaypoints" request paramater is
// set, which allows Google to determine the order in which the shops should be visited to minimze travel time.

function calcRoute() {
  var start = document.getElementById("start_address").value;
  var end = document.getElementById("destination_address").value;
  var mode = document.getElementById("mode").value;
  if (mode == "TRANSIT") {
    alert("Transit directions currently unavailable. Sorry!");
    return;
  }

  var waypts = [];
  var request = {
    origin:start,
    destination:end,
    travelMode: mode
  };

  if (current_coffee_selection != null) {
    var coffee_shop_address = current_coffee_selection.children[1].textContent;
    waypts.push({
          location:coffee_shop_address,
          stopover:true});
  }
  if (current_donut_selection != null) {
    var donut_shop_address = current_donut_selection.children[1].textContent;
    waypts.push({
          location:donut_shop_address,
          stopover:true});
  }
  if (waypts.length > 0) {
    request.waypoints = waypts;
    request.optimizeWaypoints = true;
  }
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
    }
    else if (status == google.maps.DirectionsStatus.NOT_FOUND || status == google.maps.DirectionsStatus.ZERO_RESULTS) {
      alert("Invalid start or destination address.");
    }
    else {
      alert("Error calling Google Directions API.")
    }
  });
}

// select_place is called when the user clicks on a shop. Only one coffee shop can be selected at a time, and only one
// donut shop can be selected at a time. If a shop that is already selected is selected again, it gets de-selected.

function select_place(id) {
  var selection = document.getElementById(id);
  if (selection == current_coffee_selection) {
    current_coffee_selection.style.border = "";
    current_coffee_selection = null;
  }
  else if (selection == current_donut_selection) {
    current_donut_selection.style.border = "";
    current_donut_selection = null;
  }
  else if (selection.className == "coffee_option") {
    if (current_coffee_selection != null) {
      current_coffee_selection.style.border = "";
    }
    current_coffee_selection = selection;
    current_coffee_selection.style.border = "medium solid #552000";
  }
  else {
    if (current_donut_selection != null) {
      current_donut_selection.style.border = "";
    }
    current_donut_selection = selection;
    current_donut_selection.style.border = "medium solid #FF00FF";
  }
}











