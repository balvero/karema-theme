// algolia-search.js
(function () {
  function headerSearch() {
    const input = document.querySelector('#header-search-input');
    const resultsContainer = document.querySelector('#algolia-search-results');
    const noResultsContainer = document.querySelector('#no-results');

    const paginationContainer =
      document.querySelector('.algolia-pagination') ||
      document.querySelector('[data-algolia-pagination]');

    if (!input || !resultsContainer) return;

    // Disable Enter key submit
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        return false;
      }
      if (e.key === 'Escape') {
        input.value = '';
        clearUI();
        input.blur();
      }
    });

    // Disable form submit (if inside form)
    const form = input.closest('form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        return false;
      });
    }

    // Safety checks (keep your gts usage as-is)
    if (typeof algoliasearch !== 'function') {
      console.error('Algolia client missing. Include algoliasearch-lite before this script.');
      return;
    }
    if (!gts?.text_algolia_app_id || !gts?.text_algolia_api_key || !gts?.text_algolia_index_name) {
      console.error('Missing gts config (text_algolia_app_id / text_algolia_api_key / text_algolia_index_name).');
      return;
    }

    const searchClient = algoliasearch(gts.text_algolia_app_id, gts.text_algolia_api_key);
    const index = searchClient.initIndex(gts.text_algolia_index_name);

    const HITS_PER_PAGE = 6;
    const DEBOUNCE_MS = 150;
    const MIN_CHARS = 2;

    let debounceTimeout;
    let currentQuery = '';
    let currentPage = 0; // Algolia pages are 0-based
    let totalPages = 0;

    // Match your CSS breakpoint (63.9375em ≈ 1023px at 16px base)
    const MOBILE_MQ = window.matchMedia('(max-width: 63.9375em)');
    const isMobile = () => MOBILE_MQ.matches;

    // If breakpoint changes, re-render controls appropriately
    if (MOBILE_MQ.addEventListener) {
      MOBILE_MQ.addEventListener('change', () => {
        // Move controls to correct place for current viewport
        renderPagination();
      });
    }

    // Delegated click handler:
    // - Desktop: paginationContainer [data-page]
    // - Mobile: resultsContainer [data-load-more]
    if (paginationContainer) {
      paginationContainer.addEventListener('click', function (e) {
        const btn = e.target.closest('[data-page]');
        if (!btn) return;

        // Ignore desktop paging clicks when in mobile mode (mobile uses load more)
        if (isMobile()) return;

        e.preventDefault();

        const nextPage = parseInt(btn.getAttribute('data-page'), 10);
        if (Number.isNaN(nextPage) || nextPage === currentPage) return;
        if (nextPage < 0) return;
        if (totalPages && nextPage > totalPages - 1) return;

        runSearch(currentQuery, nextPage, { append: false });
      });
    }

    // Mobile "Load more" lives inside resultsContainer now
    resultsContainer.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-load-more]');
      if (!btn) return;

      // Ignore when not in mobile mode
      if (!isMobile()) return;

      e.preventDefault();

      if (!currentQuery) return;
      if (currentPage >= totalPages - 1) return;

      runSearch(currentQuery, currentPage + 1, { append: true });
    });

    input.addEventListener('input', function () {
      const query = this.value.trim();
      clearTimeout(debounceTimeout);

      currentQuery = query;
      currentPage = 0;
      totalPages = 0;

      if (!query || query.length < MIN_CHARS) {
        clearUI();
        return;
      }

      debounceTimeout = setTimeout(() => runSearch(query, 0, { append: false }), DEBOUNCE_MS);
    });

    function clearUI() {
      resultsContainer.innerHTML = '';
      resultsContainer.classList.remove('hits');
      if (noResultsContainer) noResultsContainer.innerHTML = '';
      if (paginationContainer) paginationContainer.innerHTML = '';
    }

    function runSearch(query, page, opts = { append: false }) {
      index
        .search(query, {
          page,
          hitsPerPage: HITS_PER_PAGE,
          attributesToRetrieve: ['title', 'url', 'images', 'description', 'active'],
          filters: gts.text_algolia_filters,
        })
        .then(({ hits, nbPages }) => {
          totalPages = nbPages || 0;

          // On mobile append: remove existing load-more row before appending,
          // so the button stays at the bottom.
          if (opts.append && isMobile()) {
            removeLoadMoreRow();
          }

          currentPage = page;

          // Mobile append vs replace
          if (opts.append) {
            if (!hits || !hits.length) {
              renderPagination();
              return;
            }

            resultsContainer.classList.add('hits');
            if (noResultsContainer) noResultsContainer.innerHTML = '';
            appendResults(hits);
            renderPagination();
            return;
          }

          renderResults(hits || []);
          renderPagination();
        })
        .catch((err) => console.error('Algolia search error:', err));
    }

    function renderResults(hits) {
      resultsContainer.innerHTML = '';

      if (!hits.length) {
        resultsContainer.classList.remove('hits');
        if (noResultsContainer) noResultsContainer.innerHTML = 'Ingen resultater fundet';
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
      }

      resultsContainer.classList.add('hits');
      if (noResultsContainer) noResultsContainer.innerHTML = '';

      const frag = document.createDocumentFragment();
      hits.forEach((item) => frag.appendChild(buildHitEl(item)));
      resultsContainer.appendChild(frag);
    }

    function appendResults(hits) {
      const frag = document.createDocumentFragment();
      hits.forEach((item) => frag.appendChild(buildHitEl(item)));
      resultsContainer.appendChild(frag);
    }

    function buildHitEl(item) {
		//console.log('image field:', item.image); // ← add this
       const image =
	  (item.images?.[0]?.url || '').replace(/^http:\/\//, 'https://') ||
	  'https://cdn.ecommercedns.uk/no-image.png';

      const description = (item.description || '')
        .replace(/<[^>]+>/g, '')
        .slice(0, 150);

      const el = document.createElement('div');
      el.className = 'algolia-result-item';

      el.innerHTML = `
        <article class="item-box product-box">
          <a href="${item.url}" class="image-link" data-fit="0">
            <div class="item-image">
              <img src="${image}" alt="${item.title}" class="item-img">
            </div>
          </a>
          <div>
            <h3 class="item-title"><a href="${item.url}">${item.title}</a></h3>
            <p class="item-description">${description}</p>
          </div>
        </article>
      `;

      return el;
    }

    // --- Mobile load more row helpers ---
    function removeLoadMoreRow() {
      const existing = resultsContainer.querySelector('.algolia-load-more-row');
      if (existing) existing.remove();
    }

    function renderLoadMoreRow() {
      removeLoadMoreRow();

      const hasMore = currentPage < totalPages - 1;
      if (!hasMore) return;

      const row = document.createElement('div');
      row.className = 'algolia-load-more-row';
      row.innerHTML = `
        <button type="button" class="algolia-load-more button border" data-load-more="1">
          Vis flere
        </button>
      `;
      resultsContainer.appendChild(row);
    }

    function renderPagination() {
      // If no pagination container at all, still render mobile load-more row in-grid
      if (!totalPages || totalPages <= 1) {
        if (paginationContainer) paginationContainer.innerHTML = '';
        removeLoadMoreRow();
        return;
      }

      // Mobile: put Load more as last row INSIDE results grid
      if (isMobile()) {
        if (paginationContainer) paginationContainer.innerHTML = ''; // hide page numbers on mobile
        renderLoadMoreRow();
        return;
      }

      // Desktop: remove in-grid load more and show numbered pagination
      removeLoadMoreRow();
      if (!paginationContainer) return;

      const maxButtons = 5;
      let start = Math.max(0, currentPage - Math.floor(maxButtons / 2));
      let end = start + maxButtons - 1;

      if (end > totalPages - 1) {
        end = totalPages - 1;
        start = Math.max(0, end - (maxButtons - 1));
      }

      const parts = [];

      parts.push(`
        <button type="button"
                class="algolia-page-btn algolia-prev ${currentPage === 0 ? 'is-disabled' : ''}"
                data-page="${currentPage - 1}"
                ${currentPage === 0 ? 'disabled' : ''}>
          &lt;
        </button>
      `);

      if (start > 0) {
        parts.push(pageButton(0, currentPage));
        if (start > 1) parts.push(`<span class="algolia-ellipsis">…</span>`);
      }

      for (let p = start; p <= end; p++) {
        parts.push(pageButton(p, currentPage));
      }

      if (end < totalPages - 1) {
        if (end < totalPages - 2) parts.push(`<span class="algolia-ellipsis">…</span>`);
        parts.push(pageButton(totalPages - 1, currentPage));
      }

      parts.push(`
        <button type="button"
                class="algolia-page-btn algolia-next ${currentPage >= totalPages - 1 ? 'is-disabled' : ''}"
                data-page="${currentPage + 1}"
                ${currentPage >= totalPages - 1 ? 'disabled' : ''}>
          &gt;
        </button>
      `);

      paginationContainer.innerHTML = `
        <nav class="algolia-pagination-nav" aria-label="Search results pagination">
          ${parts.join('')}
        </nav>
      `;
    }

    function pageButton(pageZeroBased, activePageZeroBased) {
      const label = pageZeroBased + 1;
      const isActive = pageZeroBased === activePageZeroBased;

      return `
        <button type="button"
                class="algolia-page-btn algolia-page ${isActive ? 'is-active' : ''}"
                data-page="${pageZeroBased}"
                ${isActive ? 'aria-current="page"' : ''}>
          ${label}
        </button>
      `;
    }
  }

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(headerSearch);
})();
