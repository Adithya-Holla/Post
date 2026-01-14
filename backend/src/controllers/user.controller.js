/**
 * User Controller
 * Public profile endpoints
 */

import User from '../models/User.js';
import Post from '../models/Post.js';

const formatPost = (post) => ({
  id: post._id,
  content: post.content,
  author: {
    id: post.author._id,
    username: post.author.username,
    avatarUrl: post.author.avatarUrl
  },
  media: post.media?.url
    ? {
        url: post.media.url,
        mimeType: post.media.mimeType,
        originalName: post.media.originalName,
        size: post.media.size
      }
    : null,
  likesCount: post.likes.length,
  commentsCount: post.comments.length,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt
});

/**
 * Get a user's public profile by username
 * GET /api/users/:username
 */
export const getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username })
      .select('username avatarUrl bio createdAt');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};

/**
 * Get a user's posts by username
 * GET /api/users/:username/posts
 */
export const getUserPostsByUsername = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username }).select('_id');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const posts = await Post.find({ author: user._id })
      .sort({ createdAt: -1 })
      .populate('author', 'username avatarUrl');

    const formattedPosts = posts.map(formatPost);

    res.status(200).json({
      posts: formattedPosts,
      count: formattedPosts.length
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Server error while fetching posts' });
  }
};
