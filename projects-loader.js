import { fetchPublic, getImageUrl } from './client-api.js';

async function initProjects() {
    const grid = document.getElementById('gridCards');
    if (!grid) return;

    // Show loading state or clear
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Loading projects...</p>';

    // Parse query params
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('cat') || urlParams.get('pillar') || '';

    try {
        let endpoint = '/projects';
        if (category) {
            endpoint += `?pillar=${encodeURIComponent(category)}`;
        }

        const projects = await fetchPublic(endpoint);

        if (projects.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No projects found.</p>';
            return;
        }

        grid.innerHTML = ''; // Clear loading

        projects.forEach(project => {
            if (project.status === 'Inactive') return; // Filter out inactive if needed

            const card = document.createElement('article');
            card.className = 'card';

            // Infer tags from service_slug or title/description for filtering
            const tags = [];
            const slug = (project.service_slug || '').toLowerCase();
            const text = (project.title + ' ' + (project.description || '')).toLowerCase();

            if (slug) tags.push(slug);
            if (text.includes('interior')) tags.push('interior');
            if (text.includes('architecture')) tags.push('architecture');
            if (text.includes('construction')) tags.push('construction');
            if (text.includes('landscape')) tags.push('landscape');
            if (text.includes('commercial')) tags.push('commercial');
            if (text.includes('real estate') || slug.includes('real-estate')) tags.push('real-estate');

            card.dataset.tags = tags.join(' ');
            card.dataset.title = project.title;
            card.dataset.date = project.created_at ? project.created_at.split('T')[0] : '';

            // Meta info: Location • Progress or Budget
            const metaParts = [];
            if (project.location) metaParts.push(project.location);
            if (project.progress_status) metaParts.push(project.progress_status);
            const metaText = metaParts.join(' • ');

            // Badge: Category or First tag or 'Project'
            const badgeText = project.category_name || (tags.length > 0 ? tags[0].charAt(0).toUpperCase() + tags[0].slice(1) : 'Project');

            const imageUrl = getImageUrl(project.image_url);

            card.innerHTML = `
                <a class="card-link" href="project-details.html?id=${project.id}">
                    <div class="media" style="background-image:url('${imageUrl}')"></div>
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

        // Initialize filtering logic after cards are added
        initFiltering(category);

        // Initialize animations if needed (from script.js?)
        // script.js uses ScrollTrigger on elements. If we add them late, we might need refresh.
        if (window.ScrollTrigger) {
            window.ScrollTrigger.refresh();
        }
        // Also if script.js has specific project card animations, they might need re-init.
        // But script.js runs on DOMContentLoaded. If we run async, we are later.
        // We might need to manually trigger things or just let it be if it's scroll based and refresh handles it.

    } catch (error) {
        console.error('Error loading projects:', error);
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Error loading projects.</p>';
    }
}

function initFiltering(initialCategory) {
    const q = document.getElementById("q");
    const chips = document.getElementById("chips");
    const sort = document.getElementById("sort");
    const cardsWrap = document.getElementById("gridCards");
    const empty = document.getElementById("empty");
    const resetBtn = document.getElementById("reset");

    // Add Real Estate chip if missing
    if (chips && !chips.querySelector('[data-tag="real-estate"]')) {
        const btn = document.createElement('button');
        btn.className = 'chip';
        btn.dataset.tag = 'real-estate';
        btn.textContent = 'Real Estate';
        chips.appendChild(btn);
    }

    let activeTag = initialCategory || "all";

    // Set initial active chip
    if (activeTag !== "all" && chips) {
        chips.querySelectorAll(".chip").forEach(b => {
            if(b.dataset.tag === activeTag) {
                b.classList.add("active");
                // Remove active from 'all'
                const allBtn = chips.querySelector('[data-tag="all"]');
                if(allBtn) allBtn.classList.remove("active");
            } else {
                b.classList.remove("active");
            }
        });
    }

    function getCards(){
      return Array.from(cardsWrap.querySelectorAll(".card"));
    }

    function apply(){
      const term = (q.value || "").trim().toLowerCase();
      const cards = getCards();

      // filter
      let filtered = cards.filter(c => {
        const tags = (c.dataset.tags || "").toLowerCase();
        const title = (c.dataset.title || "").toLowerCase();
        // Exact match or includes? Includes is safer for multi-tag
        const tagOk = (activeTag === "all") || tags.includes(activeTag.toLowerCase());
        const termOk = !term || title.includes(term) || tags.includes(term);
        return tagOk && termOk;
      });

      // sort
      const mode = sort.value;
      filtered.sort((a,b) => {
        const ta = (a.dataset.title || "");
        const tb = (b.dataset.title || "");
        const da = new Date(a.dataset.date || "2000-01-01");
        const db = new Date(b.dataset.date || "2000-01-01");
        if(mode === "newest") return db - da;
        if(mode === "oldest") return da - db;
        if(mode === "az") return ta.localeCompare(tb);
        return 0; // featured (keep HTML order)
      });

      // render: hide all then append filtered in order
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
        q.value = "";
        activeTag = "all";
        chips.querySelectorAll(".chip").forEach(b => b.classList.remove("active"));
        const allChip = chips.querySelector('[data-tag="all"]');
        if (allChip) allChip.classList.add("active");
        sort.value = "featured";
        apply();
      });
    }

    apply();
}

document.addEventListener('DOMContentLoaded', initProjects);
