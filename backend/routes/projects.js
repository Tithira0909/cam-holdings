const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all projects (Public)
router.get('/', async (req, res) => {
  const { active, category, q, sort } = req.query;

  try {
    let query = 'SELECT * FROM projects';
    let params = [];
    let conditions = [];

    // Filter by Active status
    if (active === 'true') {
      conditions.push("status = 'Active'");
    }

    // Filter by Category
    if (category && category !== 'all' && category !== '') {
      conditions.push("category = ?");
      params.push(category);
    }

    // Search
    if (q) {
      conditions.push("(title LIKE ? OR description LIKE ? OR location LIKE ?)");
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Sorting
    if (sort === 'newest') {
      query += ' ORDER BY created_at DESC';
    } else if (sort === 'oldest') {
      query += ' ORDER BY created_at ASC';
    } else if (sort === 'az') {
      query += ' ORDER BY title ASC';
    } else if (sort === 'featured') {
      // Prioritize featured, then newest
      query += ' ORDER BY is_featured DESC, created_at DESC';
    } else {
      // Default sort
      query += ' ORDER BY is_featured DESC, created_at DESC';
    }

    const [projects] = await db.query(query, params);

    // Parse gallery_images from JSON string to array if needed (though backend usually sends JSON string as is if column is text, let's parse it for frontend convenience)
    const formattedProjects = projects.map(p => {
        try {
            if (p.gallery_images && typeof p.gallery_images === 'string') {
                p.gallery_images = JSON.parse(p.gallery_images);
            }
        } catch (e) {}
        return p;
    });

    res.json({ items: formattedProjects });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single project by slug or ID
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    // Try by slug first, then ID if it looks like an ID (though slug can be anything, usually unique)
    // We'll search by slug OR id to be safe, but prioritize slug logic if needed.
    // However, clean way is:

    let query = `
      SELECT p.*, s.name as service_name, st.name as category_name, (c.first_name || ' ' || c.last_name) as client_name
      FROM projects p
      LEFT JOIN services s ON p.service_id = s.id
      LEFT JOIN service_types st ON s.service_type_id = st.id
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE p.slug = ? OR p.id = ?
    `;

    const [projects] = await db.query(query, [slug, slug]);

    if (projects.length === 0) {
        return res.status(404).json({ message: 'Project not found' });
    }

    const project = projects[0];
    try {
        if (project.gallery_images && typeof project.gallery_images === 'string') {
            project.gallery_images = JSON.parse(project.gallery_images);
        }
    } catch (e) {}

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
