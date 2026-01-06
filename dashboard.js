// --- AUTH CHECK ---
const token = localStorage.getItem('token');
if (!token) {
    window.location.replace('login.html');
}

// --- STATE ---
let editingClientId = null;

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

    // Show Loading
    // tbody.innerHTML = '<tr><td colspan="7">Loading...</td></tr>';
    // Commented out to prevent flickering on typing

    try {
        const url = query ? `/api/admin/clients?search=${encodeURIComponent(query)}` : '/api/admin/clients';
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const clients = await response.json();

        tbody.innerHTML = '';
        if (clients.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No clients found</td></tr>';
            return;
        }

        clients.forEach(client => {
            const createdDate = new Date(client.created_at).toISOString().split('T')[0];
            const isApproved = client.is_approved || client.is_approved === 1; // MySQL boolean is 1/0
            const status = client.status || 'Active';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="client-name-cell">
                    ${client.first_name}
                    <div><span class="badge badge-reg">Registered On - ${createdDate}</span></div>
                </td>
                <td>${client.last_name}</td>
                <td>${client.email}</td>
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
        tbody.innerHTML = '<tr><td colspan="7" style="color:red; text-align:center;">Error loading data</td></tr>';
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
