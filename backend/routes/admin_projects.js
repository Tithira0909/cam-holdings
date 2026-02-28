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
    { name: 'main_image', maxCount: 1 },
    { name: 'project_images', maxCount: 10 },
    { name: 'gallery_images', maxCount: 10 }, /* Keeping for legacy compatibility if needed */
    { name: 'drawing', maxCount: 1 },
    { name: 'project', maxCount: 1 }
]), async (req, res) => {
    const {
        title, location, budget, status, description, progress_status,
        client_id, slug, service_id, project_status, start_date, end_date, is_featured, quotation_id
    } = req.body;

    const files = req.files || {};
    const image_url = files['image'] ? files['image'][0].path : null;
    const main_image_url = files['main_image'] ? files['main_image'][0].path : null;
    const drawing_url = files['drawing'] ? files['drawing'][0].path : null;
    const project_file_url = files['project'] ? files['project'][0].path : null;

    // Handle Project Images (and legacy gallery_images)
    let projectImagePaths = [];
    if (files['project_images']) {
        projectImagePaths = files['project_images'].map(f => f.path);
    } else if (files['gallery_images']) {
        projectImagePaths = files['gallery_images'].map(f => f.path);
    }
    const project_images_json = JSON.stringify(projectImagePaths);

    try {
        const [result] = await db.query(
            `INSERT INTO projects (
                title, location, budget, status, description, description_html, progress_status, image_url, main_image,
                client_id, slug, service_id, project_status, start_date, end_date, is_featured, drawing_url, project_file_url, quotation_id, gallery_images, project_images
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title, location, budget, status || 'Active', description, description, progress_status || 'Not Started', image_url, main_image_url,
                client_id || null, slug || null, service_id || null, project_status || null,
                start_date || null, end_date || null, is_featured === 'Yes',
                drawing_url, project_file_url, quotation_id || null, project_images_json, project_images_json
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
    { name: 'main_image', maxCount: 1 },
    { name: 'project_images', maxCount: 10 },
    { name: 'gallery_images', maxCount: 10 },
    { name: 'drawing', maxCount: 1 },
    { name: 'project', maxCount: 1 }
]), async (req, res) => {
    const {
        title, location, budget, status, description, progress_status,
        client_id, slug, service_id, project_status, start_date, end_date, is_featured, quotation_id,
        existing_project_images, existing_gallery_images
    } = req.body;
    const id = req.params.id;
    const files = req.files || {};

    try {
        // Construct query dynamically
        let query = `UPDATE projects SET
            title=?, location=?, budget=?, status=?, description=?, description_html=?, progress_status=?,
            client_id=?, slug=?, service_id=?, project_status=?, start_date=?, end_date=?, is_featured=?, quotation_id=?`;

        let params = [
            title, location, budget, status, description, description, progress_status,
            client_id || null, slug || null, service_id || null, project_status || null,
            start_date || null, end_date || null, is_featured === 'Yes', quotation_id || null
        ];

        // Handle Files
        if (files['image']) {
            query += ', image_url=?';
            params.push(files['image'][0].path);
        }
        if (files['main_image']) {
            query += ', main_image=?';
            params.push(files['main_image'][0].path);
        }
        if (files['drawing']) {
            query += ', drawing_url=?';
            params.push(files['drawing'][0].path);
        }
        if (files['project']) {
            query += ', project_file_url=?';
            params.push(files['project'][0].path);
        }

        // Handle Project Images Logic: Merge existing (kept) with new uploads
        let finalImages = [];

        // 1. Existing (check both field names for compatibility)
        const existingRaw = existing_project_images || existing_gallery_images;
        if (existingRaw) {
            try {
                const existing = Array.isArray(existingRaw) ? existingRaw : JSON.parse(existingRaw);
                if (Array.isArray(existing)) finalImages = finalImages.concat(existing);
            } catch (e) {
                if (typeof existingRaw === 'string') finalImages.push(existingRaw);
            }
        }

        // 2. New
        if (files['project_images']) {
            const newPaths = files['project_images'].map(f => f.path);
            finalImages = finalImages.concat(newPaths);
        } else if (files['gallery_images']) {
            const newPaths = files['gallery_images'].map(f => f.path);
            finalImages = finalImages.concat(newPaths);
        }

        const finalJson = JSON.stringify(finalImages);
        query += ', project_images=?, gallery_images=?';
        params.push(finalJson, finalJson); // Update both for compatibility

        query += ' WHERE id=?';
        params.push(id);

        await db.query(query, params);
        res.json({ message: 'Project updated successfully' });
    } catch (error) {
        console.error(error);
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
