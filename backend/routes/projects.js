const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/projects
// Filter by active=true, category=...
router.get('/', async (req, res) => {
    try {
        const { active, category } = req.query;
        let query = `
            SELECT
                id, title, slug, location, budget as estimatedCost,
                description, description_html,
                image_url as coverImage,
                gallery_images as galleryImages,
                category, status, created_at
            FROM projects`;

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

        // Parse galleryImages if it's a string
        const formattedProjects = projects.map(p => ({
            ...p,
            galleryImages: typeof p.galleryImages === 'string' ? JSON.parse(p.galleryImages) : p.galleryImages,
            isActive: p.status === 'Active'
        }));

        res.json(formattedProjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/projects/:slugOrId
router.get('/:slugOrId', async (req, res) => {
    try {
        const param = req.params.slugOrId;
        let query = `
            SELECT
                id, title, slug, location, budget as estimatedCost,
                description, description_html,
                image_url as coverImage,
                gallery_images as galleryImages,
                category, status, created_at,
                client_id, service_id, start_date, end_date, drawing_url, project_file_url
            FROM projects WHERE `;
        let params = [];

        if (/^\d+$/.test(param)) {
            query += 'id = ?';
            params.push(param);
        } else {
            query += 'slug = ?';
            params.push(param);
        }

        const [rows] = await db.query(query, params);
        if (rows.length === 0) return res.status(404).json({ message: 'Project not found' });

        const project = rows[0];
        project.galleryImages = typeof project.galleryImages === 'string' ? JSON.parse(project.galleryImages) : project.galleryImages;
        project.isActive = project.status === 'Active';

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
