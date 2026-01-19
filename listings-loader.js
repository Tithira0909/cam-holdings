import { fetchPublic, getImageUrl } from './client-api.js';

document.addEventListener('DOMContentLoaded', () => {
    loadListings();
});

async function loadListings() {
    const grid = document.getElementById('listing-grid');
    if (!grid) return;

    const category = grid.dataset.category || '';

    try {
        const listings = await fetchPublic(`/listings?category=${encodeURIComponent(category)}`);

        if (!listings || listings.length === 0) {
            grid.innerHTML = '<p style="color:#aaa; text-align:center;">No listings found.</p>';
            return;
        }

        grid.innerHTML = listings.map(item => createCard(item)).join('');

    } catch (error) {
        console.error('Error loading listings:', error);
        grid.innerHTML = '<p style="color:red; text-align:center;">Failed to load listings.</p>';
    }
}

function createCard(item) {
    const imgUrl = getImageUrl(item.cover_image);
    const title = item.title || 'Untitled';
    const location = item.location || '';
    const price = item.price || '';

    const safe = (str) => str ? String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;") : '';

    return `
        <div class="re-card">
            <img src="${imgUrl}" alt="${safe(title)}" class="re-card__img" loading="lazy">
            <div class="re-card__body">
                <h3 class="re-card__title">${safe(title)}</h3>
                ${location ? `
                <div class="re-card__loc">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#d6b25e"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                    ${safe(location)}
                </div>` : ''}
                ${price ? `<div class="re-card__price">${safe(price)}</div>` : ''}
                <a href="contact.html?subject=Inquiry about ${encodeURIComponent(title)}" class="re-card__btn">Inquire Now</a>
            </div>
        </div>
    `;
}
