const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Middleware to verify Token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Login Route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body; // Expecting 'username' to be email for DB login, or generic username

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        // Try DB Login (assuming username is email)
        const [rows] = await db.query('SELECT * FROM admins WHERE email = ?', [username]);

        if (rows.length > 0) {
            const admin = rows[0];
            const match = await bcrypt.compare(password, admin.password_hash);
            if (match) {
                const accessToken = jwt.sign(
                    { id: admin.id, username: admin.email, role: admin.role },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );
                return res.json({ accessToken });
            }
        }

        // If DB query returns no rows, check env fallback
        if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
             const accessToken = jwt.sign(
                { username: username, role: 'SuperAdmin' },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
            return res.json({ accessToken });
        }

        res.status(401).json({ message: 'Invalid credentials' });
    } catch (err) {
        // Fallback if DB fails (e.g. connection refused)
        console.error('Database error during login, attempting fallback:', err.message);
        if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
             const accessToken = jwt.sign(
                { username: username, role: 'SuperAdmin' },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
            return res.json({ accessToken });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Admin Registration Route
app.post('/api/register-admin', authenticateToken, async (req, res) => {
    const { firstName, lastName, email, phone, password, role } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const passwordHash = await bcrypt.hash(password, 10);
        const userRole = role || 'Admin';

        const [result] = await db.query(
            'INSERT INTO admins (first_name, last_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)',
            [firstName, lastName, email, phone, passwordHash, userRole]
        );

        res.status(201).json({ message: 'Admin registered successfully', adminId: result.insertId });
    } catch (err) {
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Email already exists' });
        }
        res.status(500).json({ message: 'Database error' });
    }
});

// Admin Protected Route
app.get('/api/admin', authenticateToken, (req, res) => {
    res.json({ message: 'Welcome Admin', user: req.user });
});

// Get Users Route
app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, first_name AS firstName, last_name AS lastName, email, phone, status, role FROM admins');
        res.json(rows);
    } catch (err) {
        console.error(err);
        // Return mock data if DB fails or empty (for demonstration/fallback)
        const mockUsers = [
            { id: 1, firstName: 'CAM', lastName: 'Admin', email: 'admin@camholdings.com', phone: '0112000000', status: 'Active', role: 'SuperAdmin' },
            { id: 2, firstName: 'Staff', lastName: 'Member', email: 'staff@camholdings.com', phone: '0112000001', status: 'Active', role: 'Admin' }
        ];
        res.json(mockUsers);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
