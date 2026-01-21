import { fetchPublic } from './client-api.js';
import { ServiceCard } from './service-card.js';

document.addEventListener('DOMContentLoaded', () => {
    loadListings();

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterListings(e.target.value);
        });
    }
});

let allItems = [];

async function loadListings() {
    const grid = document.getElementById('listing-grid');
    if (!grid) return;

    renderSkeleton(grid);

    const category = grid.dataset.category || '';

    // API Call to unified services endpoint
    // Filter by active=true and category
    const endpoint = `/services?active=true&category=${encodeURIComponent(category)}`;

    try {
        const items = await fetchPublic(endpoint);
        allItems = Array.isArray(items) ? items : [];

        if (allItems.length === 0) {
            grid.innerHTML = '<p style="color:#aaa; text-align:center; grid-column:1/-1;">No items found.</p>';
            return;
        }

        renderItems(grid, allItems);

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
    container.innerHTML = skeletonHTML.repeat(3);
}

function renderItems(container, items) {
    if (items.length === 0) {
        container.innerHTML = '<p style="color:#aaa; text-align:center; grid-column:1/-1;">No items found matching your search.</p>';
        return;
    }
    // We pass 'services' as sectionEndpoint if needed, but ServiceCard will use slug if available
    container.innerHTML = items.map(item => ServiceCard(item, 'services', false)).join('');
}

function filterListings(query) {
    const grid = document.getElementById('listing-grid');
    if (!grid) return;

    const lowerQuery = query.toLowerCase();
    const filtered = allItems.filter(item => {
        const title = (item.title || item.name || '').toLowerCase();
        const desc = (item.description || '').toLowerCase();
        return title.includes(lowerQuery) || desc.includes(lowerQuery);
    });

    renderItems(grid, filtered);
}
