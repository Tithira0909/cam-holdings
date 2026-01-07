const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/auth');

// GET all project tasks (Searchable)
router.get('/', authenticateToken, async (req, res) => {
    const { search } = req.query;
    try {
        let query = 'SELECT * FROM project_tasks';
        const params = [];

        if (search) {
            query += ' WHERE task_name LIKE ?';
            params.push(`%${search}%`);
        }

        query += ' ORDER BY created_at DESC';

        const [tasks] = await db.query(query, params);
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST new project task
router.post('/', authenticateToken, async (req, res) => {
    const { task_name, status } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO project_tasks (task_name, status) VALUES (?, ?)',
            [task_name, status || 'Active']
        );
        res.status(201).json({ id: result.insertId, message: 'Project Task created' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT update project task
router.put('/:id', authenticateToken, async (req, res) => {
    const { task_name, status } = req.body;
    const id = req.params.id;

    try {
        await db.query(
            'UPDATE project_tasks SET task_name = ?, status = ? WHERE id = ?',
            [task_name, status, id]
        );
        res.json({ message: 'Project Task updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE project task
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await db.query('DELETE FROM project_tasks WHERE id = ?', [req.params.id]);
        res.json({ message: 'Project Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
