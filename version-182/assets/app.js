(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var opened = panel.classList.toggle("is-open");
      button.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function initHeroCarousel() {
    var carousel = document.querySelector(".hero-carousel");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 4600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        stop();
        show(index);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initCardFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll(".js-card-filter"));
    inputs.forEach(function (input) {
      var target = document.querySelector(input.getAttribute("data-target"));
      var empty = document.querySelector(input.getAttribute("data-empty"));
      if (!target) {
        return;
      }
      var cards = Array.prototype.slice.call(target.querySelectorAll(".movie-card"));
      input.addEventListener("input", function () {
        var value = input.value.trim().toLowerCase();
        var shown = 0;
        cards.forEach(function (card) {
          var text = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || "")).toLowerCase();
          var visible = !value || text.indexOf(value) >= 0;
          card.style.display = visible ? "" : "none";
          if (visible) {
            shown += 1;
          }
        });
        if (empty) {
          empty.style.display = shown ? "none" : "block";
        }
      });
    });
  }

  function renderSearch() {
    var box = document.querySelector(".search-results");
    var input = document.querySelector(".search-input-main");
    if (!box || !input || !window.MOVIE_SEARCH_DATA) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function card(item) {
      return [
        "<article class=\"movie-card\">",
        "  <a href=\"" + item.url + "\" class=\"movie-cover\">",
        "    <img src=\"" + item.cover + "\" alt=\"" + item.title.replace(/\"/g, "&quot;") + "\" loading=\"lazy\">",
        "    <span class=\"cover-label\">" + item.region + "</span>",
        "  </a>",
        "  <div class=\"movie-card-body\">",
        "    <h3><a href=\"" + item.url + "\">" + item.title + "</a></h3>",
        "    <p>" + item.one_line + "</p>",
        "    <div class=\"movie-meta\"><span>" + item.year + "</span><span>" + item.type + "</span><span>" + item.category + "</span></div>",
        "  </div>",
        "</article>"
      ].join("\n");
    }

    function search() {
      var query = input.value.trim().toLowerCase();
      var items = window.MOVIE_SEARCH_DATA;
      var results = query ? items.filter(function (item) {
        return item.search.indexOf(query) >= 0;
      }).slice(0, 96) : items.slice(0, 48);
      box.innerHTML = results.length ? results.map(card).join("\n") : "<div class=\"category-empty\" style=\"display:block\">未找到匹配影片</div>";
    }

    input.addEventListener("input", search);
    search();
  }

  window.initMoviePlayer = function (source, videoId, layerId, buttonId) {
    var video = document.getElementById(videoId);
    var layer = document.getElementById(layerId);
    var button = document.getElementById(buttonId);
    var message = layer ? layer.querySelector(".player-message") : null;
    var loaded = false;
    var hls = null;

    if (!video || !layer || !button) {
      return;
    }

    function setMessage(text) {
      if (message) {
        message.textContent = text || "";
      }
    }

    function fail() {
      layer.classList.remove("is-hidden");
      setMessage("暂时无法播放，请稍后再试。");
    }

    function loadVideo(done) {
      if (loaded) {
        done();
        return;
      }
      loaded = true;
      setMessage("加载中...");
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          done();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            fail();
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", function onLoaded() {
          video.removeEventListener("loadedmetadata", onLoaded);
          done();
        });
        video.addEventListener("error", fail);
        video.load();
      } else {
        fail();
      }
    }

    function play() {
      loadVideo(function () {
        layer.classList.add("is-hidden");
        video.controls = true;
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            layer.classList.remove("is-hidden");
            setMessage("点击播放按钮继续观看。");
          });
        }
      });
    }

    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      play();
    });

    layer.addEventListener("click", play);

    video.addEventListener("click", function () {
      if (!loaded) {
        play();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    initMenu();
    initHeroCarousel();
    initCardFilters();
    renderSearch();
  });
})();
