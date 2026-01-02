const express = require('express');
const router = express.Router();
const { getAllServices, createService, updateService, deleteService } = require('../controllers/servicesController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.get('/', getAllServices);
router.post('/', requireAuth, requireRole('ADMIN'), createService);
router.put('/:id', requireAuth, requireRole('ADMIN'), updateService);
router.delete('/:id', requireAuth, requireRole('ADMIN'), deleteService);

module.exports = router;
