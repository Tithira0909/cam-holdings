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

// POST new blog
router.post('/', authenticateToken, cpUpload, async (req, res) => {
    try {
        const { type, title, content, publishedStatus, featuredBlog, isApproved } = req.body;

        // Handle Files
        const bannerUrl = req.files['banner'] ? req.files['banner'][0].path : null;
        const featuredImageUrl = req.files['featuredImage'] ? req.files['featuredImage'][0].path : null;

        let galleryUrls = [];
        if (req.files['galleryImages']) {
            galleryUrls = req.files['galleryImages'].map(f => f.path);
        }
        const galleryJson = JSON.stringify(galleryUrls);

        const isFeatured = featuredBlog === 'Yes' ? true : false;
        // Default approved to false if not provided, or handle admin logic
        const approvedVal = isApproved === 'true' || isApproved === true ? 1 : 0;

        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }

        // Generate slug from title
        let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        // Ensure uniqueness (simple append)
        const [existing] = await db.query("SELECT id FROM blogs WHERE slug = ?", [slug]);
        if (existing.length > 0) {
            slug = `${slug}-${Date.now()}`;
        }

        const [result] = await db.query(
            'INSERT INTO blogs (type, title, slug, banner_url, featured_image_url, gallery_json, content_html, published_status, is_featured, is_approved) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                type || 'News Content',
                title,
                slug,
                bannerUrl,
                featuredImageUrl,
                galleryJson,
                content,
                publishedStatus || 'Unpublished',
                isFeatured,
                approvedVal
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
        const { type, title, content, publishedStatus, featuredBlog, isApproved } = req.body;
        const id = req.params.id;

        // Fetch current blog to keep existing images if not replaced
        const [rows] = await db.query('SELECT * FROM blogs WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Blog not found' });
        const current = rows[0];

        let bannerUrl = current.banner_url;
        if (req.files['banner']) bannerUrl = req.files['banner'][0].path;

        let featuredImageUrl = current.featured_image_url;
        if (req.files['featuredImage']) featuredImageUrl = req.files['featuredImage'][0].path;

        let galleryJson = current.gallery_json;
        if (req.files['galleryImages']) {
            const galleryUrls = req.files['galleryImages'].map(f => f.path);
            galleryJson = JSON.stringify(galleryUrls);
        }

        const isFeatured = featuredBlog === 'Yes' ? 1 : 0;
        const approvedVal = isApproved !== undefined ? (isApproved === 'true' || isApproved === true ? 1 : 0) : current.is_approved;

        await db.query(
            'UPDATE blogs SET type=?, title=?, banner_url=?, featured_image_url=?, gallery_json=?, content_html=?, published_status=?, is_featured=?, is_approved=? WHERE id=?',
            [
                type || current.type,
                title || current.title,
                bannerUrl,
                featuredImageUrl,
                galleryJson,
                content || current.content_html,
                publishedStatus || current.published_status,
                isFeatured,
                approvedVal,
                id
            ]
        );

        res.json({ message: 'Blog updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// PATCH Toggle Published
router.patch('/:id/toggle-publish', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT published_status FROM blogs WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Blog not found' });

        const newStatus = rows[0].published_status === 'Published' ? 'Unpublished' : 'Published';
        await db.query('UPDATE blogs SET published_status = ? WHERE id = ?', [newStatus, req.params.id]);
        res.json({ message: 'Status updated', status: newStatus });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PATCH Toggle Approval
router.patch('/:id/toggle-approve', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT is_approved FROM blogs WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Blog not found' });

        const newVal = rows[0].is_approved ? 0 : 1;
        await db.query('UPDATE blogs SET is_approved = ? WHERE id = ?', [newVal, req.params.id]);
        res.json({ message: 'Approval updated', is_approved: newVal });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET Single Blog (Admin)
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM blogs WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Blog not found' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
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

module.exports = router;
