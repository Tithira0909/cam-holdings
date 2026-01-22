import { fetchPublic, getImageUrl } from './client-api.js';

document.addEventListener('DOMContentLoaded', () => {
    loadListings();
});

async function loadListings() {
    // Select both the ID (legacy/single page) and class (multi-grid page)
    const grids = document.querySelectorAll('#listing-grid, .js-listing-grid');
    if (!grids.length) return;

    grids.forEach(grid => processGrid(grid));
}

async function processGrid(grid) {
    // Map the HTML data-category to the API route segment
    const category = grid.dataset.category || '';
    const limit = grid.dataset.limit ? parseInt(grid.dataset.limit, 10) : null;

    const sectionMap = {
        'Real Estate': 'real-estate-properties',
        'Design & Architecture': 'design-architecture-properties',
        'Construction & Project Management': 'construction-properties',
        'Interiors & Finishing': 'interiors-properties'
    };

    const apiSegment = sectionMap[category];
    if (!apiSegment) {
        console.error('Unknown category:', category);
        return;
    }

    try {
        // Use the public endpoint prefix
        let listings = await fetchPublic(`/public/${apiSegment}`);

        if (!listings || listings.length === 0) {
            // Check if we should hide the section instead of showing empty state (optional, based on layout)
            // For now, consistent empty state.
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                    <h3 style="color: #fff; margin-bottom: 0.5rem; font-family: 'Josefin Sans', sans-serif;">Coming Soon</h3>
                    <p style="color: #aaa; font-size: 0.95rem;">We are currently curating a new selection of properties for this section. Please check back later.</p>
                </div>
            `;
            return;
        }

        // Apply limit if specified
        if (limit && listings.length > limit) {
            listings = listings.slice(0, limit);
        }

        grid.innerHTML = listings.map(item => createCard(item, apiSegment)).join('');

    } catch (error) {
        console.error('Error loading properties for ' + category, error);
        grid.innerHTML = '<p style="color:red; text-align:center;">Failed to load properties. Please try again later.</p>';
    }
}

function createCard(item, section) {
    const imgUrl = getImageUrl(item.main_image);
    const title = item.name || 'Untitled';
    const cost = item.estimated_cost || 'Price on Request';
    // Shorten description
    const desc = item.description ? (item.description.substring(0, 100) + (item.description.length > 100 ? '...' : '')) : '';

    const safe = (str) => str ? String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;") : '';

    return `
        <div class="re-card" style="display: flex; flex-direction: column; height: 100%;">
            <a href="property.html?section=${section}&id=${item.id}" style="text-decoration:none; color:inherit; display:flex; flex-direction:column; flex:1;">
                <div style="overflow:hidden;">
                    <img src="${imgUrl}" alt="${safe(title)}" class="re-card__img" loading="lazy" onerror="this.onerror=null;this.src='/placeholder.svg';">
                </div>
                <div class="re-card__body" style="flex:1; display:flex; flex-direction:column;">
                    <h3 class="re-card__title">${safe(title)}</h3>
                    <div class="re-card__price" style="color:#d6b25e;">
                        ${safe(cost)}
                    </div>
                    <p style="font-size:0.9rem; color:#aaa; margin-top:0.5rem; line-height: 1.5;">${safe(desc)}</p>
                </div>
            </a>
            <div style="padding: 0 1.5rem 1.5rem 1.5rem; margin-top: auto;">
                <a href="property.html?section=${section}&id=${item.id}" class="re-card__btn">View Details</a>
            </div>
        </div>
    `;
}
