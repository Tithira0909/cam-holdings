const db = require('../config/db');

exports.getAllProjects = async (req, res) => {
  try {
    const [projects] = await db.query('SELECT * FROM projects');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createProject = async (req, res) => {
  const { title, description, category } = req.body;
  const images = req.files ? req.files.map(file => file.path) : [];

  try {
    const [result] = await db.query(
      'INSERT INTO projects (title, description, category, images) VALUES (?, ?, ?, ?)',
      [title, description, category, JSON.stringify(images)]
    );
    res.status(201).json({ id: result.insertId, title, images });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    await db.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
