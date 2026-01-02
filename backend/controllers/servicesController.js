const db = require('../config/db');

exports.getAllServices = async (req, res) => {
  try {
    const [services] = await db.query('SELECT * FROM services');
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createService = async (req, res) => {
  const { title, description, icon } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO services (title, description, icon) VALUES (?, ?, ?)',
      [title, description, icon]
    );
    res.status(201).json({ id: result.insertId, title, description, icon });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateService = async (req, res) => {
  const { title, description, icon } = req.body;
  try {
    await db.query(
      'UPDATE services SET title = ?, description = ?, icon = ? WHERE id = ?',
      [title, description, icon, req.params.id]
    );
    res.json({ message: 'Service updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    await db.query('DELETE FROM services WHERE id = ?', [req.params.id]);
    res.json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
