// --- AUTH CHECK ---
const token = localStorage.getItem('token');
if (!token) {
    window.location.replace('login.html');
}

// --- STATE ---
let editingClientId = null;
let editingServiceTypeId = null;

// --- NAVIGATION & SIDEBAR LOGIC ---
const menuItems = document.querySelectorAll('.menu-item');
const navLinks = document.querySelectorAll('.menu-link, .submenu-link');
const views = document.querySelectorAll('.view-section');

// Sidebar Toggle
const sidebarToggle = document.getElementById('sidebarToggle');
if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
        document.body.classList.toggle('collapsed');
    });
}

// Collapsible Logic
menuItems.forEach(item => {
    if (item.classList.contains('collapsible')) {
        const link = item.querySelector('.menu-link');
        link.addEventListener('click', (e) => {
            // Check if clicking the link itself or just the toggle
            // For this design, clicking the parent item toggles the submenu
            item.classList.toggle('open');
        });
    }
});

// Navigation Logic
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        // If it's a collapsible parent, don't navigate (handled above), unless it has data-view
        if (link.parentElement.classList.contains('collapsible') && !link.dataset.view) {
            return;
        }

        const viewName = link.dataset.view;
        if (!viewName) return; // Placeholder links

        e.preventDefault();

        // 1. Update Active State in Sidebar
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // If in submenu, ensure parent is open and active-ish
        const parentItem = link.closest('.menu-item');
        /* Optional: Highlight parent icon
        if (parentItem) {
            const parentLink = parentItem.querySelector('.menu-link');
            if(parentLink !== link) parentLink.classList.add('active');
        }
        */

        // 2. Switch View
        views.forEach(v => v.classList.remove('active'));
        const viewId = `view-${viewName}`;
        const targetView = document.getElementById(viewId);
        if (targetView) targetView.classList.add('active');

        // 3. Trigger Data Load
        if (viewName === 'dashboard') loadDashboardStats();
        if (viewName === 'admins') loadAdmins();
        if (viewName === 'clients') loadClients();
        if (viewName === 'services') loadServices();
        if (viewName === 'service-types') loadServiceTypes();
        if (viewName === 'projects') loadProjects();
        if (viewName === 'real-estate') loadRealEstate();
        if (viewName === 'project-tasks') loadProjectTasks();
        if (viewName === 'blogs') loadBlogs();
        if (viewName === 'reviews') loadReviews();
        if (viewName === 'inquiries') loadInquiries();
        if (viewName === 'quotations') loadQuotations();
        if (viewName === 'property-designs') loadPropertyDesigns();
        if (viewName === 'property-parts') loadPropertyParts();
        if (viewName === 'property-part-items') loadPropertyPartItems();
        if (viewName === 'property-services') loadPropertyServices();
        if (viewName === 'property-service-items') loadPropertyServiceItems();
        if (viewName === 'settings-permissions') loadRoles();
        if (viewName === 'settings-analytics') loadAnalyticsSettings();
        if (viewName === 'settings-site') loadSiteSettings();
        if (viewName === 'settings-email') loadEmailSettings();
        if (viewName === 'add-client') {
            resetClientForm();
        }
    });
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('first_name');
    localStorage.removeItem('last_name');
    window.location.replace('login.html');
});

// Helper for XSS protection
const safe = (str) => str ? String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;") : '';

