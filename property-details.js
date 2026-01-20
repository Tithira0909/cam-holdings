import { fetchPublic, getImageUrl } from './client-api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const section = params.get('section');
    const id = params.get('id');

    if (!section || !id) {
        // Fallback or error
        document.getElementById('property-content').innerHTML = '<div style="color:white; text-align:center; padding:4rem;">Invalid property link.</div>';
        return;
    }

    try {
        const property = await fetchPublic(`/${section}/${id}`);
        renderProperty(property);
    } catch (error) {
        console.error('Error loading property:', error);
        document.getElementById('property-content').innerHTML =
            '<div style="text-align:center; padding: 4rem; color: white;"><h2>Property Not Found</h2><p>The requested property could not be loaded.</p><a href="index.html" style="color: #d6b25e;">Return Home</a></div>';
    }
});

function renderProperty(prop) {
    const heroBg = getImageUrl(prop.main_image);
    const safe = (str) => str ? String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;") : '';

    // Build gallery html
    let galleryHtml = '';
    let images = [];

    // Parse JSON sub_images
    if (prop.sub_images) {
        try {
            if (Array.isArray(prop.sub_images)) {
                images = prop.sub_images;
            } else {
                images = JSON.parse(prop.sub_images);
            }
        } catch (e) {
            console.warn('Failed to parse gallery images', e);
        }
    }

    if (images && images.length > 0) {
        galleryHtml = `
            <h3 style="color:white; margin-top:3rem;">Gallery</h3>
            <div class="gallery-grid">
                ${images.map(img => `<img src="${getImageUrl(img)}" class="gallery-item" loading="lazy" onerror="this.onerror=null;this.src='/placeholder.svg';">`).join('')}
            </div>
        `;
    }

    const dateStr = prop.created_at ? new Date(prop.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '';

    const html = `
        <section class="prop-hero" style="background-image: url('${heroBg}');">
            <div class="prop-hero__content">
                <h1 class="prop-title">${safe(prop.name)}</h1>
                ${dateStr ? `<div style="color:#ccc; font-size:0.9rem; margin-bottom:0.5rem; text-transform:uppercase; letter-spacing:1px;">Listed: ${dateStr}</div>` : ''}
                <div class="prop-price">${safe(prop.estimated_cost || 'Price on Request')}</div>
            </div>
        </section>

        <section class="prop-body">
            <div>
                <h2 style="color:white; margin-bottom:1rem;">Project Details</h2>
                <div class="prop-desc">${safe(prop.description || '').replace(/\n/g, '<br>')}</div>
                ${galleryHtml}
            </div>

            <aside>
                <div class="prop-sidebar">
                    <h3 style="color:white; margin-top:0;">Interested?</h3>
                    <p style="color:#ccc; margin-bottom:1.5rem;">Contact us to schedule a viewing or request a proposal.</p>
                    <a href="contact.html?subject=Inquiry: ${encodeURIComponent(prop.name)}" class="cam-btn cam-btn--gold" style="width:100%; text-align:center; display:block;">Request Proposal</a>
                </div>
            </aside>
        </section>
    `;

    document.getElementById('property-content').innerHTML = html;
}
