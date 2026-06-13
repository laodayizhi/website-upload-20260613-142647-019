(function () {
    var menuButton = document.querySelector('.mobile-menu-button');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;

        function activate(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                activate(Number(dot.getAttribute('data-hero-dot') || 0));
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                activate(index + 1);
            }, 5000);
        }
    });

    document.querySelectorAll('[data-search-area]').forEach(function (area) {
        var input = area.querySelector('.movie-search');
        var yearSelect = area.querySelector('.movie-filter-year');
        var scope = area.parentElement || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));

        function matchesYear(card, value) {
            var year = Number(card.getAttribute('data-year') || 0);
            if (!value) {
                return true;
            }
            if (value === 'older') {
                return year <= 2021;
            }
            return String(year) === value;
        }

        function filterCards() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var yearValue = yearSelect ? yearSelect.value : '';
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-tags'),
                    card.textContent
                ].join(' ').toLowerCase();
                var visible = (!keyword || haystack.indexOf(keyword) !== -1) && matchesYear(card, yearValue);
                card.classList.toggle('is-hidden', !visible);
            });
        }

        if (input) {
            input.addEventListener('input', filterCards);
        }
        if (yearSelect) {
            yearSelect.addEventListener('change', filterCards);
        }
    });
})();

(function (global) {
    function initPlayer(options) {
        if (!options || !options.source) {
            return;
        }

        var video = document.getElementById(options.videoId);
        var button = document.getElementById(options.buttonId);
        var cover = document.getElementById(options.coverId);
        var source = options.source;
        var loaded = false;
        var hlsInstance = null;

        if (!video || !button) {
            return;
        }

        function loadSource() {
            if (loaded) {
                return;
            }
            loaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (global.Hls && global.Hls.isSupported()) {
                hlsInstance = new global.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function startPlayback() {
            loadSource();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    if (cover) {
                        cover.classList.remove('is-hidden');
                    }
                });
            }
        }

        button.addEventListener('click', function (event) {
            event.preventDefault();
            startPlayback();
        });

        if (cover) {
            cover.addEventListener('click', function (event) {
                if (event.target !== button) {
                    startPlayback();
                }
            });
        }

        video.addEventListener('play', function () {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        });

        video.addEventListener('emptied', function () {
            loaded = false;
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }

    global.FilmPlayer = {
        init: initPlayer
    };
})(window);
