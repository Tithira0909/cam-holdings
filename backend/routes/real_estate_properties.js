const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Ensure folder exists or let the app crash if not (user responsibility to create dirs or add mkdir logic)
        cb(null, 'uploads/properties/');
    },
    filename: function (req, file, cb) {
        cb(null, 're-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const TABLE_NAME = 'real_estate_properties';

// --- ADMIN API ---

// GET All
router.get('/admin/real-estate-properties', authenticateToken, async (req, res) => {
    try {
        const { search } = req.query;
        let query = `SELECT * FROM ${TABLE_NAME}`;
        const params = [];
        if (search) {
            query += ' WHERE name LIKE ?';
            params.push(`%${search}%`);
        }
        query += ' ORDER BY created_at DESC';
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST Create
router.post('/admin/real-estate-properties', authenticateToken, upload.fields([
    { name: 'main_image', maxCount: 1 },
    { name: 'sub_images', maxCount: 3 }
]), async (req, res) => {
    try {
        const { name, estimated_cost, description, status } = req.body;
        const files = req.files || {};

        const main_image = files['main_image'] ? files['main_image'][0].path : null;
        if(!main_image) return res.status(400).json({message: 'Main image required'});

        const subImages = files['sub_images'] ? files['sub_images'].map(f => f.path) : [];
        const subImagesJson = JSON.stringify(subImages);

        const statusVal = status || 'Draft';

        const [result] = await db.query(
            `INSERT INTO ${TABLE_NAME} (name, estimated_cost, description, main_image, sub_images, status) VALUES (?, ?, ?, ?, ?, ?)`,
            [name, estimated_cost, description, main_image, subImagesJson, statusVal]
        );
        res.status(201).json({ id: result.insertId, message: 'Created successfully' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT Update
router.put('/admin/real-estate-properties/:id', authenticateToken, upload.fields([
    { name: 'main_image', maxCount: 1 },
    { name: 'sub_images', maxCount: 3 }
]), async (req, res) => {
    try {
        const { name, estimated_cost, description, status } = req.body;
        const id = req.params.id;
        const files = req.files || {};

        // Fetch current
        const [current] = await db.query(`SELECT * FROM ${TABLE_NAME} WHERE id=?`, [id]);
        if(current.length === 0) return res.status(404).json({message: 'Not found'});
        const curr = current[0];

        let main_image = curr.main_image;
        if(files['main_image']) main_image = files['main_image'][0].path;

        let subImagesJson = curr.sub_images;
        if(files['sub_images'] && files['sub_images'].length > 0) {
            const newSubs = files['sub_images'].map(f => f.path);
            subImagesJson = JSON.stringify(newSubs);
        }

        const statusVal = status || curr.status;

        await db.query(
            `UPDATE ${TABLE_NAME} SET name=?, estimated_cost=?, description=?, main_image=?, sub_images=?, status=? WHERE id=?`,
            [name, estimated_cost, description, main_image, subImagesJson, statusVal, id]
        );
        res.json({ message: 'Updated successfully' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE
router.delete('/admin/real-estate-properties/:id', authenticateToken, async (req, res) => {
    try {
        await db.query(`DELETE FROM ${TABLE_NAME} WHERE id=?`, [req.params.id]);
        res.json({ message: 'Deleted' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// PATCH Toggle
router.patch('/admin/real-estate-properties/:id/toggle', authenticateToken, async (req, res) => {
    try {
        const [current] = await db.query(`SELECT status FROM ${TABLE_NAME} WHERE id=?`, [req.params.id]);
        if(current.length === 0) return res.status(404).json({message:'Not found'});

        const newVal = current[0].status === 'Active' ? 'Inactive' : 'Active';
        await db.query(`UPDATE ${TABLE_NAME} SET status=? WHERE id=?`, [newVal, req.params.id]);
        res.json({ message: 'Toggled', status: newVal });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- PUBLIC API ---

router.get('/public/real-estate-properties', async (req, res) => {
    try {
        const { search, sort } = req.query;
        let query = `SELECT * FROM ${TABLE_NAME} WHERE (status='Active' OR status='Published')`;
        const params = [];

        if (search) {
            query += ` AND (name LIKE ? OR description LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        if (sort === 'oldest') {
            query += ' ORDER BY created_at ASC';
        } else if (sort === 'price_asc') {
            // Try to cast to number, fallback to string if fails (simple approach)
            query += ' ORDER BY CAST(estimated_cost AS UNSIGNED) ASC';
        } else if (sort === 'price_desc') {
            query += ' ORDER BY CAST(estimated_cost AS UNSIGNED) DESC';
        } else {
            query += ' ORDER BY created_at DESC';
        }

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/public/real-estate-properties/:id', async (req, res) => {
    try {
        const [rows] = await db.query(`SELECT * FROM ${TABLE_NAME} WHERE id=? AND (status='Active' OR status='Published')`, [req.params.id]);
        if(rows.length===0) return res.status(404).json({message: 'Not found'});
        res.json(rows[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
