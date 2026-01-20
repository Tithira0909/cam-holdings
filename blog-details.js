import { fetchPublic, getImageUrl } from './client-api.js';

async function initBlogDetails() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug') || params.get('id');
    const container = document.getElementById('blogDetailContainer');

    if (!slug) {
        container.innerHTML = `
            <div style="text-align:center; padding: 100px 20px;">
                <h1>Article Not Found</h1>
                <p>Invalid URL parameters.</p>
                <a href="/blogs.html" class="btn primary" style="margin-top:20px;">Back to Blogs</a>
            </div>
        `;
        return;
    }

    try {
        // Use the slug directly in the path
        const blog = await fetchPublic(`/blogs/${slug}`);

        if (!blog || !blog.title) {
            throw new Error('Blog not found');
        }

        // Set Title
        document.title = `${blog.title} | CAM Holdings`;

        // Render
        renderBlogDetail(blog, container);

    } catch (error) {
        console.error('Error loading blog details:', error);
        container.innerHTML = `
            <div style="text-align:center; padding: 100px 20px;">
                <h1>Article Not Found</h1>
                <p>We couldn't find the blog post you're looking for.</p>
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
