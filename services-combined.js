import { fetchPublic } from './client-api.js';
import { ServiceCard } from './service-card.js';

document.addEventListener('DOMContentLoaded', () => {
    loadAllServices();
});

async function loadAllServices() {
    // Target the existing container in services.html
    const grid = document.querySelector('.service-grid');
    if (!grid) return;

    const sources = [
        { endpoint: 'public/real-estate-properties', label: 'Real Estate' },
        { endpoint: 'public/design-architecture-properties', label: 'Design & Architecture' },
        { endpoint: 'public/construction-properties', label: 'Construction' },
        { endpoint: 'public/interiors-properties', label: 'Interiors' }
    ];

    try {
        // Fetch all in parallel
        const promises = sources.map(src =>
            fetchPublic('/' + src.endpoint)
                .then(data => ({ data, source: src }))
                .catch(err => {
                    console.error(`Failed to fetch ${src.endpoint}`, err);
                    return { data: [], source: src };
                })
        );

        const results = await Promise.all(promises);

        let allItems = [];
        results.forEach(res => {
            if (Array.isArray(res.data)) {
                const itemsWithMeta = res.data.map(item => ({
                    ...item,
                    _sectionEndpoint: res.source.endpoint,
                    _categoryLabel: res.source.label
                }));
                allItems = allItems.concat(itemsWithMeta);
            }
        });

        if (allItems.length === 0) {
            grid.innerHTML = '<p style="text-align:center;">No active items found.</p>';
            return;
        }

        // Sort by created_at descending
        allItems.sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            return dateB - dateA;
        });

        grid.innerHTML = allItems.map(item =>
            ServiceCard(item, item._sectionEndpoint, true, item._categoryLabel)
        ).join('');

    } catch (error) {
        console.error('Error loading services:', error);
        grid.innerHTML = '<p>Error loading services.</p>';
    }
}
