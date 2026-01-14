/**
 * Post Controller
 * Business logic for all Post operations (CRUD, interactions)
 */

import Post from '../models/Post.js';
import { getIO } from '../config/socket.js';

/**
 * Get all posts (public feed)
 * GET /api/posts
 */
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('author', 'username avatarUrl');

    const formattedPosts = posts.map(post => ({
      id: post._id,
      content: post.content,
      author: {
        id: post.author._id,
        username: post.author.username,
        avatarUrl: post.author.avatarUrl
      },
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    }));

    res.status(200).json({
      posts: formattedPosts,
      count: formattedPosts.length
    });
  } catch (error) {
    console.error('Get all posts error:', error);
    res.status(500).json({ message: 'Server error while fetching posts' });
  }
};

/**
 * Create new post
 * POST /api/posts
 */
export const createPost = async (req, res) => {
  try {
    const { content } = req.body;

    // Validation
    if (!content || !content.trim()) {
      return res.status(400).json({ 
        message: 'Post content is required' 
      });
    }

    if (content.length > 280) {
      return res.status(400).json({ 
        message: 'Post content must not exceed 280 characters' 
      });
    }

    // Create post
    const post = await Post.create({
      author: req.user.id,
      content: content.trim()
    });

    // Populate author details
    await post.populate('author', 'username avatarUrl');

    res.status(201).json({
      message: 'Post created successfully',
      post: {
        id: post._id,
        content: post.content,
        author: {
          id: post.author._id,
          username: post.author.username,
          avatarUrl: post.author.avatarUrl
        },
        likes: post.likes,
        comments: post.comments,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error while creating post' });
  }
};

/**
 * Update post
 * PUT /api/posts/:id
 */
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    // Validation
    if (!content || !content.trim()) {
      return res.status(400).json({ 
        message: 'Post content is required' 
      });
    }

    if (content.length > 280) {
      return res.status(400).json({ 
        message: 'Post content must not exceed 280 characters' 
      });
    }

    // Find post
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ 
        message: 'Post not found' 
      });
    }

    // Check ownership
    if (post.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({ 
        message: 'You are not authorized to edit this post' 
      });
    }

    // Update post
    post.content = content.trim();
    await post.save();

    // Populate author
    await post.populate('author', 'username avatarUrl');

    res.status(200).json({
      message: 'Post updated successfully',
      post: {
        id: post._id,
        content: post.content,
        author: {
          id: post.author._id,
          username: post.author.username,
          avatarUrl: post.author.avatarUrl
        },
        likesCount: post.likes.length,
        commentsCount: post.comments.length,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      }
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error while updating post' });
  }
};

/**
 * Delete post
 * DELETE /api/posts/:id
 */
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    // Find post
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ 
        message: 'Post not found' 
      });
    }

    // Check ownership
    if (post.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({ 
        message: 'You are not authorized to delete this post' 
      });
    }

    // Delete post
    await post.deleteOne();

    res.status(200).json({ 
      message: 'Post deleted successfully' 
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error while deleting post' });
  }
};

/**
 * Toggle like on post
 * POST /api/posts/:id/like
 */
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id.toString();

    // Find post
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ 
        message: 'Post not found' 
      });
    }

    // Check if user already liked the post
    const likeIndex = post.likes.findIndex(like => like.toString() === userId);
    let liked;

    if (likeIndex > -1) {
      // User already liked, remove like (unlike)
      post.likes.splice(likeIndex, 1);
      liked = false;
    } else {
      // User hasn't liked, add like
      post.likes.push(req.user.id);
      liked = true;
    }

    // Save post
    await post.save();

    // Emit socket event for real-time update
    try {
      const io = getIO();
      io.emit('post:liked', {
        postId: id,
        likesCount: post.likes.length,
        liked
      });
    } catch (socketError) {
      console.error('Socket emit error:', socketError);
    }

    res.status(200).json({
      likesCount: post.likes.length,
      liked
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error while liking post' });
  }
};

/**
 * Add comment to post
 * POST /api/posts/:id/comments
 */
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    // Validation
    if (!text || !text.trim()) {
      return res.status(400).json({ 
        message: 'Comment text is required' 
      });
    }

    // Find post
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ 
        message: 'Post not found' 
      });
    }

    // Add comment to post
    const comment = {
      author: req.user.id,
      text: text.trim()
    };

    post.comments.push(comment);
    await post.save();

    // Get the newly added comment (last one)
    const newComment = post.comments[post.comments.length - 1];

    // Populate author details
    await post.populate('comments.author', 'username avatarUrl');

    // Get the populated comment
    const populatedComment = post.comments[post.comments.length - 1];

    // Emit socket event for real-time update
    try {
      const io = getIO();
      io.emit('post:commented', {
        postId: id,
        commentsCount: post.comments.length
      });
    } catch (socketError) {
      console.error('Socket emit error:', socketError);
    }

    res.status(201).json({
      message: 'Comment added successfully',
      comment: {
        id: populatedComment._id,
        text: populatedComment.text,
        author: {
          id: populatedComment.author._id,
          username: populatedComment.author.username,
          avatarUrl: populatedComment.author.avatarUrl
        },
        createdAt: populatedComment.createdAt
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error while adding comment' });
  }
};

/**
 * Get comments for a post
 * GET /api/posts/:id/comments
 */
export const getComments = async (req, res) => {
  try {
    const { id } = req.params;

    // Find post
    const post = await Post.findById(id).populate('comments.author', 'username avatarUrl');

    if (!post) {
      return res.status(404).json({ 
        message: 'Post not found' 
      });
    }

    // Format comments
    const formattedComments = post.comments.map(comment => ({
      id: comment._id,
      text: comment.text,
      author: {
        id: comment.author._id,
        username: comment.author.username,
        avatarUrl: comment.author.avatarUrl
      },
      createdAt: comment.createdAt
    }));

    res.status(200).json({
      comments: formattedComments,
      count: formattedComments.length
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error while fetching comments' });
  }
};
