const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getAllProjects, createProject, deleteProject } = require('../controllers/projectsController');
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

router.get('/', getAllProjects);
router.post('/', requireAuth, requireRole('ADMIN'), upload.array('images', 5), createProject);
router.delete('/:id', requireAuth, requireRole('ADMIN'), deleteProject);

module.exports = router;
