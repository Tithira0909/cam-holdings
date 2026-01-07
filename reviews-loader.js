import { fetchPublic } from './client-api.js';

async function initReviews() {
    // Try to find the container. It might be .reviews-grid or #reviewsTrack depending on page version
    const grid = document.querySelector('.reviews-grid') || document.getElementById('reviewsTrack');

    if (!grid) return;

    try {
        // Fetch only approved reviews
        // public_api.js /reviews takes approvedOnly=true query param?
        // Let's check public_api.js.
        // It accepts approvedOnly='true'.

        const reviews = await fetchPublic('/reviews?approvedOnly=true');

        if (reviews.length === 0) {
            grid.innerHTML = '<p style="text-align:center; width:100%;">No reviews yet.</p>';
            return;
        }

        grid.innerHTML = ''; // Clear hardcoded

        reviews.forEach(review => {
            const card = document.createElement('article');
            card.className = 'review-card'; // Or 'review' if script.js expects that class

            // script.js looks for .review for pinned animations?
            // "const reviews = sec.querySelectorAll('.review');" in initPinnedSectionsSnapped
            // The hardcoded HTML uses "review-card".
            // If I change class to 'review', the pinned animation might work.
            // But CSS might be bound to .review-card.
            // I'll keep 'review-card' to match index.html styles.
            // But if script.js wants .review, maybe I add both?
            card.classList.add('review');

            // Stars
            const rating = review.rating || 5;
            const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);

            // Pill/Source
            const source = review.source || 'Client';

            card.innerHTML = `
                <div class="review-top">
                    <div class="stars" aria-label="${rating} star rating">${stars}</div>
                    <span class="review-pill">${source}</span>
                </div>
                <p class="review-text">${review.description || ''}</p>
                <div class="review-footer">
                    <span class="review-name">${review.client_name}</span>
                    <!-- Location not in DB, omit or use default -->
                </div>
            `;

            grid.appendChild(card);
        });

        // Trigger animations/refresh if needed
        if (window.ScrollTrigger) {
            window.ScrollTrigger.refresh();
        }

    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

document.addEventListener('DOMContentLoaded', initReviews);
