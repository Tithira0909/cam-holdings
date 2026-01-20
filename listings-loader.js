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
        const listings = await fetchPublic(`/${apiSegment}`);

        if (!listings || listings.length === 0) {
            grid.innerHTML = '<p style="color:#aaa; text-align:center;">No active properties found.</p>';
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
    const cost = item.estimated_cost || '';
    // Shorten description
    const desc = item.description ? (item.description.substring(0, 100) + '...') : '';

    const safe = (str) => str ? String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;") : '';

    return `
        <div class="re-card">
            <a href="property.html?section=${section}&id=${item.id}" style="text-decoration:none; color:inherit;">
                <img src="${imgUrl}" alt="${safe(title)}" class="re-card__img" loading="lazy">
                <div class="re-card__body">
                    <h3 class="re-card__title">${safe(title)}</h3>
                    <div class="re-card__loc" style="font-weight:bold; color:#d6b25e;">
                        ${safe(cost)}
                    </div>
                    <p style="font-size:0.9rem; color:#aaa; margin-top:0.5rem;">${safe(desc)}</p>
                </div>
            </a>
            <div style="padding: 0 1.5rem 1.5rem 1.5rem;">
                <a href="property.html?section=${section}&id=${item.id}" class="re-card__btn">View Details</a>
            </div>
        </div>
    `;
}
