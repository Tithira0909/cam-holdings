import { fetchPublic, postPublic } from './client-api.js';

// Helper for XSS protection
const safe = (str) => str ? String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;") : '';

// --- FETCH & DISPLAY ---
async function initReviews() {
    // Changed selector to match new HTML
    const track = document.getElementById('reviewsTrack');
    if (!track) return;

    try {
        // Updated Endpoint: returns only active & published reviews
        const reviews = await fetchPublic('/public/reviews');

        if (!reviews || reviews.length === 0) {
            track.innerHTML = '<p style="text-align:center; width:100%; color:#888;">No reviews yet. Be the first!</p>';
            return;
        }

        track.innerHTML = '';

        reviews.forEach(review => {
            const card = document.createElement('article');
            // 'rv-card' for new styling, 'review' for potential generic hooks
            card.className = 'rv-card review';

            const rating = review.rating || 5;
            const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);

            // Sanitize inputs
            const source = safe(review.source || 'Client');
            const name = safe(review.name || review.client_name || 'Anonymous');
            const msg = safe(review.message || review.description || '');
            // Use a placeholder image if none exists (assuming API might not return one yet)
            const imgUrl = review.image || '/assets/avatar-placeholder.png';

            card.innerHTML = `
                <div class="rv-head">
                    <div class="rv-avatar">
                        <img src="${imgUrl}" alt="${name}" onerror="this.src='/assets/avatar-placeholder.png'">
                    </div>
                    <div class="rv-meta">
                        <div class="rv-title">${source} Review</div>
                        <div class="stars">${stars}</div>
                    </div>
                </div>
                <div class="rv-body">
                    <p>"${msg}"</p>
                </div>
                <div class="rv-foot">
                    <span class="rv-name">${name}</span>
                </div>
            `;

            track.appendChild(card);
        });

        // Re-initialize slider if needed (if script.js runs before this)
        window.dispatchEvent(new Event('reviews-loaded'));

        // Entrance Animation
        if (window.gsap) {
            window.gsap.fromTo('.rv-card',
                { autoAlpha: 0, x: 50 },
                { autoAlpha: 1, x: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out' }
            );
        }

    } catch (error) {
        console.error('Error loading reviews:', error);
        track.innerHTML = '<p style="color:red; text-align:center;">Failed to load reviews.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initReviews();
});
