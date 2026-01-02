const db = require('../config/db');

exports.getAllBlogs = async (req, res) => {
  try {
    const [blogs] = await db.query('SELECT * FROM blogs');
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createBlog = async (req, res) => {
  const { title, content } = req.body;
  const image = req.file ? req.file.path : null;

  try {
    const [result] = await db.query(
      'INSERT INTO blogs (title, content, author_id, image, is_published, is_approved) VALUES (?, ?, ?, ?, FALSE, FALSE)',
      [title, content, req.user.id, image]
    );
    res.status(201).json({ id: result.insertId, title });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBlogStatus = async (req, res) => {
  const { is_published, is_approved } = req.body;
  try {
    await db.query(
      'UPDATE blogs SET is_published = ?, is_approved = ? WHERE id = ?',
      [is_published, is_approved, req.params.id]
    );
    res.json({ message: 'Blog status updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    await db.query('DELETE FROM blogs WHERE id = ?', [req.params.id]);
    res.json({ message: 'Blog deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
