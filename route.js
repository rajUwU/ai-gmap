var savedRoutes = []

function displaySavedRoutes () {
  var savedRoutesContainer = document.getElementById('saved-routes')
  savedRoutesContainer.innerHTML = ''

  if (savedRoutes.length > 0) {
    for (var i = 0; i < savedRoutes.length; i++) {
      var route = savedRoutes[i]

      if (route.addressPairs && route.addressPairs.length > 0) {
        // Display the previous address of the first item and current address of the last item in the addressPairs array
        var routeHTML = ''
        routeHTML += `<p>Route ID: ${route.id}</p>`
        routeHTML += `<p>Previous Address: ${route.addressPairs[0].previousAddress}</p>`
        routeHTML += `<p>Current Address: ${
          route.addressPairs[route.addressPairs.length - 1].currentAddress
        }</p>`
        routeHTML += `<button onclick="displaySequentialRoute(${route.id})">Show</button>`
        routeHTML += `<button onclick="deleteRoute(${route.id})">Delete</button>`
        routeHTML += '<hr>'

        savedRoutesContainer.innerHTML += routeHTML
      }
    }
  }
}

function deleteRoute (routeId) {
  // Find the route with the matching routeId
  var routeIndex = savedRoutes.findIndex(function (route) {
    return route.id === routeId
  })

  if (routeIndex !== -1) {
    // Remove the route from the savedRoutes array
    savedRoutes.splice(routeIndex, 1)

    // Update the display
    displaySavedRoutes()

    // Update the local storage
    localStorage.setItem('savedRoutes', JSON.stringify(savedRoutes))
    var clearBtn = document.getElementById('clear-btn')
    clearBtn.click()
  }
}

// Retrieve saved routes from local storage
var savedRoutesData = localStorage.getItem('savedRoutes')
if (savedRoutesData) {
  savedRoutes = JSON.parse(savedRoutesData)
}

// Update the side panel to display the saved routes
displaySavedRoutes()

function displaySequentialRoute (routeId) {
  var route = savedRoutes.find(function (route) {
    return route.id === routeId
  })

  if (route) {
    // Disable the search input
    searchInput.disabled = true;
    var geocoder = new google.maps.Geocoder()
    var geocodeCount = 0 // Track the number of geocoding requests completed

    route.addressPairs.forEach(function (pair, index) {
      var previousAddress = pair.previousAddress
      var currentAddress = pair.currentAddress

      geocoder.geocode(
        { address: previousAddress },
        function (previousResults, status) {
          if (status === google.maps.GeocoderStatus.OK) {
            var previousLocation = previousResults[0].geometry.location

            var previousMarker = new google.maps.Marker({
              position: previousLocation,
              map: map,
              draggable: false,
              label: {
                text: (index + 1).toString(),
                className: 'marker-label'
              },
              icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png', // Green marker icon image
                labelOrigin: new google.maps.Point(11, 40) // Adjust label position if needed
              }
            })

            markers[index * 2] = previousMarker // Store the marker at the corresponding index

            geocodeCount++ // Increment the geocode count

            // Check if all geocoding requests are completed
            if (geocodeCount === route.addressPairs.length * 2) {
              showRoute(markers)
            }
          } else {
            console.error(
              'Geocode failed for previous address:',
              previousAddress,
              'with status:',
              status
            )
          }
        }
      )

      geocoder.geocode(
        { address: currentAddress },
        function (currentResults, status) {
          if (status === google.maps.GeocoderStatus.OK) {
            var currentLocation = currentResults[0].geometry.location

            var currentMarker = new google.maps.Marker({
              position: currentLocation,
              map: map,
              draggable: false,
              label: {
                text: (index + 2).toString(),
                className: 'marker-label'
              },
              icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png', // Green marker icon image
                labelOrigin: new google.maps.Point(11, 40) // Adjust label position if needed
              }
            })

            markers[index * 2 + 1] = currentMarker // Store the marker at the corresponding index

            geocodeCount++ // Increment the geocode count

            // Check if all geocoding requests are completed
            if (geocodeCount === route.addressPairs.length * 2) {
              showRoute(markers)
            }
          } else {
            console.error(
              'Geocode failed for current address:',
              currentAddress,
              'with status:',
              status
            )
          }
        }
      )
    })

    // Update the map center
    if (markers.length > 0) {
      map.setCenter(markers[0].getPosition())
    }
  }
}
