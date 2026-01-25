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
                // Render a single placeholder card in the style of a project card
                grid.innerHTML = `
                    <a href="contact.html" class="glass-project-card">
                        <div class="gpc-bg" style="background-image: url('/placeholder.svg'); filter: grayscale(1) opacity(0.3);"></div>
                        <div class="gpc-overlay"></div>
                        <div class="gpc-content">
                            <div class="gpc-cat">Coming Soon</div>
                            <h3 class="gpc-title">No properties available</h3>
                            <div class="gpc-tags">Our exclusive portfolio is being curated. Contact us for private off-market opportunities.</div>
                        </div>
                    </a>
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
    const safe = (str) => str ? String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;") : '';

    const title = safe(item.name || 'Untitled');
    // For property, we can use cost or status as the "tag" equivalent
    const tag = item.estimated_cost ? `${item.estimated_cost}` : 'Price on Request';

    // Consistent glass card structure (glass-project-card)
    return `
        <a href="property.html?section=${section}&id=${item.id}" class="glass-project-card">
            <div class="gpc-bg" style="background-image: url('${imgUrl}');"></div>
            <div class="gpc-overlay"></div>
            <div class="gpc-content">
                <div class="gpc-cat">Premium Property</div>
                <h3 class="gpc-title">${title}</h3>
                <div class="gpc-tags">${safe(tag)}</div>
            </div>
        </a>
    `;
}
