(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function text(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function initMenu() {
        var toggle = qs('[data-menu-toggle]');
        var panel = qs('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHeroCarousel() {
        var carousel = qs('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = qsa('.hero-slide', carousel);
        var dots = qsa('.hero-dot', carousel);
        var activeIndex = 0;
        var timer;

        function show(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(activeIndex + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function getQueryValue(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || '';
    }

    function initFilters() {
        var panel = qs('[data-filter-panel]');
        var list = qs('[data-card-list]');
        if (!panel || !list) {
            return;
        }
        var keywordInput = qs('[data-page-search]', panel);
        var kindSelect = qs('[data-filter-kind]', panel);
        var yearSelect = qs('[data-filter-year]', panel);
        var regionSelect = qs('[data-filter-region]', panel);
        var clearButton = qs('[data-clear-filter]', panel);
        var countNode = qs('[data-filter-count]', panel);
        var cards = qsa('.movie-card', list);
        var initialQuery = getQueryValue('q');

        if (keywordInput && initialQuery) {
            keywordInput.value = initialQuery;
        }

        function cardText(card) {
            return text([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-kind'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags'),
                card.textContent
            ].join(' '));
        }

        function apply() {
            var keyword = text(keywordInput && keywordInput.value);
            var kind = text(kindSelect && kindSelect.value);
            var year = text(yearSelect && yearSelect.value);
            var region = text(regionSelect && regionSelect.value);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = cardText(card);
                var match = true;
                if (keyword && haystack.indexOf(keyword) === -1) {
                    match = false;
                }
                if (kind && text(card.getAttribute('data-kind')).indexOf(kind) === -1) {
                    match = false;
                }
                if (year && text(card.getAttribute('data-year')).indexOf(year) === -1) {
                    match = false;
                }
                if (region && text(card.getAttribute('data-region')).indexOf(region) === -1) {
                    match = false;
                }
                card.classList.toggle('is-filter-hidden', !match);
                if (match) {
                    visible += 1;
                }
            });

            if (countNode) {
                countNode.textContent = '当前显示 ' + visible + ' 部内容';
            }
        }

        [keywordInput, kindSelect, yearSelect, regionSelect].forEach(function (node) {
            if (node) {
                node.addEventListener('input', apply);
                node.addEventListener('change', apply);
            }
        });

        if (clearButton) {
            clearButton.addEventListener('click', function () {
                if (keywordInput) {
                    keywordInput.value = '';
                }
                if (kindSelect) {
                    kindSelect.value = '';
                }
                if (yearSelect) {
                    yearSelect.value = '';
                }
                if (regionSelect) {
                    regionSelect.value = '';
                }
                apply();
            });
        }

        apply();
    }

    function initVideoPlayer(sourceUrl) {
        var video = document.getElementById('movie-player');
        var cover = qs('[data-player-cover]');
        var message = qs('[data-player-message]');
        var started = false;
        var hlsInstance = null;

        if (!video || !sourceUrl) {
            return;
        }

        function setMessage(value) {
            if (message) {
                message.textContent = value || '';
            }
        }

        function attachSource() {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                if (video.src !== sourceUrl) {
                    video.src = sourceUrl;
                }
                return Promise.resolve();
            }

            if (window.Hls && window.Hls.isSupported()) {
                if (!hlsInstance) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(sourceUrl);
                    hlsInstance.attachMedia(video);
                }
                return Promise.resolve();
            }

            setMessage('播放暂时不可用，请稍后重试。');
            return Promise.reject(new Error('unsupported'));
        }

        function startPlayback() {
            if (started) {
                return;
            }
            started = true;
            setMessage('');
            attachSource().then(function () {
                video.controls = true;
                if (cover) {
                    cover.classList.add('is-hidden');
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        started = false;
                        if (cover) {
                            cover.classList.remove('is-hidden');
                        }
                    });
                }
            }).catch(function () {
                started = false;
            });
        }

        if (cover) {
            cover.addEventListener('click', startPlayback);
        }
        video.addEventListener('click', function () {
            if (!started) {
                startPlayback();
            }
        });
    }

    window.initVideoPlayer = initVideoPlayer;

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHeroCarousel();
        initFilters();
    });
})();
