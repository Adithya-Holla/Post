/**
 * Authentication Middleware
 * Verifies JWT tokens from cookies and attaches user to request
 */

import { verifyToken } from '../utils/token.js';
import User from '../models/User.js';

/**
 * Protect middleware - requires authentication
 */
export const protect = async (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ 
        message: 'Authentication required. Please log in.' 
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ 
        message: 'Invalid or expired token. Please log in again.' 
      });
    }

    // Get user from database
    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (!user) {
      return res.status(401).json({ 
        message: 'User not found. Please log in again.' 
      });
    }

    // Attach user to request
    req.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      createdAt: user.createdAt
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ 
      message: 'Authentication failed' 
    });
  }
};

export default protect;
