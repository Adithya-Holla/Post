/**
 * Token Utilities
 * JWT generation, verification, and cookie configuration helpers
 */

import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

/**
 * Generate JWT token
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpire
  });
};

/**
 * Verify JWT token
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    return null;
  }
};

/**
 * Cookie options for JWT
 */
export const cookieOptions = {
  httpOnly: true,
  secure: config.cookieSecure,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};
