(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.site-nav');

    if (menuButton && nav) {
        menuButton.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    document.querySelectorAll('.search-form').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                return;
            }
            event.preventDefault();
            location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
        });
    });

    var carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
        var index = 0;

        function showSlide(next) {
            if (!slides.length) {
                return;
            }
            slides[index].classList.remove('active');
            if (dots[index]) {
                dots[index].classList.remove('active');
            }
            index = (next + slides.length) % slides.length;
            slides[index].classList.add('active');
            if (dots[index]) {
                dots[index].classList.add('active');
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }
    }

    document.querySelectorAll('[data-filter-list]').forEach(function (list) {
        var scope = list.closest('section') || document;
        var input = scope.querySelector('.local-filter');
        var year = scope.querySelector('.filter-year');
        var type = scope.querySelector('.filter-type');
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var yearValue = year ? year.value : '';
            var typeValue = type ? type.value : '';

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-tags') || '',
                    card.getAttribute('data-genre') || '',
                    card.getAttribute('data-year') || '',
                    card.getAttribute('data-type') || ''
                ].join(' ').toLowerCase();
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchYear = !yearValue || (card.getAttribute('data-year') || '') === yearValue;
                var cardType = card.getAttribute('data-type') || '';
                var matchType = !typeValue || cardType === typeValue || (typeValue === '电视剧' && cardType === '剧集');
                card.classList.toggle('is-hidden-by-filter', !(matchKeyword && matchYear && matchType));
            });
        }

        [input, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    });
})();
