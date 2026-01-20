import { fetchPublic } from './client-api.js';
import { ServiceCard } from './service-card.js';

document.addEventListener('DOMContentLoaded', () => {
    loadListings();
});

async function loadListings() {
    const grid = document.getElementById('listing-grid');
    if (!grid) return;

    // Map the HTML data-category to the PUBLIC API route segment
    const category = grid.dataset.category || '';
    const sectionMap = {
        'Real Estate': 'public/real-estate-properties',
        'Design & Architecture': 'public/design-architecture-properties',
        'Construction': 'public/construction-properties',
        'Construction & Project Management': 'public/construction-properties',
        'Interiors': 'public/interiors-properties',
        'Interiors & Finishing': 'public/interiors-properties'
    };

    const apiSegment = sectionMap[category];
    if (!apiSegment) {
        console.error('Unknown category:', category);
        return;
    }

    try {
        const listings = await fetchPublic(`/${apiSegment}`);

        if (!listings || listings.length === 0) {
            grid.innerHTML = '<p style="color:#aaa; text-align:center;">No active items found.</p>';
            return;
        }

        grid.innerHTML = listings.map(item => ServiceCard(item, apiSegment, false)).join('');

    } catch (error) {
        console.error('Error loading properties:', error);
        grid.innerHTML = '<p style="color:red; text-align:center;">Failed to load items.</p>';
    }
}
