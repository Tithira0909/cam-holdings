import { fetchPublic } from './client-api.js';
import { ServiceCard } from './service-card.js';

let allItems = []; // Store fetched items for filtering

document.addEventListener('DOMContentLoaded', () => {
    loadListings();

    // Bind search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterListings(e.target.value);
        });
    }
});

async function loadListings() {
    const grid = document.getElementById('listing-grid');
    if (!grid) return;

    // Render Skeleton
    renderSkeleton(grid);

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
        grid.innerHTML = '<p style="text-align:center; color:#aaa;">Category config error.</p>';
        return;
    }

    try {
        const fetchedItems = await fetchPublic(`/${apiSegment}`);
        // Filter for Active status (Frontend safety)
        allItems = Array.isArray(fetchedItems) ? fetchedItems.filter(item => item.status === 'Active') : [];

        if (!allItems || allItems.length === 0) {
            grid.innerHTML = '<p style="color:#aaa; text-align:center; grid-column:1/-1;">No active items found.</p>';
            return;
        }

        renderItems(grid, allItems, apiSegment);

    } catch (error) {
        console.error('Error loading properties:', error);
        grid.innerHTML = '<p style="color:red; text-align:center;">Failed to load items.</p>';
    }
}

function renderSkeleton(container) {
    const skeletonHTML = `
        <div class="service-card-item skeleton-card">
            <div class="card-img-wrapper skeleton-box"></div>
            <div class="card-content">
                <div class="skeleton-line" style="width: 70%;"></div>
                <div class="skeleton-line" style="width: 40%;"></div>
                <div class="skeleton-line"></div>
            </div>
        </div>
    `;
    // Repeat 3 times
    container.innerHTML = skeletonHTML.repeat(3);
}

function renderItems(container, items, section) {
    if (items.length === 0) {
        container.innerHTML = '<p style="color:#aaa; text-align:center; grid-column:1/-1;">No items found matching your search.</p>';
        return;
    }
    container.innerHTML = items.map(item => ServiceCard(item, section, false)).join('');
}

function filterListings(query) {
    const grid = document.getElementById('listing-grid');
    if (!grid) return;

    // Get section again from map (lazy way or pass it around)
    // Actually we stored the apiSegment in the closure? No, loadListings is async.
    // We need to know the section to render the card link.
    // Let's re-derive it or store it.

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

    const lowerQuery = query.toLowerCase();
    const filtered = allItems.filter(item => {
        const name = (item.name || '').toLowerCase();
        const desc = (item.description || '').toLowerCase();
        return name.includes(lowerQuery) || desc.includes(lowerQuery);
    });

    renderItems(grid, filtered, apiSegment);
}
