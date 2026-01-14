/**
 * Server Entry Point
 * Starts the HTTP server and initializes database connection
 */

import app from './app.js';
import { config } from './config/env.js';
import connectDB from './config/db.js';
import { initSocket } from './config/socket.js';

const PORT = config.port;

// Connect to database
await connectDB();

// Start HTTP server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${config.nodeEnv} mode on port ${PORT}`);
  console.log(`✅ Health check: https://post-backend-jk26.onrender.com/health`);
});

// Initialize Socket.IO
initSocket(server);
console.log('🔌 Socket.IO initialized');

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});
