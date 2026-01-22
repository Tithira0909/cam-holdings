import { fetchPublic, getImageUrl } from './client-api.js';

async function initBlogs() {
    const grid = document.getElementById('blogGrid');
    const featuredContainer = document.querySelector('.b-feed'); // Container that holds featured + grid

    if (!grid || !featuredContainer) return;

    // Show loading
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Loading blogs...</p>';

    try {
        const blogs = await fetchPublic('/blogs');

        if (blogs.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No blogs found.</p>';
            // Hide featured if it exists as placeholder?
            const existingFeatured = featuredContainer.querySelector('.b-featured');
            if (existingFeatured) existingFeatured.style.display = 'none';
            return;
        }

        // Separate featured
        let featuredBlog = blogs.find(b => b.is_featured);
        if (!featuredBlog && blogs.length > 0) {
            featuredBlog = blogs[0];
        }

        // Grid blogs are all except the one shown as featured (or all if we want to duplicate? usually not)
        const gridBlogs = blogs.filter(b => b.id !== (featuredBlog ? featuredBlog.id : -1));

        // Render Featured
        if (featuredBlog) {
            renderFeatured(featuredBlog, featuredContainer);
        } else {
             // If for some reason no featured blog (empty list handled above), hide static featured
             const existingFeatured = featuredContainer.querySelector('.b-featured');
             if (existingFeatured) existingFeatured.style.display = 'none';
        }

        // Render Grid
        grid.innerHTML = ''; // Clear loading/static
        gridBlogs.forEach(blog => {
            const card = createBlogCard(blog);
            grid.appendChild(card);
        });

        initBlogFiltering();

    } catch (error) {
        console.error('Error loading blogs:', error);
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Error loading blogs.</p>';
    }
}

function getSnippet(html) {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent || div.innerText || '';
    return text.substring(0, 100) + (text.length > 100 ? '...' : '');
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function createBlogCard(blog) {
    const card = document.createElement('article');
    card.className = 'b-card';

    // Tags: use type or infer
    const tags = (blog.type || '').toLowerCase(); // e.g., "News Content" -> "news content"
    // Map backend types to frontend tags if needed, or just use as is.
    // Frontend tags: interior, architecture, materials, construction, budget

    card.dataset.tags = tags;
    card.dataset.title = blog.title;
    card.dataset.date = blog.created_at ? blog.created_at.split('T')[0] : '';

    const imageUrl = getImageUrl(blog.featured_image_url || blog.banner_url);
    const dateDisplay = formatDate(blog.created_at);
    const snippet = getSnippet(blog.content_html);
    const typeDisplay = blog.type || 'Blog';

    // Determine link
    const link = `blog.html?slug=${blog.slug || ''}&id=${blog.id}`;

    card.innerHTML = `
        <a class="b-card-link" href="${link}">
            <div class="b-media" style="background-image:url('${imageUrl}')"></div>
            <div class="b-glass">
            <div class="b-top">
                <span class="b-tag">${typeDisplay}</span>
                <span class="b-date2">${dateDisplay}</span>
            </div>
            <h3 class="b-title">${blog.title}</h3>
            <p class="b-snippet">${snippet}</p>
            <div class="b-bottom">
                <span class="b-mini">Read →</span>
            </div>
            </div>
        </a>
    `;
    return card;
}

function renderFeatured(blog, container) {
    // Find existing .b-featured to replace or update
    let featuredEl = container.querySelector('.b-featured');

    // If we want to replace it completely to match structure:
    if (!featuredEl) {
        featuredEl = document.createElement('article');
        featuredEl.className = 'b-featured';
        container.insertBefore(featuredEl, container.firstChild);
    }

    // Ensure it is visible
    featuredEl.style.display = '';

    const tags = (blog.type || '').toLowerCase();
    featuredEl.dataset.tags = tags;
    featuredEl.dataset.title = blog.title;
    featuredEl.dataset.date = blog.created_at ? blog.created_at.split('T')[0] : '';

    const imageUrl = getImageUrl(blog.featured_image_url || blog.banner_url);
    const dateDisplay = formatDate(blog.created_at);
    const snippet = getSnippet(blog.content_html);
    const typeDisplay = blog.type || 'Featured';

    // Determine link
    const link = `blog.html?slug=${blog.slug || ''}&id=${blog.id}`;

    featuredEl.innerHTML = `
      <a class="b-featured-link" href="${link}">
        <div class="b-featured-media" style="background-image:url('${imageUrl}')"></div>
        <div class="b-featured-glass">
          <div class="b-row">
            <span class="b-pilltag">Featured</span>
            <span class="b-date">${dateDisplay}</span>
          </div>
          <h2 class="b-h2">${blog.title}</h2>
          <p class="b-ex">
            ${snippet}
          </p>
          <div class="b-meta">
            <span class="b-cat">${typeDisplay}</span>
          </div>
          <div class="b-cta">Read Article →</div>
        </div>
      </a>
    `;
}

function initBlogFiltering() {
    const blogQ = document.getElementById("blogQ");
    const blogChips = document.getElementById("blogChips");
    const blogSort = document.getElementById("blogSort");
    const blogGrid = document.getElementById("blogGrid");
    const blogEmpty = document.getElementById("blogEmpty");
    const blogReset = document.getElementById("blogReset");

    let blogActiveTag = "all";

    function blogCards() {
      return Array.from(blogGrid.querySelectorAll(".b-card"));
    }

    function applyBlogs() {
      const term = (blogQ.value || "").trim().toLowerCase();
      const cards = blogCards();

      let filtered = cards.filter(c => {
        const tags = (c.dataset.tags || "").toLowerCase();
        const title = (c.dataset.title || "").toLowerCase();
        const tagOk = (blogActiveTag === "all") || tags.includes(blogActiveTag);
        const termOk = !term || title.includes(term) || tags.includes(term);
        return tagOk && termOk;
      });

      const mode = blogSort.value;
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
      filtered.forEach(c => { c.style.display = ""; blogGrid.appendChild(c); });

      if (blogEmpty) blogEmpty.hidden = filtered.length !== 0;
    }

    if (blogChips) {
        blogChips.addEventListener("click", (e) => {
        const btn = e.target.closest(".b-chip");
        if(!btn) return;
        blogActiveTag = btn.dataset.tag;
        blogChips.querySelectorAll(".b-chip").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        applyBlogs();
        });
    }

    if (blogQ) blogQ.addEventListener("input", applyBlogs);
    if (blogSort) blogSort.addEventListener("change", applyBlogs);

    if(blogReset){
      blogReset.addEventListener("click", () => {
        blogQ.value = "";
        blogActiveTag = "all";
        blogChips.querySelectorAll(".b-chip").forEach(b => b.classList.remove("active"));
        const allChip = blogChips.querySelector('[data-tag="all"]');
        if (allChip) allChip.classList.add("active");
        blogSort.value = "featured";
        applyBlogs();
      });
    }

    // Sidebar topic quick-jump -> activates chip
    document.querySelectorAll("[data-jump]").forEach(a => {
      a.addEventListener("click", () => {
        const tag = a.getAttribute("data-jump");
        const chip = blogChips.querySelector(`[data-tag="${tag}"]`);
        if(chip) chip.click();
      });
    });

    applyBlogs();
}

document.addEventListener('DOMContentLoaded', initBlogs);
