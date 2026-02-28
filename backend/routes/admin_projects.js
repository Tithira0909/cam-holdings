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

// GET single project with documents
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const [projects] = await db.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);
        if (projects.length === 0) return res.status(404).json({ message: 'Not found' });

        const project = projects[0];

        const [docs] = await db.query('SELECT * FROM project_documents WHERE project_id = ?', [req.params.id]);
        project.documents = docs;

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST new project
router.post('/', authenticateToken, upload.fields([
    { name: 'thumbnail_image', maxCount: 1 },
    { name: 'main_image', maxCount: 1 },
    { name: 'gallery_images', maxCount: 10 },
    { name: 'drawing', maxCount: 1 },
    { name: 'project', maxCount: 1 }
]), async (req, res) => {
    const {
        title, location, budget, status, description, progress_status,
        client_id, slug, service_id, project_status, quotation_id, property_extensions,
        start_date, end_date, is_featured
    } = req.body;

    const files = req.files || {};
    const thumbnail_image = files['thumbnail_image'] ? files['thumbnail_image'][0].path : null;
    const main_image = files['main_image'] ? files['main_image'][0].path : null;
    const drawing_url = files['drawing'] ? files['drawing'][0].path : null;
    const project_file_url = files['project'] ? files['project'][0].path : null;

    let galleryImages = [];
    if (files['gallery_images']) {
        galleryImages = files['gallery_images'].map(f => f.path);
    }
    const gallery_images_json = JSON.stringify(galleryImages);

    // Use main_image as legacy image_url for fallback
    const image_url = main_image || thumbnail_image;

    try {
        const [result] = await db.query(
            `INSERT INTO projects (
                title, location, budget, status, description, description_html, progress_status, image_url,
                client_id, slug, service_id, project_status, quotation_id, property_extensions,
                start_date, end_date, is_featured, drawing_url, project_file_url,
                thumbnail_image, main_image, gallery_images
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title, location, budget, status || 'Active', description, description, progress_status || 'Not Started', image_url,
                client_id || null, slug || null, service_id || null, project_status || null, quotation_id || null, property_extensions || null,
                start_date || null, end_date || null, is_featured === 'Yes',
                drawing_url, project_file_url,
                thumbnail_image, main_image, gallery_images_json
            ]
        );
        res.status(201).json({ id: result.insertId, message: 'Project created' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT update project
router.put('/:id', authenticateToken, upload.fields([
    { name: 'thumbnail_image', maxCount: 1 },
    { name: 'main_image', maxCount: 1 },
    { name: 'gallery_images', maxCount: 10 },
    { name: 'drawing', maxCount: 1 },
    { name: 'project', maxCount: 1 }
]), async (req, res) => {
    const {
        title, location, budget, status, description, progress_status,
        client_id, slug, service_id, project_status, quotation_id, property_extensions,
        start_date, end_date, is_featured
    } = req.body;
    const id = req.params.id;

    try {
        // Fetch current to handle merges
        const [current] = await db.query('SELECT * FROM projects WHERE id=?', [id]);
        if(current.length === 0) return res.status(404).json({message:'Not found'});
        const curr = current[0];

        const files = req.files || {};

        let thumbnail_image = curr.thumbnail_image;
        if (files['thumbnail_image']) thumbnail_image = files['thumbnail_image'][0].path;

        let main_image = curr.main_image;
        if (files['main_image']) main_image = files['main_image'][0].path;

        // Also update legacy image_url if main image changes
        const image_url = main_image || thumbnail_image || curr.image_url;

        let drawing_url = curr.drawing_url;
        if (files['drawing']) drawing_url = files['drawing'][0].path;

        let project_file_url = curr.project_file_url;
        if (files['project']) project_file_url = files['project'][0].path;

        // Gallery: Append or Replace?
        // Typically append new ones to existing list?
        // But the prompt says "multiple image upload with preview grid + remove option".
        // The frontend logic usually sends the FINAL list or we handle removals separately.
        // If frontend sends FormData with 'gallery_images', it usually means NEW files.
        // Existing files are usually kept unless explicit removal.
        // However, standard HTML file input only sends new files.
        // We will APPEND new files to the list.
        // Removals should ideally be handled by a separate endpoint or by sending a list of "kept" images.
        // For simplicity: We assume frontend sends "gallery_images" only for new files.
        // To handle removals, we would need a separate field 'removed_gallery_images'.
        // Let's implement APPEND logic here. The frontend verification script assumes we can add.

        let existingGallery = [];
        try {
            existingGallery = curr.gallery_images ? (typeof curr.gallery_images === 'string' ? JSON.parse(curr.gallery_images) : curr.gallery_images) : [];
        } catch(e) { existingGallery = []; }

        let newGallery = [];
        if (files['gallery_images']) {
            newGallery = files['gallery_images'].map(f => f.path);
        }

        // We also need to handle removals. If 'removed_gallery_images' is sent in body (as JSON string or array)
        let finalGallery = [...existingGallery, ...newGallery];

        if (req.body.removed_gallery_images) {
            let removed = [];
            try {
                removed = JSON.parse(req.body.removed_gallery_images);
            } catch(e) {
                if(Array.isArray(req.body.removed_gallery_images)) removed = req.body.removed_gallery_images;
            }
            if (Array.isArray(removed)) {
                finalGallery = finalGallery.filter(img => !removed.includes(img));
            }
        }

        const gallery_images_json = JSON.stringify(finalGallery);

        await db.query(
            `UPDATE projects SET
                title=?, location=?, budget=?, status=?, description=?, progress_status=?,
                client_id=?, slug=?, service_id=?, project_status=?, quotation_id=?, property_extensions=?,
                start_date=?, end_date=?, is_featured=?, drawing_url=?, project_file_url=?,
                thumbnail_image=?, main_image=?, image_url=?, gallery_images=?
            WHERE id=?`,
            [
                title, location, budget, status, description, progress_status,
                client_id || null, slug, service_id || null, project_status, quotation_id || null, property_extensions,
                start_date || null, end_date || null, is_featured === 'Yes', drawing_url, project_file_url,
                thumbnail_image, main_image, image_url, gallery_images_json,
                id
            ]
        );
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
