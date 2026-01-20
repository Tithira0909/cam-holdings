import { fetchPublic, getImageUrl } from './client-api.js';

export class ListingManager {
    constructor(config) {
        this.config = config;
        this.containerId = config.containerId || 'listing-grid';
        // Support single or multiple endpoints
        // config.endpoints = [ { url: '...', category: '...' }, ... ]
        // config.apiEndpoint (legacy/single)
        this.endpoints = config.endpoints || (config.apiEndpoint ? [{ url: config.apiEndpoint, category: config.categoryName || 'General', section: config.sectionName }] : []);

        this.detailsPage = 'property.html';

        // State
        this.items = [];
        this.filters = {
            search: '',
            sort: 'newest'
        };

        this.init();
    }

    async init() {
        this.renderHeader();
        await this.loadData();
    }

    renderHeader() {
        // Find container parent to inject header before grid
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const headerHtml = `
            <div class="listing-header">
                <div class="lh-left">
                    <input type="text" id="listingSearch" placeholder="Search by name..." class="search-input">
                </div>
                <div class="lh-right">
                    <select id="listingSort" class="sort-select">
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                    </select>
                </div>
            </div>
        `;

        // Inject header before the grid container
        const wrapper = document.createElement('div');
        wrapper.className = 'listing-wrapper';
        wrapper.innerHTML = headerHtml;

        container.parentNode.insertBefore(wrapper, container);
        // Move container inside? Or just keep grid below.
        // Let's keep grid below for cleaner DOM manipulation.

        // Event Listeners
        document.getElementById('listingSearch').addEventListener('input', (e) => {
            this.filters.search = e.target.value;
            this.loadData();
        });

        document.getElementById('listingSort').addEventListener('change', (e) => {
            this.filters.sort = e.target.value;
            this.loadData();
        });
    }

    async loadData() {
        const container = document.getElementById(this.containerId);
        container.innerHTML = '<div class="loading-state">Loading...</div>';

        try {
            // Build query string
            const params = new URLSearchParams({
                search: this.filters.search,
                sort: this.filters.sort
            });

            // Fetch from all endpoints
            const promises = this.endpoints.map(ep =>
                fetchPublic(`${ep.url}?${params.toString()}`)
                    .then(data => data.map(item => ({
                        ...item,
                        _category: ep.category,
                        _section: ep.section // Pass section name for URL construction
                    })))
            );

            const results = await Promise.all(promises);
            // Merge all
            this.items = results.flat();

            // Client-side sort if multiple sources (since DB sort is per-endpoint)
            // If single source, backend sort is enough, but client sort doesn't hurt for consistency across merged lists
            this.sortItems();

            this.renderGrid();
        } catch (error) {
            console.error(error);
            container.innerHTML = '<div class="error-state">Failed to load properties.</div>';
        }
    }

    sortItems() {
        const sort = this.filters.sort;
        this.items.sort((a, b) => {
            if (sort === 'newest') {
                return new Date(b.created_at) - new Date(a.created_at);
            } else if (sort === 'oldest') {
                return new Date(a.created_at) - new Date(b.created_at);
            } else if (sort === 'price_asc') {
                return parseFloat(a.estimated_cost) - parseFloat(b.estimated_cost);
            } else if (sort === 'price_desc') {
                return parseFloat(b.estimated_cost) - parseFloat(a.estimated_cost);
            }
            return 0;
        });
    }

    renderGrid() {
        const container = document.getElementById(this.containerId);
        if (this.items.length === 0) {
            container.innerHTML = '<div class="empty-state">No listings found matching your criteria.</div>';
            return;
        }

        container.innerHTML = this.items.map(item => this.createCard(item)).join('');
    }

    createCard(item) {
        const imgUrl = getImageUrl(item.main_image);
        const title = this.safe(item.name);
        const cost = this.safe(item.estimated_cost);
        let desc = this.safe(item.description || '');
        if (desc.length > 100) desc = desc.substring(0, 100) + '...';

        const status = item.status || 'Active';
        // For public view we mostly show Active, but if Mixed/Draft leaked, handle it.

        // Category Badge (Combined View)
        let categoryHtml = '';
        if (this.endpoints.length > 1 && item._category) {
            categoryHtml = `<div class="lc-category-badge">${item._category}</div>`;
        }

        const section = item._section || this.sectionName; // Use item-specific section if merged
        const detailsUrl = `${this.detailsPage}?section=${section}&id=${item.id}`;

        return `
            <div class="listing-card">
                <div class="lc-media">
                    <img src="${imgUrl}" alt="${title}" loading="lazy" onerror="this.onerror=null;this.src='/placeholder.svg';">
                    ${categoryHtml}
                </div>
                <div class="lc-content">
                    <h3 class="lc-title">${title}</h3>
                    <div class="lc-cost">${cost}</div>
                    <p class="lc-desc">${desc}</p>
                    <a href="${detailsUrl}" class="lc-btn">View Details</a>
                </div>
            </div>
        `;
    }

    safe(str) {
        return str ? String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;") : '';
    }
}
