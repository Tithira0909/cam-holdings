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
        if (viewName === 'project-tasks') loadProjectTasks();
        if (viewName === 'blogs') loadBlogs();
        if (viewName === 'reviews') loadReviews();
        if (viewName === 'inquiries') loadInquiries();
        if (viewName === 'quotations') loadQuotations();
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
                <td>${safe(proj.title)}</td>
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

// Project Modal
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

if(openProjectModalBtn) openProjectModalBtn.addEventListener('click', openProjectModalFunc);
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
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No reviews found</td></tr>';
            return;
        }

        reviews.forEach(review => {
            const isApproved = review.is_approved === 1 || review.is_approved === true;
            const status = review.status || 'Active';
            const ratingStars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${review.client_name}</td>
                <td><div style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${review.description || ''}">${review.description || '-'}</div></td>
                <td style="color:#f1c40f; font-size:1.2rem;">${ratingStars}</td>
                <td><span class="badge" style="background-color: #95a5a6;">${review.source || 'Unknown'}</span></td>
                <td><span class="badge ${isApproved ? 'badge-approved' : 'badge-not-approved'}">${isApproved ? 'Approved' : 'Not Approved'}</span></td>
                <td><span class="badge ${status === 'Active' ? 'badge-active' : 'badge-inactive'}">${status}</span></td>
                <td>
                    ${!isApproved ? `<button class="btn-sm btn-approve" onclick="approveReview(${review.id})">Approve</button>` : ''}
                    <button class="btn-sm btn-edit" style="background-color:#2c3e50;" onclick="toggleReviewStatus(${review.id})">Change Status</button>
                    <button class="btn-sm btn-edit" onclick="editReview(${review.id})">Edit</button>
                    <button class="btn-sm btn-deactivate" onclick="deleteReview(${review.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading reviews:', error);
        tbody.innerHTML = '<tr><td colspan="7" style="color:red; text-align:center;">Error loading reviews</td></tr>';
    }
}

// Modal
const reviewModal = document.getElementById('reviewModal');
const openReviewModalBtn = document.getElementById('openReviewModalBtn');
const closeReviewModalBtn = document.getElementById('closeReviewModal');
const cancelReviewBtn = document.getElementById('cancelReviewBtn');

function openReviewModal() {
    reviewModal.classList.add('active');
}

function closeReviewModal() {
    reviewModal.classList.remove('active');
    document.getElementById('reviewForm').reset();
    editingReviewId = null;
    document.querySelector('#reviewModal h2').textContent = 'Add Review';
    document.querySelector('#reviewModal button[type="submit"]').textContent = 'Add Review';
    updateStarDisplay(5); // Default to 5
    document.getElementById('rev_rating').value = 5;
}

if(openReviewModalBtn) openReviewModalBtn.addEventListener('click', openReviewModal);
if(closeReviewModalBtn) closeReviewModalBtn.addEventListener('click', closeReviewModal);
if(cancelReviewBtn) cancelReviewBtn.addEventListener('click', closeReviewModal);

// Star Rating UI
const starContainer = document.getElementById('starRating');
const starInput = document.getElementById('rev_rating');
const stars = starContainer ? starContainer.querySelectorAll('span') : [];

if (starContainer) {
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const val = parseInt(star.dataset.val);
            starInput.value = val;
            updateStarDisplay(val);
        });
    });
    // Set initial
    updateStarDisplay(5);
}

