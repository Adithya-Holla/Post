/**
 * Axios Instance Configuration
 * Configured for API requests with credentials
 */
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:4000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default axiosInstance;
