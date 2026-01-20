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

    const sources = [
        { endpoint: 'public/real-estate-properties', label: 'Real Estate' },
        { endpoint: 'public/design-architecture-properties', label: 'Design & Architecture' },
        { endpoint: 'public/construction-properties', label: 'Construction' },
        { endpoint: 'public/interiors-properties', label: 'Interiors' }
    ];

    try {
        const promises = sources.map(src =>
            fetchPublic('/' + src.endpoint)
                .then(data => ({ data, source: src }))
                .catch(err => {
                    console.error(`Failed to fetch ${src.endpoint}`, err);
                    return { data: [], source: src };
                })
        );

        const results = await Promise.all(promises);

        allCombinedItems = [];
        results.forEach(res => {
            if (Array.isArray(res.data)) {
                const itemsWithMeta = res.data.map(item => ({
                    ...item,
                    _sectionEndpoint: res.source.endpoint,
                    _categoryLabel: res.source.label
                }));
                allCombinedItems = allCombinedItems.concat(itemsWithMeta);
            }
        });

        if (allCombinedItems.length === 0) {
            grid.innerHTML = '<p style="text-align:center;">No active items found.</p>';
            return;
        }

        // Sort by created_at descending
        allCombinedItems.sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            return dateB - dateA;
        });

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
    container.innerHTML = items.map(item =>
        ServiceCard(item, item._sectionEndpoint, true, item._categoryLabel)
    ).join('');
}

function filterCombinedListings(query) {
    const grid = document.querySelector('.service-grid');
    if (!grid) return;

    const lowerQuery = query.toLowerCase();
    const filtered = allCombinedItems.filter(item => {
        const name = (item.name || '').toLowerCase();
        const desc = (item.description || '').toLowerCase();
        const cat = (item._categoryLabel || '').toLowerCase();
        return name.includes(lowerQuery) || desc.includes(lowerQuery) || cat.includes(lowerQuery);
    });

    renderCombinedItems(grid, filtered);
}
