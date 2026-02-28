const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Helper to generate slug
const generateSlug = (title) => {
    return title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// GET all projects
router.get('/', authenticateToken, async (req, res) => {
    const { search } = req.query;
    try {
        let query = 'SELECT * FROM projects';
        const params = [];
        if (search) {
            query += ' WHERE title LIKE ? OR location LIKE ?';
            params.push(`%${search}%`, `%${search}%`);
        }
        query += ' ORDER BY created_at DESC';
        const [projects] = await db.query(query, params);
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST new project
router.post('/', authenticateToken, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'gallery', maxCount: 3 },
    { name: 'drawing', maxCount: 1 },
    { name: 'project', maxCount: 1 }
]), async (req, res) => {
    const {
        title, location, budget, status, description, progress_status,
        client_id, service_id, category, project_status, start_date, end_date, is_featured
    } = req.body;

    if (!title) return res.status(400).json({ message: 'Title required' });

    const files = req.files || {};
    const image_url = files['image'] ? files['image'][0].path : null;
    const drawing_url = files['drawing'] ? files['drawing'][0].path : null;
    const project_file_url = files['project'] ? files['project'][0].path : null;

    let gallery_images = [];
    if (files['gallery']) {
        gallery_images = files['gallery'].map(f => f.path);
    }
    const galleryJson = JSON.stringify(gallery_images);

    // Slug generation
    let slug = req.body.slug;
    if (!slug) {
        slug = generateSlug(title);
        // Ensure uniqueness
        const [exists] = await db.query('SELECT id FROM projects WHERE slug = ?', [slug]);
        if (exists.length > 0) slug = `${slug}-${Date.now()}`;
    }

    try {
        const [result] = await db.query(
            `INSERT INTO projects (
                title, location, budget, status, description, progress_status, image_url,
                client_id, slug, service_id, category, gallery_images, project_status, start_date, end_date, is_featured, drawing_url, project_file_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title, location, budget, status || 'Active', description, progress_status || 'Not Started', image_url,
                client_id || null, slug, service_id || null, category || null, galleryJson, project_status || null,
                start_date || null, end_date || null, is_featured === 'Yes' || is_featured === true,
                drawing_url, project_file_url
            ]
        );
        res.status(201).json({ id: result.insertId, message: 'Project created' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT update project
router.put('/:id', authenticateToken, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'gallery', maxCount: 3 },
    { name: 'drawing', maxCount: 1 },
    { name: 'project', maxCount: 1 }
]), async (req, res) => {
    const {
        title, location, budget, status, description, progress_status,
        client_id, slug, service_id, category, project_status, start_date, end_date, is_featured
    } = req.body;
    const id = req.params.id;

    try {
        // Fetch current
        const [current] = await db.query('SELECT * FROM projects WHERE id=?', [id]);
        if (current.length === 0) return res.status(404).json({ message: 'Not found' });
        const curr = current[0];

        const files = req.files || {};
        const image_url = files['image'] ? files['image'][0].path : curr.image_url;
        const drawing_url = files['drawing'] ? files['drawing'][0].path : curr.drawing_url;
        const project_file_url = files['project'] ? files['project'][0].path : curr.project_file_url;

        let galleryJson = curr.gallery_images;
        if (files['gallery'] && files['gallery'].length > 0) {
            const gallery_images = files['gallery'].map(f => f.path);
            galleryJson = JSON.stringify(gallery_images);
        }

        const isFeaturedVal = (is_featured === 'Yes' || is_featured === 'true' || is_featured === true);

        // Update
        await db.query(
            `UPDATE projects SET
                title=?, location=?, budget=?, status=?, description=?, progress_status=?, image_url=?,
                client_id=?, slug=?, service_id=?, category=?, gallery_images=?, project_status=?, start_date=?, end_date=?, is_featured=?, drawing_url=?, project_file_url=?
             WHERE id=?`,
            [
                title, location, budget, status, description, progress_status, image_url,
                client_id, slug, service_id, category, galleryJson, project_status, start_date, end_date, isFeaturedVal, drawing_url, project_file_url,
                id
            ]
        );
        res.json({ message: 'Project updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE project
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await db.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
        res.json({ message: 'Project deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PATCH toggle status
router.patch('/:id/toggle', authenticateToken, async (req, res) => {
    try {
        const [current] = await db.query('SELECT status FROM projects WHERE id=?', [req.params.id]);
        if(current.length === 0) return res.status(404).json({message:'Not found'});

        const newStatus = current[0].status === 'Active' ? 'Inactive' : 'Active';
        await db.query('UPDATE projects SET status=? WHERE id=?', [newStatus, req.params.id]);
        res.json({ message: 'Status toggled', status: newStatus });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PATCH progress (Keep existing)
router.patch('/:id/progress', authenticateToken, async (req, res) => {
    const { progress_status } = req.body;
    try {
        await db.query('UPDATE projects SET progress_status = ? WHERE id = ?', [progress_status, req.params.id]);
        res.json({ message: 'Progress updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
