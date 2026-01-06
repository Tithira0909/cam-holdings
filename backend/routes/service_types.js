const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure Multer for file uploads
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

// GET all service types
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM service_types ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET one service type
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM service_types WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Service Type not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST new service type (Protected)
router.post('/', authenticateToken, upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), async (req, res) => {
  try {
    const { name, slug, description, status } = req.body;
    const thumbnail = req.files['thumbnail'] ? req.files['thumbnail'][0].path : null;
    const banner = req.files['banner'] ? req.files['banner'][0].path : null;

    if (!name || !slug || !description) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const [result] = await db.query(
      'INSERT INTO service_types (name, slug, description, thumbnail, banner, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, slug, description, thumbnail, banner, status || 'Active']
    );

    res.status(201).json({ id: result.insertId, message: 'Service type created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update service type (Protected)
router.put('/:id', authenticateToken, upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), async (req, res) => {
  try {
    const { name, slug, description, status } = req.body;
    // Note: If new files are uploaded, use them. Otherwise, keep existing.
    // However, handling "keep existing" is tricky if the frontend sends nothing.
    // Usually, we'd fetch the existing record first if files are null.
    // For simplicity here, we assume if file is not sent, we don't update that column (need to build query dynamically).

    // First, fetch existing
    const [existing] = await db.query('SELECT * FROM service_types WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Service type not found' });

    const thumbnail = req.files && req.files['thumbnail'] ? req.files['thumbnail'][0].path : existing[0].thumbnail;
    const banner = req.files && req.files['banner'] ? req.files['banner'][0].path : existing[0].banner;

    await db.query(
      'UPDATE service_types SET name = ?, slug = ?, description = ?, thumbnail = ?, banner = ?, status = ? WHERE id = ?',
      [name, slug, description, thumbnail, banner, status, req.params.id]
    );

    res.json({ message: 'Service type updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE service type (Protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await db.query('DELETE FROM service_types WHERE id = ?', [req.params.id]);
    res.json({ message: 'Service type deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
