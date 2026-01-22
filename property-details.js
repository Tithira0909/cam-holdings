import { fetchPublic, getImageUrl } from './client-api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const section = params.get('section');
    const id = params.get('id');

    if (!section || !id) {
        document.getElementById('property-content').innerHTML = '<div style="color:white; text-align:center; padding:4rem;">Invalid property link.</div>';
        return;
    }

    try {
        const property = await fetchPublic(`/public/${section}/${id}`);
        if (!property) throw new Error('Property not found');
        renderProperty(property);
    } catch (error) {
        console.error('Error loading property:', error);
        document.getElementById('property-content').innerHTML =
            '<div style="text-align:center; padding: 4rem; color: white;"><h2>Property Not Found</h2><p>The requested property could not be loaded.</p><a href="index.html" style="color: #d6b25e;">Return Home</a></div>';
    }
});

function renderProperty(prop) {
    const safe = (str) => str ? String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;") : '';

    // Image Logic
    let heroBg = null;
    let images = [];

    // Parse sub_images first as we might need them for fallback
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

    // Determine Main Image
    if (prop.main_image) {
        heroBg = getImageUrl(prop.main_image);
    } else if (images.length > 0) {
        heroBg = getImageUrl(images[0]);
    }
    // Else heroBg remains null

    // Cost Logic
    const costDisplay = prop.estimated_cost ? safe(prop.estimated_cost) : 'Price on Request';

    // Gallery HTML
    let galleryHtml = '';
    if (images && images.length > 0) {
        galleryHtml = `
            <h3 style="color:white; margin-top:3rem; font-family: 'Inter', sans-serif;">Gallery</h3>
            <div class="gallery-grid">
                ${images.map(img => `<img src="${getImageUrl(img)}" class="gallery-item" loading="lazy" alt="Property Image" onerror="this.style.display='none'">`).join('')}
            </div>
        `;
    }

    // Hero Style
    let heroStyle = '';
    let heroClass = 'prop-hero';
    if (heroBg) {
        heroStyle = `background-image: url('${heroBg}');`;
    } else {
        heroClass += ' prop-hero--no-image';
    }

    const html = `
        <section class="${heroClass}" style="${heroStyle}">
            <div class="prop-hero__content">
                <h1 class="prop-title" style="font-family: 'Inter', sans-serif;">${safe(prop.name)}</h1>
                <div class="prop-price" style="font-family: 'Inter', sans-serif;">${costDisplay}</div>
            </div>
        </section>

        <section class="prop-body">
            <div>
                <h2 style="color:white; margin-bottom:1rem; font-family: 'Inter', sans-serif;">Project Details</h2>
                <div class="prop-desc" style="font-family: 'Inter', sans-serif;">${safe(prop.description || '').replace(/\n/g, '<br>')}</div>
                ${galleryHtml}
            </div>

            <aside>
                <div class="prop-sidebar">
                    <h3 style="color:white; margin-top:0; font-family: 'Inter', sans-serif;">Interested?</h3>
                    <p style="color:#ccc; margin-bottom:1.5rem; font-family: 'Inter', sans-serif;">Contact us to schedule a viewing or request a proposal.</p>
                    <a href="contact.html?subject=Inquiry: ${encodeURIComponent(prop.name)}" class="cam-btn cam-btn--gold" style="width:100%; text-align:center; display:block;">Request Proposal</a>
                </div>
            </aside>
        </section>
    `;

    document.getElementById('property-content').innerHTML = html;
}
