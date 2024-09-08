// Global variables
var map;
var timeSlider;
var currentYear = 1930; // Start year
var endYear = 1945; // End year
var markers = []; // Define the markers array
var closedBusinessColor = 'black';

// Function to initialize the time slider
function initializeTimeSlider() {
  var TimeSlider = L.Control.extend({
    onAdd: function(map) {
      var slider = L.DomUtil.create('input', 'time-slider');
      slider.type = 'range';
      slider.min = currentYear;
      slider.max = endYear;
      slider.value = currentYear;
      slider.step = 1;
      
      L.DomEvent.on(slider, 'input', function() {
        currentYear = parseInt(this.value);
        updateMarkers();
        L.DomUtil.get('year-display').innerHTML = currentYear;
      });
      
      var container = L.DomUtil.create('div', 'time-slider-container');
      container.appendChild(slider);
      
      var yearDisplay = L.DomUtil.create('div', 'year-display');
      yearDisplay.id = 'year-display';
      yearDisplay.innerHTML = currentYear;
      container.appendChild(yearDisplay);
      
      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.disableScrollPropagation(container);
      
      return container;
    }
  });
  
  timeSlider = new TimeSlider({ position: 'bottomright' }).addTo(map);
}

function createMarkers(chapters) {
  markers = []; // Clear existing markers
  for (var i in chapters) {
    var c = chapters[i];
    if (!isNaN(parseFloat(c['Latitude'])) && !isNaN(parseFloat(c['Longitude']))) {
      var lat = parseFloat(c['Latitude']);
      var lon = parseFloat(c['Longitude']);
      
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
}

function updateMarkers() {
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
}

function createMediaElement(mediaLink, mediaCredit, mediaCreditLink) {
  var media = null;
  var mediaContainer = null;
  var source = '';

  if (mediaCreditLink) {
    source = $('<a>', {
      text: mediaCredit,
      href: mediaCreditLink,
      target: "_blank",
      class: 'source'
    });
  } else {
    source = $('<span>', {
      text: mediaCredit,
      class: 'source'
    });
  }

  if (mediaLink && mediaLink.indexOf('youtube.com/') > -1) {
    media = $('<iframe></iframe>', {
      src: mediaLink,
      width: '100%',
      height: '100%',
      frameborder: '0',
      allow: 'autoplay; encrypted-media',
      allowfullscreen: 'allowfullscreen',
    });
    mediaContainer = $('<div></div>', {
      class: 'img-container'
    }).append(media).after(source);
  } else {
    var mediaTypes = {
      'jpg': 'img', 'jpeg': 'img', 'png': 'img', 'tiff': 'img', 'gif': 'img',
      'mp3': 'audio', 'ogg': 'audio', 'wav': 'audio',
    }
    var mediaExt = mediaLink ? mediaLink.split('.').pop().toLowerCase() : '';
    var mediaType = mediaTypes[mediaExt];

    if (mediaType) {
      media = $('<' + mediaType + '>', {
        src: mediaLink,
        controls: mediaType === 'audio' ? 'controls' : '',
        alt: mediaCredit
      });

      var enableLightbox = getSetting('_enableLightbox') === 'yes' ? true : false;
      if (enableLightbox && mediaType === 'img') {
        var lightboxWrapper = $('<a></a>', {
          'data-lightbox': mediaLink,
          'href': mediaLink,
          'data-title': mediaCredit,
          'data-alt': mediaCredit,
        });
        media = lightboxWrapper.append(media);
      }

      mediaContainer = $('<div></div>', {
        class: mediaType + '-container'
      }).append(media).after(source);
    }
  }

  return mediaContainer;
}

function addBaseMap() {
  var basemap = trySetting('_tileProvider', '');
  L.tileLayer.provider(basemap, {
    maxZoom: 18,
    apiKey: trySetting('_tileProviderApiKey', ''),
    apikey: trySetting('_tileProviderApiKey', ''),
    api_key: '646d29b1-9794-470a-8fbb-b0adbc18bb2f',
    key: trySetting('_tileProviderApiKey', ''),
    accessToken: trySetting('_tileProviderApiKey', '')
  }).addTo(map);
}

function initMap(options, chapters) {
  createDocumentSettings(options);
  createMarkers(chapters);
  initializeTimeSlider();

  var chapterContainerMargin = 70;

  document.title = getSetting('_mapTitle');
  $('#header').append('<h1>' + (getSetting('_mapTitle') || '') + '</h1>');
  $('#header').append('<h2>' + (getSetting('_mapSubtitle') || '') + '</h2>');

  if (getSetting('_mapLogo')) {
    $('#logo').append('<img src="' + getSetting('_mapLogo') + '" />');
    $('#top').css('height', '60px');
  } else {
    $('#logo').css('display', 'none');
    $('#header').css('padding-top', '25px');
  }

  addBaseMap();

  if (getSetting('_zoomControls') !== 'off') {
    L.control.zoom({
      position: getSetting('_zoomControls')
    }).addTo(map);
  }

  var pixelsAbove = [];
  var chapterCount = 0;

  var currentlyInFocus;
  var overlay;
  var geoJsonOverlay;

  for (var i in chapters) {
    var c = chapters[i];
    var container = $('<div></div>', {
      id: 'container' + i,
      class: 'chapter-container'
    });

    var mediaLinks = c['Media Link'] ? c['Media Link'].split(',').map(item => item.trim()) : [];
    var mediaCredits = c['Media Credit'] ? c['Media Credit'].split(',').map(item => item.trim()) : [];
    var mediaCreditLinks = c['Media Credit Link'] ? c['Media Credit Link'].split(',').map(item => item.trim()) : [];

    for (var j = 0; j < mediaLinks.length; j++) {
      var mediaLink = mediaLinks[j];
      var mediaCredit = mediaCredits[j] || '';
      var mediaCreditLink = mediaCreditLinks[j] || '';

      if (mediaLink) {
        var mediaElement = createMediaElement(mediaLink, mediaCredit, mediaCreditLink);
        if (mediaElement) {
          container.append(mediaElement);
        }
      }
    }

    container
      .append('<p class="chapter-header">' + c['Chapter'] + '</p>')
      .append('<p class="description">' + c['Description'] + '</p>');

    $('#contents').append(container);
  }

  changeAttribution();

  var imgContainerHeight = parseInt(getSetting('_imgContainerHeight'));
  if (imgContainerHeight > 0) {
    $('.img-container').css({
      'height': imgContainerHeight + 'px',
      'max-height': imgContainerHeight + 'px',
    });
  }

  pixelsAbove[0] = -100;
  for (var i = 1; i < chapters.length; i++) {
    pixelsAbove[i] = pixelsAbove[i-1] + $('div#container' + (i-1)).height() + chapterContainerMargin;
  }
  pixelsAbove.push(Number.MAX_VALUE);

  $('div#contents').scroll(function() {
    var currentPosition = $(this).scrollTop();

    if (currentPosition < 200) {
      $('#title').css('opacity', 1 - Math.min(1, currentPosition / 100));
    }

    for (var i = 0; i < pixelsAbove.length - 1; i++) {
      if (currentPosition >= pixelsAbove[i] && currentPosition < (pixelsAbove[i+1] - 2 * chapterContainerMargin) && currentlyInFocus != i) {
        
        location.hash = i + 1;
        $('.chapter-container').removeClass("in-focus").addClass("out-focus");
        $('div#container' + i).addClass("in-focus").removeClass("out-focus");

        currentlyInFocus = i;

        if (overlay && map.hasLayer(overlay)) {
          map.removeLayer(overlay);
        }

        if (geoJsonOverlay && map.hasLayer(geoJsonOverlay)) {
          map.removeLayer(geoJsonOverlay);
        }

        var c = chapters[i];

        if (c['Overlay']) {
          var opacity = parseFloat(c['Overlay Transparency']) || 1;
          var url = c['Overlay'];

          if (url.split('.').pop() === 'geojson') {
            $.getJSON(url, function(geojson) {
              overlay = L.geoJson(geojson, {
                style: function(feature) {
                  return {
                    fillColor: feature.properties.fillColor || '#ffffff',
                    weight: feature.properties.weight || 1,
                    opacity: feature.properties.opacity || opacity,
                    color: feature.properties.color || '#cccccc',
                    fillOpacity: feature.properties.fillOpacity || 0.5,
                  }
                }
              }).addTo(map);
            });
          } else {
            overlay = L.tileLayer(c['Overlay'], { opacity: opacity }).addTo(map);
          }
        }

        if (c['GeoJSON Overlay']) {
          $.getJSON(c['GeoJSON Overlay'], function(geojson) {
            var props = {};

            if (c['GeoJSON Feature Properties']) {
              var propsArray = c['GeoJSON Feature Properties'].split(';');
              for (var p in propsArray) {
                if (propsArray[p].split(':').length === 2) {
                  props[ propsArray[p].split(':')[0].trim() ] = propsArray[p].split(':')[1].trim();
                }
              }
            }

            geoJsonOverlay = L.geoJson(geojson, {
              style: function(feature) {
                return {
                  fillColor: feature.properties.fillColor || props.fillColor || '#ffffff',
                  weight: feature.properties.weight || props.weight || 1,
                  opacity: feature.properties.opacity || props.opacity || 0.5,
                  color: feature.properties.color || props.color || '#cccccc',
                  fillOpacity: feature.properties.fillOpacity || props.fillOpacity || 0.5,
                }
              }
            }).addTo(map);
          });
        }

        if (c['Latitude'] && c['Longitude']) {
          var zoom = c['Zoom'] ? c['Zoom'] : CHAPTER_ZOOM;
          map.flyTo([c['Latitude'], c['Longitude']], zoom, {
            animate: true,
            duration: 2,
          });
        }

        break;
      }
    }
  });

  $('#contents').append('<div id="space-at-the-bottom"><a href="#top"><i class="fa fa-chevron-up"></i><br><small>Top</small></a></div>');

  $("<style>")
    .prop("type", "text/css")
    .html("\
    #narration, #title {\
      background-color: " + trySetting('_narrativeBackground', 'white') + "; \
      color: " + trySetting('_narrativeText', 'black') + "; \
    }\
    a, a:visited, a:hover {\
      color: " + trySetting('_narrativeLink', 'blue') + " \
    }\
    .in-focus {\
      background-color: " + trySetting('_narrativeActive', '#f0f0f0') + " \
    }")
    .appendTo("head");

  endPixels = parseInt(getSetting('_pixelsAfterFinalChapter'));
  if (endPixels > 100) {
    $('#space-at-the-bottom').css({
      'height': (endPixels / 2) + 'px',
      'padding-top': (endPixels / 2) + 'px',
    });
  }

  var bounds = [];
  for (var i in markers) {
    if (markers[i]) {
      markers[i].addTo(map);
      markers[i]['_pixelsAbove'] = pixelsAbove[i];
      markers[i].on('click', function() {
        var pixels = parseInt($(this)[0]['_pixelsAbove']) + 5;
        $('div#contents').animate({
          scrollTop: pixels + 'px'});
      });
      bounds.push(markers[i].getLatLng());
    }
  }
  map.fitBounds(bounds);

  $('#map, #narration, #title').css('visibility', 'visible');
    $('div.loader').css('visibility', 'hidden');

    $('div#container0').addClass("in-focus");
    $('div#contents').animate({scrollTop: '1px'});

    // On first load, check hash and if it contains a number, scroll down
    if (parseInt(location.hash.substr(1))) {
      var containerId = parseInt(location.hash.substr(1)) - 1;
      $('#contents').animate({
        scrollTop: $('#container' + containerId).offset().top
      }, 2000);
    }

    // Add Google Analytics if the ID exists
    var ga = getSetting('_googleAnalytics');
    if (ga && ga.length >= 10) {
      var gaScript = document.createElement('script');
      gaScript.setAttribute('src', 'https://www.googletagmanager.com/gtag/js?id=' + ga);
      document.head.appendChild(gaScript);

      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', ga);
    }

    // Load tiles
    addBaseMap();

    // Add zoom controls if needed
    if (getSetting('_zoomControls') !== 'off') {
      L.control.zoom({
        position: getSetting('_zoomControls')
      }).addTo(map);
    }

    // Add markers and fit map to their bounds
    var bounds = [];
    for (var i in markers) {
      if (markers[i]) {
        markers[i].addTo(map);
        markers[i]['_pixelsAbove'] = pixelsAbove[i];
        markers[i].on('click', function() {
          var pixels = parseInt($(this)[0]['_pixelsAbove']) + 5;
          $('div#contents').animate({
            scrollTop: pixels + 'px'
          });
        });
        bounds.push(markers[i].getLatLng());
      }
    }
    map.fitBounds(bounds);

    // Update markers to reflect initial time
    updateMarkers();
  }

  /**
   * Changes map attribution (author, GitHub repo, email etc.) in bottom-right
   */
  function changeAttribution() {
    var attributionHTML = $('.leaflet-control-attribution')[0].innerHTML;
    var credit = 'View <a href="'
      + (typeof googleDocURL !== 'undefined' && googleDocURL ? googleDocURL : './csv/Chapters.csv')
      + '" target="_blank">data</a>';

    var name = getSetting('_authorName');
    var url = getSetting('_authorURL');

    if (name && url) {
      if (url.indexOf('@') > 0) { url = 'mailto:' + url; }
      credit += ' by <a href="' + url + '">' + name + '</a> | ';
    } else if (name) {
      credit += ' by ' + name + ' | ';
    } else {
      credit += ' | ';
    }

    credit += 'View <a href="' + getSetting('_githubRepo') + '">code</a>';
    if (getSetting('_codeCredit')) credit += ' by ' + getSetting('_codeCredit');
    credit += ' with ';
    $('.leaflet-control-attribution')[0].innerHTML = credit + attributionHTML;
  }

  /**
   * Loads the basemap and adds it to the map
   */
  function addBaseMap() {
    var basemap = trySetting('_tileProvider', 'Stamen.TonerLite');
    L.tileLayer.provider(basemap, {
      maxZoom: 18,
      apikey: trySetting('_mapboxApiKey', 'yourApiKey'),
      accessToken: trySetting('_mapboxApiKey', 'yourApiKey')
    }).addTo(map);
  }

  // Helper functions for setting and getting document settings
  function createDocumentSettings(settings) {
    for (var i in settings) {
      var setting = settings[i];
      documentSettings[setting.Setting] = setting.Customize;
    }
  }

  function getSetting(s) {
    return documentSettings[constants[s]];
  }

  function trySetting(s, def) {
    s = getSetting(s);
    if (!s || s.trim() === '') { return def; }
    return s;
  }
});