/**
 * Database Configuration
 * Handles MongoDB connection setup and connection lifecycle management
 */

import mongoose from 'mongoose';
import { config } from './env.js';

/**
 * Connect to MongoDB database
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodbUri);
    
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;
