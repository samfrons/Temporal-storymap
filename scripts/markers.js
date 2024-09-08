
// Function to create markers
function createMarkers(chapters) {
  // START OF MARKER CREATION
  markers = []; // Clear existing markers
  for (var i in chapters) {
    var c = chapters[i];
    if (!isNaN(parseFloat(c['Latitude'])) && !isNaN(parseFloat(c['Longitude']))) {
      var lat = parseFloat(c['Latitude']);
      var lon = parseFloat(c['Longitude']);
      
      // Create marker
      var marker = L.marker([lat, lon], {
        icon: L.ExtraMarkers.icon({
          icon: 'fa-number',
          number: c['Marker'] === 'Numbered' ? parseInt(i) + 1 : '',
          markerColor: c['Marker Color'] || 'blue'
        }),
        opacity: c['Marker'] === 'Hidden' ? 0 : 0.9,
        interactive: c['Marker'] === 'Hidden' ? false : true,
      });
      
      marker.bindPopup(c['Chapter']);
      marker.properties = c;
      marker.originalColor = c['Marker Color'] || 'blue'; // Store the original color
      markers.push(marker);
    }
  }
  // END OF MARKER CREATION
}



// Function to update markers based on the current year
function updateMarkers() {
  // START OF MARKER UPDATE
  for (var i in markers) {
    var m = markers[i];
    var props = m.properties;
    
    var endYear = props['End date'] ? parseInt(props['End date']) : null;
    
    if (endYear === null || currentYear < endYear) {
      if (!map.hasLayer(m)) {
        m.addTo(map);
      }
      // Use the original color
      m.setIcon(L.ExtraMarkers.icon({
        icon: 'fa-number',
        number: props['Marker'] === 'Numbered' ? parseInt(i) + 1 : '',
        markerColor: m.originalColor
      }));
    } else {
      if (!map.hasLayer(m)) {
        m.addTo(map);
      }
      // Use the closed business color
      m.setIcon(L.ExtraMarkers.icon({
        icon: 'fa-number',
        number: props['Marker'] === 'Numbered' ? parseInt(i) + 1 : '',
        markerColor: closedBusinessColor
      }));
    }
  }
  // END OF MARKER UPDATE
}
