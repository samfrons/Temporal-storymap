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

function addMultimediaToChapter(container, chapter) {
  var mediaLinks = chapter['Media Link'] ? chapter['Media Link'].split(',').map(item => item.trim()) : [];
  var mediaCredits = chapter['Media Credit'] ? chapter['Media Credit'].split(',').map(item => item.trim()) : [];
  var mediaCreditLinks = chapter['Media Credit Link'] ? chapter['Media Credit Link'].split(',').map(item => item.trim()) : [];

  for (var j = 0; j < mediaLinks.length; j++) {
    var mediaElement = createMediaElement(mediaLinks[j], mediaCredits[j] || '', mediaCreditLinks[j] || '');
    if (mediaElement) {
      container.append(mediaElement);
    }
  }
}



//






