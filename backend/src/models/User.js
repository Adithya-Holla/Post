/**
 * User Model
 * Defines the User schema including authentication fields and profile information
 */

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username must not exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required']
  },
  avatarUrl: {
    type: String,
    default: 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff'
  },
  bio: {
    type: String,
    default: 'Welcome to my profile! 👋 Sharing thoughts and ideas.',
    maxlength: [200, 'Bio must not exceed 200 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;
