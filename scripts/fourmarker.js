var markers = []; // Define the markers array
var currentYear = 1930; // Start year
var endYear = 1945; // End year

var defaultMarkerClass = 'default-marker';
var activeMarkerClass = 'active-marker';
var midStateMarkerClass = 'mid-state-marker';
var endStateMarkerClass = 'end-state-marker';

function createMarker(c, i) {
  if (!isNaN(parseFloat(c['Latitude'])) && !isNaN(parseFloat(c['Longitude']))) {
    var lat = parseFloat(c['Latitude']);
    var lon = parseFloat(c['Longitude']);
    
    var marker = L.marker([lat, lon], {
      icon: L.divIcon({
        className: defaultMarkerClass,
        html: c['Marker'] === 'Numbered' ? (parseInt(i) + 1).toString() : '',
        iconSize: [30, 30],
        iconAnchor: [15, 30]
      }),
      opacity: c['Marker'] === 'Hidden' ? 0 : 1,
      interactive: c['Marker'] === 'Hidden' ? false : true,
    });
    
    var popupContent = `
      <div class="custom-popup">
        <h3>${c['Chapter']}</h3>
        <p><strong>Location:</strong> ${c['Location']}</p>
        <p><strong>Start Date:</strong> ${c['Start date'] || 'N/A'}</p>
        <p><strong>End Date:</strong> ${c['End date'] || 'N/A'}</p>
        <p>${c['Description'] || ''}</p>
      </div>
    `;
    
    marker.bindPopup(popupContent, {
      maxWidth: 300,
      closeButton: false
    });
    
    marker.properties = c;
    return marker;
  }
  return null;
}

function createMarkers(chapters) {
  markers = []; // Clear existing markers
  for (var i in chapters) {
    var c = chapters[i];
    var marker = createMarker(c, i);
    if (marker) {
      markers.push(marker);
    } else {
      markers.push(null);
    }
  }
  return markers;
}

function updateMarkers(activeIndex) {
  for (var i in markers) {
    var m = markers[i];
    if (m) {
      var props = m.properties;
      
      var startDate = props['Start date'] ? new Date(props['Start date']).getFullYear() : null;
      var midDate = props['Mid date'] ? new Date(props['Mid date']).getFullYear() : null;
      var endDate = props['End date'] ? new Date(props['End date']).getFullYear() : null;
      
      var markerClass;
      
      if (startDate && currentYear < startDate) {
        markerClass = defaultMarkerClass;
      } else if (endDate && currentYear >= endDate) {
        markerClass = endStateMarkerClass;
      } else if (midDate && currentYear >= midDate) {
        markerClass = midStateMarkerClass;
      } else {
        markerClass = activeMarkerClass;
      }
      
      // Check if this is the active marker
      if (parseInt(i) === activeIndex) {
        markerClass += ' marker-active';
        m.openPopup(); // Open the popup for the active marker
      } else {
        m.closePopup(); // Close the popup for inactive markers
      }
      
      m.setIcon(L.divIcon({
        className: markerClass,
        html: props['Marker'] === 'Numbered' ? (parseInt(i) + 1).toString() : '',
        iconSize: [30, 30],
        iconAnchor: [15, 30]
      }));
      
      if (!map.hasLayer(m)) {
        m.addTo(map);
      }
    }
  }
}