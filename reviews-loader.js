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
        if (window.__CAM_REVIEWS_SLIDER__ === true) {
             // Dispatch event to tell script.js to re-calc dots if it's listening,
             // or we rely on user interaction to update.
             // Actually, the initReviewsSlider in script.js sets up event listeners on the track.
             // But it builds dots *once* based on children. We need to rebuild dots.
             // Since we can't easily call initReviewsSlider again without exposing it,
             // let's try to manually trigger a custom event or check if we can re-run logic.
             // For now, let's assume script.js might need a reload or we dispatch a custom event if we implemented that.
             // But simpler: just manually dispatch a resize event which might trigger updates if implemented,
             // OR, better, we can just let it be. The script.js runs on DOMContentLoaded.
             // This loader also runs on DOMContentLoaded. If this runs *after* script.js, the track is empty when script.js runs.
             // We should probably emit an event that script.js listens to, or make script.js robust.
             // I'll update script.js to listen for 'reviews-loaded'.
             window.dispatchEvent(new Event('reviews-loaded'));
        }

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

// --- FORM LOGIC ---
function initReviewForm() {
    const form = document.getElementById('leaveReviewForm');
    const msgEl = document.getElementById('reviewMsg');

    if (!form) return;

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
        if(ratingInput) ratingInput.value = val;
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
        const originalText = btn.textContent;
        btn.textContent = 'Submitting...';
        if(msgEl) msgEl.textContent = '';

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Basic validation
        if (!data.name || !data.message) {
            if(msgEl) {
                msgEl.textContent = 'Please fill in all required fields.';
                msgEl.className = 'form-msg error';
            }
            btn.disabled = false;
            btn.textContent = originalText;
            return;
        }

        try {
            // POST to /public/reviews
            await postPublic('/public/reviews', data);

            if(msgEl) {
                msgEl.textContent = 'Thanks! Your review is pending approval.';
                msgEl.className = 'form-msg success';
            }
            form.reset();
            updateStars(5); // Reset stars

            setTimeout(() => {
                btn.disabled = false;
                btn.textContent = originalText;
                if(msgEl) msgEl.textContent = '';
            }, 5000);

        } catch (error) {
            console.error(error);
            if(msgEl) {
                msgEl.textContent = 'Failed to submit review. Please try again.';
                msgEl.className = 'form-msg error';
            }
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initReviews();
    initReviewForm();
});
