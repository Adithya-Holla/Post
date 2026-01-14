/**
 * Multer Configuration for File Uploads
 * Handles profile picture uploads with validation
 */
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ensureDirSync = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Store uploads in memory so avatars can be persisted in MongoDB.
const avatarStorage = multer.memoryStorage();

// File filter
const avatarFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Supported: JPG, PNG, WEBP, HEIC, HEIF.'), false);
  }
};

// Configure multer for avatars
export const upload = multer({
  storage: avatarStorage,
  fileFilter: avatarFileFilter,
  limits: {
    fileSize: config.maxFileSize
  }
});

// Disk storage for post media (images/videos)
const postMediaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsRoot = path.resolve(__dirname, '..', '..', config.uploadDir);
    const postsDir = path.join(uploadsRoot, 'posts');
    ensureDirSync(postsDir);
    cb(null, postsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').slice(0, 10);
    const safeExt = ext && ext.length <= 10 ? ext : '';
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
    cb(null, unique);
  }
});

const postMediaFileFilter = (req, file, cb) => {
  const ok = file.mimetype?.startsWith('image/') || file.mimetype?.startsWith('video/');
  if (ok) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Supported: images and videos.'), false);
  }
};

export const uploadPostMedia = multer({
  storage: postMediaStorage,
  fileFilter: postMediaFileFilter,
  limits: {
    fileSize: config.maxFileSize
  }
});

export default upload;
