const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validator');

// POST /api/auth/register - Register new user
router.post('/register', validate('register'), authController.register);

// POST /api/auth/login - Login user
router.post('/login', validate('login'), authController.login);

// GET /api/auth/me - Get current user profile
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
