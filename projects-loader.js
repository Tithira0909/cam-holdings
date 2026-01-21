import { fetchPublic, getImageUrl } from './client-api.js';

let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'featured';

async function loadProjects() {
    const grid = document.getElementById('gridCards');
    const empty = document.getElementById('empty');
    if (!grid) return;

    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Loading projects...</p>';
    if (empty) empty.hidden = true;

    try {
        const queryParams = new URLSearchParams({
            active: 'true',
            category: currentCategory === 'all' ? '' : currentCategory,
            q: currentSearch,
            sort: currentSort
        });

        // The fetchPublic function handles the /api prefix.
        // We pass the path relative to /api.
        const data = await fetchPublic(`/projects?${queryParams.toString()}`);

        // Handle response format: new API returns { items: [...] }
        const projects = Array.isArray(data) ? data : (data.items || []);

        grid.innerHTML = '';

        if (projects.length === 0) {
            if (empty) empty.hidden = false;
            else grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No projects found.</p>';
            return;
        }

        projects.forEach(project => {
            const card = document.createElement('article');
            card.className = 'card';

            const imageUrl = getImageUrl(project.image_url);

            // Format Category
            let categoryDisplay = 'Project';
            if (project.category) {
                // Capitalize
                categoryDisplay = project.category.charAt(0).toUpperCase() + project.category.slice(1);
            } else if (project.service_name) {
                categoryDisplay = project.service_name;
            }

            // Meta: Location • Budget
            const metaParts = [];
            if (project.location) metaParts.push(project.location);
            if (project.budget) {
                // If it looks like a number, format it?
                // DB has budget as TEXT (VARCHAR).
                // We'll display as is for flexibility or simple format if desired.
                metaParts.push(project.budget);
            }
            const metaText = metaParts.join(' • ');

            // Link logic: prioritize slug
            const linkParam = project.slug ? `slug=${project.slug}` : `id=${project.id}`;
            const linkUrl = `project-details.html?${linkParam}`;

            card.innerHTML = `
                <a class="card-link" href="${linkUrl}">
                    <div class="media" style="background-image:url('${imageUrl}')"></div>
                    <div class="glass">
                        <div class="badge">${categoryDisplay}</div>
                        <h3 class="title">${project.title}</h3>
                        <p class="meta">${metaText}</p>
                        <div class="line"></div>
                        <p class="desc">${project.description || ''}</p>
                        <div class="cta">View Project →</div>
                    </div>
                </a>
            `;

            grid.appendChild(card);
        });

        // Refresh ScrollTrigger if available (for animations)
        if (window.ScrollTrigger) {
            window.ScrollTrigger.refresh();
        }

    } catch (error) {
        console.error('Error loading projects:', error);
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Error loading projects. Check backend connection.</p>';
    }
}

function initFiltering() {
    const qInput = document.getElementById("q");
    const chips = document.getElementById("chips");
    const sortSelect = document.getElementById("sort");
    const resetBtn = document.getElementById("reset");

    // Search Debounce
    let searchTimeout;
    if (qInput) {
        qInput.addEventListener("input", (e) => {
            currentSearch = e.target.value.trim();
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(loadProjects, 500);
        });
    }

    // Sort Change
    if (sortSelect) {
        sortSelect.addEventListener("change", (e) => {
            currentSort = e.target.value;
            loadProjects();
        });
    }

    // Category Chips
    if (chips) {
        chips.addEventListener("click", (e) => {
            const btn = e.target.closest(".chip");
            if (!btn) return;

            // UI Toggle
            chips.querySelectorAll(".chip").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            currentCategory = btn.dataset.tag; // 'all', 'interior', etc.
            loadProjects();
        });
    }

    // Reset Button
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            if (qInput) qInput.value = "";
            currentSearch = "";

            currentCategory = "all";
            if (chips) {
                chips.querySelectorAll(".chip").forEach(b => b.classList.remove("active"));
                const allChip = chips.querySelector('[data-tag="all"]');
                if (allChip) allChip.classList.add("active");
            }

            currentSort = "featured";
            if (sortSelect) sortSelect.value = "featured";

            loadProjects();
        });
    }

    // Initial Load
    loadProjects();
}

document.addEventListener('DOMContentLoaded', initFiltering);
