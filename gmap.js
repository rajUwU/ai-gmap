var map
var markers = []
var directionsService
var directionsRenderer
var markerLabels = []
var markerCounter = 1
var selectedMarker
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

  var searchInput = document.getElementById('search-input')
  var meansOfTransportInput = document.getElementById('means-of-transport')
  var fareInput = document.getElementById('fare')
  var placeMarkerBtn = document.getElementById('place-marker-btn')
  var showRouteBtn = document.getElementById('show-route-btn')
  var submitBtn = document.getElementById('submit-btn')
  var searchResults = document.getElementById('search-results')
  var meansFareInputs = document.getElementById('means-fare-inputs')

  // Create a new Autocomplete instance and bind it to the search input
  var autocomplete = new google.maps.places.Autocomplete(searchInput)
  var addresses = []
  var addressPairs = []

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

              // Add the address to the addresses array
              addresses.push(address)
              console.log(addresses)

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
    }
  })

  placeMarkerBtn.addEventListener('click', function () {
    var input = searchInput.value

    // Perform a geocode request to get the selected place's coordinates
    var geocoder = new google.maps.Geocoder()
    geocoder.geocode({ address: input }, function (results, status) {
      if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
        var place = results[0]

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
          },
          meansOfTransport: meansOfTransportInput.value,
          fare: fareInput.value
        })

        // Add the marker to the markers array
        markers.push(marker)
        markerLabels.push(markerCounter)

        // Update the map center
        map.setCenter(place.geometry.location)

        markerCounter++

        if (markers.length === 2) {
          meansFareInputs
          if (markers.length === 2) {
            meansFareInputs.style.display = 'block'
            placeMarkerBtn.disabled = true
          }

          if (markers.length >= 3) {
            submitBtn.disabled = false
          }
        }
      }
    })
  })

  showRouteBtn.addEventListener('click', function () {
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
  })

  var resultContainer = document.getElementById('result-container')
  var closeBtn = document.getElementById('close-btn')
  var geocoder = new google.maps.Geocoder()

  submitBtn.addEventListener('click', function () {
    // Check if there are at least two markers
    if (markers.length >= 2) {
      // Retrieve addresses and associate means of transport and fare values
      var geocodeCounter = 0 // Counter to keep track of geocoding requests

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
      resultHTML += `<p>Address ${j + 1}: ${pair.currentAddress}</p>`
      resultHTML += `<p>Previous Address ${j + 1}: ${pair.previousAddress}</p>`
      resultHTML += `<p>Means of Transport ${j + 1}: ${
        pair.meansOfTransport
      }</p>`
      resultHTML += `<p>Fare ${j + 1}: ${pair.fare}</p>`
      resultHTML += '<hr>'
    }
    resultContainer.innerHTML = resultHTML

    closeBtn.addEventListener('click', function () {
      // Hide the popup
      popup.style.display = 'none'
    })

    // Clear the directions renderer
    directionsRenderer.set('directions', null)
  }

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
