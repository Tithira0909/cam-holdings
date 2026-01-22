import { fetchPublic, getImageUrl } from './client-api.js';

document.addEventListener('DOMContentLoaded', () => {
    loadHomeProjects();
});

async function loadHomeProjects() {
    const grid = document.getElementById('home-projects-grid');
    if (!grid) return;

    try {
        const projects = await fetchPublic('/projects');

        if (!projects || projects.length === 0) {
            renderEmpty(grid);
            return;
        }

        // Filter: Active only
        let active = projects.filter(p => p.status === 'Active' || p.status === 'Published');

        // Prioritize Featured
        active.sort((a, b) => {
            // Sort by is_featured desc
            const fA = (a.is_featured === 1 || a.is_featured === true) ? 1 : 0;
            const fB = (b.is_featured === 1 || b.is_featured === true) ? 1 : 0;
            if (fA !== fB) return fB - fA;
            // Then by date desc
            return new Date(b.created_at) - new Date(a.created_at);
        });

        // Limit to 3
        const displayProjects = active.slice(0, 3);

        if (displayProjects.length === 0) {
            renderEmpty(grid);
            return;
        }

        grid.innerHTML = displayProjects.map(p => createGlassCard(p)).join('');

    } catch (error) {
        console.error('Error loading home projects:', error);
        grid.innerHTML = '<p style="color:red; text-align:center;">Failed to load projects.</p>';
    }
}

function renderEmpty(grid) {
    grid.innerHTML = `
        <div class="hp-empty">
            <p style="color:var(--muted);">New projects coming soon.</p>
        </div>
    `;
}

function createGlassCard(p) {
    // Priority: Featured Image -> Main Image -> Thumbnail -> First Gallery Image -> Placeholder
    // Schema says: image_url, thumbnail_image, main_image, gallery_images
    // Let's check what backend returns. Usually 'image_url' is the main one in simple schema,
    // but the migration added 'main_image' and 'thumbnail_image'.
    // Let's try main_image first, then image_url.
    const imgPath = p.main_image || p.image_url || p.thumbnail_image;
    const imgUrl = getImageUrl(imgPath);

    const safe = (str) => str ? String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;") : '';

    const title = safe(p.title);

    // Service Tags
    // If we don't have joined service names, we infer or use a default
    // Ideally we would have 'service_name' if we used the joined query, but /projects is SELECT *
    // We can use a placeholder or generic text if specific data is missing.
    // However, for "Real Estate Projects", we can default to "Real Estate Development" if no tag.
    let tags = "Real Estate & Development";
    // If description contains keywords, we can spice it up
    const desc = (p.description || "").toLowerCase();
    if (desc.includes('interior')) tags += " • Interiors";
    if (desc.includes('construct')) tags += " • Construction";

    const catLabel = p.is_featured ? "Featured Project" : "Selected Work";

    return `
        <a href="project-details.html?id=${p.id}" class="glass-project-card">
            <div class="gpc-bg" style="background-image: url('${imgUrl}');"></div>
            <div class="gpc-overlay"></div>
            <div class="gpc-content">
                <div class="gpc-cat">${catLabel}</div>
                <h3 class="gpc-title">${title}</h3>
                <div class="gpc-tags">${tags}</div>
            </div>
        </a>
    `;
}
