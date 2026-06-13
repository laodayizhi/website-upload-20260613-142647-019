(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  ready(function () {
    var navToggle = document.querySelector("[data-nav-toggle]");
    var navLinks = document.querySelector("[data-nav-links]");

    if (navToggle && navLinks) {
      navToggle.addEventListener("click", function () {
        navLinks.classList.toggle("open");
      });
    }

    var slider = document.querySelector("[data-hero-slider]");

    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var timer = null;

      function showSlide(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === current);
        });
      }

      function startTimer() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          showSlide(current + 1);
        }, 5000);
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showSlide(index);
          startTimer();
        });
      });

      if (slides.length > 1) {
        showSlide(0);
        startTimer();
      }
    }

    document.querySelectorAll("[data-filter]").forEach(function (panel) {
      var target = panel.getAttribute("data-filter");
      var grid = document.querySelector(target);
      if (!grid) {
        return;
      }

      var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
      var searchInput = panel.querySelector("[data-filter-search]");
      var yearSelect = panel.querySelector("[data-filter-year]");
      var typeSelect = panel.querySelector("[data-filter-type]");
      var regionSelect = panel.querySelector("[data-filter-region]");

      function applyFilter() {
        var keyword = normalize(searchInput && searchInput.value);
        var year = normalize(yearSelect && yearSelect.value);
        var type = normalize(typeSelect && typeSelect.value);
        var region = normalize(regionSelect && regionSelect.value);

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchYear = !year || normalize(card.getAttribute("data-year")) === year;
          var matchType = !type || normalize(card.getAttribute("data-type")) === type;
          var matchRegion = !region || normalize(card.getAttribute("data-region")) === region;
          card.classList.toggle("is-filter-hidden", !(matchKeyword && matchYear && matchType && matchRegion));
        });
      }

      [searchInput, yearSelect, typeSelect, regionSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilter);
          control.addEventListener("change", applyFilter);
        }
      });
    });
  });
})();
