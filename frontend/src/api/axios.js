/**
 * Axios Instance Configuration
 * Configured for API requests with credentials
 */
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://post-backend-jk26.onrender.com/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default axiosInstance;
