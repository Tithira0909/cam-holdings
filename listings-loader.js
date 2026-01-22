import { fetchPublic, getImageUrl } from './client-api.js';

document.addEventListener('DOMContentLoaded', () => {
    loadListings();
});

async function loadListings() {
    const grid = document.getElementById('listing-grid');
    if (!grid) return;

    // Map the HTML data-category to the API route segment
    const category = grid.dataset.category || '';
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
        // Ensure we hit the public endpoint
        const listings = await fetchPublic(`/public/${apiSegment}`);

        if (!listings || listings.length === 0) {
            grid.innerHTML = `
                <div class="re-empty">
                    <h3>No properties available</h3>
                    <p>We are currently updating our exclusive listings. Please check back soon or contact us directly for private opportunities.</p>
                    <a href="contact.html" class="re-card__btn" style="width:auto; margin-top:1rem; padding-inline:2rem;">Contact Us</a>
                </div>
            `;
            return;
        }

        grid.innerHTML = listings.map(item => createCard(item, apiSegment)).join('');

    } catch (error) {
        console.error('Error loading properties:', error);
        grid.innerHTML = '<p style="color:red; text-align:center;">Failed to load properties.</p>';
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
