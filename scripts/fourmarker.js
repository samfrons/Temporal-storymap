var markers = []; // Define the markers array
var currentYear = 1930; // Start year
var endYear = 1945; // End year

var defaultMarkerClass = 'default-marker';
var activeMarkerClass = 'active-marker';
var midStateMarkerClass = 'mid-state-marker';
var endStateMarkerClass = 'end-state-marker';

function createMarker(c, i) {
  console.log('Creating marker for chapter:', c['Chapter']);
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
    
    marker.on('click', function() {
      console.log('Marker clicked:', c['Chapter']);
      this.openPopup();
    });

    marker.properties = c;
    console.log('Marker created successfully for:', c['Chapter']);
    return marker;
  }
  console.log('Invalid coordinates for chapter:', c['Chapter']);
  return null;
}

function createMarkers(chapters) {
  console.log('Creating markers for', chapters.length, 'chapters');
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
  console.log('Created', markers.filter(m => m !== null).length, 'markers');
  return markers;
}

function updateMarkers(activeIndex) {
  console.log('Updating markers, active index:', activeIndex);
  for (var i in markers) {
    var m = markers[i];
    if (m) {
      var props = m.properties;
      
      var startDate = props['Start date'] ? new Date(props['Start date']).getFullYear() : null;
      var endDate = props['End date'] ? new Date(props['End date']).getFullYear() : null;
      
      var markerClass;
      
      if (startDate && currentYear < startDate) {
        markerClass = defaultMarkerClass;
      } else if (endDate && currentYear >= endDate) {
        markerClass = endStateMarkerClass;
      } else {
        markerClass = activeMarkerClass;
      }
      
      if (parseInt(i) === activeIndex) {
        markerClass += ' marker-active';
        console.log('Opening popup for active marker:', props['Chapter']);
        m.openPopup();
      } else {
        m.closePopup();
      }
      
      m.setIcon(L.divIcon({
        className: markerClass,
        html: props['Marker'] === 'Numbered' ? (parseInt(i) + 0).toString() : '',
        iconSize: [30, 30],
        iconAnchor: [15, 30]
      }));
      
      if (!map.hasLayer(m)) {
        m.addTo(map);
        console.log('Added marker to map:', props['Chapter']);
      }
    }
  }
  console.log('Markers updated successfully');
}

console.log('fourmarker.js loaded successfully');