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
        // For simplicity, we use 'uploads/' and frontend helper will resolve it
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, 're-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const TABLE_NAME = 'interiors_properties';

// --- ADMIN API ---

// GET All
router.get('/admin/interiors-properties', authenticateToken, async (req, res) => {
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
router.post('/admin/interiors-properties', authenticateToken, upload.fields([
    { name: 'main_image', maxCount: 1 },
    { name: 'sub_images', maxCount: 3 }
]), async (req, res) => {
    try {
        const { name, estimated_cost, description, is_active } = req.body;
        const files = req.files || {};

        const main_image = files['main_image'] ? files['main_image'][0].path : null;
        if(!main_image) return res.status(400).json({message: 'Main image required'});

        const subImages = files['sub_images'] || [];
        const sub1 = subImages[0] ? subImages[0].path : null;
        const sub2 = subImages[1] ? subImages[1].path : null;
        const sub3 = subImages[2] ? subImages[2].path : null;

        const activeVal = is_active === 'true' || is_active === '1' || is_active === 1 ? 1 : 0;

        const [result] = await db.query(
            `INSERT INTO ${TABLE_NAME} (name, estimated_cost, description, main_image, sub_image_1, sub_image_2, sub_image_3, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, estimated_cost, description, main_image, sub1, sub2, sub3, activeVal]
        );
        res.status(201).json({ id: result.insertId, message: 'Created successfully' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT Update
router.put('/admin/interiors-properties/:id', authenticateToken, upload.fields([
    { name: 'main_image', maxCount: 1 },
    { name: 'sub_images', maxCount: 3 }
]), async (req, res) => {
    try {
        const { name, estimated_cost, description, is_active } = req.body;
        const id = req.params.id;
        const files = req.files || {};

        // Fetch current to keep existing images if not replaced
        const [current] = await db.query(`SELECT * FROM ${TABLE_NAME} WHERE id=?`, [id]);
        if(current.length === 0) return res.status(404).json({message: 'Not found'});
        const curr = current[0];

        let main_image = curr.main_image;
        if(files['main_image']) main_image = files['main_image'][0].path;

        let sub1 = curr.sub_image_1;
        let sub2 = curr.sub_image_2;
        let sub3 = curr.sub_image_3;

        if(files['sub_images']) {
            // Replace logic: If new subs uploaded, overwrite from 1 to 3
            // Assuming simplified logic: new upload replaces all subs or just fills?
            // User requirement: "Handle 'replace image' on edit".
            // For simplicity in MVP: If new sub_images uploaded, they shift into slots.
            const newSubs = files['sub_images'];
            if(newSubs.length > 0) sub1 = newSubs[0].path;
            if(newSubs.length > 1) sub2 = newSubs[1].path;
            if(newSubs.length > 2) sub3 = newSubs[2].path;
        }

        const activeVal = is_active === undefined ? curr.is_active : (is_active === 'true' || is_active === '1' || is_active === 1 ? 1 : 0);

        await db.query(
            `UPDATE ${TABLE_NAME} SET name=?, estimated_cost=?, description=?, main_image=?, sub_image_1=?, sub_image_2=?, sub_image_3=?, is_active=? WHERE id=?`,
            [name, estimated_cost, description, main_image, sub1, sub2, sub3, activeVal, id]
        );
        res.json({ message: 'Updated successfully' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE
router.delete('/admin/interiors-properties/:id', authenticateToken, async (req, res) => {
    try {
        await db.query(`DELETE FROM ${TABLE_NAME} WHERE id=?`, [req.params.id]);
        res.json({ message: 'Deleted' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// PATCH Toggle
router.patch('/admin/interiors-properties/:id/toggle', authenticateToken, async (req, res) => {
    try {
        const [current] = await db.query(`SELECT is_active FROM ${TABLE_NAME} WHERE id=?`, [req.params.id]);
        if(current.length === 0) return res.status(404).json({message:'Not found'});

        const newVal = current[0].is_active ? 0 : 1;
        await db.query(`UPDATE ${TABLE_NAME} SET is_active=? WHERE id=?`, [newVal, req.params.id]);
        res.json({ message: 'Toggled', is_active: newVal });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- PUBLIC API ---

router.get('/public/interiors-properties', async (req, res) => {
    try {
        const [rows] = await db.query(`SELECT * FROM ${TABLE_NAME} WHERE is_active=1 ORDER BY created_at DESC`);
        res.json(rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/public/interiors-properties/:id', async (req, res) => {
    try {
        const [rows] = await db.query(`SELECT * FROM ${TABLE_NAME} WHERE id=? AND is_active=1`, [req.params.id]);
        if(rows.length===0) return res.status(404).json({message: 'Not found'});
        res.json(rows[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
