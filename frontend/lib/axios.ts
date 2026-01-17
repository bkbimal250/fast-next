/**
 * Axios instance with automatic token injection
 */

import axios from 'axios';
import { tokenManager } from './auth';

// Get API URL from environment or use default
let API_URL = process.env.NEXT_PUBLIC_API_URL;

// Ensure HTTPS is used when page is served over HTTPS (fix mixed content errors)
if (typeof window !== 'undefined' && window.location.protocol === 'https:' && API_URL) {
  // If page is HTTPS, ensure API URL is also HTTPS
  API_URL = API_URL.replace(/^http:/, 'https:');
}

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add token to all requests
apiClient.interceptors.request.use(
  (config) => {
    // Only access localStorage on client side
    if (typeof window !== 'undefined') {
      const token = tokenManager.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Network Error - Check if backend server is running at:', API_URL);
      console.error('Error details:', error.message);
    }
    
    if (error.response?.status === 401) {
      // Token expired or invalid, remove it
      if (typeof window !== 'undefined') {
        tokenManager.removeToken();
        // Redirect to login if we're in the browser
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

