/**
 * Socket.IO Configuration
 * Handles real-time events for posts
 */
import { Server } from 'socket.io';
import { config } from '../config/env.js';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: config.clientUrl,
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export default { initSocket, getIO };
