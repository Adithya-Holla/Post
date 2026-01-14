/**
 * Environment Configuration
 * Centralizes all environment variables and validates required configs
 */

import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Export configuration object with defaults
export const config = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/post-app',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
};

export default config;
