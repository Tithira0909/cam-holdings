const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/projects
// Filter by active=true, category=...
router.get('/', async (req, res) => {
    try {
        const { active, category } = req.query;
        let query = 'SELECT * FROM projects';
        const params = [];
        const conditions = [];

        if (active === 'true') {
            conditions.push("status = 'Active'");
        }

        if (category) {
            conditions.push("category = ?");
            params.push(category);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY created_at DESC';

        const [projects] = await db.query(query, params);
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/projects/:slugOrId
router.get('/:slugOrId', async (req, res) => {
    try {
        const param = req.params.slugOrId;
        // Check if numeric ID or Slug
        let query = 'SELECT * FROM projects WHERE ';
        let params = [];

        if (/^\d+$/.test(param)) {
            query += 'id = ?';
            params.push(param);
        } else {
            query += 'slug = ?';
            params.push(param);
        }

        const [projects] = await db.query(query, params);
        if (projects.length === 0) return res.status(404).json({ message: 'Project not found' });
        res.json(projects[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
