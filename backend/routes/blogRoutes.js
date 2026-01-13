const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getAllBlogs, createBlog, updateBlogStatus, deleteBlog } = require('../controllers/blogsController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.get('/', getAllBlogs);
router.post('/', requireAuth, upload.single('image'), createBlog);
router.patch('/:id/status', requireAuth, requireRole('ADMIN'), updateBlogStatus);
router.delete('/:id', requireAuth, requireRole('ADMIN'), deleteBlog);

module.exports = router;
