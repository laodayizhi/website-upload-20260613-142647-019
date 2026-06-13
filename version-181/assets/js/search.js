(function () {
    var params = new URLSearchParams(location.search);
    var query = (params.get('q') || '').trim();
    var input = document.querySelector('.big-search input[name="q"]');
    var heading = document.getElementById('search-heading');
    var results = document.getElementById('search-results');

    if (input) {
        input.value = query;
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function card(item) {
        return '<article class="movie-card">' +
            '<a class="movie-card-cover" href="' + escapeHtml(item.url) + '">' +
            '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
            '<span class="movie-badge">' + escapeHtml(item.year) + '</span>' +
            '</a>' +
            '<div class="movie-card-body">' +
            '<div class="movie-meta-line"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
            '<h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>' +
            '<p>' + escapeHtml(item.description || item.summary) + '</p>' +
            '<div class="tag-row"><span>' + escapeHtml(item.category) + '</span><span>' + escapeHtml(item.year) + '</span></div>' +
            '</div>' +
            '</article>';
    }

    if (!query || !results || typeof MOVIE_INDEX === 'undefined') {
        return;
    }

    var lower = query.toLowerCase();
    var matched = MOVIE_INDEX.filter(function (item) {
        return [
            item.title,
            item.description,
            item.summary,
            item.tags,
            item.genre,
            item.region,
            item.type,
            item.year,
            item.category
        ].join(' ').toLowerCase().indexOf(lower) !== -1;
    }).slice(0, 120);

    if (heading) {
        heading.textContent = matched.length ? '搜索结果' : '暂无匹配内容';
    }

    results.innerHTML = matched.length ? matched.map(card).join('') : '<div class="content-main"><h2>暂无匹配内容</h2><p>可以尝试使用更短的片名、题材、地区或年份继续搜索。</p><a class="btn btn-primary" href="./categories.html">浏览分类</a></div>';
})();
