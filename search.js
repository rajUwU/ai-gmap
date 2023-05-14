function initializeFindMode () {
  // Get references to the elements
  var searchSwitch = document.getElementById('search-switch')
  var clearBtn = document.getElementById('clear-btn')
  var searchInput = document.getElementById('search-input')
  var searchInput1 = document.getElementById('search-input-1')
  var searchInput2 = document.getElementById('search-input-2')
  var sidePanel = document.getElementById('side-panel')
  var searchBtn = document.getElementById('search-btn')
  var searchResults = document.getElementById('search-results')

  // Function to handle the search switch change event
  function handleSearchSwitchChange () {
    if (searchSwitch.checked) {
      // Clear anything from prior functions
      clearBtn.click()

      searchInput.style.display = 'none'
      searchInput1.style.display = 'block'
      searchInput2.style.display = 'block'
      sidePanel.style.display = 'none'
      searchBtn.style.display = 'block'
    } else {
      searchInput.style.display = 'block'
      searchInput1.style.display = 'none'
      searchInput2.style.display = 'none'
      sidePanel.style.display = 'block'
      searchBtn.style.display = 'none'
    }
  }

  // Attach event listener to the search switch
  searchSwitch.addEventListener('change', handleSearchSwitchChange)

  // Call the function to initialize the search bar visibility
  handleSearchSwitchChange()

  // Variables to store the selected addresses
  var selectedAddress1 = ''
  var selectedAddress2 = ''

  // Create autocomplete objects for the search inputs
  var autocomplete1 = new google.maps.places.Autocomplete(searchInput1)
  var autocomplete2 = new google.maps.places.Autocomplete(searchInput2)

  // Add a listener for the place_changed event on the Autocomplete instance of searchInput1
  autocomplete1.addListener('place_changed', function () {
    var place = autocomplete1.getPlace()

    // Check if the place object is valid
    if (place.geometry && place.geometry.location) {
      // Store the selected address
      selectedAddress1 = place.formatted_address
    }
  })

  // Add a listener for the place_changed event on the Autocomplete instance of searchInput2
  autocomplete2.addListener('place_changed', function () {
    var place = autocomplete2.getPlace()

    // Check if the place object is valid
    if (place.geometry && place.geometry.location) {
      // Store the selected address
      selectedAddress2 = place.formatted_address
    }
  })

  var similarityThreshold = 0.6; // Adjust the threshold value as needed

  searchBtn.addEventListener('click', function () {
    var input1 = searchInput1.value;
    var input2 = searchInput2.value;
    var savedRoutes = JSON.parse(localStorage.getItem('savedRoutes')) || [];
  
    // Create markers for input locations and retrieve their addresses
    var geocoder = new google.maps.Geocoder();
    geocodeAddress(input1, function (address1) {
      geocodeAddress(input2, function (address2) {
        // Search for routes in localStorage
        var matchingRoutes = [];
  
        // Flag to indicate if matching routes were found
        var hasMatchingRoutes = false;
  
        savedRoutes.forEach(function (route) {
          var addressPairs = route.addressPairs || [];
          var firstPair = addressPairs[0];
          var lastPair = addressPairs[addressPairs.length - 1];
  
          // Calculate the similarity score between input1 and previousAddress
          var similarity1 = stringSimilarity.compareTwoStrings(
            input1.toLowerCase(),
            firstPair.previousAddress.toLowerCase()
          );
  
          // Calculate the similarity score between input2 and currentAddress
          var similarity2 = stringSimilarity.compareTwoStrings(
            input2.toLowerCase(),
            lastPair.currentAddress.toLowerCase()
          );
  
          // Check if the similarity scores meet the threshold for both comparisons
          var isFirstMatch = similarity1 >= similarityThreshold;
          var isSecondMatch = similarity2 >= similarityThreshold;
  
          if (isFirstMatch && isSecondMatch) {
            matchingRoutes.push(route);
            hasMatchingRoutes = true; // Matching routes found
          }
        });
  
        console.log('Matching Routes:', matchingRoutes);
  
        // Print the Route ID of matching routes
        matchingRoutes.forEach(function (route) {
          console.log('Route ID:', route.id);
          displaySequentialRoute(route.id);
        });
  
        // If no matching routes found, display a message
        if (!hasMatchingRoutes) {
          console.log('No matching routes found.');
          // Perform any additional actions when no matching routes are found
        }
      });
    });
  });
  
  function geocodeAddress(address, callback) {
    var geocoder = new google.maps.Geocoder();
    var marker = new google.maps.Marker();
  
    geocoder.geocode({ address: address }, function (results, status) {
      if (status === 'OK') {
        var location = results[0].geometry.location;
        var formattedAddress = results[0].formatted_address;
  
        // Retrieve the address from the marker's location
        geocoder.geocode({ location: location }, function (results, status) {
          if (status === 'OK') {
            var formattedAddress = results[0].formatted_address;
            callback(formattedAddress);
          } else {
            console.log(
              'Geocode was not successful for the following reason: ' + status
            );
            callback(null);
          }
        });
      } else {
        console.log(
          'Geocode was not successful for the following reason: ' + status
        );
        callback(null);
      }
    });
  }
}
