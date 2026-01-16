const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /services
router.get('/services', async (req, res) => {
    try {
        const [services] = await db.query(
            "SELECT s.*, st.name as service_type_name FROM services s LEFT JOIN service_types st ON s.service_type_id = st.id WHERE s.status = 'published' ORDER BY s.created_at DESC"
        );
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /service-types
router.get('/service-types', async (req, res) => {
    try {
        const [types] = await db.query("SELECT * FROM service_types WHERE status = 'Active' ORDER BY created_at DESC");
        res.json(types);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /reviews (Legacy/Admin usage? Keeping for compatibility if needed, or deprecating)
router.get('/reviews', async (req, res) => {
    try {
        const { approvedOnly } = req.query;
        let query = "SELECT * FROM reviews";
        const conditions = [];

        // Support both old 'status' and new 'is_active' if columns exist/migrated
        // Since we migrated, we should prioritize new columns but fallback or check.
        // Assuming migration ran:
        // status might be gone or mapped.
        // Let's use new columns for new queries.
        // This endpoint might be used by existing frontend components.
        // I will map old params to new schema to be safe.

        if (approvedOnly === 'true') {
             conditions.push("(is_published = 1 OR is_approved = 1)");
        }
        conditions.push("(is_active = 1 OR status = 'Active')");

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }
        query += " ORDER BY created_at DESC";

        const [reviews] = await db.query(query);
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /public/reviews - Submit a new review
router.post('/public/reviews', async (req, res) => {
    try {
        const { name, email, message, rating, source } = req.body;

        if (!name || !message || !rating) {
            return res.status(400).json({ message: 'Name, Message, and Rating (1-5) are required.' });
        }

        const ratingInt = parseInt(rating);
        if (ratingInt < 1 || ratingInt > 5) {
             return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
        }

        // is_active=0, is_published=0 by default
        const [result] = await db.query(
            'INSERT INTO reviews (name, email, message, rating, source, is_active, is_published) VALUES (?, ?, ?, ?, ?, 0, 0)',
            [name, email || null, message, ratingInt, source || 'Google']
        );

        res.status(201).json({ message: 'Thanks! Your review is pending approval.', id: result.insertId });
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({ message: 'Server error submitting review.' });
    }
});

// GET /public/reviews - Fetch approved reviews
router.get('/public/reviews', async (req, res) => {
    try {
        const { published } = req.query;
        let query = "SELECT * FROM reviews WHERE is_active = 1 AND is_published = 1";

        // If published=1 is passed, we filter. If not passed? Requirement says "GET /api/public/reviews?published=1".
        // I will assume this endpoint serves public approved reviews by default or strictly checks param.
        // "return only is_active=1 AND is_published=1"

        // Add limit? "limit + order newest"
        query += " ORDER BY created_at DESC LIMIT 10";

        const [reviews] = await db.query(query);
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching public reviews:', error);
        res.status(500).json({ message: 'Server error fetching reviews.' });
    }
});

// GET /blogs
router.get('/blogs', async (req, res) => {
    try {
        const [blogs] = await db.query("SELECT * FROM blogs WHERE published_status = 'Published' ORDER BY created_at DESC");
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
