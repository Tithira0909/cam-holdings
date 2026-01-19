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

// GET Active Service Listings
router.get('/listings', async (req, res) => {
    try {
        const { category } = req.query;
        let query = "SELECT * FROM service_listings WHERE status = 'Active'";
        const params = [];

        if (category) {
            query += " AND service_category = ?";
            params.push(category);
        }

        query += " ORDER BY created_at DESC";
        const [listings] = await db.query(query, params);
        res.json(listings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET Single Listing
router.get('/listings/:id', async (req, res) => {
    try {
        const query = "SELECT * FROM service_listings WHERE id = ? AND status = 'Active'";
        const [listings] = await db.query(query, [req.params.id]);
        if (listings.length === 0) return res.status(404).json({ message: 'Listing not found' });
        res.json(listings[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- ADMIN ROUTES ---

// GET All Listings (Admin)
router.get('/admin/listings', authenticateToken, async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = "SELECT * FROM service_listings";
        const params = [];
        const conditions = [];

        if (search) {
            conditions.push("(title LIKE ? OR location LIKE ?)");
            params.push(`%${search}%`, `%${search}%`);
        }

        if (category) {
            conditions.push("service_category = ?");
            params.push(category);
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        query += " ORDER BY created_at DESC";
        const [listings] = await db.query(query, params);
        res.json(listings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST Create Listing
router.post('/admin/listings', authenticateToken, upload.fields([{ name: 'cover_image', maxCount: 1 }, { name: 'gallery_images', maxCount: 10 }]), async (req, res) => {
    const { title, location, price, description, status, category, tags, service_category } = req.body;
    const files = req.files || {};

    const cover_image = files['cover_image'] ? files['cover_image'][0].path : null;
    const gallery_files = files['gallery_images'] ? files['gallery_images'].map(f => f.path) : [];
    const gallery_images = JSON.stringify(gallery_files);

    try {
        const [result] = await db.query(
            `INSERT INTO service_listings (
                title, location, price, description, cover_image, gallery_images, status, category, tags, service_category
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, location, price, description, cover_image, gallery_images, status || 'Active', category, tags, service_category]
        );
        res.status(201).json({ id: result.insertId, message: 'Listing created successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT Update Listing
router.put('/admin/listings/:id', authenticateToken, upload.fields([{ name: 'cover_image', maxCount: 1 }, { name: 'gallery_images', maxCount: 10 }]), async (req, res) => {
    const { title, location, price, description, status, category, tags, service_category } = req.body;
    const id = req.params.id;
    const files = req.files || {};

    try {
        // Build update query dynamically
        let query = "UPDATE service_listings SET title=?, location=?, price=?, description=?, status=?, category=?, tags=?, service_category=?";
        let params = [title, location, price, description, status, category, tags, service_category];

        if (files['cover_image']) {
            query += ", cover_image=?";
            params.push(files['cover_image'][0].path);
        }

        if (files['gallery_images']) {
            const gallery_files = files['gallery_images'].map(f => f.path);
            query += ", gallery_images=?";
            params.push(JSON.stringify(gallery_files));
        }

        query += " WHERE id=?";
        params.push(id);

        await db.query(query, params);
        res.json({ message: 'Listing updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE Listing
router.delete('/admin/listings/:id', authenticateToken, async (req, res) => {
    try {
        await db.query('DELETE FROM service_listings WHERE id = ?', [req.params.id]);
        res.json({ message: 'Listing deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PATCH Toggle Status
router.patch('/admin/listings/:id/status', authenticateToken, async (req, res) => {
    const { status } = req.body;
    try {
        await db.query('UPDATE service_listings SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Status updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
