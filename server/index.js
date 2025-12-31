const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mock Admin Credentials (in real app, use DB)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD_PLAIN = process.env.ADMIN_PASSWORD;

// Generate Hash for verification (Usually stored in DB)
// For this simple example, we compare with plain text or we can hash it on startup.
// Let's assume we store the hash.
let ADMIN_PASSWORD_HASH;

(async () => {
    ADMIN_PASSWORD_HASH = await bcrypt.hash(ADMIN_PASSWORD_PLAIN, 10);
})();

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
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    if (username === ADMIN_USERNAME) {
        const match = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
        if (match) {
            const accessToken = jwt.sign({ username: username, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.json({ accessToken });
        }
    }

    res.status(401).json({ message: 'Invalid credentials' });
});

// Admin Protected Route
app.get('/api/admin', authenticateToken, (req, res) => {
    res.json({ message: 'Welcome Admin', user: req.user });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
