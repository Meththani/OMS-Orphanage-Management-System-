const express = require('express');
const { login, register, updateCredentials } = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);

// Account creation is admin-only
router.post('/register', protect, restrictTo('admin'), register);

// User profile settings — any logged-in user can change their own username/password
router.patch('/update-credentials', protect, updateCredentials);

module.exports = router;
