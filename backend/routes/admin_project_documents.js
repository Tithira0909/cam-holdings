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
        cb(null, Date.now() + '-' + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// POST /api/admin/project-documents
router.post('/', authenticateToken, upload.single('file'), async (req, res) => {
    const { project_id, name, category, is_locked } = req.body;
    const file = req.file;

    if (!file || !project_id || !name) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO project_documents (project_id, name, file_path, category, is_locked) VALUES (?, ?, ?, ?, ?)`,
            [project_id, name, file.path, category || 'Project', is_locked === 'true']
        );
        res.status(201).json({ id: result.insertId, message: 'Document added', file_path: file.path });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /api/admin/project-documents/:id
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await db.query('DELETE FROM project_documents WHERE id = ?', [req.params.id]);
        res.json({ message: 'Document deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PATCH /api/admin/project-documents/:id/lock
router.patch('/:id/lock', authenticateToken, async (req, res) => {
    const { is_locked } = req.body;
    try {
        await db.query('UPDATE project_documents SET is_locked = ? WHERE id = ?', [is_locked, req.params.id]);
        res.json({ message: 'Lock status updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
