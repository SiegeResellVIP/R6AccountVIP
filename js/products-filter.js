// products-filter.js
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.product-grid');
  if (!grid) return;

  const items = Array.from(grid.children);
  const sortBy = document.getElementById('sort-by');
  const filterPlatform = document.getElementById('filter-platform');
  const filterRank = document.getElementById('filter-rank');
  const noResults = document.getElementById('no-results-message');
  const clearBtn = document.getElementById('clear-filters-button');

  const rankOrderMap = {
    unranked: 0, copper: 1, bronze: 2, silver: 3,
    gold: 4, platinum: 5, diamond: 6,
    champion: 7, collector: 8
  };

  function apply() {
    let curr = items.slice();
    if (filterPlatform.value !== 'all') {
      curr = curr.filter(p => p.dataset.platform === filterPlatform.value);
    }
    if (filterRank.value !== 'all') {
      curr = curr.filter(p => p.dataset.rank === filterRank.value);
    }
    if (sortBy.value !== 'default') {
      curr.sort((a,b) => {
        if (sortBy.value.includes('price')) {
          const pa = +a.dataset.priceValue, pb = +b.dataset.priceValue;
          return sortBy.value==='price-asc' ? pa-pb : pb-pa;
        }
        const ra = rankOrderMap[a.dataset.rank],
              rb = rankOrderMap[b.dataset.rank];
        return sortBy.value==='rank-asc' ? ra-rb : rb-ra;
      });
    }
    grid.innerHTML = '';
    if (curr.length === 0) {
      noResults.style.display = 'block';
    } else {
      noResults.style.display = 'none';
      curr.forEach(n => grid.appendChild(n));
    }
  }

  function clearAll() {
    sortBy.value = 'default';
    filterPlatform.value = 'all';
    filterRank.value = 'all';
    apply();
  }

  sortBy.addEventListener('change', apply);
  filterPlatform.addEventListener('change', apply);
  filterRank.addEventListener('change', apply);
  clearBtn.addEventListener('click', clearAll);
  apply();
});