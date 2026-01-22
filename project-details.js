import { fetchPublic, getImageUrl } from './client-api.js';

async function initProjectDetails() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    const loadingEl = document.getElementById('projectLoading');
    const contentEl = document.getElementById('projectContent');
    const errorEl = document.getElementById('projectError');

    if (!id) {
        if(loadingEl) loadingEl.style.display = 'none';
        if(errorEl) errorEl.style.display = 'grid';
        return;
    }

    try {
        // Fetch project details using the single ID endpoint
        // Endpoint: /projects/:id
        const project = await fetchPublic(`/projects/${id}`);

        if (!project || project.message === 'Project not found') {
            throw new Error('Project not found');
        }

        // Render Data
        document.title = `${project.title} | CAM Holdings`;

        // Priority: Main Image (Featured) > First Gallery > Thumbnail > Legacy Image
        let mainImg = project.main_image;
        let gallery = [];
        try {
            if (project.gallery_images) {
                gallery = typeof project.gallery_images === 'string' ? JSON.parse(project.gallery_images) : project.gallery_images;
            }
        } catch(e){}

        if (!mainImg && gallery.length > 0) mainImg = gallery[0];
        if (!mainImg) mainImg = project.thumbnail_image;
        if (!mainImg) mainImg = project.image_url;

        // Render Hero Image
        const imgEl = document.getElementById('pdImage');
        if (imgEl) {
            if (mainImg) {
                imgEl.src = getImageUrl(mainImg);
                imgEl.style.objectFit = 'cover';
            } else {
                // Placeholder pattern
                imgEl.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMxMTEiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZmlsbD0iIzMzMyIgZm9udC1zaXplPSIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q0FNIEhvbGRpbmdzPC90ZXh0Pjwvc3ZnPg==';
            }
        }

        // Render Gallery (if multiple images)
        if (gallery.length > 0) {
            const galleryContainer = document.createElement('div');
            galleryContainer.className = 'pd-gallery-grid';
            galleryContainer.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; margin-top: 1rem;';

            gallery.forEach(img => {
                const thumb = document.createElement('img');
                thumb.src = getImageUrl(img);
                thumb.style.cssText = 'width: 100%; height: 80px; object-fit: cover; border-radius: 8px; cursor: pointer; border: 1px solid rgba(255,255,255,0.1);';
                thumb.onclick = () => {
                    imgEl.src = getImageUrl(img); // Swap hero
                };
                galleryContainer.appendChild(thumb);
            });

            // Append to left column
            const leftCol = document.querySelector('.pd-left');
            if (leftCol) leftCol.appendChild(galleryContainer);
        }

        // Text Fields
        setText('pdTitle', project.title);
        setText('pdBadge', project.status || 'Active');
        setText('pdLocation', project.location || 'N/A');
        setText('pdService', project.service_name || 'General');

        // Category inference or from DB
        let category = project.category_name;
        if (!category) {
            // Fallback inference similar to projects-loader.js
            const text = (project.title + ' ' + (project.description || '')).toLowerCase();
            if (text.includes('interior')) category = 'Interior';
            else if (text.includes('architecture')) category = 'Architecture';
            else if (text.includes('construction')) category = 'Construction';
            else if (text.includes('landscape')) category = 'Landscape';
            else if (text.includes('commercial')) category = 'Commercial';
            else category = 'Project';
        }
        setText('pdCategory', category);

        // Formatting Budget
        let budgetDisplay = 'TBD';
        if (project.budget) {
            // Check if it's a number-like string
            const budgetNum = parseFloat(project.budget);
            if (!isNaN(budgetNum)) {
                budgetDisplay = new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(budgetNum);
            } else {
                budgetDisplay = project.budget;
            }
        }
        setText('pdBudget', budgetDisplay);

        // Client
        // Note: The API returns client_id. To show client name, we might need to fetch client details
        // or check if the backend joins it. The current backend `GET /:id` (read previously)
        // just does `SELECT * FROM projects`. So we might just show ID or generic info.
        // If the project object has client_name (joined), use it. Else hide or show ID.
        // Looking at memory/file reads, backend is simple select *.
        // We will just show "Private Client" if not available, or the ID.
        setText('pdClient', project.client_name || 'Private Client');

        // Dates
        const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '-';
        setText('pdStartDate', formatDate(project.start_date));
        setText('pdEndDate', formatDate(project.end_date));

        // Description (Safe HTML)
        const descEl = document.getElementById('pdDescription');
        if (descEl) {
            // Basic safety: replace script tags or just use textContent if strictly text.
            // Assuming description_html might be rich text from CKEditor.
            // We'll trust backend sanitization or simple render for now, but usually should use a sanitizer.
            // For this task, innerHTML is accepted if we trust admin input.
            descEl.innerHTML = project.description_html || project.description || '<p>No description available.</p>';
        }

        // Documents / Files
        const docsEl = document.getElementById('pdDocs');
        if (docsEl) {
            docsEl.innerHTML = '';
            if (project.drawing_url) {
                docsEl.appendChild(createDocLink('Architectural Drawing', project.drawing_url));
            }
            if (project.project_file_url) {
                docsEl.appendChild(createDocLink('Project Documentation', project.project_file_url));
            }
        }

        // Show Content
        if(loadingEl) loadingEl.style.display = 'none';
        if(contentEl) contentEl.style.display = 'block';

    } catch (error) {
        console.error('Error loading project details:', error);
        if(loadingEl) loadingEl.style.display = 'none';
        if(errorEl) errorEl.style.display = 'grid';
    }
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function createDocLink(label, url) {
    const a = document.createElement('a');
    a.href = getImageUrl(url);
    a.target = '_blank';
    a.className = 'btn ghost';
    a.style.fontSize = '0.8rem';
    a.style.padding = '0.6rem 1rem';
    a.innerHTML = `<span>📄</span> ${label}`;
    return a;
}

document.addEventListener('DOMContentLoaded', initProjectDetails);
