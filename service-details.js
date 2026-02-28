import { fetchPublic, getImageUrl } from './client-api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    const id = params.get('id');
    const param = slug || id;

    if (!param) {
        document.getElementById('service-content').innerHTML = '<div style="color:white; text-align:center; padding:4rem;">Invalid link.</div>';
        return;
    }

    try {
        const item = await fetchPublic(`/services/${param}`);
        renderService(item);
    } catch (error) {
        console.error('Error loading service:', error);
        document.getElementById('service-content').innerHTML =
            '<div style="text-align:center; padding: 4rem; color: white;"><h2>Not Found</h2><p>The requested service could not be loaded.</p><a href="services.html" style="color: #d6b25e;">Return to Services</a></div>';
    }
});

function renderService(item) {
    const heroBg = getImageUrl(item.cover_image || item.image_url);
    const safe = (str) => str ? String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;") : '';

    const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '';

    const html = `
        <section class="prop-hero" style="background-image: url('${heroBg}');">
            <div class="prop-hero__content">
                ${item.category ? `<div style="display:inline-block; padding:6px 12px; background:rgba(214,178,94,0.9); color:#000; font-weight:bold; font-size:0.8rem; border-radius:4px; margin-bottom:1rem; text-transform:uppercase;">${safe(item.category)}</div>` : ''}
                <h1 class="prop-title">${safe(item.title || item.name)}</h1>
                ${dateStr ? `<div style="color:#ccc; font-size:0.9rem; margin-bottom:0.5rem; text-transform:uppercase; letter-spacing:1px;">Posted: ${dateStr}</div>` : ''}
            </div>
        </section>

        <section class="prop-body">
            <div>
                <h2 style="color:white; margin-bottom:1rem;">Description</h2>
                <div class="prop-desc">${safe(item.description || '').replace(/\n/g, '<br>')}</div>
            </div>

            <aside>
                <div class="prop-sidebar">
                    <h3 style="color:white; margin-top:0;">Interested?</h3>
                    <p style="color:#ccc; margin-bottom:1.5rem;">Contact us to know more about this service.</p>
                    <a href="contact.html?subject=Inquiry: ${encodeURIComponent(item.title || item.name)}" class="cam-btn cam-btn--gold" style="width:100%; text-align:center; display:block;">Inquire Now</a>
                </div>
            </aside>
        </section>
    `;

    document.getElementById('service-content').innerHTML = html;
}
