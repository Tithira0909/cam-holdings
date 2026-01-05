const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true
}));
app.use(bodyParser.json());
app.use(cookieParser());

// Middleware
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token || (req.headers['authorization'] && req.headers['authorization'].split(' ')[1]);

  if (!token) return res.status(401).json({ message: 'Authentication required' });

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admins only' });
  }
};

// Login Endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000 // 1 hour
    });

    res.status(200).json({ message: 'Login successful', role: user.role });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

app.get('/api/check-auth', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

// PROJECTS CRUD
app.get('/api/projects', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM projects ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/projects', authenticateToken, isAdmin, async (req, res) => {
  const { title, description, image_url } = req.body;
  try {
    const [result] = await db.query('INSERT INTO projects (title, description, image_url) VALUES (?, ?, ?)', [title, description, image_url]);
    res.status(201).json({ id: result.insertId, title, description, image_url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/projects/:id', authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { title, description, image_url } = req.body;
    try {
        await db.query('UPDATE projects SET title = ?, description = ?, image_url = ? WHERE id = ?', [title, description, image_url, id]);
        res.json({ message: 'Project updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/projects/:id', authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM projects WHERE id = ?', [id]);
        res.json({ message: 'Project deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// BLOGS CRUD
app.get('/api/blogs', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM blogs ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/blogs', authenticateToken, isAdmin, async (req, res) => {
    const { title, content, author, image_url } = req.body;
    try {
        const [result] = await db.query('INSERT INTO blogs (title, content, author, image_url) VALUES (?, ?, ?, ?)', [title, content, author, image_url]);
        res.status(201).json({ id: result.insertId, title, content, author, image_url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/blogs/:id', authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { title, content, author, image_url } = req.body;
    try {
        await db.query('UPDATE blogs SET title = ?, content = ?, author = ?, image_url = ? WHERE id = ?', [title, content, author, image_url, id]);
        res.json({ message: 'Blog updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/blogs/:id', authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM blogs WHERE id = ?', [id]);
        res.json({ message: 'Blog deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// QUOTATIONS
app.get('/api/quotations', authenticateToken, isAdmin, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM quotations ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/quotations', async (req, res) => {
    const { name, email, message } = req.body;
    try {
        const [result] = await db.query('INSERT INTO quotations (name, email, message) VALUES (?, ?, ?)', [name, email, message]);
        res.status(201).json({ message: 'Quotation submitted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/quotations/:id', authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await db.query('UPDATE quotations SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: 'Quotation status updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

if (require.main === module) {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
