import { fetchPublic, getImageUrl } from './client-api.js';

async function initProjects() {
    const grid = document.getElementById('gridCards');
    if (!grid) return;

    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Loading projects...</p>';

    // Read category from URL if present
    const params = new URLSearchParams(window.location.search);
    const categoryFilter = params.get('category'); // e.g. 'Real Estate'

    try {
        let endpoint = '/projects?active=true';
        if (categoryFilter) {
            endpoint += `&category=${encodeURIComponent(categoryFilter)}`;
        }

        const projects = await fetchPublic(endpoint);

        if (projects.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No projects found.</p>';
            return;
        }

        grid.innerHTML = '';

        projects.forEach(project => {
            const card = document.createElement('article');
            card.className = 'card';

            const text = (project.title + ' ' + (project.description || '')).toLowerCase();
            // Tags logic can remain client side or rely on backend category
            const tags = [];
            if (project.category) tags.push(project.category.toLowerCase());

            card.dataset.tags = tags.join(' ');
            card.dataset.title = project.title;
            card.dataset.date = project.created_at ? project.created_at.split('T')[0] : '';

            const metaParts = [];
            if (project.location) metaParts.push(project.location);
            if (project.progress_status) metaParts.push(project.progress_status);
            const metaText = metaParts.join(' • ');

            const badgeText = project.category || 'Project';

            const rawImage = project.image_url || project.cover_image;
            const imageUrl = getImageUrl(rawImage);

            // Link to project details
            const link = project.slug ? `project-details.html?slug=${project.slug}` : `project-details.html?id=${project.id}`;

            card.innerHTML = `
                <a class="card-link" href="${link}">
                    <div class="media-wrapper">
                        <img
                            src="${imageUrl}"
                            alt="${project.title}"
                            loading="lazy"
                            decoding="async"
                            class="card-img"
                            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                        />
                        <div class="fallback-placeholder" style="display: none;">
                            <div class="fallback-icon-box"></div>
                            <span>No Image Available</span>
                        </div>
                    </div>
                    <div class="glass">
                        <div class="badge">${badgeText}</div>
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

        initFiltering();
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();

    } catch (error) {
        console.error('Error loading projects:', error);
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Error loading projects.</p>';
    }
}

function initFiltering() {
    // Keep existing client-side filtering logic if chips are used
    const q = document.getElementById("q");
    const chips = document.getElementById("chips");
    const sort = document.getElementById("sort");
    const cardsWrap = document.getElementById("gridCards");
    const empty = document.getElementById("empty");
    const resetBtn = document.getElementById("reset");

    let activeTag = "all";

    function getCards(){
      return Array.from(cardsWrap.querySelectorAll(".card"));
    }

    function apply(){
      const term = (q?.value || "").trim().toLowerCase();
      const cards = getCards();

      let filtered = cards.filter(c => {
        const tags = (c.dataset.tags || "").toLowerCase();
        const title = (c.dataset.title || "").toLowerCase();
        const tagOk = (activeTag === "all") || tags.includes(activeTag);
        const termOk = !term || title.includes(term) || tags.includes(term);
        return tagOk && termOk;
      });

      const mode = sort ? sort.value : "featured";
      filtered.sort((a,b) => {
        const ta = (a.dataset.title || "");
        const tb = (b.dataset.title || "");
        const da = new Date(a.dataset.date || "2000-01-01");
        const db = new Date(b.dataset.date || "2000-01-01");
        if(mode === "newest") return db - da;
        if(mode === "oldest") return da - db;
        if(mode === "az") return ta.localeCompare(tb);
        return 0;
      });

      cards.forEach(c => c.style.display = "none");
      filtered.forEach(c => {
        c.style.display = "";
        cardsWrap.appendChild(c);
      });

      if (empty) {
          empty.hidden = filtered.length !== 0;
      }
    }

    if (chips) {
        chips.addEventListener("click", (e) => {
            const btn = e.target.closest(".chip");
            if(!btn) return;
            activeTag = btn.dataset.tag;
            chips.querySelectorAll(".chip").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            apply();
        });
    }

    if (q) q.addEventListener("input", apply);
    if (sort) sort.addEventListener("change", apply);

    if(resetBtn){
      resetBtn.addEventListener("click", () => {
        if(q) q.value = "";
        activeTag = "all";
        if(chips) {
            chips.querySelectorAll(".chip").forEach(b => b.classList.remove("active"));
            const allChip = chips.querySelector('[data-tag="all"]');
            if (allChip) allChip.classList.add("active");
        }
        if (sort) sort.value = "featured";
        apply();
      });
    }

    apply();
}

document.addEventListener('DOMContentLoaded', initProjects);
