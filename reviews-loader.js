import { fetchPublic, postPublic } from './client-api.js';

// Helper for XSS protection
const safe = (str) => str ? String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;") : '';

// --- FETCH & DISPLAY ---
async function initReviews() {
    const grid = document.querySelector('.reviews-grid');
    if (!grid) return;

    try {
        // Updated Endpoint: returns only active & published reviews
        const reviews = await fetchPublic('/public/reviews');

        if (!reviews || reviews.length === 0) {
            grid.innerHTML = '<p style="text-align:center; width:100%; color:#888;">No reviews yet. Be the first!</p>';
            return;
        }

        grid.innerHTML = '';

        reviews.forEach(review => {
            const card = document.createElement('article');
            card.className = 'review-card review'; // 'review' class used by script.js for animations

            const rating = review.rating || 5;
            const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);

            // Sanitize inputs
            const source = safe(review.source || 'Client');
            const name = safe(review.name || review.client_name || 'Anonymous');
            const msg = safe(review.message || review.description || '');

            card.innerHTML = `
                <div class="review-top">
                    <div class="stars" style="color:var(--gold); letter-spacing:2px;">${stars}</div>
                    <span class="review-pill">${source}</span>
                </div>
                <p class="review-text">"${msg}"</p>
                <div class="review-footer">
                    <span class="review-name" style="color:var(--gold); font-weight:600;">${name}</span>
                </div>
            `;

            grid.appendChild(card);
        });

        // Trigger ScrollTrigger refresh if present (for pinning logic)
        if (window.ScrollTrigger) {
            window.ScrollTrigger.refresh();
        }

        // Entrance Animation (since script.js likely missed these due to async load)
        if (window.gsap) {
            window.gsap.fromTo('.review',
                { autoAlpha: 0, y: 20 },
                { autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out' }
            );
        }

    } catch (error) {
        console.error('Error loading reviews:', error);
        grid.innerHTML = '<p style="color:red; text-align:center;">Failed to load reviews.</p>';
    }
}

// --- MODAL & FORM LOGIC ---
function initReviewForm() {
    const openBtn = document.getElementById('openReviewBtn');
    const closeBtn = document.getElementById('closeReviewBtn');
    const modal = document.getElementById('publicReviewModal');
    const form = document.getElementById('publicReviewForm');
    const msgEl = document.getElementById('reviewMsg');

    if (!openBtn || !modal || !form) return;

    // Toggle Modal
    openBtn.addEventListener('click', () => {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
    });

    const closeModal = () => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        form.reset();
        msgEl.textContent = '';
        msgEl.className = 'form-msg';
        updateStars(5);
    };

    closeBtn.addEventListener('click', closeModal);

    // Star Rating UI
    const starContainer = document.getElementById('starRatingInput');
    const ratingInput = document.getElementById('ratingInput');
    const stars = starContainer ? starContainer.querySelectorAll('span') : [];

    function updateStars(val) {
        stars.forEach(s => {
            const v = parseInt(s.dataset.val);
            if (v <= val) s.classList.add('selected');
            else s.classList.remove('selected');
        });
        ratingInput.value = val;
    }

    if (starContainer) {
        stars.forEach(s => {
            s.addEventListener('click', () => updateStars(parseInt(s.dataset.val)));
            s.addEventListener('mouseenter', () => {
                const val = parseInt(s.dataset.val);
                stars.forEach(st => {
                    const v = parseInt(st.dataset.val);
                    if (v <= val) st.classList.add('hover');
                    else st.classList.remove('hover');
                });
            });
        });
        starContainer.addEventListener('mouseleave', () => {
            stars.forEach(s => s.classList.remove('hover'));
        });
    }

    // Submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Submitting...';
        msgEl.textContent = '';

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Basic validation
        if (!data.name || !data.message) {
            msgEl.textContent = 'Please fill in all required fields.';
            msgEl.className = 'form-msg error';
            btn.disabled = false;
            btn.textContent = 'Submit Review';
            return;
        }

        try {
            // POST to /public/reviews
            const result = await postPublic('/public/reviews', data);

            msgEl.textContent = 'Review submitted! Pending approval.';
            msgEl.className = 'form-msg success';

            setTimeout(() => {
                closeModal();
                btn.disabled = false;
                btn.textContent = 'Submit Review';
            }, 2000);

        } catch (error) {
            console.error(error);
            msgEl.textContent = 'Failed to submit review. Please try again.';
            msgEl.className = 'form-msg error';
            btn.disabled = false;
            btn.textContent = 'Submit Review';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initReviews();
    initReviewForm();
});
