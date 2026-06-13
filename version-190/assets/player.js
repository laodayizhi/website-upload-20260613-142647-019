(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var video = document.getElementById("moviePlayer");
    var overlay = document.querySelector("[data-player-overlay]");

    if (!video) {
      return;
    }

    var source = video.getAttribute("data-play");
    var prepared = false;
    var hls = null;

    function prepare() {
      if (prepared || !source) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        prepared = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        prepared = true;
        return;
      }

      video.src = source;
      prepared = true;
    }

    function startPlayback() {
      prepare();
      video.setAttribute("controls", "controls");
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var request = video.play();
      if (request && typeof request.catch === "function") {
        request.catch(function () {
          video.setAttribute("controls", "controls");
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
  });
})();
