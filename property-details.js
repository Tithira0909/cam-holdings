import { fetchPublic, getImageUrl } from './client-api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const slug = params.get('slug');
    const identifier = slug || id;

    if (!identifier) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const property = await fetchPublic(`/properties/${identifier}`);
        renderProperty(property);
    } catch (error) {
        console.error('Error loading property:', error);
        document.getElementById('property-content').innerHTML =
            '<div style="text-align:center; padding: 4rem; color: white;"><h2>Property Not Found</h2><p>The requested property could not be loaded.</p><a href="index.html" style="color: #d6b25e;">Return Home</a></div>';
    }
});

function renderProperty(prop) {
    const heroBg = getImageUrl(prop.cover_image);
    const safe = (str) => str ? String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;") : '';

    // Parse Gallery
    let galleryHtml = '';
    try {
        const gallery = JSON.parse(prop.gallery_images || '[]');
        if (Array.isArray(gallery) && gallery.length > 0) {
            galleryHtml = `
                <h3 style="color:white; margin-top:3rem;">Gallery</h3>
                <div class="gallery-grid">
                    ${gallery.map(img => `<img src="${getImageUrl(img)}" class="gallery-item" loading="lazy">`).join('')}
                </div>
            `;
        }
    } catch (e) { console.error('Gallery parse error', e); }

    const html = `
        <section class="prop-hero" style="background-image: url('${heroBg}');">
            <div class="prop-hero__content">
                <div style="font-size: 0.9rem; color: #d6b25e; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">${safe(prop.category || 'Exclusive Listing')}</div>
                <h1 class="prop-title">${safe(prop.title)}</h1>
                <div class="prop-loc">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#d6b25e"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                    ${safe(prop.location || 'Location upon request')}
                </div>
                <div class="prop-price">${safe(prop.price || 'Price on Request')}</div>
            </div>
        </section>

        <section class="prop-body">
            <div>
                <h2 style="color:white; margin-bottom:1rem;">About this Property</h2>
                <div class="prop-desc">${safe(prop.description || 'No description available.').replace(/\n/g, '<br>')}</div>
                ${galleryHtml}
            </div>

            <aside>
                <div class="prop-sidebar">
                    <h3 style="color:white; margin-top:0;">Interested?</h3>
                    <p style="color:#ccc; margin-bottom:1.5rem;">Contact us to schedule a viewing or request more information about this property.</p>
                    <a href="contact.html?subject=Inquiry: ${encodeURIComponent(prop.title)}" class="cam-btn cam-btn--gold" style="width:100%; text-align:center; display:block;">Request Details</a>
                    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1); color: #888; font-size: 0.9rem;">
                        <strong>ID:</strong> ${prop.id}<br>
                        <strong>Type:</strong> ${safe(prop.service_category)}
                    </div>
                </div>
            </aside>
        </section>
    `;

    document.getElementById('property-content').innerHTML = html;
}
