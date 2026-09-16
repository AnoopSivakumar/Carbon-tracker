const express = require('express');
const { addUser, searchUsers, getUser, updateUser, deleteUser } = require('../controllers/userController');
const { authenticate, requireRole } = require('../middleware/auth');
const router = express.Router();

router.use(authenticate);

router.get('/', requireRole('admin'), searchUsers);          // Search User
router.post('/', requireRole('admin'), addUser);              // Add User
router.get('/:id', getUser);
router.put('/:id', updateUser);                               // Update Profile (self or admin)
router.delete('/:id', requireRole('admin'), deleteUser);      // Delete User

module.exports = router;
