var activeMarkerColor = '#FFA500'; // Orange by default, change this to your preferred color
var svgIconUrl = '..media/img/pin.svg';


// Function to create markers
function createMarkers(chapters) {
  markers = []; // Clear existing markers
  for (var i in chapters) {
    var c = chapters[i];
    if (!isNaN(parseFloat(c['Latitude'])) && !isNaN(parseFloat(c['Longitude']))) {
      var lat = parseFloat(c['Latitude']);
      var lon = parseFloat(c['Longitude']);
      
      var svgIcon = L.divIcon({
        html: `<img src="${svgIconUrl}" class="custom-marker" style="width:30px;height:30px;">`,
        className: '',
        iconSize: [30, 30],
        iconAnchor: [15, 30]
      });
      
      var marker = L.marker([lat, lon], {
        icon: svgIcon,
        opacity: c['Marker'] === 'Hidden' ? 0 : 0.9,
        interactive: c['Marker'] === 'Hidden' ? false : true,
      });



       // Create custom popup content
      var popupContent = `
        <div class="custom-popup">
          <h3>${c['Chapter']}</h3>
          <p><strong>Location:</strong> ${c['Location']}</p>
          <p><strong>Start Date:</strong> ${c['Start date'] || 'N/A'}</p>
          <p><strong>End Date:</strong> ${c['End date'] || 'N/A'}</p>
        </div>
      `;
      
      marker.bindPopup(popupContent);
      marker.properties = c;
      marker.originalColor = c['Marker Color'] || 'blue'; // Store the original color
      markers.push(marker);
    }
  }
}

function markActiveColor(k) {
  for (var i = 0; i < markers.length; i++) {
    if (markers[i] && markers[i]._icon) {
      markers[i]._icon.classList.remove('marker-active');
      if (i == k) {
        markers[k]._icon.classList.add('marker-active');
      }
    }
  }
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
