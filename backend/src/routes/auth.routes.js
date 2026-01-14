/**
 * Authentication Routes
 * Handles user registration, login, logout, and token refresh endpoints
 */

import express from 'express';
import {
	register,
	login,
	getCurrentUser,
	logout,
	uploadAvatar,
	updateBio,
	checkUsernameAvailability,
	forgotPassword,
	resetPassword
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { upload } from '../config/multer.js';
import { usernameCheckLimiter, forgotPasswordLimiter } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', register);

// GET /api/auth/check-username?username=...
router.get('/check-username', usernameCheckLimiter, checkUsernameAvailability);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', resetPassword);

// GET /api/auth/me - protected route
router.get('/me', protect, getCurrentUser);

// POST /api/auth/logout
router.post('/logout', logout);

// POST /api/auth/avatar - upload avatar (protected)
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);

// PUT /api/auth/bio - update bio (protected)
router.put('/bio', protect, updateBio);

export default router;