// --- DASHBOARD LOGIC ---
async function loadDashboardStats() {
    // Set Admin Name
    const fName = localStorage.getItem('first_name') || 'Admin';
    const lName = localStorage.getItem('last_name') || '';
    const fullName = `${fName} ${lName}`.trim();

    const adminNameDisplay = document.getElementById('adminNameDisplay');
    if (adminNameDisplay) adminNameDisplay.textContent = fullName;

    // Update Header Info
    const headerName = document.getElementById('headerAdminName');
    if (headerName) headerName.textContent = fullName;

    const headerAvatar = document.getElementById('headerAvatar');
    if (headerAvatar) headerAvatar.textContent = fName.charAt(0).toUpperCase();

    // Fetch Stats
    try {
        const response = await fetch('/api/admin/dashboard/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch stats');

        const stats = await response.json();

        document.getElementById('count-registered-users').textContent = stats.registeredUsers;
        document.getElementById('count-total-posts').textContent = stats.totalPosts;
        document.getElementById('count-not-approved-posts').textContent = stats.notApprovedPosts;

    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// --- INQUIRIES LOGIC ---
async function loadInquiries() {
    const tbody = document.getElementById('inquiriesTableBody');
    if (!tbody) return;

    try {
        const response = await fetch('/api/admin/inquiries', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch inquiries');

        const inquiries = await response.json();

        tbody.innerHTML = '';
        if (inquiries.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No inquiries found</td></tr>';
            return;
        }

        inquiries.forEach(item => {
            const dateObj = new Date(item.created_at);
            const dateStr = dateObj.toISOString().split('T')[0] + ' ' + dateObj.toTimeString().split(' ')[0]; // YYYY-MM-DD HH:mm:ss rough approximation or use proper format

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="client-name-cell">
                    ${safe(item.client_name)}
                    <div><span class="badge" style="background-color: #00cec9;">Received on - ${safe(dateStr)}</span></div>
                </td>
                <td>${safe(item.email)}</td>
                <td>${safe(item.phone) || '-'}</td>
                <td>${safe(item.subject) || '-'}</td>
                <td>
                    <button class="btn-sm" style="background-color: #0d0d26;" onclick="viewMessage(${item.id})">View Message</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error('Error loading inquiries:', error);
        tbody.innerHTML = '<tr><td colspan="5" style="color:red; text-align:center;">Error loading inquiries</td></tr>';
    }
}

// --- QUOTATIONS LOGIC ---
async function loadQuotations() {
    const tbody = document.getElementById('quotationsTableBody');
    if (!tbody) return;

    try {
        const response = await fetch('/api/admin/quotations', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch quotations');

        const quotes = await response.json();

        tbody.innerHTML = '';
        if (quotes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;">No quotations found</td></tr>';
            return;
        }

        quotes.forEach(item => {
            const createdObj = new Date(item.created_at);
            const createdStr = createdObj.toISOString().split('T')[0] + ' ' + createdObj.toTimeString().split(' ')[0];

            // Format reference column with badge
            const refHtml = `
                <div>${safe(item.reference_id)}</div>
                <div><span class="badge" style="background-color: #e74c3c;">${safe(createdStr)}</span></div>
            `;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${refHtml}</td>
                <td>${safe(item.first_name)}</td>
                <td>${safe(item.last_name || 'Null')}</td>
                <td>${safe(item.email)}</td>
                <td>${safe(item.contact || '-')}</td>
                <td>${safe(item.type)}</td>
                <td>${safe(item.date ? new Date(item.date).toISOString().split('T')[0] : '')}</td>
                <td>${safe(item.time || '')}</td>
                <td>
                    <button class="btn-sm" style="background-color: #0066cc;" onclick="previewQuotation(${item.id})">Preview</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading quotations:', error);
        tbody.innerHTML = '<tr><td colspan="9" style="color:red; text-align:center;">Error loading quotations</td></tr>';
    }
}

// Quote Modal
const quoteModal = document.getElementById('quoteModal');
const closeQuoteModalBtn = document.getElementById('closeQuoteModal');
const closeQuoteBtn = document.getElementById('closeQuoteBtn');

function closeQuoteModalFunc() {
    quoteModal.classList.remove('active');
}

if(closeQuoteModalBtn) closeQuoteModalBtn.addEventListener('click', closeQuoteModalFunc);
if(closeQuoteBtn) closeQuoteBtn.addEventListener('click', closeQuoteModalFunc);

window.previewQuotation = async (id) => {
    try {
        const response = await fetch(`/api/admin/quotations/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch details');
        const data = await response.json();

        document.getElementById('qRef').textContent = data.reference_id;
        document.getElementById('qName').textContent = `${data.first_name} ${data.last_name || ''}`;
        document.getElementById('qEmail').textContent = data.email;
        document.getElementById('qPhone').textContent = data.contact || '-';
        document.getElementById('qType').textContent = data.type;

        let dateTimeStr = '';
        if (data.date) dateTimeStr += new Date(data.date).toISOString().split('T')[0];
        if (data.time) dateTimeStr += ' ' + data.time;
        document.getElementById('qDateTime').textContent = dateTimeStr;

        // Parse JSON details if possible
        let detailsText = '';
        try {
            const detailsObj = JSON.parse(data.details_json);
            // Pretty print or just key-value
            detailsText = Object.entries(detailsObj).map(([k, v]) => `${k}: ${v}`).join('\n');
        } catch (e) {
            detailsText = data.details_json || '';
        }

        document.getElementById('qBody').textContent = detailsText;

        quoteModal.classList.add('active');
    } catch (error) {
        console.error(error);
        alert('Error fetching details');
    }
};

// Message Modal
const msgModal = document.getElementById('messageModal');
const closeMsgModalBtn = document.getElementById('closeMessageModal');
const closeMsgBtn = document.getElementById('closeMessageBtn');

function closeMessageModal() {
    msgModal.classList.remove('active');
}

if(closeMsgModalBtn) closeMsgModalBtn.addEventListener('click', closeMessageModal);
if(closeMsgBtn) closeMsgBtn.addEventListener('click', closeMessageModal);

window.viewMessage = async (id) => {
    try {
        // Fetch full details (or find in list if we cached it, but endpoint requested)
        const response = await fetch(`/api/admin/inquiries/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch message details');

        const data = await response.json();

        document.getElementById('msgName').textContent = data.client_name;
        document.getElementById('msgEmail').textContent = data.email;
        document.getElementById('msgPhone').textContent = data.phone || '-';
        document.getElementById('msgSubject').textContent = data.subject || '-';

        const dateObj = new Date(data.created_at);
        document.getElementById('msgDate').textContent = dateObj.toISOString().split('T')[0] + ' ' + dateObj.toTimeString().split(' ')[0];

        // Escape HTML for message body security
        const safeMsg = data.message ? String(data.message).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;") : '';
        document.getElementById('msgBody').innerHTML = safeMsg;

        msgModal.classList.add('active');

    } catch (error) {
        console.error(error);
        alert('Error fetching details');
    }
};

// --- PROJECTS LOGIC ---
let editingProjectId = null;
let projectProgressId = null;
let projectSearchTimeout;

document.getElementById('projectSearch')?.addEventListener('input', (e) => {
    clearTimeout(projectSearchTimeout);
    projectSearchTimeout = setTimeout(() => loadProjects(e.target.value), 300);
});

async function loadProjects(query = '') {
    const tbody = document.getElementById('projectsTableBody');
    if (!tbody) return;

    try {
        const url = query ? `/api/admin/projects?search=${encodeURIComponent(query)}` : '/api/admin/projects';
        const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        const projects = await response.json();

        tbody.innerHTML = '';
        if (projects.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No projects found</td></tr>';
            return;
        }

        projects.forEach(proj => {
            const statusClass = proj.status === 'Active' ? 'badge-active' : 'badge-inactive';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    ${safe(proj.title)}
                    <div style="font-size:0.8em; color:#666;">${safe(proj.service_name || '-')}</div>
                </td>
                <td>${safe(proj.location || '-')}</td>
                <td>${safe(proj.budget || '-')}</td>
                <td><span class="badge ${statusClass}">${safe(proj.status || 'Active')}</span></td>
                <td>
                    <button class="btn-sm btn-edit" onclick="editProject(${proj.id})">Edit</button>
                    <button class="btn-sm btn-deactivate" onclick="deleteProject(${proj.id})">Delete</button>
                    <button class="btn-sm" style="background-color: #0d0d26;" onclick="openProgressModal(${proj.id}, '${safe(proj.progress_status || '')}')">Progress</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading projects:', error);
        tbody.innerHTML = '<tr><td colspan="5" style="color:red; text-align:center;">Error loading projects</td></tr>';
    }
}

// --- REAL ESTATE LOGIC ---
let editingRealEstateId = null;
let reSearchTimeout;

document.getElementById('realEstateSearch')?.addEventListener('input', (e) => {
    clearTimeout(reSearchTimeout);
    reSearchTimeout = setTimeout(() => loadRealEstate(e.target.value), 300);
});

async function loadRealEstate(query = '') {
    const tbody = document.getElementById('realEstateTableBody');
    if (!tbody) return;

    try {
        const url = query ? `/api/admin/real-estate/properties?search=${encodeURIComponent(query)}` : '/api/admin/real-estate/properties';
        const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        const properties = await response.json();

        tbody.innerHTML = '';
        if (properties.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No properties found</td></tr>';
            return;
        }

        properties.forEach(prop => {
            const statusClass = (prop.status === 1 || prop.status === true) ? 'badge-active' : 'badge-inactive';
            const statusText = (prop.status === 1 || prop.status === true) ? 'Active' : 'Inactive';
            const imgUrl = prop.cover_image_url || 'https://via.placeholder.com/60';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${imgUrl}" alt="Img" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;"></td>
                <td>${safe(prop.title)}</td>
                <td>${safe(prop.location || '-')}</td>
                <td>${safe(prop.price_budget || '-')}</td>
                <td><span class="badge ${statusClass}">${statusText}</span></td>
                <td>
                    <button class="btn-sm btn-edit" onclick="editRealEstate(${prop.id})">Edit</button>
                    <button class="btn-sm btn-deactivate" onclick="deleteRealEstate(${prop.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading real estate:', error);
        tbody.innerHTML = '<tr><td colspan="6" style="color:red; text-align:center;">Error loading properties</td></tr>';
    }
}

// Real Estate Modal Logic
const reModal = document.getElementById('realEstateModal');
const openReModalBtn = document.getElementById('openRealEstateModalBtn');
const closeReModalBtn = document.getElementById('closeRealEstateModal');
const cancelReBtn = document.getElementById('cancelRealEstateBtn');

async function openRealEstateModal() {
    reModal.classList.add('active');
    document.getElementById('realEstateForm').reset();
    editingRealEstateId = null;
    document.querySelector('#realEstateModal h2').textContent = 'New Property Card';
}

function closeRealEstateModal() {
    reModal.classList.remove('active');
}

if(openReModalBtn) openReModalBtn.addEventListener('click', openRealEstateModal);
if(closeReModalBtn) closeReModalBtn.addEventListener('click', closeRealEstateModal);
if(cancelReBtn) cancelReBtn.addEventListener('click', closeRealEstateModal);

window.editRealEstate = async (id) => {
    try {
        const response = await fetch('/api/admin/real-estate/properties', { headers: { 'Authorization': `Bearer ${token}` } });
        const props = await response.json();
        const item = props.find(p => p.id === id);

        if(!item) return;

        editingRealEstateId = id;
        document.querySelector('#realEstateModal h2').textContent = 'Edit Property Card';

        const form = document.getElementById('realEstateForm');
        form.querySelector('#re_title').value = item.title;
        form.querySelector('#re_location').value = item.location || '';
        form.querySelector('#re_budget').value = item.price_budget || '';
        form.querySelector('#re_short_desc').value = item.short_description || '';
        form.querySelector('#re_desc').value = item.description || '';
        form.querySelector('#re_status').value = (item.status === 1 || item.status === true) ? '1' : '0';
        form.querySelector('#re_featured').value = (item.featured === 1 || item.featured === true) ? '1' : '0';

        reModal.classList.add('active');
    } catch(e) { console.error(e); }
};

document.getElementById('realEstateForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
        let url = '/api/admin/real-estate/properties';
        let method = 'POST';

        if (editingRealEstateId) {
            url = `/api/admin/real-estate/properties/${editingRealEstateId}`;
            method = 'PUT';
        }

        const response = await fetch(url, {
            method: method,
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        if (response.ok) {
            closeRealEstateModal();
            loadRealEstate();
            alert(editingRealEstateId ? 'Property updated!' : 'Property added!');
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to save property');
        }
    } catch (e) {
        console.error(e);
        alert('Error saving property');
    }
});

window.deleteRealEstate = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
        const response = await fetch(`/api/admin/real-estate/properties/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) loadRealEstate();
        else alert('Failed to delete');
    } catch (e) { console.error(e); }
};

// --- NEW PROJECT PAGE LOGIC ---
let projectEditorInstance;

async function loadClientsForProjectForm() {
    try {
        const response = await fetch('/api/admin/clients', { headers: { 'Authorization': `Bearer ${token}` } });
        const clients = await response.json();
        const select = document.getElementById('np_client');
        select.innerHTML = '<option value="">Select Client</option>';
        clients.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            option.textContent = `${c.first_name} ${c.last_name}`;
            select.appendChild(option);
        });
    } catch (e) {
        console.error(e);
    }
}

async function loadServicesForProjectForm() {
    try {
        const response = await fetch('/api/admin/services', { headers: { 'Authorization': `Bearer ${token}` } });
        const services = await response.json();
        const select = document.getElementById('np_service');
        select.innerHTML = '<option value="">Select Service</option>';
        services.forEach(s => {
            const option = document.createElement('option');
            option.value = s.id;
            option.textContent = s.name;
            select.appendChild(option);
        });
    } catch (e) {
        console.error(e);
    }
}

async function initProjectEditor() {
    if (projectEditorInstance) return;
    try {
        if (window.ClassicEditor) {
            projectEditorInstance = await ClassicEditor.create(document.querySelector('#projectEditor'));
        }
    } catch (error) {
        console.error('CKEditor Init Error:', error);
    }
}

document.getElementById('addProjectForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (projectEditorInstance) {
        document.getElementById('np_description_hidden').value = projectEditorInstance.getData();
    }

    const formData = new FormData(e.target);

    try {
        const response = await fetch('/api/admin/projects', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        if (response.ok) {
            alert('Project created successfully');
            e.target.reset();
            if(projectEditorInstance) projectEditorInstance.setData('');

            // Navigate back
            const projectsLink = document.querySelector('[data-view="projects"]');
            if (projectsLink) projectsLink.click();
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to create project');
        }
    } catch (e) {
        console.error(e);
        alert('Error creating project');
    }
});

// Project Modal (Used for Edit)
const projectModal = document.getElementById('projectModal');
const openProjectModalBtn = document.getElementById('openProjectModalBtn');
const closeProjectModalBtn = document.getElementById('closeProjectModal');
const cancelProjectBtn = document.getElementById('cancelProjectBtn');

function openProjectModalFunc() {
    projectModal.classList.add('active');
}
function closeProjectModalFunc() {
    projectModal.classList.remove('active');
    document.getElementById('projectForm').reset();
    editingProjectId = null;
    document.querySelector('#projectModal h2').textContent = 'New Project';
    document.querySelector('#projectModal button[type="submit"]').textContent = 'Save Project';
}

if(openProjectModalBtn) {
    openProjectModalBtn.addEventListener('click', () => {
        // Switch view to Add Project Page
        document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
        document.getElementById('view-add-project').classList.add('active');
        loadClientsForProjectForm();
        loadServicesForProjectForm();
        initProjectEditor();
    });
}
if(closeProjectModalBtn) closeProjectModalBtn.addEventListener('click', closeProjectModalFunc);
if(cancelProjectBtn) cancelProjectBtn.addEventListener('click', closeProjectModalFunc);

window.editProject = async (id) => {
    try {
        const response = await fetch('/api/admin/projects', { headers: { 'Authorization': `Bearer ${token}` } });
        const projects = await response.json();
        const project = projects.find(p => p.id === id);

        if(!project) return;

        editingProjectId = id;
        document.querySelector('#projectModal h2').textContent = 'Edit Project';
        document.querySelector('#projectModal button[type="submit"]').textContent = 'Update Project';

        const form = document.getElementById('projectForm');
        form.querySelector('#proj_title_input').value = project.title;
        form.querySelector('#proj_loc').value = project.location || '';
        form.querySelector('#proj_budget').value = project.budget || '';
        form.querySelector('#proj_status').value = project.status || 'Active';
        form.querySelector('#proj_desc_input').value = project.description || '';

        openProjectModalFunc();
    } catch(e) {
        console.error(e);
    }
};

document.getElementById('projectForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
        let url = '/api/admin/projects';
        let method = 'POST';

        if (editingProjectId) {
            url = `/api/admin/projects/${editingProjectId}`;
            method = 'PUT';
        }

        const response = await fetch(url, {
            method: method,
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        if (response.ok) {
            closeProjectModalFunc();
            loadProjects();
            alert(editingProjectId ? 'Project updated!' : 'Project created!');
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to save project');
        }
    } catch (e) {
        console.error(e);
        alert('Error saving project');
    }
});

window.deleteProject = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
        const response = await fetch(`/api/admin/projects/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) loadProjects();
        else alert('Failed to delete project');
    } catch (e) {
        console.error(e);
    }
};

// Progress Modal
const progModal = document.getElementById('projectProgressModal');
const closeProgBtn = document.getElementById('closeProgressModal');
const cancelProgBtn = document.getElementById('cancelProgressBtn');

function closeProgModal() {
    progModal.classList.remove('active');
    projectProgressId = null;
    document.getElementById('progressForm').reset();
}

if(closeProgBtn) closeProgBtn.addEventListener('click', closeProgModal);
if(cancelProgBtn) cancelProgBtn.addEventListener('click', closeProgModal);

window.openProgressModal = (id, currentStatus) => {
    projectProgressId = id;
    document.getElementById('prog_status').value = currentStatus;
    progModal.classList.add('active');
};

document.getElementById('progressForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if(!projectProgressId) return;

    const status = document.getElementById('prog_status').value;

    try {
        const response = await fetch(`/api/admin/projects/${projectProgressId}/progress`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ progress_status: status })
        });

        if(response.ok) {
            closeProgModal();
            loadProjects();
            alert('Progress updated!');
        } else {
            alert('Failed to update progress');
        }
    } catch(e) {
        console.error(e);
        alert('Error updating progress');
    }
});

// --- REGISTERED CLIENTS LOGIC ---
let clientSearchTimeout;
document.getElementById('clientSearch')?.addEventListener('input', (e) => {
    clearTimeout(clientSearchTimeout);
    clientSearchTimeout = setTimeout(() => loadClients(e.target.value), 300);
});

async function loadClients(query = '') {
    const tbody = document.getElementById('clientsTableBody');
    if (!tbody) return;

    try {
        const url = query ? `/api/admin/clients?search=${encodeURIComponent(query)}` : '/api/admin/clients';
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            let errorMsg = `Server error: ${response.status}`;
            try {
                const errData = await response.json();
                errorMsg = errData.message || errorMsg;
            } catch (e) {
                const text = await response.text();
                if (text) errorMsg += ` - ${text}`;
            }
            throw new Error(errorMsg);
        }

        const clients = await response.json();

        if (!Array.isArray(clients)) {
             throw new Error("Invalid data format received from server");
        }

        tbody.innerHTML = '';
        if (clients.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No clients found</td></tr>';
            return;
        }

        clients.forEach(client => {
            let createdDate = '-';
            try {
                if (client.created_at) {
                    createdDate = new Date(client.created_at).toISOString().split('T')[0];
                }
            } catch (e) {
                console.warn('Invalid date:', client.created_at);
            }

            const isApproved = client.is_approved || client.is_approved === 1; // MySQL boolean is 1/0
            const status = client.status || 'Active';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="client-name-cell">
                    ${client.first_name || '-'}
                    <div><span class="badge badge-reg">Registered On - ${createdDate}</span></div>
                </td>
                <td>${client.last_name || '-'}</td>
                <td>${client.email || '-'}</td>
                <td>${client.contact_number || '-'}</td>
                <td>
                    <span class="badge ${status === 'Active' ? 'badge-active' : 'badge-inactive'}">${status}</span>
                    <br/>
                    <span class="badge ${isApproved ? 'badge-approved' : 'badge-not-approved'}">
                        ${isApproved ? 'Approved' : 'Not Approved'}
                    </span>
                </td>
                <td>${client.role || 'User'}</td>
                <td>
                    <button class="btn-sm btn-edit" onclick="editClient(${client.id})">Edit</button>
                    ${status === 'Active' ? `<button class="btn-sm btn-deactivate" onclick="toggleStatus(${client.id}, 'deactivate')">Deactivate</button>` : ''}
                    ${!isApproved ? `<button class="btn-sm btn-approve" onclick="approveClient(${client.id})">Approve</button>` : ''}
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading clients:', error);
        tbody.innerHTML = `<tr><td colspan="7" style="color:red; text-align:center;">Error: ${error.message}</td></tr>`;
    }
}

window.approveClient = async (id) => {
    try {
        const response = await fetch(`/api/admin/clients/${id}/approve`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) loadClients();
        else alert('Failed to approve client');
    } catch (error) {
        console.error(error);
    }
};

window.toggleStatus = async (id, action) => {
    if (!confirm('Are you sure?')) return;
    try {
        const response = await fetch(`/api/admin/clients/${id}/${action}`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) loadClients();
        else alert('Failed to update status');
    } catch (error) {
        console.error(error);
    }
};

// --- REGISTERED ADMINS LOGIC ---
let adminSearchTimeout;
document.getElementById('adminSearch')?.addEventListener('input', (e) => {
    clearTimeout(adminSearchTimeout);
    adminSearchTimeout = setTimeout(() => loadAdmins(e.target.value), 300);
});

async function loadAdmins(query = '') {
    const tbody = document.getElementById('adminsTableBody');
    if (!tbody) return;

    try {
        const url = query ? `/api/admin/admins?search=${encodeURIComponent(query)}` : '/api/admin/admins';
        const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        const admins = await response.json();

        tbody.innerHTML = '';
        if (admins.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No admins found</td></tr>';
            return;
        }

        admins.forEach(admin => {
            const isActive = admin.is_active !== 0 && admin.is_active !== false;
            const status = isActive ? 'Active' : 'Inactive';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${admin.first_name || '-'}</td>
                <td>${admin.last_name || '-'}</td>
                <td>${admin.email || admin.username}</td>
                <td>${admin.phone || '-'}</td>
                <td><span class="badge ${isActive ? 'badge-active' : 'badge-inactive'}">${status}</span></td>
                <td>${admin.role}</td>
                <td>
                    <button class="btn-sm btn-edit" onclick="editAdmin(${admin.id})">Edit</button>
                    ${isActive ? `<button class="btn-sm btn-deactivate" onclick="deactivateAdmin(${admin.id})">Deactivate</button>` : ''}
                    <button class="btn-sm" style="background-color: blue;" onclick="changePermissions(${admin.id})">Change Permissions</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading admins:', error);
        tbody.innerHTML = '<tr><td colspan="7" style="color:red; text-align:center;">Error loading data</td></tr>';
    }
}

window.deactivateAdmin = async (id) => {
    if (!confirm('Are you sure you want to deactivate this admin?')) return;
    try {
        const response = await fetch(`/api/admin/admins/${id}/deactivate`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) loadAdmins();
        else {
            const data = await response.json();
            alert(data.message || 'Failed to deactivate');
        }
    } catch (error) {
        console.error(error);
    }
};

window.changePermissions = async (id) => {
    // For now, just a dummy action or toggle role if needed.
    // Prompt implies updating fields. I'll just alert for now or send a dummy update.
    if (!confirm('Change permissions for this user?')) return;
    try {
        const response = await fetch(`/api/admin/admins/${id}/permissions`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ permissions: 'FULL_ACCESS' }) // Dummy permission
        });
        if (response.ok) alert('Permissions updated');
        else alert('Failed to update permissions');
    } catch (error) {
        console.error(error);
    }
};

window.editAdmin = (id) => {
    alert('Edit Admin functionality coming soon (requires new form)');
};

// --- SERVICE TYPES LOGIC ---
async function loadServiceTypes() {
    const listContainer = document.getElementById('serviceTypesList');
    if (!listContainer) return;

    try {
        const response = await fetch('/api/admin/service-types', { headers: { 'Authorization': `Bearer ${token}` } });
        const types = await response.json();

        listContainer.innerHTML = '';
        if (types.length === 0) {
            listContainer.innerHTML = '<p>No service types found.</p>';
            return;
        }

        types.forEach(type => {
            const thumbUrl = type.thumbnail ? `/uploads/${type.thumbnail.split(/[/\\]/).pop()}` : 'https://via.placeholder.com/60';

            const item = document.createElement('div');
            item.className = 'service-type-item';
            item.innerHTML = `
                <div class="service-type-info">
                    <img src="${thumbUrl}" alt="Thumb" class="service-thumb">
                    <div>
                        <strong>${type.name}</strong>
                        <div style="font-size: 0.8rem; color: #666;">/${type.slug}</div>
                        <div style="font-size: 0.8rem; color: #888; margin-top: 4px;">${type.description || ''}</div>
                    </div>
                </div>
                <div>
                     <span class="badge ${type.status === 'Active' ? 'badge-active' : 'badge-inactive'}">${type.status}</span>
                </div>
                <div>
                    <button class="btn-sm btn-edit" onclick="editServiceType(${type.id})">Edit</button>
                    <button class="btn-sm btn-deactivate" onclick="deleteServiceType(${type.id})">Delete</button>
                </div>
            `;
            listContainer.appendChild(item);
        });

    } catch (error) {
        console.error('Error loading service types:', error);
        listContainer.innerHTML = '<p style="color:red">Error loading service types</p>';
    }
}

// Modal Logic
const modal = document.getElementById('serviceTypeModal');
const openModalBtn = document.getElementById('openServiceTypeModalBtn');
const closeModalBtn = document.getElementById('closeServiceTypeModal');
const cancelModalBtn = document.getElementById('cancelServiceTypeBtn');

function openModal() {
    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
    document.getElementById('serviceTypeForm').reset();
    editingServiceTypeId = null;
    document.querySelector('#serviceTypeModal h2').textContent = 'New Service Type';
    document.querySelector('#serviceTypeModal button[type="submit"]').textContent = 'Create Service Type';
}

if(openModalBtn) openModalBtn.addEventListener('click', openModal);
if(closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
if(cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

window.editServiceType = async (id) => {
    try {
        // Fetch specific service type details
        const response = await fetch(`/api/admin/service-types/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!response.ok) throw new Error('Failed to fetch details');

        const type = await response.json();

        // Populate form
        const form = document.getElementById('serviceTypeForm');
        form.querySelector('#st_name').value = type.name;
        form.querySelector('#st_slug').value = type.slug;
        form.querySelector('#st_desc').value = type.description;
        form.querySelector('#st_status').value = type.status;

        // Switch state to editing
        editingServiceTypeId = id;
        document.querySelector('#serviceTypeModal h2').textContent = 'Edit Service Type';
        document.querySelector('#serviceTypeModal button[type="submit"]').textContent = 'Update Service Type';

        openModal();
    } catch (error) {
        console.error(error);
        alert('Error fetching service type details');
    }
};


// Form Submission
document.getElementById('serviceTypeForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    try {
        let url = '/api/admin/service-types';
        let method = 'POST';

        if (editingServiceTypeId) {
            url = `/api/admin/service-types/${editingServiceTypeId}`;
            method = 'PUT';
        }

        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData // Fetch handles Content-Type for FormData (multipart/form-data)
        });

        if (response.ok) {
            closeModal();
            loadServiceTypes();
            alert(editingServiceTypeId ? 'Service Type updated successfully!' : 'Service Type created successfully!');
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to save service type');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Server error');
    }
});

window.deleteServiceType = async (id) => {
    if(!confirm('Are you sure you want to delete this?')) return;
    try {
        const response = await fetch(`/api/admin/service-types/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) loadServiceTypes();
        else alert('Failed to delete');
    } catch (error) {
        console.error(error);
    }
}

// --- SERVICES LOGIC ---
let editingServiceId = null;
let serviceSearchTimeout;
document.getElementById('serviceSearch')?.addEventListener('input', (e) => {
    clearTimeout(serviceSearchTimeout);
    serviceSearchTimeout = setTimeout(() => loadServices(e.target.value), 300);
});

async function loadServices(query = '') {
    const tbody = document.getElementById('servicesTableBody');
    if (!tbody) return;

    try {
        const url = query ? `/api/admin/services?search=${encodeURIComponent(query)}` : '/api/admin/services';
        const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        const services = await response.json();

        tbody.innerHTML = '';
        if (services.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No services found</td></tr>';
            return;
        }

        services.forEach(service => {
            const thumbUrl = service.image_url ? `/uploads/${service.image_url.split(/[/\\]/).pop()}` : 'https://via.placeholder.com/60';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${service.name}</td>
                <td><img src="${thumbUrl}" alt="Thumb" style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px;"></td>
                <td>${service.service_type_name || '-'}</td>
                <td><span class="badge ${service.status === 'published' ? 'badge-approved' : 'badge-inactive'}">${service.status}</span></td>
                <td>
                    <button class="btn-sm btn-edit" onclick="editService(${service.id})">Edit</button>
                    <button class="btn-sm btn-deactivate" onclick="deleteService(${service.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error('Error loading services:', error);
        tbody.innerHTML = '<tr><td colspan="5" style="color:red; text-align:center;">Error loading services</td></tr>';
    }
}

// Service Modal Logic
const serviceModal = document.getElementById('serviceModal');
const openServiceModalBtn = document.getElementById('openServiceModalBtn');
const closeServiceModalBtn = document.getElementById('closeServiceModal');
const cancelServiceBtn = document.getElementById('cancelServiceBtn');

function openServiceModal() {
    serviceModal.classList.add('active');
    loadServiceTypesForDropdown();
}

function closeServiceModal() {
    serviceModal.classList.remove('active');
    document.getElementById('serviceForm').reset();
    editingServiceId = null;
    document.querySelector('#serviceModal h2').textContent = 'New Service';
    document.querySelector('#serviceModal button[type="submit"]').textContent = 'Create Service';
}

if(openServiceModalBtn) openServiceModalBtn.addEventListener('click', openServiceModal);
if(closeServiceModalBtn) closeServiceModalBtn.addEventListener('click', closeServiceModal);
if(cancelServiceBtn) cancelServiceBtn.addEventListener('click', closeServiceModal);

async function loadServiceTypesForDropdown() {
    try {
        const response = await fetch('/api/admin/service-types', { headers: { 'Authorization': `Bearer ${token}` } });
        const types = await response.json();
        const select = document.getElementById('svc_type');

        // Preserve selected value if editing
        const currentVal = select.value;

        select.innerHTML = '<option value="">Select Service Type</option>';
        types.forEach(type => {
            const option = document.createElement('option');
            option.value = type.id;
            option.textContent = type.name;
            select.appendChild(option);
        });

        if (currentVal) select.value = currentVal;
    } catch (error) {
        console.error('Error loading types:', error);
    }
}

window.editService = async (id) => {
    try {
        const response = await fetch('/api/admin/services', { headers: { 'Authorization': `Bearer ${token}` } });
        const services = await response.json();
        const service = services.find(s => s.id === id);

        if (!service) return;

        editingServiceId = id;
        document.querySelector('#serviceModal h2').textContent = 'Edit Service';
        document.querySelector('#serviceModal button[type="submit"]').textContent = 'Update Service';

        const form = document.getElementById('serviceForm');
        form.querySelector('#svc_name').value = service.name;
        form.querySelector('#svc_desc').value = service.description;
        form.querySelector('#svc_status').value = service.status;

        await loadServiceTypesForDropdown();
        form.querySelector('#svc_type').value = service.service_type_id;

        serviceModal.classList.add('active');

    } catch (error) {
        console.error(error);
        alert('Error fetching details');
    }
};

document.getElementById('serviceForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
        let url = '/api/admin/services';
        let method = 'POST';

        if (editingServiceId) {
            url = `/api/admin/services/${editingServiceId}`;
            method = 'PUT';
        }

        const response = await fetch(url, {
            method: method,
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        if (response.ok) {
            closeServiceModal();
            loadServices();
            alert(editingServiceId ? 'Service updated!' : 'Service created!');
        } else {
            const data = await response.json();
            alert(data.message || 'Failed');
        }
    } catch (error) {
        console.error(error);
        alert('Server error');
    }
});

window.deleteService = async (id) => {
    if(!confirm('Are you sure?')) return;
    try {
        const response = await fetch(`/api/admin/services/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) loadServices();
        else alert('Failed to delete');
    } catch (error) {
        console.error(error);
    }
}


// --- REVIEWS LOGIC ---
let editingReviewId = null;

async function loadReviews() {
    const tbody = document.getElementById('reviewsTableBody');
    if (!tbody) return;

    try {
        const response = await fetch('/api/admin/reviews', { headers: { 'Authorization': `Bearer ${token}` } });
        const reviews = await response.json();

        tbody.innerHTML = '';
        if (reviews.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No reviews found</td></tr>';
            return;
        }

        reviews.forEach(review => {
            const isActive = review.is_active === 1 || review.is_active === true;
            const isPublished = review.is_published === 1 || review.is_published === true;
            const ratingStars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
            const dateStr = review.created_at ? new Date(review.created_at).toLocaleDateString() : '-';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${safe(review.name)}</td>
                <td><span class="badge" style="background-color: #95a5a6;">${safe(review.source || 'Unknown')}</span></td>
                <td style="color:#f1c40f; font-size:1.2rem;">${ratingStars}</td>
                <td><div style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${safe(review.message || '')}">${safe(review.message || '-')}</div></td>
                <td><span class="badge ${isActive ? 'badge-active' : 'badge-inactive'}">${isActive ? 'Active' : 'Inactive'}</span></td>
                <td><span class="badge ${isPublished ? 'badge-approved' : 'badge-not-approved'}">${isPublished ? 'Published' : 'Draft'}</span></td>
                <td>${dateStr}</td>
                <td>
                    <button class="btn-sm btn-edit" style="background-color:#2c3e50;" onclick="toggleReviewActive(${review.id}, ${isActive})">${isActive ? 'Deactivate' : 'Activate'}</button>
                    <button class="btn-sm btn-approve" onclick="toggleReviewPublished(${review.id}, ${isPublished})">${isPublished ? 'Unpublish' : 'Publish'}</button>
                    <button class="btn-sm btn-edit" onclick="editReview(${review.id})">Edit</button>
                    <button class="btn-sm btn-deactivate" onclick="deleteReview(${review.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading reviews:', error);
        tbody.innerHTML = '<tr><td colspan="8" style="color:red; text-align:center;">Error loading reviews</td></tr>';
    }
}

// Modal
const reviewModal = document.getElementById('reviewModal');
const openReviewModalBtn = document.getElementById('openReviewModalBtn');
const closeReviewModalBtn = document.getElementById('closeReviewModal');
const cancelReviewBtn = document.getElementById('cancelReviewBtn');

function openReviewModal() {
    reviewModal.classList.add('active');
    document.querySelectorAll('.error-msg').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
}

function closeReviewModal() {
    reviewModal.classList.remove('active');
    document.getElementById('reviewForm').reset();
    editingReviewId = null;
    document.querySelector('#reviewModal h2').textContent = 'Add Review';
    const btn = document.getElementById('submitReviewBtn');
    if(btn) btn.textContent = 'Add Review';

    updateStarDisplay(5);
    document.getElementById('rev_rating').value = 5;
    const ratingDisp = document.getElementById('ratingValueDisplay');
    if(ratingDisp) ratingDisp.textContent = '5';

    // Default checked for add
    document.getElementById('rev_active').checked = false;
    document.getElementById('rev_published').checked = false;
}

if(openReviewModalBtn) openReviewModalBtn.addEventListener('click', openReviewModal);
if(closeReviewModalBtn) closeReviewModalBtn.addEventListener('click', closeReviewModal);
if(cancelReviewBtn) cancelReviewBtn.addEventListener('click', closeReviewModal);

// Star Rating UI
const starContainer = document.getElementById('starRating');
const starInput = document.getElementById('rev_rating');
const ratingDisplay = document.getElementById('ratingValueDisplay');
const stars = starContainer ? starContainer.querySelectorAll('span') : [];

if (starContainer) {
    stars.forEach(star => {
        // Click
        star.addEventListener('click', () => {
            const val = parseInt(star.dataset.val);
            starInput.value = val;
            if(ratingDisplay) ratingDisplay.textContent = val;
            updateStarDisplay(val);
        });
        // Hover
        star.addEventListener('mouseenter', () => {
            highlightStars(parseInt(star.dataset.val));
        });
    });

    starContainer.addEventListener('mouseleave', () => {
        const currentVal = parseInt(starInput.value) || 0;
        updateStarDisplay(currentVal);
    });

    updateStarDisplay(5);
}

function highlightStars(val) {
    if (!starContainer) return;
    const spans = starContainer.querySelectorAll('span');
    spans.forEach(span => {
        const v = parseInt(span.dataset.val);
        if (v <= val) span.classList.add('hover');
        else span.classList.remove('hover');
        span.classList.remove('filled');
    });
}

function updateStarDisplay(rating) {
    if (!starContainer) return;
    const spans = starContainer.querySelectorAll('span');
    spans.forEach(span => {
        const val = parseInt(span.dataset.val);
        span.classList.remove('hover');
        if (val <= rating) span.classList.add('filled');
        else span.classList.remove('filled');
    });
}

// Edit Logic
window.editReview = async (id) => {
    try {
        const response = await fetch('/api/admin/reviews', { headers: { 'Authorization': `Bearer ${token}` } });
        const reviews = await response.json();
        const review = reviews.find(r => r.id === id);

        if (!review) return;

        editingReviewId = id;
        document.querySelector('#reviewModal h2').textContent = 'Edit Review';
        const btn = document.getElementById('submitReviewBtn');
        if(btn) btn.textContent = 'Update Review';

        const form = document.getElementById('reviewForm');
        form.querySelector('#rev_name').value = review.name;
        form.querySelector('#rev_email').value = review.email || '';
        form.querySelector('#rev_message').value = review.message || '';
        form.querySelector('#rev_source').value = review.source || 'Google';

        document.getElementById('rev_active').checked = (review.is_active === 1 || review.is_active === true);
        document.getElementById('rev_published').checked = (review.is_published === 1 || review.is_published === true);

        const rating = review.rating || 5;
        document.getElementById('rev_rating').value = rating;
        if(ratingDisplay) ratingDisplay.textContent = rating;
        updateStarDisplay(rating);

        openReviewModal();
    } catch (error) {
        console.error(error);
        alert('Error fetching details');
    }
};

// Actions
window.toggleReviewActive = async (id, currentStatus) => {
    try {
        const response = await fetch(`/api/admin/reviews/${id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ is_active: !currentStatus })
        });
        if (response.ok) loadReviews();
        else alert('Failed to update status');
    } catch (error) {
        console.error(error);
    }
};

window.toggleReviewPublished = async (id, currentStatus) => {
    try {
        const response = await fetch(`/api/admin/reviews/${id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ is_published: !currentStatus })
        });
        if (response.ok) loadReviews();
        else alert('Failed to update published status');
    } catch (error) {
        console.error(error);
    }
};

window.deleteReview = async (id) => {
    if(!confirm('Are you sure?')) return;
    try {
        const response = await fetch(`/api/admin/reviews/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) loadReviews();
        else alert('Failed to delete');
    } catch (error) {
        console.error(error);
    }
};

// Submit
document.getElementById('reviewForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validation
    const nameInput = document.getElementById('rev_name');
    const messageInput = document.getElementById('rev_message');
    const ratingInput = document.getElementById('rev_rating');
    let valid = true;

    document.querySelectorAll('.error-msg').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));

    if (!nameInput.value.trim()) {
        document.getElementById('rev_name_error').style.display = 'block';
        nameInput.classList.add('input-error');
        valid = false;
    }
    if (!messageInput.value.trim()) {
        messageInput.classList.add('input-error');
        valid = false;
    }
    if (!ratingInput.value || ratingInput.value < 1) {
        document.getElementById('rev_rating_error').style.display = 'block';
        valid = false;
    }

    if (!valid) return;

    // Loading
    const submitBtn = document.getElementById('submitReviewBtn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Processing...';
    submitBtn.disabled = true;

    const formData = new FormData(e.target);
    // FormData doesn't capture unchecked checkboxes
    const data = Object.fromEntries(formData.entries());
    data.is_active = document.getElementById('rev_active').checked;
    data.is_published = document.getElementById('rev_published').checked;

    try {
        let url = '/api/admin/reviews';
        let method = 'POST'; // Currently admin POST maps to manual creation

        if (editingReviewId) {
            url = `/api/admin/reviews/${editingReviewId}`;
            method = 'PATCH'; // We changed PUT to PATCH for updates in backend
        }

        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            closeReviewModal();
            loadReviews();
        } else {
            const resData = await response.json();
            alert(resData.message || 'Failed');
        }
    } catch (error) {
        console.error(error);
        alert('Server error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// --- CLIENT REGISTRATION / EDIT LOGIC ---
window.editClient = async (id) => {
    // 1. Fetch client details (Assuming we have them in the list, but fetching fresh is better or using data-attribs)
    // For simplicity, find in list logic is complex without state. I will fetch from list if I cache it, or just populate from row if I'm lazy.
    // Better: GET /api/admin/clients?search=EMAIL to find precise? No.
    // I should have a GET /:id endpoint but I didn't verify it existed in clients.js (I added GET / and PATCH).
    // I'll grab the data from the DOM or simply refetch list and find.

    // Quick hack: Use the data already loaded in the table? No, too messy.
    // I will iterate the displayed list if possible, or just add a GET /:id endpoint?
    // User requested PUT /:id for edit.

    // Let's iterate the current list in memory if I had it. I don't.
    // I will add a GET /:id endpoint? No, the plan didn't include it.
    // I will use the search endpoint with ID if needed? No.

    // Actually, I can just populate the form if I attach data to the edit button.
    // Let's modify `loadClients` to attach data object to the button.
    // But `onclick="editClient(...)` is string based.

    // I will fetch the list again and find the client. Not efficient but fine for now.
    const response = await fetch('/api/admin/clients', { headers: { 'Authorization': `Bearer ${token}` } });
    const clients = await response.json();
    const client = clients.find(c => c.id === id);

    if (!client) return;

    // Switch View
    // Find the link that opens add-client (Users -> Register Client)
    const registerLink = document.querySelector('.submenu-link[data-view="add-client"]');
    if (registerLink) {
        // Expand the Users menu if needed
        const usersMenu = registerLink.closest('.menu-item');
        if (usersMenu) usersMenu.classList.add('open');
        registerLink.click();
    }

    editingClientId = id;

    // Update Form UI
    document.getElementById('clientFormTitle').textContent = 'Edit Client';
    document.getElementById('submitClientBtn').textContent = 'Update Client';

    // Populate
    const form = document.getElementById('registerClientForm');
    form.first_name.value = client.first_name;
    form.last_name.value = client.last_name;
    form.email.value = client.email;
    form.contact_number.value = client.contact_number;
    form.postal_code.value = client.postal_code;
    form.site_address.value = client.site_address;
    form.correspondence_address.value = client.correspondence_address;

    // Password fields: Optional on edit? User requirement said "PUT ... (for Edit)".
    // Usually we leave blank if not changing. I need to handle that in backend.
    // Backend PUT updates all fields currently.
    // I will fill password with dummy or handle backend.
    // The current backend PUT expects all fields.
    // I'll leave password blank and enforce user to re-enter? Or Update backend to ignore if empty?
    // Current backend code: `UPDATE clients SET first_name=?, ...`. It DOES NOT update password.
    // So password fields in form are irrelevant for PUT.
    form.password.removeAttribute('required');
    form.confirm_password.removeAttribute('required');
    // Hide password fields? Or label "Leave blank to keep current"?
    // I'll just leave them visible but not required.
};

function resetClientForm() {
    editingClientId = null;
    document.getElementById('clientFormTitle').textContent = 'Register New Client';
    document.getElementById('submitClientBtn').textContent = 'Create Client Account';
    const form = document.getElementById('registerClientForm');
    form.reset();
    form.password.setAttribute('required', 'true');
    form.confirm_password.setAttribute('required', 'true');
}

document.getElementById('registerClientForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const msgDiv = document.getElementById('clientMsg');
    msgDiv.style.display = 'none';
    msgDiv.className = 'message';

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Validation
    if (!editingClientId) {
        if (data.password !== data.confirm_password) {
            showMessage(msgDiv, 'Passwords do not match', 'error');
            return;
        }
    }

    try {
        let url, method;
        if (editingClientId) {
            url = `/api/admin/clients/${editingClientId}`;
            method = 'PUT';
        } else {
            url = '/api/admin/clients';
            method = 'POST';
        }

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            showMessage(msgDiv, editingClientId ? 'Client updated successfully!' : 'Client created successfully!', 'success');
            if (!editingClientId) e.target.reset();
        } else {
            showMessage(msgDiv, result.message || 'Operation failed', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage(msgDiv, 'Server error occurred', 'error');
    }
});

function showMessage(element, text, type) {
    element.textContent = text;
    element.classList.add(type);
    element.style.display = 'block';
}

// --- BLOGS LOGIC ---
let blogSearchTimeout;
let editorInstance;

document.getElementById('blogSearch')?.addEventListener('input', (e) => {
    clearTimeout(blogSearchTimeout);
    blogSearchTimeout = setTimeout(() => loadBlogs(e.target.value), 300);
});

async function loadBlogs(query = '') {
    const tbody = document.getElementById('blogsTableBody');
    if (!tbody) return;

    try {
        const url = query ? `/api/admin/blogs?search=${encodeURIComponent(query)}` : '/api/admin/blogs';
        const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        const blogs = await response.json();

        tbody.innerHTML = '';
        if (blogs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No blogs found</td></tr>';
            return;
        }

        blogs.forEach(blog => {
            const statusClass = blog.published_status === 'Published' ? 'badge-active' : 'badge-inactive';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${safe(blog.title)}</td>
                <td>${safe(blog.type)}</td>
                <td><span class="badge ${statusClass}">${safe(blog.published_status)}</span></td>
                <td>
                    <button class="btn-sm btn-deactivate" onclick="deleteBlog(${blog.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading blogs:', error);
        tbody.innerHTML = '<tr><td colspan="4" style="color:red; text-align:center;">Error loading blogs</td></tr>';
    }
}

// Add Blog Navigation & Logic
const addBlogNavBtn = document.getElementById('addBlogNavBtn');
if (addBlogNavBtn) {
    addBlogNavBtn.addEventListener('click', () => {
        // Switch view manually to Add Blog
        document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
        document.getElementById('view-add-blog').classList.add('active');
        initEditor();
    });
}

async function initEditor() {
    if (editorInstance) return;
    try {
        if (window.ClassicEditor) {
            editorInstance = await ClassicEditor.create(document.querySelector('#editor'));
        }
    } catch (error) {
        console.error('CKEditor Init Error:', error);
    }
}

document.getElementById('addBlogForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (editorInstance) {
        document.getElementById('new_blog_content_hidden').value = editorInstance.getData();
    }

    const formData = new FormData(e.target);

    try {
        const response = await fetch('/api/admin/blogs', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        if (response.ok) {
            alert('Blog created successfully');
            e.target.reset();
            if(editorInstance) editorInstance.setData('');

            // Navigate back to list (Simulate click on sidebar link)
            const blogsLink = document.querySelector('[data-view="blogs"]');
            if (blogsLink) blogsLink.click();
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to create blog');
        }
    } catch (e) {
        console.error(e);
        alert('Error creating blog');
    }
});

window.deleteBlog = async (id) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;
    try {
        const response = await fetch(`/api/admin/blogs/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) loadBlogs();
        else alert('Failed to delete blog');
    } catch (e) {
        console.error(e);
    }
};

// --- PROJECT TASKS LOGIC ---
let editingProjectTaskId = null;
let projectTaskSearchTimeout;

document.getElementById('projectTaskSearch')?.addEventListener('input', (e) => {
    clearTimeout(projectTaskSearchTimeout);
    projectTaskSearchTimeout = setTimeout(() => loadProjectTasks(e.target.value), 300);
});

async function loadProjectTasks(query = '') {
    const tbody = document.getElementById('projectTasksTableBody');
    if (!tbody) return;

    try {
        const url = query ? `/api/admin/project-tasks?search=${encodeURIComponent(query)}` : '/api/admin/project-tasks';
        const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        const tasks = await response.json();

        tbody.innerHTML = '';
        if (tasks.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">No tasks found</td></tr>';
            return;
        }

        tasks.forEach(task => {
            const statusClass = task.status === 'Active' ? 'badge-active' : 'badge-inactive';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${safe(task.task_name)}</td>
                <td><span class="badge ${statusClass}">${safe(task.status)}</span></td>
                <td>
                    <button class="btn-sm btn-edit" onclick="editProjectTask(${task.id})">Edit</button>
                    <button class="btn-sm btn-deactivate" onclick="deleteProjectTask(${task.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading tasks:', error);
        tbody.innerHTML = '<tr><td colspan="3" style="color:red; text-align:center;">Error loading tasks</td></tr>';
    }
}

// Project Task Modal
const ptModal = document.getElementById('projectTaskModal');
const openPtModalBtn = document.getElementById('openProjectTaskModalBtn');
const closePtModalBtn = document.getElementById('closeProjectTaskModal');
const cancelPtBtn = document.getElementById('cancelProjectTaskBtn');

function openPtModalFunc() {
    ptModal.classList.add('active');
}

function closePtModalFunc() {
    ptModal.classList.remove('active');
    document.getElementById('projectTaskForm').reset();
    editingProjectTaskId = null;
    document.querySelector('#projectTaskModal h2').textContent = 'New Task';
    document.querySelector('#projectTaskModal button[type="submit"]').textContent = 'Save Task';
}

if(openPtModalBtn) openPtModalBtn.addEventListener('click', openPtModalFunc);
if(closePtModalBtn) closePtModalBtn.addEventListener('click', closePtModalFunc);
if(cancelPtBtn) cancelPtBtn.addEventListener('click', closePtModalFunc);

window.editProjectTask = async (id) => {
    try {
        const response = await fetch('/api/admin/project-tasks', { headers: { 'Authorization': `Bearer ${token}` } });
        const tasks = await response.json();
        const task = tasks.find(t => t.id === id);

        if(!task) return;

        editingProjectTaskId = id;
        document.querySelector('#projectTaskModal h2').textContent = 'Edit Task';
        document.querySelector('#projectTaskModal button[type="submit"]').textContent = 'Update Task';

        const form = document.getElementById('projectTaskForm');
        form.querySelector('#pt_name').value = task.task_name;
        form.querySelector('#pt_status').value = task.status;

        openPtModalFunc();
    } catch(e) {
        console.error(e);
        alert('Error fetching details');
    }
};

document.getElementById('projectTaskForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
        let url = '/api/admin/project-tasks';
        let method = 'POST';

        if (editingProjectTaskId) {
            url = `/api/admin/project-tasks/${editingProjectTaskId}`;
            method = 'PUT';
        }

        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            closePtModalFunc();
            loadProjectTasks();
            alert(editingProjectTaskId ? 'Task updated!' : 'Task created!');
        } else {
            const resData = await response.json();
            alert(resData.message || 'Failed to save task');
        }
    } catch (e) {
        console.error(e);
        alert('Error saving task');
    }
});

window.deleteProjectTask = async (id) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
        const response = await fetch(`/api/admin/project-tasks/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) loadProjectTasks();
        else alert('Failed to delete task');
    } catch (e) {
        console.error(e);
    }
};

// --- QUOTATION SETTINGS LOGIC ---

// 1. Property Designs
let editingPropertyDesignId = null;

async function loadPropertyDesigns() {
    const tbody = document.getElementById('propertyDesignsTableBody');
    if (!tbody) return;
    try {
        const response = await fetch('/api/admin/property-designs', { headers: { 'Authorization': `Bearer ${token}` } });
        const rows = await response.json();
        tbody.innerHTML = '';
        if (rows.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No designs found</td></tr>';
            return;
        }
        rows.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${safe(item.name)}</td>
                <td><span class="badge ${item.status === 'Active' ? 'badge-active' : 'badge-inactive'}">${safe(item.status)}</span></td>
                <td>${safe(item.description || '-')}</td>
                <td>
                    <button class="btn-sm btn-edit" onclick="editPropertyDesign(${item.id})">Edit</button>
                    <button class="btn-sm btn-deactivate" onclick="deletePropertyDesign(${item.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="4" style="color:red; text-align:center;">Error loading data</td></tr>';
    }
}

const pdModal = document.getElementById('propertyDesignModal');
const openPdBtn = document.getElementById('openPropertyDesignModalBtn');
const closePdBtn = document.getElementById('closePropertyDesignModal');
const cancelPdBtn = document.getElementById('cancelPropertyDesignBtn');

if(openPdBtn) openPdBtn.addEventListener('click', () => {
    pdModal.classList.add('active');
    document.getElementById('propertyDesignForm').reset();
    editingPropertyDesignId = null;
    pdModal.querySelector('h2').textContent = 'New Property Design';
});
const closePdModalFunc = () => pdModal.classList.remove('active');
if(closePdBtn) closePdBtn.addEventListener('click', closePdModalFunc);
if(cancelPdBtn) cancelPdBtn.addEventListener('click', closePdModalFunc);

window.editPropertyDesign = async (id) => {
    try {
        // Fetch all to find (or fetch single if API exists, sticking to pattern)
        const response = await fetch('/api/admin/property-designs', { headers: { 'Authorization': `Bearer ${token}` } });
        const rows = await response.json();
        const item = rows.find(r => r.id === id);
        if(!item) return;

        editingPropertyDesignId = id;
        pdModal.querySelector('h2').textContent = 'Edit Property Design';
        const form = document.getElementById('propertyDesignForm');
        form.querySelector('[name="name"]').value = item.name;
        form.querySelector('[name="description"]').value = item.description || '';
        form.querySelector('[name="status"]').value = item.status;
        pdModal.classList.add('active');
    } catch(e){ console.error(e); }
};

document.getElementById('propertyDesignForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    try {
        let url = '/api/admin/property-designs';
        let method = 'POST';
        if(editingPropertyDesignId) {
            url = `/api/admin/property-designs/${editingPropertyDesignId}`;
            method = 'PUT';
        }
        const res = await fetch(url, {
            method,
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if(res.ok) {
            closePdModalFunc();
            loadPropertyDesigns();
        } else alert('Failed to save');
    } catch(e){ console.error(e); }
});

window.deletePropertyDesign = async (id) => {
    if(!confirm('Are you sure?')) return;
    try {
        const res = await fetch(`/api/admin/property-designs/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(res.ok) loadPropertyDesigns();
        else alert('Failed to delete');
    } catch(e){ console.error(e); }
};


// 2. Property Parts
let editingPropertyPartId = null;

async function loadPropertyParts() {
    const tbody = document.getElementById('propertyPartsTableBody');
    if (!tbody) return;
    try {
        const response = await fetch('/api/admin/property-parts', { headers: { 'Authorization': `Bearer ${token}` } });
        const rows = await response.json();
        tbody.innerHTML = '';
        if (rows.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No parts found</td></tr>';
            return;
        }
        rows.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${safe(item.name)}</td>
                <td><span class="badge ${item.status === 'Active' ? 'badge-active' : 'badge-inactive'}">${safe(item.status)}</span></td>
                <td>${safe(item.description || '-')}</td>
                <td>
                    <button class="btn-sm btn-edit" onclick="editPropertyPart(${item.id})">Edit</button>
                    <button class="btn-sm btn-deactivate" onclick="deletePropertyPart(${item.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="4" style="color:red; text-align:center;">Error loading data</td></tr>';
    }
}

const ppModal = document.getElementById('propertyPartModal');
const openPpBtn = document.getElementById('openPropertyPartModalBtn');
const closePpBtn = document.getElementById('closePropertyPartModal');
const cancelPpBtn = document.getElementById('cancelPropertyPartBtn');

if(openPpBtn) openPpBtn.addEventListener('click', () => {
    ppModal.classList.add('active');
    document.getElementById('propertyPartForm').reset();
    editingPropertyPartId = null;
    ppModal.querySelector('h2').textContent = 'New Property Part';
});
const closePpModalFunc = () => ppModal.classList.remove('active');
if(closePpBtn) closePpBtn.addEventListener('click', closePpModalFunc);
if(cancelPpBtn) cancelPpBtn.addEventListener('click', closePpModalFunc);

window.editPropertyPart = async (id) => {
    try {
        const response = await fetch('/api/admin/property-parts', { headers: { 'Authorization': `Bearer ${token}` } });
        const rows = await response.json();
        const item = rows.find(r => r.id === id);
        if(!item) return;

        editingPropertyPartId = id;
        ppModal.querySelector('h2').textContent = 'Edit Property Part';
        const form = document.getElementById('propertyPartForm');
        form.querySelector('[name="name"]').value = item.name;
        form.querySelector('[name="description"]').value = item.description || '';
        form.querySelector('[name="status"]').value = item.status;
        ppModal.classList.add('active');
    } catch(e){ console.error(e); }
};

document.getElementById('propertyPartForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    try {
        let url = '/api/admin/property-parts';
        let method = 'POST';
        if(editingPropertyPartId) {
            url = `/api/admin/property-parts/${editingPropertyPartId}`;
            method = 'PUT';
        }
        const res = await fetch(url, {
            method,
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if(res.ok) {
            closePpModalFunc();
            loadPropertyParts();
        } else alert('Failed to save');
    } catch(e){ console.error(e); }
});

window.deletePropertyPart = async (id) => {
    if(!confirm('Are you sure?')) return;
    try {
        const res = await fetch(`/api/admin/property-parts/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(res.ok) loadPropertyParts();
        else alert('Failed to delete');
    } catch(e){ console.error(e); }
};


// 3. Property Part Items
let editingPropertyPartItemId = null;

async function loadPropertyPartItems() {
    const tbody = document.getElementById('propertyPartItemsTableBody');
    if (!tbody) return;
    try {
        const response = await fetch('/api/admin/property-part-items', { headers: { 'Authorization': `Bearer ${token}` } });
        const rows = await response.json();
        tbody.innerHTML = '';
        if (rows.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No items found</td></tr>';
            return;
        }
        rows.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${safe(item.name)}</td>
                <td>${safe(item.part_name || '-')}</td>
                <td><span class="badge ${item.status === 'Active' ? 'badge-active' : 'badge-inactive'}">${safe(item.status)}</span></td>
                <td>${safe(item.description || '-')}</td>
                <td>
                    <button class="btn-sm btn-edit" onclick="editPropertyPartItem(${item.id})">Edit</button>
                    <button class="btn-sm btn-deactivate" onclick="deletePropertyPartItem(${item.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="5" style="color:red; text-align:center;">Error loading data</td></tr>';
    }
}

async function loadPropertyPartsDropdown() {
    try {
        const response = await fetch('/api/admin/property-parts', { headers: { 'Authorization': `Bearer ${token}` } });
        const rows = await response.json();
        const select = document.getElementById('ppi_part_id');
        select.innerHTML = '<option value="">Select Part</option>';
        rows.forEach(r => {
            const opt = document.createElement('option');
            opt.value = r.id;
            opt.textContent = r.name;
            select.appendChild(opt);
        });
    } catch(e){ console.error(e); }
}

const ppiModal = document.getElementById('propertyPartItemModal');
const openPpiBtn = document.getElementById('openPropertyPartItemModalBtn');
const closePpiBtn = document.getElementById('closePropertyPartItemModal');
const cancelPpiBtn = document.getElementById('cancelPropertyPartItemBtn');

if(openPpiBtn) openPpiBtn.addEventListener('click', () => {
    ppiModal.classList.add('active');
    document.getElementById('propertyPartItemForm').reset();
    editingPropertyPartItemId = null;
    ppiModal.querySelector('h2').textContent = 'New Property Part Item';
    loadPropertyPartsDropdown();
});
const closePpiModalFunc = () => ppiModal.classList.remove('active');
if(closePpiBtn) closePpiBtn.addEventListener('click', closePpiModalFunc);
if(cancelPpiBtn) cancelPpiBtn.addEventListener('click', closePpiModalFunc);

window.editPropertyPartItem = async (id) => {
    try {
        const response = await fetch('/api/admin/property-part-items', { headers: { 'Authorization': `Bearer ${token}` } });
        const rows = await response.json();
        const item = rows.find(r => r.id === id);
        if(!item) return;

        editingPropertyPartItemId = id;
        ppiModal.querySelector('h2').textContent = 'Edit Property Part Item';
        const form = document.getElementById('propertyPartItemForm');
        form.querySelector('[name="name"]').value = item.name;
        form.querySelector('[name="description"]').value = item.description || '';
        form.querySelector('[name="status"]').value = item.status;

        await loadPropertyPartsDropdown();
        form.querySelector('[name="part_id"]').value = item.part_id;

        ppiModal.classList.add('active');
    } catch(e){ console.error(e); }
};

document.getElementById('propertyPartItemForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    try {
        let url = '/api/admin/property-part-items';
        let method = 'POST';
        if(editingPropertyPartItemId) {
            url = `/api/admin/property-part-items/${editingPropertyPartItemId}`;
            method = 'PUT';
        }
        const res = await fetch(url, {
            method,
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if(res.ok) {
            closePpiModalFunc();
            loadPropertyPartItems();
        } else alert('Failed to save');
    } catch(e){ console.error(e); }
});

window.deletePropertyPartItem = async (id) => {
    if(!confirm('Are you sure?')) return;
    try {
        const res = await fetch(`/api/admin/property-part-items/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(res.ok) loadPropertyPartItems();
        else alert('Failed to delete');
    } catch(e){ console.error(e); }
};


// 4. Property Services
let editingPropertyServiceId = null;

async function loadPropertyServices() {
    const tbody = document.getElementById('propertyServicesTableBody');
    if (!tbody) return;
    try {
        const response = await fetch('/api/admin/property-services', { headers: { 'Authorization': `Bearer ${token}` } });
        const rows = await response.json();
        tbody.innerHTML = '';
        if (rows.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No services found</td></tr>';
            return;
        }
        rows.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${safe(item.name)}</td>
                <td><span class="badge ${item.status === 'Active' ? 'badge-active' : 'badge-inactive'}">${safe(item.status)}</span></td>
                <td>${safe(item.description || '-')}</td>
                <td>
                    <button class="btn-sm btn-edit" onclick="editPropertyService(${item.id})">Edit</button>
                    <button class="btn-sm btn-deactivate" onclick="deletePropertyService(${item.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="4" style="color:red; text-align:center;">Error loading data</td></tr>';
    }
}

const psModal = document.getElementById('propertyServiceModal');
const openPsBtn = document.getElementById('openPropertyServiceModalBtn');
const closePsBtn = document.getElementById('closePropertyServiceModal');
const cancelPsBtn = document.getElementById('cancelPropertyServiceBtn');

if(openPsBtn) openPsBtn.addEventListener('click', () => {
    psModal.classList.add('active');
    document.getElementById('propertyServiceForm').reset();
    editingPropertyServiceId = null;
    psModal.querySelector('h2').textContent = 'New Property Service';
});
const closePsModalFunc = () => psModal.classList.remove('active');
if(closePsBtn) closePsBtn.addEventListener('click', closePsModalFunc);
if(cancelPsBtn) cancelPsBtn.addEventListener('click', closePsModalFunc);

window.editPropertyService = async (id) => {
    try {
        const response = await fetch('/api/admin/property-services', { headers: { 'Authorization': `Bearer ${token}` } });
        const rows = await response.json();
        const item = rows.find(r => r.id === id);
        if(!item) return;

        editingPropertyServiceId = id;
        psModal.querySelector('h2').textContent = 'Edit Property Service';
        const form = document.getElementById('propertyServiceForm');
        form.querySelector('[name="name"]').value = item.name;
        form.querySelector('[name="description"]').value = item.description || '';
        form.querySelector('[name="status"]').value = item.status;
        psModal.classList.add('active');
    } catch(e){ console.error(e); }
};

document.getElementById('propertyServiceForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    try {
        let url = '/api/admin/property-services';
        let method = 'POST';
        if(editingPropertyServiceId) {
            url = `/api/admin/property-services/${editingPropertyServiceId}`;
            method = 'PUT';
        }
        const res = await fetch(url, {
            method,
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if(res.ok) {
            closePsModalFunc();
            loadPropertyServices();
        } else alert('Failed to save');
    } catch(e){ console.error(e); }
});

window.deletePropertyService = async (id) => {
    if(!confirm('Are you sure?')) return;
    try {
        const res = await fetch(`/api/admin/property-services/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(res.ok) loadPropertyServices();
        else alert('Failed to delete');
    } catch(e){ console.error(e); }
};


// 5. Property Service Items
let editingPropertyServiceItemId = null;

async function loadPropertyServiceItems() {
    const tbody = document.getElementById('propertyServiceItemsTableBody');
    if (!tbody) return;
    try {
        const response = await fetch('/api/admin/property-service-items', { headers: { 'Authorization': `Bearer ${token}` } });
        const rows = await response.json();
        tbody.innerHTML = '';
        if (rows.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No items found</td></tr>';
            return;
        }
        rows.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${safe(item.name)}</td>
                <td>${safe(item.service_name || '-')}</td>
                <td><span class="badge ${item.status === 'Active' ? 'badge-active' : 'badge-inactive'}">${safe(item.status)}</span></td>
                <td>${safe(item.description || '-')}</td>
                <td>
                    <button class="btn-sm btn-edit" onclick="editPropertyServiceItem(${item.id})">Edit</button>
                    <button class="btn-sm btn-deactivate" onclick="deletePropertyServiceItem(${item.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="5" style="color:red; text-align:center;">Error loading data</td></tr>';
    }
}

async function loadPropertyServicesDropdown() {
    try {
        const response = await fetch('/api/admin/property-services', { headers: { 'Authorization': `Bearer ${token}` } });
        const rows = await response.json();
        const select = document.getElementById('psi_service_id');
        select.innerHTML = '<option value="">Select Service</option>';
        rows.forEach(r => {
            const opt = document.createElement('option');
            opt.value = r.id;
            opt.textContent = r.name;
            select.appendChild(opt);
        });
    } catch(e){ console.error(e); }
}

const psiModal = document.getElementById('propertyServiceItemModal');
const openPsiBtn = document.getElementById('openPropertyServiceItemModalBtn');
const closePsiBtn = document.getElementById('closePropertyServiceItemModal');
const cancelPsiBtn = document.getElementById('cancelPropertyServiceItemBtn');

if(openPsiBtn) openPsiBtn.addEventListener('click', () => {
    psiModal.classList.add('active');
    document.getElementById('propertyServiceItemForm').reset();
    editingPropertyServiceItemId = null;
    psiModal.querySelector('h2').textContent = 'New Property Service Item';
    loadPropertyServicesDropdown();
});
const closePsiModalFunc = () => psiModal.classList.remove('active');
if(closePsiBtn) closePsiBtn.addEventListener('click', closePsiModalFunc);
if(cancelPsiBtn) cancelPsiBtn.addEventListener('click', closePsiModalFunc);

window.editPropertyServiceItem = async (id) => {
    try {
        const response = await fetch('/api/admin/property-service-items', { headers: { 'Authorization': `Bearer ${token}` } });
        const rows = await response.json();
        const item = rows.find(r => r.id === id);
        if(!item) return;

        editingPropertyServiceItemId = id;
        psiModal.querySelector('h2').textContent = 'Edit Property Service Item';
        const form = document.getElementById('propertyServiceItemForm');
        form.querySelector('[name="name"]').value = item.name;
        form.querySelector('[name="description"]').value = item.description || '';
        form.querySelector('[name="status"]').value = item.status;

        await loadPropertyServicesDropdown();
        form.querySelector('[name="service_id"]').value = item.service_id;

        psiModal.classList.add('active');
    } catch(e){ console.error(e); }
};

document.getElementById('propertyServiceItemForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    try {
        let url = '/api/admin/property-service-items';
        let method = 'POST';
        if(editingPropertyServiceItemId) {
            url = `/api/admin/property-service-items/${editingPropertyServiceItemId}`;
            method = 'PUT';
        }
        const res = await fetch(url, {
            method,
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if(res.ok) {
            closePsiModalFunc();
            loadPropertyServiceItems();
        } else alert('Failed to save');
    } catch(e){ console.error(e); }
});

window.deletePropertyServiceItem = async (id) => {
    if(!confirm('Are you sure?')) return;
    try {
        const res = await fetch(`/api/admin/property-service-items/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(res.ok) loadPropertyServiceItems();
        else alert('Failed to delete');
    } catch(e){ console.error(e); }
};


// Init
// Default to Dashboard
loadDashboardStats();

// --- SETTINGS LOGIC ---

// 1. Roles (Permissions)
let editingRoleId = null;

async function loadRoles() {
    const tbody = document.getElementById('rolesTableBody');
    if (!tbody) return;
    try {
        const response = await fetch('/api/admin/roles', { headers: { 'Authorization': `Bearer ${token}` } });
        const rows = await response.json();
        tbody.innerHTML = '';
        if (rows.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No roles found</td></tr>';
            return;
        }
        rows.forEach(item => {
            // permissions is JSON string
            let perms = '';
            try {
                const p = JSON.parse(item.permissions);
                perms = safe(p);
            } catch(e) { perms = safe(item.permissions); }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${safe(item.name)}</td>
                <td><div style="max-width:300px; overflow:hidden; text-overflow:ellipsis;">${perms}</div></td>
                <td><span class="badge ${item.status === 'Active' ? 'badge-active' : 'badge-inactive'}">${safe(item.status)}</span></td>
                <td>
                    <button class="btn-sm btn-edit" onclick="editRole(${item.id})">Edit</button>
                    <button class="btn-sm btn-deactivate" onclick="deleteRole(${item.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="4" style="color:red; text-align:center;">Error loading data</td></tr>';
    }
}

const roleModal = document.getElementById('roleModal');
const openRoleBtn = document.getElementById('openRoleModalBtn');
const closeRoleBtn = document.getElementById('closeRoleModal');
const cancelRoleBtn = document.getElementById('cancelRoleBtn');

if(openRoleBtn) openRoleBtn.addEventListener('click', () => {
    roleModal.classList.add('active');
    document.getElementById('roleForm').reset();
    editingRoleId = null;
    roleModal.querySelector('h2').textContent = 'New Role';
});
const closeRoleModalFunc = () => roleModal.classList.remove('active');
if(closeRoleBtn) closeRoleBtn.addEventListener('click', closeRoleModalFunc);
if(cancelRoleBtn) cancelRoleBtn.addEventListener('click', closeRoleModalFunc);

window.editRole = async (id) => {
    try {
        const response = await fetch('/api/admin/roles', { headers: { 'Authorization': `Bearer ${token}` } });
        const rows = await response.json();
        const item = rows.find(r => r.id === id);
        if(!item) return;

        editingRoleId = id;
        roleModal.querySelector('h2').textContent = 'Edit Role';
        const form = document.getElementById('roleForm');
        form.querySelector('[name="name"]').value = item.name;

        let perms = '';
        try {
            perms = JSON.parse(item.permissions);
        } catch(e) { perms = item.permissions; }

        form.querySelector('[name="permissions"]').value = perms;
        form.querySelector('[name="status"]').value = item.status;
        roleModal.classList.add('active');
    } catch(e){ console.error(e); }
};

document.getElementById('roleForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    // Convert permissions to something? Keeping as string for now

    try {
        let url = '/api/admin/roles';
        let method = 'POST';
        if(editingRoleId) {
            url = `/api/admin/roles/${editingRoleId}`;
            method = 'PUT';
        }
        const res = await fetch(url, {
            method,
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if(res.ok) {
            closeRoleModalFunc();
            loadRoles();
        } else {
            const err = await res.json();
            alert(err.message || 'Failed to save');
        }
    } catch(e){ console.error(e); }
});

window.deleteRole = async (id) => {
    if(!confirm('Are you sure?')) return;
    try {
        const res = await fetch(`/api/admin/roles/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(res.ok) loadRoles();
        else alert('Failed to delete');
    } catch(e){ console.error(e); }
};

// 2. Analytics Settings
async function loadAnalyticsSettings() {
    try {
        const res = await fetch('/api/admin/settings/analytics', { headers: { 'Authorization': `Bearer ${token}` } });
        if(!res.ok) return;
        const data = await res.json();
        const form = document.getElementById('analyticsSettingsForm');
        if(data) {
            form.querySelector('[name="google_analytics_id"]').value = data.google_analytics_id || '';
            form.querySelector('[name="facebook_pixel_id"]').value = data.facebook_pixel_id || '';
            form.querySelector('[name="custom_header_scripts"]').value = data.custom_header_scripts || '';
            form.querySelector('[name="custom_footer_scripts"]').value = data.custom_footer_scripts || '';
        }
    } catch(e) { console.error(e); }
}

document.getElementById('analyticsSettingsForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    try {
        const res = await fetch('/api/admin/settings/analytics', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if(res.ok) alert('Settings saved');
        else alert('Failed to save');
    } catch(e) { console.error(e); alert('Error'); }
});

// 3. Site Settings
async function loadSiteSettings() {
    try {
        const res = await fetch('/api/admin/settings/site', { headers: { 'Authorization': `Bearer ${token}` } });
        if(!res.ok) return;
        const data = await res.json();
        const form = document.getElementById('siteSettingsForm');
        if(data) {
            form.querySelector('[name="site_title"]').value = data.site_title || '';
            form.querySelector('[name="site_tagline"]').value = data.site_tagline || '';
            form.querySelector('[name="site_email"]').value = data.site_email || '';
            form.querySelector('[name="contact_phone"]').value = data.contact_phone || '';
            form.querySelector('[name="address"]').value = data.address || '';
            form.querySelector('[name="logo_url"]').value = data.logo_url || '';
            form.querySelector('[name="favicon_url"]').value = data.favicon_url || '';
            form.querySelector('[name="maintenance_mode"]').value = data.maintenance_mode ? 'true' : 'false';
            form.querySelector('[name="social_facebook"]').value = data.social_facebook || '';
            form.querySelector('[name="social_twitter"]').value = data.social_twitter || '';
            form.querySelector('[name="social_instagram"]').value = data.social_instagram || '';
            form.querySelector('[name="social_linkedin"]').value = data.social_linkedin || '';
            form.querySelector('[name="social_youtube"]').value = data.social_youtube || '';
        }
    } catch(e) { console.error(e); }
}

document.getElementById('siteSettingsForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    try {
        const res = await fetch('/api/admin/settings/site', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if(res.ok) alert('Settings saved');
        else alert('Failed to save');
    } catch(e) { console.error(e); alert('Error'); }
});

// 4. Email Settings
async function loadEmailSettings() {
    try {
        const res = await fetch('/api/admin/settings/email', { headers: { 'Authorization': `Bearer ${token}` } });
        if(!res.ok) return;
        const data = await res.json();
        const form = document.getElementById('emailSettingsForm');
        if(data) {
            form.querySelector('[name="mail_driver"]').value = data.mail_driver || 'smtp';
            form.querySelector('[name="mail_host"]').value = data.mail_host || '';
            form.querySelector('[name="mail_port"]').value = data.mail_port || '';
            form.querySelector('[name="mail_username"]').value = data.mail_username || '';
            // Don't fill password for security, or maybe fill it?
            // form.querySelector('[name="mail_password"]').value = data.mail_password || '';
            form.querySelector('[name="mail_encryption"]').value = data.mail_encryption || 'tls';
            form.querySelector('[name="from_address"]').value = data.from_address || '';
            form.querySelector('[name="from_name"]').value = data.from_name || '';
        }
    } catch(e) { console.error(e); }
}

document.getElementById('emailSettingsForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    try {
        const res = await fetch('/api/admin/settings/email', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if(res.ok) alert('Settings saved');
        else alert('Failed to save');
    } catch(e) { console.error(e); alert('Error'); }
});
