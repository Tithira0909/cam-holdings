// Helper for XSS protection
const safe = (str) => str ? String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;") : '';

function getImageUrl(path) {
    if (!path) return '/placeholder.svg';
    let cleanPath = path.replace(/\\/g, '/');
    if (cleanPath.startsWith('uploads/')) {
        cleanPath = cleanPath.substring(8);
    }
    return `/uploads/${cleanPath}`;
}

async function loadListings() {
    const grid = document.getElementById('listing-grid');
    if (!grid) return;

    const category = grid.dataset.category;
    const searchInput = document.getElementById('listing-search');
    let searchTerm = '';
    let allItems = []; // Store fetched items for client-side filter

    const fetchAndRender = async () => {
        grid.innerHTML = '<p style="color:white; text-align:center; grid-column: 1/-1;">Loading...</p>';
        try {
            let url = `/api/service-listings?category=${encodeURIComponent(category)}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch');

            allItems = await response.json();
            filterAndRender();
        } catch (e) {
            console.error(e);
            grid.innerHTML = '<p style="color:red; text-align:center; grid-column: 1/-1;">Error loading properties. Ensure backend is running.</p>';
        }
    };

    const filterAndRender = () => {
        let filtered = allItems;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = allItems.filter(item =>
                (item.title && item.title.toLowerCase().includes(term)) ||
                (item.short_description && item.short_description.toLowerCase().includes(term))
            );
        }
        renderGrid(filtered);
    };

    const renderGrid = (items) => {
        grid.innerHTML = '';
        if (items.length === 0) {
            grid.innerHTML = '<p style="color:rgba(255,255,255,0.7); text-align:center; grid-column: 1/-1;">No listings found.</p>';
            return;
        }

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 're-card'; // Reuse existing CSS class from styles.css

            const imgUrl = getImageUrl(item.main_image);
            const title = item.title || item.name || 'Untitled';
            const desc = item.short_description || item.description || '';
            const cost = item.estimated_cost ? `<div class="re-card__price">${safe(item.estimated_cost)}</div>` : '';

            const truncatedDesc = desc.length > 100 ? desc.substring(0, 100) + '...' : desc;

            card.innerHTML = `
                <div style="height: 200px; overflow: hidden;">
                    <img src="${imgUrl}" alt="${safe(title)}" class="re-card__img" style="width:100%; height:100%; object-fit:cover;" onerror="this.onerror=null;this.src='/placeholder.svg';">
                </div>
                <div class="re-card__body">
                    <h3 class="re-card__title">${safe(title)}</h3>
                    ${cost}
                    <p style="color: #aaa; font-size: 0.9rem; line-height: 1.5; margin-bottom: 1rem;">${safe(truncatedDesc)}</p>
                    <button class="re-card__btn" style="background:transparent; cursor:pointer;" onclick="alert('View details: ${safe(title)}')">View Details</button>
                </div>
            `;
            grid.appendChild(card);
        });
    };

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value;
            filterAndRender();
        });
    }

    // Initial Load
    fetchAndRender();
}

document.addEventListener('DOMContentLoaded', loadListings);
