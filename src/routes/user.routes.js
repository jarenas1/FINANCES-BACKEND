const router = require('express').Router();
const { getAllUsers, toggleUserStatus, deleteUser, updateProfile, changePassword } = require('../controllers/userController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

router.get('/', protect, isAdmin, getAllUsers);
router.put('/:id/toggle-status', protect, isAdmin, toggleUserStatus);
router.delete('/:id', protect, isAdmin, deleteUser);

module.exports = router;
