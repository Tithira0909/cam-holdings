document.addEventListener('DOMContentLoaded', async () => {
    const list = document.getElementById('re-projects-list');
    if (!list) return;

    const safe = (str) => str ? String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;") : '';

    try {
        // Fetch projects with pillar=real-estate and sort=featured
        const response = await fetch('/api/projects?pillar=real-estate&sort=featured');
        const projects = await response.json();

        if (!projects || projects.length === 0) {
            list.innerHTML = '<p style="color:rgba(255,255,255,0.5)">No exclusive properties listed at the moment.</p>';
            return;
        }

        list.innerHTML = projects.map(p => {
            const imgUrl = p.image_url ? (p.image_url.startsWith('/') ? p.image_url : '/uploads/' + p.image_url.split(/[/\\]/).pop()) : 'https://via.placeholder.com/400x300';
            const link = p.slug ? `/project-details.html?slug=${safe(p.slug)}` : `/project-details.html?id=${p.id}`;

            return `
            <div class="whycam-card" onclick="window.location.href='${link}'" style="cursor:pointer; padding:0; overflow:hidden;">
                <div style="height:220px; background:url('${safe(imgUrl)}') center/cover;"></div>
                <div style="padding:18px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <span class="gold" style="font-size:0.85rem; letter-spacing:0.05em; text-transform:uppercase;">${safe(p.budget || 'Price On Request')}</span>
                        ${p.status === 'Active' ? '<span style="font-size:0.7rem; padding:2px 6px; border:1px solid rgba(255,255,255,0.2); border-radius:4px;">ACTIVE</span>' : ''}
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
