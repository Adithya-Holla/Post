/**
 * Authentication Routes
 * Handles user registration, login, logout, and token refresh endpoints
 */

import express from 'express';
import { register, login, getCurrentUser, logout, uploadAvatar } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { upload } from '../config/multer.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me - protected route
router.get('/me', protect, getCurrentUser);

// POST /api/auth/logout
router.post('/logout', logout);

// POST /api/auth/avatar - upload avatar (protected)
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);

export default router;
