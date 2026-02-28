import { fetchPublic, getImageUrl } from './client-api.js';

async function initProjectDetails() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    const id = params.get('id');
    const param = slug || id;

    const loadingEl = document.getElementById('projectLoading');
    const contentEl = document.getElementById('projectContent');
    const errorEl = document.getElementById('projectError');

    if (!param) {
        if(loadingEl) loadingEl.style.display = 'none';
        if(errorEl) errorEl.style.display = 'grid';
        return;
    }

    try {
        const project = await fetchPublic(`/projects/${param}`);

        if (!project || project.message === 'Project not found') {
            throw new Error('Project not found');
        }

        document.title = `${project.title} | CAM Holdings`;

        // Image
        const imgEl = document.getElementById('pdImage');
        // Handle image_url from new schema or old
        if (imgEl) imgEl.src = getImageUrl(project.image_url || project.cover_image);

        setText('pdTitle', project.title);
        setText('pdBadge', project.status || 'Active');
        setText('pdLocation', project.location || 'N/A');

        // Category / Service
        // Use 'category' or 'serviceCategory' or 'service_name' if available
        const category = project.category || project.serviceCategory || project.service_name || '-';
        setText('pdCategory', category);
        setText('pdService', category); // Map both for now

        // Budget
        let budgetDisplay = 'TBD';
        const cost = project.budget || project.estimatedCost;
        if (cost) {
            const budgetNum = parseFloat(cost);
            if (!isNaN(budgetNum)) {
                budgetDisplay = new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(budgetNum);
            } else {
                budgetDisplay = cost;
            }
        }
        setText('pdBudget', budgetDisplay);

        setText('pdClient', project.client_name || 'Private Client');

        const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '-';
        setText('pdStartDate', formatDate(project.start_date));
        setText('pdEndDate', formatDate(project.end_date));

        const descEl = document.getElementById('pdDescription');
        if (descEl) {
            descEl.innerHTML = project.description_html || project.description || '<p>No description available.</p>';
        }

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
        const galEl = document.getElementById('pdGallery');
        if (galEl && project.gallery_images) {
            let images = [];
            try {
                images = typeof project.gallery_images === 'string' ? JSON.parse(project.gallery_images) : project.gallery_images;
            } catch(e) {}

            if (Array.isArray(images) && images.length > 0) {
                galEl.innerHTML = images.map(img => `
                    <div style="border-radius: 12px; overflow: hidden; height: 200px; border: 1px solid rgba(255,255,255,0.1);">
                        <img src="${getImageUrl(img)}" style="width:100%; height:100%; object-fit:cover;" loading="lazy">
                    </div>
                `).join('');
            } else {
                galEl.style.display = 'none'; // Hide if no gallery
            }
        }

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
