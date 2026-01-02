const { query, get } = require('../db');
const bcrypt = require('bcrypt');

const listUsers = async (req, res) => {
    try {
        const users = await query("SELECT id, name, email, role, phone, company, status, created_at FROM users");
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const createUser = async (req, res) => {
    const { name, email, password, role, phone, company } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        await query("INSERT INTO users (name, email, password, role, phone, company) VALUES (?, ?, ?, ?, ?, ?)",
            [name, email, hash, role, phone, company]);
        res.status(201).json({ message: 'User created' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, company, status } = req.body;
    try {
        await query("UPDATE users SET name=?, email=?, phone=?, company=?, status=? WHERE id=?",
            [name, email, phone, company, status, id]);
        res.json({ message: 'User updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await query("DELETE FROM users WHERE id=?", [id]);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { listUsers, createUser, updateUser, deleteUser };
