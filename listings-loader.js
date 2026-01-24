import { fetchPublic, getImageUrl } from './client-api.js';

document.addEventListener('DOMContentLoaded', () => {
    loadListings();
});

async function loadListings() {
    // Support multiple grids via class, fallback to ID for legacy/single pages
    const grids = document.querySelectorAll('.js-listing-grid, #listing-grid');
    if (grids.length === 0) return;

    const sectionMap = {
        'Real Estate': 'real-estate-properties',
        'Design & Architecture': 'design-architecture-properties',
        'Construction & Project Management': 'construction-properties',
        'Interiors & Finishing': 'interiors-properties'
    };

    // Use a Set to avoid processing the same element twice if it has both ID and class
    const processedGrids = new Set();

    for (const grid of grids) {
        if (processedGrids.has(grid)) continue;
        processedGrids.add(grid);

        const category = grid.dataset.category || '';
        const apiSegment = sectionMap[category];

        if (!apiSegment) {
            console.error('Unknown category:', category);
            continue;
        }

        // Add loading state if empty
        if (!grid.innerHTML.trim()) {
            grid.innerHTML = '<p style="color:white; text-align:center;">Loading...</p>';
        }

        try {
            // Ensure we hit the public endpoint
            const listings = await fetchPublic(`/public/${apiSegment}`);

            if (!listings || listings.length === 0) {
                grid.innerHTML = `
                    <div class="re-empty">
                        <h3>No properties available</h3>
                        <p>Our curated selection of premium properties is currently being updated. Contact us for exclusive off-market opportunities.</p>
                    </div>
                `;
                continue;
            }

            // Optional: limit number of items if data-limit is present
            let displayListings = listings;
            const limit = grid.dataset.limit;
            if (limit) {
                displayListings = listings.slice(0, parseInt(limit));
            }

            grid.innerHTML = displayListings.map(item => createCard(item, apiSegment)).join('');

        } catch (error) {
            console.error(`Error loading properties for ${category}:`, error);
            grid.innerHTML = '<p style="color:red; text-align:center;">Failed to load properties.</p>';
        }
    }
}

function createCard(item, section) {
    const imgUrl = getImageUrl(item.main_image);
    const title = item.name || 'Untitled';
    const cost = item.estimated_cost ? `${item.estimated_cost}` : 'Price on Request';
    // Shorten description
    const desc = item.description ? (item.description.substring(0, 120) + (item.description.length > 120 ? '...' : '')) : 'No description available.';

    const safe = (str) => str ? String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;") : '';

    return `
        <div class="re-card">
            <a href="property.html?section=${section}&id=${item.id}" class="re-card__img-wrap">
                <img src="${imgUrl}" alt="${safe(title)}" class="re-card__img" loading="lazy" onerror="this.onerror=null;this.src='/placeholder.svg';">
            </a>
            <div class="re-card__body">
                <a href="property.html?section=${section}&id=${item.id}" style="text-decoration:none;">
                    <h3 class="re-card__title">${safe(title)}</h3>
                </a>
                <div class="re-card__cost">${safe(cost)}</div>
                <p class="re-card__desc">${safe(desc)}</p>

                <div class="re-card__actions">
                     <a href="property.html?section=${section}&id=${item.id}" class="re-card__btn">View Details</a>
                </div>
            </div>
        </div>
    `;
}
