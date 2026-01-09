const express = require('express');
const router = express.Router();

// Placeholder data since DB connection might be unreliable or table missing in this environment
let projects = [
    {
        id: 1,
        title: "Sample Project 1",
        location: "New York",
        budget: "50000",
        status: "Active",
        description: "This is a sample project.",
        image_url: null,
        progress_status: "In Progress"
    },
    {
        id: 2,
        title: "Sample Project 2",
        location: "London",
        budget: "75000",
        status: "Inactive",
        description: "Another sample project.",
        image_url: null,
        progress_status: "Completed"
    }
];

// GET /api/projects (list)
router.get('/', (req, res) => {
    res.json(projects);
});

// GET /api/projects/:id (single)
router.get('/:id', (req, res) => {
    const project = projects.find(p => p.id === parseInt(req.params.id));
    if (!project) {
        return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
});

// POST /api/projects (create)
// NOTE: This is a public endpoint as per user request. In a real application, this should be protected.
router.post('/', (req, res) => {
    const { title, location, budget, status, description, image_url, progress_status } = req.body;
    const newProject = {
        id: projects.length + 1,
        title,
        location,
        budget,
        status: status || 'Active',
        description,
        image_url: image_url || null,
        progress_status: progress_status || 'Not Started'
    };
    projects.push(newProject);
    res.status(201).json(newProject);
});

// PUT /api/projects/:id (update)
// NOTE: This is a public endpoint as per user request. In a real application, this should be protected.
router.put('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) {
        return res.status(404).json({ message: 'Project not found' });
    }

    const { title, location, budget, status, description, image_url, progress_status } = req.body;
    projects[index] = {
        ...projects[index],
        title: title !== undefined ? title : projects[index].title,
        location: location !== undefined ? location : projects[index].location,
        budget: budget !== undefined ? budget : projects[index].budget,
        status: status !== undefined ? status : projects[index].status,
        description: description !== undefined ? description : projects[index].description,
        image_url: image_url !== undefined ? image_url : projects[index].image_url,
        progress_status: progress_status !== undefined ? progress_status : projects[index].progress_status
    };

    res.json({ message: 'Project updated', project: projects[index] });
});

// DELETE /api/projects/:id (delete)
// NOTE: This is a public endpoint as per user request. In a real application, this should be protected.
router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) {
        return res.status(404).json({ message: 'Project not found' });
    }
    projects.splice(index, 1);
    res.json({ message: 'Project deleted' });
});

module.exports = router;
