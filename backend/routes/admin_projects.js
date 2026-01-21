const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const generateSlug = (title) => {
    return title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// GET all projects (Searchable)
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
    { name: 'drawing', maxCount: 1 },
    { name: 'project', maxCount: 1 },
    { name: 'galleryImages', maxCount: 3 }
]), async (req, res) => {
    const {
        title, location, budget, status, description, progress_status,
        client_id, slug, service_id, project_status, start_date, end_date,
        is_featured, category
    } = req.body;

    const files = req.files || {};
    const image_url = files['image'] ? files['image'][0].path : null;
    const drawing_url = files['drawing'] ? files['drawing'][0].path : null;
    const project_file_url = files['project'] ? files['project'][0].path : null;

    let gallery_images = [];
    if (files['galleryImages']) {
        gallery_images = files['galleryImages'].map(f => f.path);
    }
    const gallery_json = JSON.stringify(gallery_images);

    const finalSlug = slug ? slug : generateSlug(title || '');
    const finalStatus = status || 'Active';
    const featured = (is_featured === 'Yes' || is_featured === 'true' || is_featured === true || is_featured === '1' || is_featured === 1) ? 1 : 0;

    try {
        const [result] = await db.query(
            `INSERT INTO projects (
                title, location, budget, status, description, description_html, progress_status, image_url,
                client_id, slug, service_id, project_status, start_date, end_date, is_featured, drawing_url, project_file_url,
                category, gallery_images
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title, location, budget, finalStatus, description, description, progress_status || 'Not Started', image_url,
                client_id || null, finalSlug, service_id || null, project_status || null,
                start_date || null, end_date || null, featured,
                drawing_url, project_file_url,
                category || 'interior', gallery_json
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
    { name: 'galleryImages', maxCount: 3 },
    { name: 'drawing', maxCount: 1 },
    { name: 'project', maxCount: 1 }
]), async (req, res) => {
    const {
        title, location, budget, status, description, progress_status,
        category, is_featured, slug, client_id, service_id, project_status, start_date, end_date
    } = req.body;
    const id = req.params.id;

    const files = req.files || {};

    try {
        let query = 'UPDATE projects SET title=?, location=?, budget=?, status=?, description=?, progress_status=?, category=?, is_featured=?';
        const featured = (is_featured === 'Yes' || is_featured === 'true' || is_featured === true || is_featured === '1' || is_featured === 1) ? 1 : 0;
        let params = [title, location, budget, status, description, progress_status, category, featured];

        if (slug) {
            query += ', slug=?';
            params.push(slug);
        }
        if (client_id) {
            query += ', client_id=?';
            params.push(client_id);
        }
        if (service_id) {
            query += ', service_id=?';
            params.push(service_id);
        }
        if (project_status) {
            query += ', project_status=?';
            params.push(project_status);
        }
        if (start_date) {
            query += ', start_date=?';
            params.push(start_date);
        }
        if (end_date) {
            query += ', end_date=?';
            params.push(end_date);
        }

        if (files['image']) {
            query += ', image_url=?';
            params.push(files['image'][0].path);
        }

        if (files['galleryImages']) {
             const gallery_images = files['galleryImages'].map(f => f.path);
             query += ', gallery_images=?';
             params.push(JSON.stringify(gallery_images));
        }

        if (files['drawing']) {
            query += ', drawing_url=?';
            params.push(files['drawing'][0].path);
        }
        if (files['project']) {
            query += ', project_file_url=?';
            params.push(files['project'][0].path);
        }

        query += ' WHERE id=?';
        params.push(id);

        await db.query(query, params);
        res.json({ message: 'Project updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE project
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        // Optional: Delete image file if exists (not critical for this task)
        await db.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PATCH update progress
router.patch('/:id/progress', authenticateToken, async (req, res) => {
    const { progress_status } = req.body;
    try {
        await db.query('UPDATE projects SET progress_status = ? WHERE id = ?', [progress_status, req.params.id]);
        res.json({ message: 'Progress updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PATCH toggle status (active/inactive)
router.patch('/:id/toggle', authenticateToken, async (req, res) => {
    try {
        // Get current status
        const [rows] = await db.query('SELECT status FROM projects WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Project not found' });

        const newStatus = rows[0].status === 'Active' ? 'Inactive' : 'Active';
        await db.query('UPDATE projects SET status = ? WHERE id = ?', [newStatus, req.params.id]);
        res.json({ message: `Project status changed to ${newStatus}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PATCH toggle featured
router.patch('/:id/featured', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT is_featured FROM projects WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Project not found' });

        const newFeatured = !rows[0].is_featured;
        await db.query('UPDATE projects SET is_featured = ? WHERE id = ?', [newFeatured, req.params.id]);
        res.json({ message: `Project featured status changed` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
