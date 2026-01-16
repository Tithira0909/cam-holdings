document.addEventListener('DOMContentLoaded', async () => {
    const list = document.getElementById('re-projects-list');
    if (!list) return;

    const safe = (str) => str ? String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;") : '';

    try {
        // Fetch from new Real Estate API
        const response = await fetch('/api/real-estate/properties?featured=true');
        const projects = await response.json();

        if (!projects || projects.length === 0) {
            list.innerHTML = '<p style="color:rgba(255,255,255,0.5)">No exclusive properties listed at the moment.</p>';
            return;
        }

        list.innerHTML = projects.map(p => {
            const imgUrl = p.cover_image_url || 'https://via.placeholder.com/400x300';
            const link = `/property.html?slug=${safe(p.slug)}`;

            return `
            <div class="whycam-card" onclick="window.location.href='${link}'" style="cursor:pointer; padding:0; overflow:hidden;">
                <div style="height:220px; background:url('${safe(imgUrl)}') center/cover;"></div>
                <div style="padding:18px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <span class="gold" style="font-size:0.85rem; letter-spacing:0.05em; text-transform:uppercase;">${safe(p.price_budget || 'Price On Request')}</span>
                    </div>
                    <h3 style="margin-bottom:6px;">${safe(p.title)}</h3>
                    <p style="font-size:0.9rem; color:var(--muted);">${safe(p.location || '')}</p>
                </div>
            </div>
            `;
        }).join('');

    } catch (e) {
        console.error(e);
        list.innerHTML = '<p style="color:red">Failed to load properties.</p>';
    }
});
