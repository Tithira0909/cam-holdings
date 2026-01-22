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

        // Image Priority: Main > Image > First Gallery
        let imgPath = project.main_image || project.image_url;
        // Check project_images first, then gallery_images
        const galleryRaw = project.project_images || project.gallery_images;

        if (!imgPath && galleryRaw) {
            try {
                const gal = typeof galleryRaw === 'string' ? JSON.parse(galleryRaw) : galleryRaw;
                if (Array.isArray(gal) && gal.length > 0) imgPath = gal[0];
            } catch(e){}
        }

        const imgEl = document.getElementById('pdImage');
        if (imgEl) imgEl.src = getImageUrl(imgPath);

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

        // Gallery
        const gallerySection = document.getElementById('pdGallerySection');
        const galleryGrid = document.getElementById('pdGallery');

        if (gallerySection && galleryGrid) {
            let galleryImages = [];
            try {
                const raw = project.project_images || project.gallery_images;
                if (raw) {
                    galleryImages = typeof raw === 'string' ? JSON.parse(raw) : raw;
                }
            } catch (e) { console.error('Error parsing gallery images', e); }

            if (Array.isArray(galleryImages) && galleryImages.length > 0) {
                gallerySection.style.display = 'block';
                galleryGrid.innerHTML = '';
                galleryImages.forEach(img => {
                    const item = document.createElement('div');
                    item.className = 'gallery-item';
                    const src = getImageUrl(img);
                    item.innerHTML = `<img src="${src}" class="gallery-img" alt="Gallery Image">`;
                    item.onclick = () => openLightbox(src);
                    galleryGrid.appendChild(item);
                });
            } else {
                gallerySection.style.display = 'none';
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
    const fullUrl = getImageUrl(url);
    const ext = fullUrl.split('.').pop().toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);

    if (isImage) {
        const div = document.createElement('a');
        div.href = fullUrl;
        div.target = '_blank';
        div.className = 'doc-thumb-link';
        div.innerHTML = `
            <img src="${fullUrl}" class="doc-thumb" alt="${label}">
            <span style="font-size:0.8rem;">${label}</span>
        `;
        return div;
    } else {
        const a = document.createElement('a');
        a.href = fullUrl;
        a.target = '_blank';
        a.className = 'btn ghost';
        a.style.fontSize = '0.8rem';
        a.style.padding = '0.6rem 1rem';
        a.innerHTML = `<span>📄</span> ${label}`;
        return a;
    }
}

// Lightbox Logic
function openLightbox(src) {
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightboxImage');
    if (lb && lbImg) {
        lbImg.src = src;
        lb.classList.add('active');
    }
}

document.querySelector('.lightbox-close')?.addEventListener('click', () => {
    document.getElementById('lightbox').classList.remove('active');
});

document.getElementById('lightbox')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        document.getElementById('lightbox').classList.remove('active');
    }
});

document.addEventListener('DOMContentLoaded', initProjectDetails);
