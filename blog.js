import { getImageUrl } from './client-api.js';

async function initBlogDetails() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    const id = params.get('id');

    const loadingEl = document.getElementById('blogLoading');
    const notFoundView = document.getElementById('notFoundView');
    const articleView = document.getElementById('blogArticle');

    if (!slug && !id) {
        showNotFound();
        return;
    }

    try {
        let blog = null;

        // Strategy: Try slug first, fallback to ID if slug fails (404) or is missing
        if (slug) {
            try {
                const response = await fetch(`/api/blogs/slug/${slug}`);
                if (response.ok) {
                    blog = await response.json();
                } else if (response.status === 404 && id) {
                    // Slug failed, try ID fallback
                    console.warn(`Blog slug '${slug}' not found, falling back to ID '${id}'`);
                    const resId = await fetch(`/api/blogs/${id}`);
                    if (resId.ok) {
                        blog = await resId.json();
                    }
                }
            } catch (e) { console.error(e); }
        }

        // If slug wasn't present, or slug logic failed to set blog (and didn't fallback yet)
        if (!blog && id && !slug) {
             const response = await fetch(`/api/blogs/${id}`);
             if (response.ok) blog = await response.json();
        }

        if (!blog) {
            showNotFound();
            return;
        }

        renderBlog(blog);

    } catch (error) {
        console.error('Error fetching blog:', error);
        showNotFound();
    }

    function showNotFound() {
        if (loadingEl) loadingEl.style.display = 'none';
        if (notFoundView) notFoundView.style.display = 'block';
        if (articleView) articleView.style.display = 'none';
    }

    function renderBlog(blog) {
        if (loadingEl) loadingEl.style.display = 'none';
        if (notFoundView) notFoundView.style.display = 'none';
        if (articleView) articleView.style.display = 'block';

        // Set Title
        const titleEl = document.getElementById('blogTitle');
        if (titleEl) {
            titleEl.textContent = blog.title;
            document.title = `${blog.title} | CAM Holdings`;
        }

        // Set Category
        const catEl = document.getElementById('blogCategory');
        if (catEl) catEl.textContent = blog.type || 'Blog';

        // Set Date
        const dateEl = document.getElementById('blogDate');
        if (dateEl && blog.created_at) {
            const date = new Date(blog.created_at);
            dateEl.textContent = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        }

        // Set Hero Image
        const heroBg = document.getElementById('blogHeroBg');
        if (heroBg) {
            const imgPath = getImageUrl(blog.banner_url || blog.featured_image_url);
            heroBg.style.backgroundImage = `url('${imgPath}')`;
        }

        // Set Content
        const bodyEl = document.getElementById('blogBody');
        if (bodyEl) {
            // content_html comes from CKEditor, so it is safe-ish HTML but should be sanitized if user input was untrusted.
            // In admin context, we trust admin.
            bodyEl.innerHTML = blog.content_html || '<p>No content available.</p>';
        }
    }
}

document.addEventListener('DOMContentLoaded', initBlogDetails);
