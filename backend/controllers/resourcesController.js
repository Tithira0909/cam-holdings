const db = require('../config/db');

exports.getAllResources = async (req, res) => {
  try {
    const [resources] = await db.query('SELECT * FROM resources');
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createResource = async (req, res) => {
  const { title, type } = req.body;
  const file_url = req.file ? req.file.path : null;

  try {
    const [result] = await db.query(
      'INSERT INTO resources (title, file_url, type) VALUES (?, ?, ?)',
      [title, file_url, type]
    );
    res.status(201).json({ id: result.insertId, title });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteResource = async (req, res) => {
  try {
    await db.query('DELETE FROM resources WHERE id = ?', [req.params.id]);
    res.json({ message: 'Resource deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
