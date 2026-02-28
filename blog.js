import { fetchPublic, getImageUrl } from './client-api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    const id = params.get('id');

    const contentDiv = document.getElementById('blog-content');

    if (!slug && !id) {
        renderError(contentDiv, 'Invalid blog link.');
        return;
    }

    try {
        let blog;
        if (slug) {
            blog = await fetchPublic(`/blogs/slug/${slug}`);
        }

        // Fallback to ID if slug failed or wasn't provided (and we have ID)
        if ((!blog || blog.message === 'Blog not found') && id) {
            blog = await fetchPublic(`/blogs/${id}`);
        }

        if (!blog || blog.message === 'Blog not found') {
            renderError(contentDiv, 'Blog not found.');
            return;
        }

        renderBlog(blog, contentDiv);

    } catch (error) {
        console.error('Error loading blog:', error);
        renderError(contentDiv, 'Unable to load blog. Please try again later.');
    }
});

function renderError(container, message) {
    container.innerHTML = `
        <div style="height: 60vh; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; text-align: center; padding: 2rem;">
            <h2 style="font-size: 2rem; margin-bottom: 1rem;">Not Found</h2>
            <p style="color: #aaa; margin-bottom: 2rem;">${message}</p>
            <a href="/blogs.html" class="btn ghost">Back to Blogs</a>
        </div>
    `;
}

function renderBlog(blog, container) {
    const imageUrl = getImageUrl(blog.banner_url || blog.featured_image_url);
    const dateStr = blog.created_at ? new Date(blog.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

    document.title = `${blog.title} | CAM Holdings`;

    // Calculate reading time? Maybe later.

    container.innerHTML = `
        <header class="blog-hero" style="background-image: url('${imageUrl}');">
            <div class="blog-hero-content">
                <div class="blog-meta">
                    <span>${blog.type || 'Blog'}</span>
                    <span>•</span>
                    <span>${dateStr}</span>
                </div>
                <h1 class="blog-title">${blog.title}</h1>
            </div>
        </header>

        <article class="blog-body">
            ${blog.content_html || '<p>No content available.</p>'}
        </article>

        <div class="blog-nav">
            <a href="/blogs.html" class="back-btn">← Back to Blogs</a>
            <!-- Optional Next/Prev could go here -->
        </div>
    `;
}
