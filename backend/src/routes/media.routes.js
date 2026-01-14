/**
 * Media Routes
 */

import express from 'express';
import { streamMedia } from '../controllers/media.controller.js';

const router = express.Router();

// GET /api/media/:id
router.get('/:id', streamMedia);

export default router;
