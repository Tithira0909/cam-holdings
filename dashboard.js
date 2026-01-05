// Check authentication
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'login.html';
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
});

// Load Projects
async function loadProjects() {
    const projectsList = document.getElementById('projectsList');
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

// Add Project
document.getElementById('addProjectForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const imageUrl = document.getElementById('imageUrl').value;

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
            document.getElementById('addProjectForm').reset();
            loadProjects();
        } else {
            alert('Failed to add project');
        }
    } catch (error) {
        console.error('Error adding project:', error);
        alert('Error adding project');
    }
});

// Delete Project
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
        alert('Error deleting project');
    }
};

// Initial load
loadProjects();
