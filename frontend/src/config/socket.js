/**
 * Socket.IO Client Configuration
 * Manages real-time connection to backend
 */
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:4000';

let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true
    });

    socket.on('connect', () => {
      // Connected to Socket.IO server
    });

    socket.on('disconnect', () => {
      // Disconnected from Socket.IO server
    });

    socket.on('connect_error', (error) => {
      // Silent error handling
    });
  }

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default { initSocket, getSocket, disconnectSocket };