function updateStarDisplay(rating) {
    if (!starContainer) return;
    const spans = starContainer.querySelectorAll('span');
    spans.forEach(span => {
        const val = parseInt(span.dataset.val);
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
        document.querySelector('#reviewModal button[type="submit"]').textContent = 'Update Review';

        const form = document.getElementById('reviewForm');
        form.querySelector('#rev_name').value = review.client_name;
        form.querySelector('#rev_desc').value = review.description || '';

        // Radio logic
        const sourceRadios = form.querySelectorAll('input[name="source"]');
        sourceRadios.forEach(radio => {
            if (radio.value === review.source) radio.checked = true;
        });

        // Rating logic
        const rating = review.rating || 5;
        document.getElementById('rev_rating').value = rating;
        updateStarDisplay(rating);

        reviewModal.classList.add('active');
    } catch (error) {
        console.error(error);
        alert('Error fetching details');
    }
};

// Actions
window.approveReview = async (id) => {
    try {
        const response = await fetch(`/api/admin/reviews/${id}/approve`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) loadReviews();
        else alert('Failed to approve');
    } catch (error) {
        console.error(error);
    }
};

window.toggleReviewStatus = async (id) => {
    try {
        const response = await fetch(`/api/admin/reviews/${id}/status`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) loadReviews();
        else alert('Failed to update status');
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
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
        let url = '/api/admin/reviews';
        let method = 'POST';

        if (editingReviewId) {
            url = `/api/admin/reviews/${editingReviewId}`;
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
            closeReviewModal();
            loadReviews();
            alert(editingReviewId ? 'Review updated!' : 'Review added!');
        } else {
            const resData = await response.json();
            alert(resData.message || 'Failed');
        }
    } catch (error) {
        console.error(error);
        alert('Server error');
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

// --- BLOGS LOGIC (Formerly Document Types) ---
let editingBlogId = null;
let blogSearchTimeout;

document.getElementById('blogSearch')?.addEventListener('input', (e) => {
    clearTimeout(blogSearchTimeout);
    blogSearchTimeout = setTimeout(() => loadBlogs(e.target.value), 300);
});

async function loadBlogs(query = '') {
    const tbody = document.getElementById('blogsTableBody');
    if (!tbody) return;

    try {
        // Keeping the API endpoint same as per instructions, but UI says Blogs
        const url = query ? `/api/admin/document-types?search=${encodeURIComponent(query)}` : '/api/admin/document-types';
        const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        const blogs = await response.json();

        tbody.innerHTML = '';
        if (blogs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No blogs found</td></tr>';
            return;
        }

        blogs.forEach(blog => {
            const statusClass = blog.status === 'Active' ? 'badge-active' : 'badge-inactive';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${safe(blog.document_name)}</td>
                <td>${safe(blog.description || '-')}</td>
                <td>${safe(blog.type)}</td>
                <td><span class="badge ${statusClass}">${safe(blog.status)}</span></td>
                <td>
                    <button class="btn-sm btn-edit" onclick="editBlog(${blog.id})">Edit</button>
                    <button class="btn-sm btn-deactivate" onclick="deleteBlog(${blog.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading blogs:', error);
        tbody.innerHTML = '<tr><td colspan="5" style="color:red; text-align:center;">Error loading blogs</td></tr>';
    }
}

// Blog Modal
const blogModal = document.getElementById('blogModal');
const openBlogModalBtn = document.getElementById('openBlogModalBtn');
const closeBlogModalBtn = document.getElementById('closeBlogModal');
const cancelBlogBtn = document.getElementById('cancelBlogBtn');

function openBlogModalFunc() {
    blogModal.classList.add('active');
}

function closeBlogModalFunc() {
    blogModal.classList.remove('active');
    document.getElementById('blogForm').reset();
    editingBlogId = null;
    document.querySelector('#blogModal h2').textContent = 'New Blog';
    document.querySelector('#blogModal button[type="submit"]').textContent = 'Save Blog';
}

if(openBlogModalBtn) openBlogModalBtn.addEventListener('click', openBlogModalFunc);
if(closeBlogModalBtn) closeBlogModalBtn.addEventListener('click', closeBlogModalFunc);
if(cancelBlogBtn) cancelBlogBtn.addEventListener('click', closeBlogModalFunc);

window.editBlog = async (id) => {
    try {
        const response = await fetch('/api/admin/document-types', { headers: { 'Authorization': `Bearer ${token}` } });
        const blogs = await response.json();
        const blog = blogs.find(b => b.id === id);

        if(!blog) return;

        editingBlogId = id;
        document.querySelector('#blogModal h2').textContent = 'Edit Blog';
        document.querySelector('#blogModal button[type="submit"]').textContent = 'Update Blog';

        const form = document.getElementById('blogForm');
        form.querySelector('#blog_title').value = blog.document_name;
        form.querySelector('#blog_category').value = blog.type;
        form.querySelector('#blog_excerpt').value = blog.description || '';
        form.querySelector('#blog_status').value = blog.status;

        openBlogModalFunc();
    } catch(e) {
        console.error(e);
        alert('Error fetching blog details');
    }
};

document.getElementById('blogForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
        let url = '/api/admin/document-types';
        let method = 'POST';

        if (editingBlogId) {
            url = `/api/admin/document-types/${editingBlogId}`;
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
            closeBlogModalFunc();
            loadBlogs();
            alert(editingBlogId ? 'Blog updated!' : 'Blog created!');
        } else {
            const resData = await response.json();
            alert(resData.message || 'Failed to save blog');
        }
    } catch (e) {
        console.error(e);
        alert('Error saving blog');
    }
});

window.deleteBlog = async (id) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;
    try {
        const response = await fetch(`/api/admin/document-types/${id}`, {
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

// Init
// Default to Dashboard
loadDashboardStats();
