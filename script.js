// script.js - This file will contain all your custom JavaScript for the website.

document.addEventListener('DOMContentLoaded', function() {
    // --- Header Hide on Scroll (Mobile Only) ---
    const header = document.querySelector('header');
    let lastScrollY = window.scrollY;
    let ticking = false;

    // This function checks if the screen width is considered "mobile" (<= 768px)
    const isMobile = () => window.innerWidth <= 768; // Matches your CSS breakpoint for mobile

    function updateHeaderVisibility() {
        const currentScrollY = window.scrollY;

        // Condition to HIDE the header:
        // 1. It's a mobile screen (isMobile() is true)
        // 2. We are scrolling DOWN (currentScrollY > lastScrollY)
        // 3. We have scrolled past the header's initial height (to prevent it hiding immediately at the top)
        if (isMobile() && currentScrollY > lastScrollY && currentScrollY > header.offsetHeight) {
            header.classList.add('header-hidden'); // Add the CSS class to hide it
        }
        // Condition to SHOW the header:
        // 1. It's a mobile screen (isMobile() is true)
        // 2. We are scrolling UP (currentScrollY < lastScrollY)
        // 3. We have scrolled up by at least 50 pixels (to prevent flickering with tiny scrolls)
        else if (isMobile() && currentScrollY < lastScrollY && currentScrollY < (lastScrollY - 50)) {
            header.classList.remove('header-hidden'); // Remove the CSS class to show it
        }
        // If it's NOT a mobile screen (i.e., desktop), always ensure the header is visible
        else if (!isMobile()) {
            header.classList.remove('header-hidden');
        }

        // Update the last scroll position for the next scroll event
        lastScrollY = currentScrollY;
        // Reset ticking, so the next animation frame can be requested
        ticking = false;
    }

    // Listen for scroll events on the window
    window.addEventListener('scroll', () => {
        // Use requestAnimationFrame for smoother animations that are synced with the browser
        if (!ticking) {
            window.requestAnimationFrame(updateHeaderVisibility);
            ticking = true;
        }
    });

    // Handle initial load: Run the visibility check once when the page loads
    window.addEventListener('load', () => {
        updateHeaderVisibility();
    });

    // Handle window resize: If the user resizes the window (e.g., from mobile to desktop view)
    window.addEventListener('resize', () => {
        if (!isMobile()) {
            header.classList.remove('header-hidden'); // If it becomes desktop, make sure it's visible
        }
        updateHeaderVisibility(); // Re-evaluate header state after resize
    });

    // --- End Header Hide on Scroll ---


    // --- Your existing Product Filtering and Sorting Logic (only for index.html) ---
    // This part should only run on the index.html page because it refers to elements
    // (like product-grid, filters) that only exist there.
    if (document.getElementById('products')) { // Check if the #products section exists on the page
        const productGrid = document.querySelector('.product-grid');
        const products = Array.from(productGrid.children);

        const sortBySelect = document.getElementById('sort-by');
        const filterPlatformSelect = document.getElementById('filter-platform');
        const filterRankSelect = document.getElementById('filter-rank');
        const noResultsMessage = document.getElementById('no-results-message');
        const clearFiltersButton = document.getElementById('clear-filters-button');

        // Define numerical order for ranks (higher value = higher rank for sorting)
        const rankOrderMap = {
            "unranked": 0, "copper": 1, "bronze": 2, "silver": 3,
            "gold": 4, "platinum": 5, "diamond": 6, "champion": 7,
            "collector": 8
        };

        function applyFiltersAndSort() {
            let currentProducts = [...products];

            // --- 1. Apply Filters ---
            const selectedPlatform = filterPlatformSelect.value;
            if (selectedPlatform !== 'all') {
                currentProducts = currentProducts.filter(product =>
                    product.dataset.platform === selectedPlatform
                );
            }

            const selectedRank = filterRankSelect.value;
            if (selectedRank !== 'all') {
                currentProducts = currentProducts.filter(product =>
                    selectedRank === product.dataset.rank
                );
            }

            // --- 2. Apply Sorting ---
            const sortOrder = sortBySelect.value;
            if (sortOrder !== 'default') {
                currentProducts.sort((a, b) => {
                    if (sortOrder.includes('price')) {
                        const priceA = parseFloat(a.dataset.priceValue);
                        const priceB = parseFloat(b.dataset.priceValue);
                        return sortOrder === 'price-asc' ? priceA - priceB : priceB - priceA;
                    } else if (sortOrder.includes('rank')) {
                        const rankA = rankOrderMap[a.dataset.rank];
                        const rankB = rankOrderMap[b.dataset.rank];
                        return sortOrder === 'rank-asc' ? rankA - rankB : rankB - rankA;
                    }
                    return 0;
                });
            }

            // --- 3. Update the display ---
            productGrid.innerHTML = '';

            if (currentProducts.length === 0) {
                noResultsMessage.style.display = 'block';
            } else {
                noResultsMessage.style.display = 'none';
                currentProducts.forEach(product => productGrid.appendChild(product));
            }
        }

        // Function to reset all filters
        function clearAllFilters() {
            sortBySelect.value = 'default';
            filterPlatformSelect.value = 'all';
            filterRankSelect.value = 'all';
            applyFiltersAndSort();
        }

        // Event Listeners for changes on the dropdowns
        sortBySelect.addEventListener('change', applyFiltersAndSort);
        filterPlatformSelect.addEventListener('change', applyFiltersAndSort);
        filterRankSelect.addEventListener('change', applyFiltersAndSort);

        // Event listener for Clear Filters button
        clearFiltersButton.addEventListener('click', clearAllFilters);

        // Initial call to apply any default sorting/filtering on page load
        applyFiltersAndSort();
    }
});