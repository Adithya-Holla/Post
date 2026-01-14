/**
 * Express Application Setup
 * Configures Express app with middleware, routes, and error handlers
 */

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import { config } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import postRoutes from './routes/post.routes.js';
import userRoutes from './routes/user.routes.js';
import mediaRoutes from './routes/media.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Behind a reverse proxy (e.g., Render) so req.protocol is correct
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files (post media)
app.use('/uploads', express.static(path.join(__dirname, '..', config.uploadDir)));

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Post API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      posts: '/api/posts'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/media', mediaRoutes);

// Error handling middleware for multer errors
app.use((err, req, res, next) => {
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      const maxMb = Math.round((config.maxFileSize || 5 * 1024 * 1024) / (1024 * 1024));
      return res.status(400).json({ message: `File size too large. Maximum size is ${maxMb}MB.` });
    }
    return res.status(400).json({ message: err.message });
  }
  
  if (err.message) {
    return res.status(400).json({ message: err.message });
  }
  
  next(err);
});

export default app;
