const { query } = require('../db');

const listProjects = async (req, res) => {
    try {
        const projects = await query("SELECT * FROM projects");
        // Parse images JSON
        const parsed = projects.map(p => ({
            ...p,
            images: p.images ? JSON.parse(p.images) : []
        }));
        res.json(parsed);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const createProject = async (req, res) => {
    const { title, category, location, description, status } = req.body;
    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

    try {
        await query("INSERT INTO projects (title, category, location, description, images, status) VALUES (?, ?, ?, ?, ?, ?)",
            [title, category, location, description, JSON.stringify(images), status]);
        res.status(201).json({ message: 'Project created' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateProject = async (req, res) => {
    // Handling updates with file uploads is complex (add/remove).
    // Simplified: Update text fields.
    const { id } = req.params;
    const { title, category, location, description, status } = req.body;

    try {
        await query("UPDATE projects SET title=?, category=?, location=?, description=?, status=? WHERE id=?",
            [title, category, location, description, status, id]);
        res.json({ message: 'Project updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteProject = async (req, res) => {
    const { id } = req.params;
    try {
        await query("DELETE FROM projects WHERE id=?", [id]);
        res.json({ message: 'Project deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { listProjects, createProject, updateProject, deleteProject };
