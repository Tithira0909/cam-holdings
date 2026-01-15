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
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// GET all projects (Searchable)
router.get('/', authenticateToken, async (req, res) => {
    const { search } = req.query;
    try {
        let query = `
            SELECT p.*, s.name as service_name
            FROM projects p
            LEFT JOIN services s ON p.service_id = s.id
        `;
        const params = [];

        if (search) {
            query += ' WHERE p.title LIKE ? OR p.location LIKE ?';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY p.created_at DESC';

        const [projects] = await db.query(query, params);
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST new project
router.post('/', authenticateToken, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'drawing', maxCount: 1 }, { name: 'project', maxCount: 1 }]), async (req, res) => {
    const {
        title, location, budget, status, description, progress_status,
        client_id, slug, service_id, project_status, start_date, end_date, is_featured
    } = req.body;

    const files = req.files || {};
    const image_url = files['image'] ? files['image'][0].path : null;
    const drawing_url = files['drawing'] ? files['drawing'][0].path : null;
    const project_file_url = files['project'] ? files['project'][0].path : null;

    try {
        const [result] = await db.query(
            `INSERT INTO projects (
                title, location, budget, status, description, description_html, progress_status, image_url,
                client_id, slug, service_id, project_status, start_date, end_date, is_featured, drawing_url, project_file_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title, location, budget, status || 'Active', description, description, progress_status || 'Not Started', image_url,
                client_id || null, slug || null, service_id || null, project_status || null,
                start_date || null, end_date || null, is_featured === 'Yes',
                drawing_url, project_file_url
            ]
        );
        res.status(201).json({ id: result.insertId, message: 'Project created' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT update project
router.put('/:id', authenticateToken, upload.single('image'), async (req, res) => {
    const { title, location, budget, status, description, progress_status } = req.body;
    const id = req.params.id;

    try {
        let query = 'UPDATE projects SET title=?, location=?, budget=?, status=?, description=?, progress_status=?';
        let params = [title, location, budget, status, description, progress_status];

        if (req.file) {
            query += ', image_url=?';
            params.push(req.file.path);
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

module.exports = router;
