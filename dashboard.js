// --- AUTH CHECK ---
const token = localStorage.getItem('token');
if (!token) {
    window.location.replace('login.html'); // Use replace to prevent back button
}

// --- NAVIGATION ---
const navBtns = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view-section');

navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all
        navBtns.forEach(b => b.classList.remove('active'));
        views.forEach(v => v.classList.remove('active'));

        // Add active to clicked
        btn.classList.add('active');
        const viewId = `view-${btn.dataset.view}`;
        document.getElementById(viewId).classList.add('active');
    });
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.replace('login.html');
});

// --- PROJECTS LOGIC ---
async function loadProjects() {
    const projectsList = document.getElementById('projectsList');
    if (!projectsList) return; // Guard if element missing

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
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            loadProjects();
        } else {
            alert('Failed to delete project');
        }
    } catch (error) {
        console.error('Error deleting project:', error);
    }
};

// --- CLIENT REGISTRATION LOGIC ---
document.getElementById('registerClientForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const msgDiv = document.getElementById('clientMsg');
    msgDiv.style.display = 'none';
    msgDiv.className = 'message'; // Reset classes

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Validation
    if (data.password !== data.confirm_password) {
        showMessage(msgDiv, 'Passwords do not match', 'error');
        return;
    }

    try {
        const response = await fetch('/api/admin/clients', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            showMessage(msgDiv, 'Client created successfully!', 'success');
            e.target.reset();
        } else {
            showMessage(msgDiv, result.message || 'Failed to create client', 'error');
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
loadProjects();
