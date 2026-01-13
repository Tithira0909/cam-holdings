const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getAllResources, createResource, deleteResource } = require('../controllers/resourcesController');
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

router.get('/', getAllResources);
router.post('/', requireAuth, requireRole('ADMIN'), upload.single('file'), createResource);
router.delete('/:id', requireAuth, requireRole('ADMIN'), deleteResource);

module.exports = router;
