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
    { name: 'drawing', maxCount: 1 },
    { name: 'project', maxCount: 1 },
    { name: 'gallery_images', maxCount: 10 }
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

    // Handle Gallery Images
    let galleryPaths = [];
    if (files['gallery_images']) {
        galleryPaths = files['gallery_images'].map(f => f.path);
    }
    const gallery_json = JSON.stringify(galleryPaths);

    try {
        const [result] = await db.query(
            `INSERT INTO projects (
                title, location, budget, status, description, description_html, progress_status, image_url, main_image,
                client_id, slug, service_id, project_status, start_date, end_date, is_featured, drawing_url, project_file_url, quotation_id, gallery_images
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title, location, budget, status || 'Active', description, description, progress_status || 'Not Started', image_url, main_image_url,
                client_id || null, slug || null, service_id || null, project_status || null,
                start_date || null, end_date || null, is_featured === 'Yes',
                drawing_url, project_file_url, quotation_id || null, gallery_json
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
    { name: 'drawing', maxCount: 1 },
    { name: 'project', maxCount: 1 },
    { name: 'gallery_images', maxCount: 10 }
]), async (req, res) => {
    const {
        title, location, budget, status, description, progress_status,
        client_id, slug, service_id, project_status, start_date, end_date, is_featured, quotation_id,
        existing_gallery_images
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

        // Handle Gallery Logic: Merge existing (kept) with new uploads
        let finalGallery = [];
        // 1. Existing
        if (existing_gallery_images) {
            try {
                // If it's a string (from FormData), parse it. If array, use it.
                const existing = Array.isArray(existing_gallery_images) ? existing_gallery_images : JSON.parse(existing_gallery_images);
                if (Array.isArray(existing)) finalGallery = finalGallery.concat(existing);
            } catch (e) {
                // If parsing fails, maybe it's a single string path?
                if (typeof existing_gallery_images === 'string') finalGallery.push(existing_gallery_images);
            }
        }
        // 2. New
        if (files['gallery_images']) {
            const newPaths = files['gallery_images'].map(f => f.path);
            finalGallery = finalGallery.concat(newPaths);
        }

        // Always update gallery_images, even if empty array (clearing them)
        // Check if we touched gallery at all?
        // If the user deleted all images, existing_gallery_images might be empty json "[]".
        // So we should update it.
        query += ', gallery_images=?';
        params.push(JSON.stringify(finalGallery));

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
