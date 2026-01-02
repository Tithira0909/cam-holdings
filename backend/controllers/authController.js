const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { get, query } = require('../db');

const login = async (req, res) => {
    const { email, password, type } = req.body; // type: 'admin' or 'client'

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
    }

    try {
        const user = await get("SELECT * FROM users WHERE email = ?", [email]);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Role check
        if (type && user.role !== type && user.role !== 'admin') {
            // Admin can login as client? Maybe not. Strict check:
            if (user.role !== type) {
                 return res.status(403).json({ message: `Not authorized as ${type}` });
            }
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '8h' }
        );

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const registerClient = async (req, res) => {
    // Only admins can create clients usually, or public signup?
    // Prompt says "CRUD clients" is Admin function.
    // But public "Get a Quote" might create a user?
    // For now, let's assume Admin creates clients or public signup.
    // We'll stick to Admin-created for this controller function.
    const { name, email, password, phone, company } = req.body;

    try {
        const existing = await get("SELECT id FROM users WHERE email = ?", [email]);
        if (existing) return res.status(400).json({ message: 'Email exists' });

        const hash = await bcrypt.hash(password, 10);
        await query(
            "INSERT INTO users (name, email, password, role, phone, company) VALUES (?, ?, ?, ?, ?, ?)",
            [name, email, hash, 'client', phone, company]
        );
        res.status(201).json({ message: 'Client created' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { login, registerClient };
