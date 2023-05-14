var map
var markers = []
var directionsService
var directionsRenderer
var markerLabels = []
var markerCounter = 1
var selectedMarker

var searchInput = document.getElementById('search-input')
var meansOfTransportInput = document.getElementById('means-of-transport')
var fareInput = document.getElementById('fare')
var submitBtn = document.getElementById('submit-btn')
var meansFareInputs = document.getElementById('means-fare-inputs')
var resultContainer = document.getElementById('result-container')
var popup = document.getElementById('popup')
var saveRouteBtn = document.getElementById('save-route-btn');
var clearBtn = document.getElementById('clear-btn')


function initMap () {
  // Create a new map instance
  var center = { lat: 37.7749, lng: -122.4194 }
  map = new google.maps.Map(document.getElementById('map'), {
    center: center,
    zoom: 12
  })

  directionsService = new google.maps.DirectionsService()
  directionsRenderer = new google.maps.DirectionsRenderer({
    map: map,
    suppressMarkers: true
  })

  // Create a new Autocomplete instance and bind it to the search input
  var autocomplete = new google.maps.places.Autocomplete(searchInput)
  var addresses = []
  var addressPairs = []
  var addressCords = []

  // Add a listener for the place_changed event on the Autocomplete instance
  autocomplete.addListener('place_changed', function () {
    var place = autocomplete.getPlace()

    // Check if the place object is valid
    if (place.geometry && place.geometry.location) {
      // Check if the marker already exists at the selected place's location
      var existingMarker = getExistingMarker(place.geometry.location)
      if (existingMarker) {
        // Marker already exists, do not create a new one
        return
      }

      // Create a new marker and set it on the map
      var marker = new google.maps.Marker({
        position: place.geometry.location,
        map: map,
        draggable: true,
        label: {
          text: markerCounter.toString(),
          className: 'marker-label'
        }
      })

      // Add the marker to the markers array
      markers.push(marker)
      markerLabels.push(markerCounter)

      // Update the map center
      map.setCenter(place.geometry.location)

      // Geocode the position to get the address
      geocoder.geocode(
        { location: place.geometry.location },
        function (results, status) {
          if (status === google.maps.GeocoderStatus.OK) {
            if (results[0]) {
              var address = results[0].formatted_address
              var latitude = place.geometry.location.lat()
              var longitude = place.geometry.location.lng()

              // Add the address and its coordinates to the arrays
              addresses.push(address)
              addressCords.push({ latitude: latitude, longitude: longitude })
              console.log(addresses)
              console.log(addressCords)

              if (markers.length >= 2) {
                meansFareInputs.style.display = 'block'
              }

              // Call displayResults to update the display
              displayResults()
            } else {
              console.log('Address not found')
            }
          } else {
            console.log('Geocoder failed: ' + status)
          }
        }
      )

      markerCounter++
      if (markers.length >= 2) {
        meansFareInputs
        showRoute()
        meansFareInputs.style.display = 'block'
      }
    }
  })

  var geocoder = new google.maps.Geocoder()

  submitBtn.addEventListener('click', function () {
    // Check if there are at least two markers
    if (markers.length >= 2) {
      // Get the means of transport and fare values
      var meansOfTransport = meansOfTransportInput.value || ''
      var fare = fareInput.value || ''

      // Create an address pair object with the current and previous address
      var pair = {
        currentAddress: addresses[addresses.length - 1],
        previousAddress: addresses[addresses.length - 2],
        meansOfTransport: meansOfTransport,
        fare: fare
      }

      // Add the address pair to the array
      addressPairs.push(pair)
      // Show the popup
      popup.style.display = 'block'

      // Call displayResults to update the display
      displayResults()
    }
  })

  // Function to display the results
  function displayResults () {
    // Do something with the data (e.g., submit it to a server)
    console.log('Address Pairs:', addressPairs)

    // Display the information in the result container
    var resultHTML = ''
    for (var j = 0; j < addressPairs.length; j++) {
      var pair = addressPairs[j]
      resultHTML += `<p>Address: ${pair.currentAddress}</p>`
      resultHTML += `<p>Previous Address: ${pair.previousAddress}</p>`
      resultHTML += `<p>Means of Transport: ${pair.meansOfTransport}</p>`
      resultHTML += `<p>Fare: ${pair.fare}</p>`
      resultHTML += '<hr>'
    }
    resultContainer.innerHTML = resultHTML
  }

  clearBtn.addEventListener('click', function () {

    // Enable the search input
    searchInput.disabled = false;
    // Clear all input boxes
    meansOfTransportInput.value = ''
    fareInput.value = ''
    markerCounter = 1

    // Hide the popup
    popup.style.display = 'none'
    meansFareInputs.style.display = 'none'

    // Clear the search input
    searchInput.value = ''

    // Remove all markers from the map and clear the markers array
    markers.forEach(function (marker) {
      marker.setMap(null)
    })
    markers = []

    // Clear the directions renderer
    directionsRenderer.set('directions', null)

    // Clear other arrays
    addressPairs = []
    addresses = []
    markerLabels = []
  })

  saveRouteBtn.addEventListener('click', function () {
    // Push a copy of the addressPairs array to the savedRoutes array
    savedRoutes.push({ addressPairs: [...addressPairs], id: savedRoutes.length + 1 });
    console.log('Route saved:', addressPairs);

    // Save the updated savedRoutes array to local storage
    localStorage.setItem('savedRoutes', JSON.stringify(savedRoutes));

    // Update the side panel to display the saved routes
    displaySavedRoutes();
    clearBtn.click();
  });
  
  // Function to check if a marker already exists at a given location
  function getExistingMarker (location) {
    for (var i = 0; i < markers.length; i++) {
      if (markers[i].getPosition().equals(location)) {
        return markers[i]
      }
    }
    return null
  }
}

function showRoute () {
  // Check if there are at least two markers
  if (markers.length >= 2) {
    var waypoints = []

    // Add the markers' positions as waypoints
    for (var i = 1; i < markers.length - 1; i++) {
      waypoints.push({
        location: markers[i].getPosition(),
        stopover: true
      })
    }

    // Create a directions request object
    var request = {
      origin: markers[0].getPosition(),
      destination: markers[markers.length - 1].getPosition(),
      waypoints: waypoints,
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode.DRIVING
    }

    // Send the directions request to the DirectionsService
    directionsService.route(request, function (result, status) {
      if (status === google.maps.DirectionsStatus.OK) {
        // Display the directions on the map
        directionsRenderer.setDirections(result)
      }
    })
  }
}