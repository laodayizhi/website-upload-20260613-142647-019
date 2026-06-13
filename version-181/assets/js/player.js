function initMoviePlayer(source) {
    var video = document.getElementById('movie-player');
    var button = document.getElementById('movie-play-button');
    var loaded = false;
    var hls = null;

    if (!video || !button || !source) {
        return;
    }

    function loadVideo() {
        if (loaded) {
            return;
        }
        loaded = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (typeof Hls !== 'undefined' && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }
    }

    function startPlayback() {
        loadVideo();
        button.classList.add('is-hidden');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    button.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        }
    });
    video.addEventListener('play', function () {
        button.classList.add('is-hidden');
    });
    video.addEventListener('error', function () {
        if (hls && typeof hls.destroy === 'function') {
            hls.destroy();
            hls = null;
        }
        loaded = false;
    });
}
