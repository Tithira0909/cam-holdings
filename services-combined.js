import { fetchPublic } from './client-api.js';
import { ServiceCard } from './service-card.js';

let allCombinedItems = [];

document.addEventListener('DOMContentLoaded', () => {
    loadAllServices();

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterCombinedListings(e.target.value);
        });
    }
});

async function loadAllServices() {
    const grid = document.querySelector('.service-grid');
    if (!grid) return;

    renderSkeleton(grid);

    try {
        // Fetch all active services
        const items = await fetchPublic('/services?active=true');

        allCombinedItems = Array.isArray(items) ? items : [];

        if (allCombinedItems.length === 0) {
            grid.innerHTML = '<p style="text-align:center; grid-column:1/-1;">No active services found.</p>';
            return;
        }

        renderCombinedItems(grid, allCombinedItems);

    } catch (error) {
        console.error('Error loading services:', error);
        grid.innerHTML = '<p>Error loading services.</p>';
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

function renderCombinedItems(container, items) {
    if (items.length === 0) {
        container.innerHTML = '<p style="text-align:center; grid-column:1/-1;">No items found matching your search.</p>';
        return;
    }
    // We pass 'services' as sectionEndpoint so card links to service-details
    // Pass true for showCategoryBadge to display category on card
    container.innerHTML = items.map(item =>
        ServiceCard(item, 'services', true, item.category)
    ).join('');
}

function filterCombinedListings(query) {
    const grid = document.querySelector('.service-grid');
    if (!grid) return;

    const lowerQuery = query.toLowerCase();
    const filtered = allCombinedItems.filter(item => {
        const title = (item.title || item.name || '').toLowerCase();
        const desc = (item.description || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        return title.includes(lowerQuery) || desc.includes(lowerQuery) || cat.includes(lowerQuery);
    });

    renderCombinedItems(grid, filtered);
}
