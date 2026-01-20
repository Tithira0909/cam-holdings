import { fetchPublic, getImageUrl } from './client-api.js';

async function initBlogDetails() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug') || params.get('id');
    const container = document.getElementById('blogDetailContainer');

    if (!slug) {
        container.innerHTML = `
            <div style="text-align:center; padding: 100px 20px;">
                <h1>Article Not Found</h1>
                <p>No article specified in the URL.</p>
                <a href="/blogs.html" class="btn primary" style="margin-top:20px;">Back to Blogs</a>
            </div>
        `;
        return;
    }

    // Attempt to fetch. If it looks like a slug (has chars) try slug endpoint first.
    // If we only have ID (numeric), maybe fallback?
    // User requested explicit usage of slug endpoint.
    // Ideally we should use /blogs/slug/:slug if it is a slug.

    // We will try the general purpose one or the explicit one?
    // User said: "Fix backend endpoint to match frontend... GET /api/blogs/slug/:slug"
    // And "Blog detail page must fetch using that slug"

    let endpoint = `/blogs/slug/${slug}`;

    // Fallback logic if we suspect it's an ID (legacy links? though we just fixed them)
    // If the slug is numeric, it might be an ID.
    // But the new API /blogs/slug/:slug expects a slug.
    // If we pass an ID there, it won't find it (unless slug == id string).
    // The previous /blogs/:slug endpoint handled both.
    // Let's use the explicit slug endpoint as requested, but if it fails (404), maybe we could try ID if it looks like ID?
    // User requirement: "Only show 'Article Not Found' when: slug/id is missing OR API returns 404"

    try {
        console.log(`Fetching blog with slug: ${slug}`);
        const blog = await fetchPublic(endpoint);

        if (!blog || !blog.title) {
            // This usually won't happen if fetchPublic throws on 404/500, but checking just in case
             throw new Error('Blog not found');
        }

        // Set Title
        document.title = `${blog.title} | CAM Holdings`;

        // Render
        renderBlogDetail(blog, container);

    } catch (error) {
        console.error('Error loading blog details:', error);

        // Differentiate between 404 (Not Found) and other errors (Server Error)
        // fetchPublic in client-api.js throws "API Error: 404"

        let title = "Article Not Found";
        let msg = "We couldn't find the blog post you're looking for.";

        if (error.message && !error.message.includes('404')) {
            title = "Server Error";
            msg = "Something went wrong while loading the article. Please try again later.";
        }

        container.innerHTML = `
            <div style="text-align:center; padding: 100px 20px;">
                <h1>${title}</h1>
                <p>${msg}</p>
                <a href="/blogs.html" class="btn primary" style="margin-top:20px;">Back to Blogs</a>
            </div>
        `;
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function renderBlogDetail(blog, container) {
    const imageUrl = getImageUrl(blog.featured_image_url || blog.banner_url);
    const dateDisplay = formatDate(blog.created_at);
    const typeDisplay = blog.type || 'Blog';

    // HTML Content - assuming it's safe (from admin) or we trust it.
    // If we need sanitization, we'd use a library, but here we'll assume basic trust or simplistic render.
    // Ideally use DOMPurify in a real app if content is from rich text editor.
    const contentHtml = blog.content_html || '<p>No content available.</p>';

    const html = `
        <header class="bd-hero" style="background-image: url('${imageUrl}');">
            <div class="bd-hero-content">
                <a href="/blogs.html" class="bd-back">← Back to Blogs</a>
                <br>
                <span class="bd-chip">${typeDisplay}</span>
                <h1 class="bd-h1">${blog.title}</h1>
                <div class="bd-meta">
                    <span>${dateDisplay}</span>
                    <span>•</span>
                    <span>5 min read</span>
                </div>
            </div>
        </header>

        <main class="wrap bd-layout">
            <div class="bd-main">
                <div class="bd-body">
                    ${contentHtml}
                </div>

                <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 3rem 0;">

                <div style="display:flex; justify-content:space-between;">
                    <a href="/blogs.html" class="btn ghost">← Back to All</a>
                </div>
            </div>

            <aside class="bd-side">
                <div class="b-widget">
                    <h3 class="b-w-title">Share</h3>
                    <div style="display:flex; gap:10px; margin-top:1rem;">
                        <button class="btn ghost small">FB</button>
                        <button class="btn ghost small">TW</button>
                        <button class="btn ghost small">LN</button>
                    </div>
                </div>

                <div class="b-widget">
                    <h3 class="b-w-title">Related</h3>
                    <div class="b-topic-list">
                         <a class="b-topic" href="/blogs.html?tag=${typeDisplay.toLowerCase()}">
                            <span>More ${typeDisplay}</span>
                        </a>
                    </div>
                </div>
            </aside>
        </main>
    `;

    container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', initBlogDetails);
