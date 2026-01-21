
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('listings-grid');
    if (!grid) return;

    const category = grid.dataset.category;
    if (!category) {
        console.error('No category defined for listings grid');
        return;
    }

    const searchInput = document.getElementById('listing-search');
    let allListings = [];

    // Helper to format currency/cost if needed (or just show string)
    const formatCost = (cost) => {
        if (!cost) return '';
        return `<div class="text-gold text-sm font-medium mt-2">${cost}</div>`;
    };

    const getImageUrl = (path) => {
        if (!path) return '/placeholder.svg';
        if (path.startsWith('http')) return path;
        const cleanPath = path.replace(/^uploads\//, '');
        return `/uploads/${cleanPath}`; // Proxy handles /uploads -> backend/uploads
    };

    const renderListings = (listings) => {
        grid.innerHTML = '';
        if (listings.length === 0) {
            grid.innerHTML = '<div class="col-span-full text-center py-10 text-gray-400">No active listings found.</div>';
            return;
        }

        listings.forEach(item => {
            const card = document.createElement('article');
            card.className = 'bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden hover:border-gold transition-colors duration-300 group';

            card.innerHTML = `
                <div class="relative aspect-[4/3] overflow-hidden">
                    <img src="${getImageUrl(item.image_url)}" alt="${item.name}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60"></div>
                </div>
                <div class="p-6">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="text-xl font-bold text-white group-hover:text-gold transition-colors">${item.name}</h3>
                    </div>
                    ${formatCost(item.estimated_cost)}
                    <p class="text-gray-400 text-sm mt-3 line-clamp-3">${item.description || ''}</p>
                    <div class="mt-6">
                        <a href="/contact.html?subject=Inquiry: ${encodeURIComponent(item.name)}" class="inline-block px-4 py-2 border border-gold text-gold text-xs uppercase tracking-wider hover:bg-gold hover:text-black transition-colors">
                            View Details
                        </a>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    };

    const fetchListings = async () => {
        try {
            grid.innerHTML = '<div class="col-span-full text-center py-10 text-gray-500">Loading listings...</div>';
            const response = await fetch(`/api/services?category=${category}`);
            if (!response.ok) throw new Error('Failed to fetch listings');

            allListings = await response.json();
            renderListings(allListings);
        } catch (error) {
            console.error(error);
            grid.innerHTML = '<div class="col-span-full text-center py-10 text-red-500">Error loading listings. Please try again later.</div>';
        }
    };

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = allListings.filter(item =>
                item.name.toLowerCase().includes(term) ||
                (item.description && item.description.toLowerCase().includes(term))
            );
            renderListings(filtered);
        });
    }

    fetchListings();
});
