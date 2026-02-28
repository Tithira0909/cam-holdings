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
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

const cpUpload = upload.fields([
  { name: 'banner', maxCount: 1 },
  { name: 'featuredImage', maxCount: 1 },
  { name: 'galleryImages', maxCount: 10 }
]);

// GET all blogs
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { search } = req.query;
        let query = 'SELECT * FROM blogs';
        const params = [];

        if (search) {
            query += ' WHERE title LIKE ?';
            params.push(`%${search}%`);
        }

        query += ' ORDER BY created_at DESC';

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET single blog
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM blogs WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Blog not found' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST new blog
router.post('/', authenticateToken, cpUpload, async (req, res) => {
    try {
        const { type, title, content, publishedStatus, featuredBlog, approvalStatus } = req.body;

        // Handle Files
        const bannerUrl = req.files['banner'] ? req.files['banner'][0].path : null;
        const featuredImageUrl = req.files['featuredImage'] ? req.files['featuredImage'][0].path : null;

        let galleryUrls = [];
        if (req.files['galleryImages']) {
            galleryUrls = req.files['galleryImages'].map(f => f.path);
        }
        const galleryJson = JSON.stringify(galleryUrls);

        const isFeatured = featuredBlog === 'Yes' ? true : false;
        const isApproved = approvalStatus === 'Approved' ? true : false; // Handle form data

        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }

        // Generate simple slug (can be improved)
        let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        // Check uniqueness
        const [slugCheck] = await db.query('SELECT id FROM blogs WHERE slug = ?', [slug]);
        if(slugCheck.length > 0) slug += '-' + Date.now();

        const [result] = await db.query(
            'INSERT INTO blogs (type, title, banner_url, featured_image_url, gallery_json, content_html, published_status, is_featured, is_approved, slug) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                type || 'News Content',
                title,
                bannerUrl,
                featuredImageUrl,
                galleryJson,
                content,
                publishedStatus || 'Unpublished',
                isFeatured,
                isApproved,
                slug
            ]
        );

        res.status(201).json({ message: 'Blog created successfully', id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// PUT update blog
router.put('/:id', authenticateToken, cpUpload, async (req, res) => {
    try {
        const id = req.params.id;
        const { type, title, content, publishedStatus, featuredBlog, approvalStatus } = req.body;

        // Get existing to preserve images if not updated
        const [existing] = await db.query('SELECT * FROM blogs WHERE id = ?', [id]);
        if (existing.length === 0) return res.status(404).json({ message: 'Not found' });
        const curr = existing[0];

        // Handle Files
        let bannerUrl = curr.banner_url;
        if (req.files['banner']) bannerUrl = req.files['banner'][0].path;

        let featuredImageUrl = curr.featured_image_url;
        if (req.files['featuredImage']) featuredImageUrl = req.files['featuredImage'][0].path;

        let galleryJson = curr.gallery_json;
        if (req.files['galleryImages']) {
            const galleryUrls = req.files['galleryImages'].map(f => f.path);
            galleryJson = JSON.stringify(galleryUrls);
        }

        const isFeatured = (featuredBlog === 'Yes' || featuredBlog === true || featuredBlog === 'true') ? 1 : 0;
        const isApproved = (approvalStatus === 'Approved' || approvalStatus === 'true' || approvalStatus === true) ? 1 : 0;

        await db.query(
            'UPDATE blogs SET type=?, title=?, banner_url=?, featured_image_url=?, gallery_json=?, content_html=?, published_status=?, is_featured=?, is_approved=? WHERE id=?',
            [
                type,
                title,
                bannerUrl,
                featuredImageUrl,
                galleryJson,
                content,
                publishedStatus,
                isFeatured,
                isApproved,
                id
            ]
        );

        res.json({ message: 'Blog updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// DELETE blog
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await db.query('DELETE FROM blogs WHERE id = ?', [req.params.id]);
        res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PATCH Toggle Publish
router.patch('/:id/toggle-publish', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT published_status FROM blogs WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Not found' });

        const newStatus = rows[0].published_status === 'Published' ? 'Unpublished' : 'Published';
        await db.query('UPDATE blogs SET published_status = ? WHERE id = ?', [newStatus, req.params.id]);
        res.json({ message: 'Updated', status: newStatus });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PATCH Toggle Approve
router.patch('/:id/toggle-approve', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT is_approved FROM blogs WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Not found' });

        const newVal = !rows[0].is_approved;
        await db.query('UPDATE blogs SET is_approved = ? WHERE id = ?', [newVal, req.params.id]);
        res.json({ message: 'Updated', is_approved: newVal });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
