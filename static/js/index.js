window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;

var interp_images = [];
function preloadInterpolationImages() {
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
    interp_images[i] = new Image();
    interp_images[i].src = path;
  }
}

function setInterpolationImage(i) {
  var image = interp_images[i];
  image.ondragstart = function() { return false; };
  image.oncontextmenu = function() { return false; };
  $('#interpolation-image-wrapper').empty().append(image);
}


$(document).ready(function() {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");

    });

    var options = {
			slidesToScroll: 1,
			slidesToShow: 3,
			loop: true,
			infinite: true,
			autoplay: false,
			autoplaySpeed: 3000,
    }

		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);

    // Loop on each carousel initialized
    for(var i = 0; i < carousels.length; i++) {
    	// Add listener to  event
    	carousels[i].on('before:show', state => {
    		console.log(state);
    	});
    }

    // Access to bulmaCarousel instance of an element
    var element = document.querySelector('#my-element');
    if (element && element.bulmaCarousel) {
    	// bulmaCarousel instance is available as element.bulmaCarousel
    	element.bulmaCarousel.on('before-show', function(state) {
    		console.log(state);
    	});
    }

    /*var player = document.getElementById('interpolation-video');
    player.addEventListener('loadedmetadata', function() {
      $('#interpolation-slider').on('input', function(event) {
        console.log(this.value, player.duration);
        player.currentTime = player.duration / 100 * this.value;
      })
    }, false);*/
    preloadInterpolationImages();

    $('#interpolation-slider').on('input', function(event) {
      setInterpolationImage(this.value);
    });
    setInterpolationImage(0);
    $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);

    bulmaSlider.attach();

})

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.sync-video-pair').forEach(function (pair) {
    const master = pair.querySelector('.sync-master');
    const slave = pair.querySelector('.sync-slave');

    if (!master || !slave) {
      return;
    }

    function syncAndPlay() {
      slave.currentTime = master.currentTime;
      slave.play().catch(function () {});
    }

    master.addEventListener('play', syncAndPlay);
    master.addEventListener('playing', syncAndPlay);
    master.addEventListener('pause', function () {
      slave.pause();
    });
    master.addEventListener('waiting', function () {
      slave.pause();
    });
    master.addEventListener('seeking', function () {
      slave.currentTime = master.currentTime;
    });
    master.addEventListener('seeked', function () {
      slave.currentTime = master.currentTime;
    });
    master.addEventListener('ratechange', function () {
      slave.playbackRate = master.playbackRate;
    });
    master.addEventListener('timeupdate', function () {
      if (Math.abs(slave.currentTime - master.currentTime) >= 0.08) {
        slave.currentTime = master.currentTime;
      }
    });

    if (!master.paused) {
      syncAndPlay();
    }
  });

  const master = document.getElementById('result-output-video');
  const slave = document.getElementById('result-input-video');
  const masterSource = document.getElementById('result-output-source');
  const slaveSource = document.getElementById('result-input-source');
  const thumbs = document.querySelectorAll('.result-thumb');

  if (!master || !slave || !masterSource || !slaveSource || !thumbs.length) {
    return;
  }

  function waitForMetadata(video) {
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      return Promise.resolve();
    }

    return new Promise(function (resolve) {
      video.addEventListener('loadedmetadata', resolve, { once: true });
    });
  }

  thumbs.forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      const outputPath = this.dataset.output;
      const inputPath = this.dataset.input;

      if (!outputPath || !inputPath) {
        return;
      }

      master.pause();
      masterSource.src = outputPath;
      slaveSource.src = inputPath;

      master.load();
      slave.load();

      Promise.all([waitForMetadata(master), waitForMetadata(slave)])
        .then(function () {
          master.currentTime = 0;
          slave.currentTime = 0;
          return master.play();
        })
        .catch(function () {});

      thumbs.forEach(function (t) {
        t.classList.remove('is-active');
      });
      this.classList.add('is-active');
    });
  });
});
