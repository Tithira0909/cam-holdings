import { fetchPublic, getImageUrl } from './client-api.js';

async function initProjects() {
    const grid = document.getElementById('gridCards');
    if (!grid) return;

    // Show loading state or clear
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Loading projects...</p>';

    try {
        // Fetch active projects
        const response = await fetchPublic('/projects?active=true');
        const projects = response.items || response; // Handle { items: [] } or []

        if (!projects || projects.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #888;">No projects found.</p>';
            return;
        }

        grid.innerHTML = ''; // Clear loading

        projects.forEach(project => {
            const card = document.createElement('article');
            card.className = 'card';

            // Priority: Main Image (Featured) > First Gallery > Thumbnail > Legacy Image
            let img = project.main_image;
            if (!img && project.gallery_images) {
                try {
                    const gallery = typeof project.gallery_images === 'string' ? JSON.parse(project.gallery_images) : project.gallery_images;
                    if (Array.isArray(gallery) && gallery.length > 0) img = gallery[0];
                } catch(e){}
            }
            if (!img) img = project.thumbnail_image;
            if (!img) img = project.image_url;

            const imageUrl = getImageUrl(img);

            // Tags Logic
            const text = (project.title + ' ' + (project.description || '')).toLowerCase();
            const tags = [];
            if (text.includes('interior')) tags.push('interior');
            if (text.includes('architecture')) tags.push('architecture');
            if (text.includes('construction')) tags.push('construction');
            if (text.includes('landscape')) tags.push('landscape');
            if (text.includes('commercial')) tags.push('commercial');

            card.dataset.tags = tags.join(' ');
            card.dataset.title = project.title;
            card.dataset.date = project.created_at || '';

            const metaText = project.location || 'Location';
            const badgeText = tags.length > 0 ? tags[0].charAt(0).toUpperCase() + tags[0].slice(1) : 'Project';

            // Truncate description
            let desc = project.description || '';
            if(desc.length > 100) desc = desc.substring(0, 100) + '...';

            card.innerHTML = `
                <a class="card-link" href="project-details.html?id=${project.slug || project.id}">
                    <div class="media" style="background-image:url('${imageUrl}'); background-size: cover; background-position: center;"></div>
                    <div class="glass">
                        <div class="badge">${badgeText}</div>
                        <h3 class="title">${project.title}</h3>
                        <p class="meta">${metaText}</p>
                        <div class="line"></div>
                        <p class="desc">${desc}</p>
                        <div class="cta">View Project →</div>
                    </div>
                </a>
            `;

            grid.appendChild(card);
        });

        // Initialize filtering logic after cards are added
        initFiltering();

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

function initFiltering() {
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
      const term = (q.value || "").trim().toLowerCase();
      const cards = getCards();

      // filter
      let filtered = cards.filter(c => {
        const tags = (c.dataset.tags || "").toLowerCase();
        const title = (c.dataset.title || "").toLowerCase();
        const tagOk = (activeTag === "all") || tags.includes(activeTag);
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
