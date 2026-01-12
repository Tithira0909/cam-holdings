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

// GET /reviews
router.get('/reviews', async (req, res) => {
    try {
        const { approvedOnly } = req.query;
        let query = "SELECT * FROM reviews";
        const params = [];
        const conditions = [];

        if (approvedOnly === 'true') {
            conditions.push("is_approved = 1");
        }
        conditions.push("status = 'Active'");

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }
        query += " ORDER BY created_at DESC";

        const [reviews] = await db.query(query, params);
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
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
