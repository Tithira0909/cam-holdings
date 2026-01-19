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

// --- PUBLIC ROUTES ---

// GET Active Real Estate Properties
router.get('/real-estate', async (req, res) => {
    try {
        const query = "SELECT * FROM real_estate_properties WHERE status = 'Active' ORDER BY created_at DESC";
        const [properties] = await db.query(query);
        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET Single Real Estate Property
router.get('/real-estate/:id', async (req, res) => {
    try {
        const query = "SELECT * FROM real_estate_properties WHERE id = ? AND status = 'Active'";
        const [properties] = await db.query(query, [req.params.id]);
        if (properties.length === 0) return res.status(404).json({ message: 'Property not found' });
        res.json(properties[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- ADMIN ROUTES ---

// GET All Properties (Admin)
router.get('/admin/real-estate', authenticateToken, async (req, res) => {
    try {
        const { search } = req.query;
        let query = "SELECT * FROM real_estate_properties";
        const params = [];

        if (search) {
            query += " WHERE title LIKE ? OR location LIKE ?";
            params.push(`%${search}%`, `%${search}%`);
        }

        query += " ORDER BY created_at DESC";
        const [properties] = await db.query(query, params);
        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST Create Property
router.post('/admin/real-estate', authenticateToken, upload.fields([{ name: 'cover_image', maxCount: 1 }, { name: 'gallery_images', maxCount: 10 }]), async (req, res) => {
    const { title, location, price, description, status, category, tags } = req.body;
    const files = req.files || {};

    const cover_image = files['cover_image'] ? files['cover_image'][0].path : null;
    const gallery_files = files['gallery_images'] ? files['gallery_images'].map(f => f.path) : [];
    const gallery_images = JSON.stringify(gallery_files);

    try {
        const [result] = await db.query(
            `INSERT INTO real_estate_properties (
                title, location, price, description, cover_image, gallery_images, status, category, tags
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, location, price, description, cover_image, gallery_images, status || 'Active', category, tags]
        );
        res.status(201).json({ id: result.insertId, message: 'Property created successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT Update Property
router.put('/admin/real-estate/:id', authenticateToken, upload.fields([{ name: 'cover_image', maxCount: 1 }, { name: 'gallery_images', maxCount: 10 }]), async (req, res) => {
    const { title, location, price, description, status, category, tags } = req.body;
    const id = req.params.id;
    const files = req.files || {};

    try {
        // Build update query dynamically
        let query = "UPDATE real_estate_properties SET title=?, location=?, price=?, description=?, status=?, category=?, tags=?";
        let params = [title, location, price, description, status, category, tags];

        if (files['cover_image']) {
            query += ", cover_image=?";
            params.push(files['cover_image'][0].path);
        }

        if (files['gallery_images']) {
            const gallery_files = files['gallery_images'].map(f => f.path);
            query += ", gallery_images=?";
            params.push(JSON.stringify(gallery_files));
            // Note: This replaces existing gallery. For append logic, we'd need to fetch first.
            // Assuming replacement for simplicity as per common admin dashboard patterns.
        }

        query += " WHERE id=?";
        params.push(id);

        await db.query(query, params);
        res.json({ message: 'Property updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE Property
router.delete('/admin/real-estate/:id', authenticateToken, async (req, res) => {
    try {
        await db.query('DELETE FROM real_estate_properties WHERE id = ?', [req.params.id]);
        res.json({ message: 'Property deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PATCH Toggle Status
router.patch('/admin/real-estate/:id/status', authenticateToken, async (req, res) => {
    const { status } = req.body;
    try {
        await db.query('UPDATE real_estate_properties SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Status updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
