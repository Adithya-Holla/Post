/**
 * Post Routes
 * Handles all Post-related endpoints (CRUD, like, comment)
 */

import express from 'express';
import { getAllPosts, createPost, updatePost, deletePost, likePost, addComment, getComments } from '../controllers/post.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// GET /api/posts - get all posts (public)
router.get('/', getAllPosts);

// POST /api/posts - create post (protected)
router.post('/', protect, createPost);

// PUT /api/posts/:id - update post (protected)
router.put('/:id', protect, updatePost);

// DELETE /api/posts/:id - delete post (protected)
router.delete('/:id', protect, deletePost);

// POST /api/posts/:id/like - like/unlike post (protected)
router.post('/:id/like', protect, likePost);

// GET /api/posts/:id/comments - get comments (public)
router.get('/:id/comments', getComments);

// POST /api/posts/:id/comments - add comment (protected)
router.post('/:id/comments', protect, addComment);

export default router;
