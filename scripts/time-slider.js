
// Function to initialize the time slider
function initializeTimeSlider() {
  // START OF TIME SLIDER INITIALIZATION
  var TimeSlider = L.Control.extend({
    onAdd: function(map) {
      // Create slider element
      var slider = L.DomUtil.create('input', 'time-slider');
      slider.type = 'range';
      slider.min = currentYear;
      slider.max = endYear;
      slider.value = currentYear;
      slider.step = 1;
      
      // Add event listener for slider input
      L.DomEvent.on(slider, 'input', function() {
        currentYear = parseInt(this.value);
        updateMarkers();
        L.DomUtil.get('year-display').innerHTML = currentYear;
      });
      
      // Create container for slider and year display
      var container = L.DomUtil.create('div', 'time-slider-container');
      container.appendChild(slider);
      
      var yearDisplay = L.DomUtil.create('div', 'year-display');
      yearDisplay.id = 'year-display';
      yearDisplay.innerHTML = currentYear;
      container.appendChild(yearDisplay);
      
      // Prevent map zoom when using the slider
      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.disableScrollPropagation(container);
      
      return container;
    }
  });
  
  // Add the time slider to the map
  timeSlider = new TimeSlider({ position: 'bottomright' }).addTo(map);
  // END OF TIME SLIDER INITIALIZATION
}

