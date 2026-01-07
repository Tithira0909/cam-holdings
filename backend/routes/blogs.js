const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/auth');
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
        const { type, title, content, publishedStatus, featuredBlog } = req.body;

        // Handle Files
        const bannerUrl = req.files['banner'] ? req.files['banner'][0].path : null;
        const featuredImageUrl = req.files['featuredImage'] ? req.files['featuredImage'][0].path : null;

        let galleryUrls = [];
        if (req.files['galleryImages']) {
            galleryUrls = req.files['galleryImages'].map(f => f.path);
        }
        const galleryJson = JSON.stringify(galleryUrls);

        const isFeatured = featuredBlog === 'Yes' ? true : false;

        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }

        const [result] = await db.query(
            'INSERT INTO blogs (type, title, banner_url, featured_image_url, gallery_json, content_html, published_status, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
                type || 'News Content',
                title,
                bannerUrl,
                featuredImageUrl,
                galleryJson,
                content,
                publishedStatus || 'Unpublished',
                isFeatured
            ]
        );

        res.status(201).json({ message: 'Blog created successfully', id: result.insertId });
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

module.exports = router;
