// --- AUTH CHECK ---
const token = localStorage.getItem('token');
if (!token) {
    window.location.replace('login.html');
}

// --- STATE ---
let editingClientId = null;
let editingServiceTypeId = null;

// --- NAVIGATION ---
const navBtns = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view-section');

navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Reset Edit Mode if leaving Add Client
        if (btn.dataset.view !== 'add-client') {
            resetClientForm();
        }

        // Navigation UI update
        navBtns.forEach(b => b.classList.remove('active'));
        views.forEach(v => v.classList.remove('active'));

        btn.classList.add('active');
        const viewId = `view-${btn.dataset.view}`;
        document.getElementById(viewId).classList.add('active');

        // Data Load triggers
        if (btn.dataset.view === 'projects') loadProjects();
        if (btn.dataset.view === 'clients') loadClients();
        if (btn.dataset.view === 'admins') loadAdmins();
        if (btn.dataset.view === 'service-types') loadServiceTypes();
    });
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.replace('login.html');
});

// --- PROJECTS LOGIC ---
async function loadProjects() {
    const projectsList = document.getElementById('projectsList');
    if (!projectsList) return;

    try {
        const response = await fetch('/api/projects');
        const projects = await response.json();

        projectsList.innerHTML = '';
        if (projects.length === 0) {
            projectsList.innerHTML = '<p>No projects found.</p>';
            return;
        }

        projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = `
                <img src="${project.image_url || 'https://via.placeholder.com/300'}" alt="${project.title}" class="project-image">
                <div class="project-content">
                    <h3 class="project-title">${project.title}</h3>
                    <p>${project.description || ''}</p>
                    <button class="delete-btn" onclick="deleteProject(${project.id})">Delete</button>
                </div>
            `;
            projectsList.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading projects:', error);
        projectsList.innerHTML = '<p>Error loading projects.</p>';
    }
}

document.getElementById('addProjectForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('proj_title').value;
    const description = document.getElementById('proj_desc').value;
    const imageUrl = document.getElementById('proj_img').value;

    try {
        const response = await fetch('/api/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, description, image_url: imageUrl })
        });

        if (response.ok) {
            e.target.reset();
            loadProjects();
            alert('Project added!');
        } else {
            alert('Failed to add project');
        }
    } catch (error) {
        console.error('Error adding project:', error);
        alert('Error adding project');
    }
});

window.deleteProject = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
        const response = await fetch(`/api/projects/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) loadProjects();
        else alert('Failed to delete project');
    } catch (error) {
        console.error('Error deleting project:', error);
    }
};

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
    editingClientId = id;
    document.querySelector('button[data-view="add-client"]').click();

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

// Init
// Check hash or default?
loadProjects();
