const express = require('express');
const router = express.Router();
const { getAllUsers, createUser, deleteUser } = require('../controllers/usersController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.get('/', requireAuth, requireRole('ADMIN'), getAllUsers);
router.post('/', requireAuth, requireRole('ADMIN'), createUser);
router.delete('/:id', requireAuth, requireRole('ADMIN'), deleteUser);

module.exports = router;
