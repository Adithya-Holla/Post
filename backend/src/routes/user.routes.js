/**
 * User Routes
 * Public profile and user post endpoints
 */

import express from 'express';
import { getPublicProfile, getUserPostsByUsername } from '../controllers/user.controller.js';

const router = express.Router();

// GET /api/users/:username - public profile
router.get('/:username', getPublicProfile);

// GET /api/users/:username/posts - public posts by user
router.get('/:username/posts', getUserPostsByUsername);

export default router;
