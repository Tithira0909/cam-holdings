const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, 're-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// --- PUBLIC ROUTES ---

// GET Public Properties (Active only)
router.get('/real-estate/properties', async (req, res) => {
    try {
        const { featured, limit, search } = req.query;
        let query = 'SELECT * FROM real_estate_properties WHERE status = 1';
        const params = [];

        if (featured === 'true') {
            query += ' AND featured = 1';
        }

        if (search) {
            query += ' AND (title LIKE ? OR location LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY featured DESC, created_at DESC';

        if (limit) {
            query += ' LIMIT ?';
            params.push(parseInt(limit));
        }

        const [rows] = await db.query(query, params);

        // Transform image paths to URLs
        const properties = rows.map(p => ({
            ...p,
            cover_image_url: p.cover_image ? `/uploads/${path.basename(p.cover_image)}` : null,
            gallery_images: p.gallery_images ? JSON.parse(p.gallery_images).map(img => `/uploads/${path.basename(img)}`) : []
        }));

        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET Single Property (Public)
router.get('/real-estate/properties/:id', async (req, res) => {
    try {
        // Can be ID or Slug
        const isId = /^\d+$/.test(req.params.id);
        const whereClause = isId ? 'id = ?' : 'slug = ?';

        const [rows] = await db.query(`SELECT * FROM real_estate_properties WHERE ${whereClause} AND status = 1`, [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Property not found' });
        }

        const p = rows[0];
        const property = {
            ...p,
            cover_image_url: p.cover_image ? `/uploads/${path.basename(p.cover_image)}` : null,
            gallery_images: p.gallery_images ? JSON.parse(p.gallery_images).map(img => `/uploads/${path.basename(img)}`) : []
        };

        res.json(property);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// --- ADMIN ROUTES ---

// GET All Properties (Admin)
router.get('/admin/real-estate/properties', authenticateToken, async (req, res) => {
    try {
        const { search } = req.query;
        let query = 'SELECT * FROM real_estate_properties WHERE 1=1';
        const params = [];

        if (search) {
            query += ' AND (title LIKE ? OR location LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY created_at DESC';

        const [rows] = await db.query(query, params);

        const properties = rows.map(p => ({
            ...p,
            cover_image_url: p.cover_image ? `/uploads/${path.basename(p.cover_image)}` : null
        }));

        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST Create Property
router.post('/admin/real-estate/properties', authenticateToken, upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'galleryImages', maxCount: 10 }]), async (req, res) => {
    try {
        const { title, location, priceBudget, shortDescription, description, status, featured, bedrooms, bathrooms, areaSqft, propertyType } = req.body;

        if (!title || !location || !priceBudget || !shortDescription) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const files = req.files || {};
        const coverImagePath = files['coverImage'] ? files['coverImage'][0].path : null;

        if (!coverImagePath) {
            return res.status(400).json({ message: 'Cover image is required' });
        }

        const galleryPaths = files['galleryImages'] ? files['galleryImages'].map(f => f.path) : [];

        // Generate slug
        let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        // Check uniqueness (simple append timestamp if exists - basic collision handling)
        const [existing] = await db.query('SELECT id FROM real_estate_properties WHERE slug = ?', [slug]);
        if (existing.length > 0) {
            slug = `${slug}-${Date.now()}`;
        }

        const [result] = await db.query(
            `INSERT INTO real_estate_properties
            (title, slug, location, price_budget, short_description, description, cover_image, gallery_images, status, featured, bedrooms, bathrooms, area_sqft, property_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title,
                slug,
                location,
                priceBudget,
                shortDescription,
                description,
                coverImagePath,
                JSON.stringify(galleryPaths),
                status === 'true' || status === '1' || status === 1 ? 1 : 0,
                featured === 'true' || featured === '1' || featured === 1 ? 1 : 0,
                bedrooms || null,
                bathrooms || null,
                areaSqft || null,
                propertyType || null
            ]
        );

        res.status(201).json({ id: result.insertId, message: 'Property created successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// PUT Update Property
router.put('/admin/real-estate/properties/:id', authenticateToken, upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'galleryImages', maxCount: 10 }]), async (req, res) => {
    try {
        const id = req.params.id;
        const { title, location, priceBudget, shortDescription, description, status, featured, bedrooms, bathrooms, areaSqft, propertyType } = req.body;

        // Fetch existing to handle images
        const [existing] = await db.query('SELECT * FROM real_estate_properties WHERE id = ?', [id]);
        if (existing.length === 0) return res.status(404).json({ message: 'Property not found' });

        const currentProp = existing[0];
        const files = req.files || {};

        // Update cover image if provided
        const coverImagePath = files['coverImage'] ? files['coverImage'][0].path : currentProp.cover_image;

        // Update gallery if provided (Overwrite logic for simplicity, or append? Requirement says "upload", usually implies replace or add. Let's assume replace for simplicity or keep existing if empty?)
        // Better: if new gallery images uploaded, replace/append.
        // Let's implement: if files uploaded, replace list. Else keep.
        let galleryPaths = currentProp.gallery_images ? JSON.parse(currentProp.gallery_images) : [];
        if (files['galleryImages'] && files['galleryImages'].length > 0) {
             // Append or Replace? Let's Append.
             const newPaths = files['galleryImages'].map(f => f.path);
             galleryPaths = [...galleryPaths, ...newPaths];
        }

        // Slug update? Only if title changes? Let's keep slug stable usually, or update if title changes.
        // Let's keep slug stable to avoid broken links.

        await db.query(
            `UPDATE real_estate_properties SET
            title=?, location=?, price_budget=?, short_description=?, description=?,
            cover_image=?, gallery_images=?, status=?, featured=?,
            bedrooms=?, bathrooms=?, area_sqft=?, property_type=?
            WHERE id=?`,
            [
                title, location, priceBudget, shortDescription, description,
                coverImagePath, JSON.stringify(galleryPaths),
                status === 'true' || status === '1' || status === 1 ? 1 : 0,
                featured === 'true' || featured === '1' || featured === 1 ? 1 : 0,
                bedrooms || null, bathrooms || null, areaSqft || null, propertyType || null,
                id
            ]
        );

        res.json({ message: 'Property updated successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE Property
router.delete('/admin/real-estate/properties/:id', authenticateToken, async (req, res) => {
    try {
        await db.query('DELETE FROM real_estate_properties WHERE id = ?', [req.params.id]);
        res.json({ message: 'Property deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PATCH Status
router.patch('/admin/real-estate/properties/:id/status', authenticateToken, async (req, res) => {
    try {
        const { status } = req.body; // boolean or 1/0
        const val = status === true || status === 'true' || status === 1 || status === '1' ? 1 : 0;
        await db.query('UPDATE real_estate_properties SET status = ? WHERE id = ?', [val, req.params.id]);
        res.json({ message: 'Status updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PATCH Featured
router.patch('/admin/real-estate/properties/:id/featured', authenticateToken, async (req, res) => {
    try {
        const { featured } = req.body;
        const val = featured === true || featured === 'true' || featured === 1 || featured === '1' ? 1 : 0;
        await db.query('UPDATE real_estate_properties SET featured = ? WHERE id = ?', [val, req.params.id]);
        res.json({ message: 'Featured status updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
