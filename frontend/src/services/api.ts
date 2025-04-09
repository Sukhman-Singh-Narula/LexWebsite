// src/services/api.ts with enhanced error logging
import axios from 'axios';
import { setAuthHeader } from '../features/auth/authSlice';

// Set default base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

console.log('API Base URL:', API_BASE_URL); // Log for debugging

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout
  timeout: 10000,
});

// Request interceptor for adding authentication token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request details
    console.log(`${config.method?.toUpperCase()} ${config.url}`);
    if (config.data) {
      console.log('Request payload:', JSON.stringify(config.data, null, 2));
    }

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log(`Response from ${response.config.url}: ${response.status}`);
    if (response.data) {
      console.log('Response data:', JSON.stringify(response.data, null, 2).substring(0, 200) + '...');
    }
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network error or server not responding');
      return Promise.reject(new Error('Network error - server may be unavailable'));
    }

    // Log detailed error information
    console.error(`API Error (${error.response.status}) from ${error.config.url}:`);
    console.error('Request data:', JSON.stringify(error.config.data || {}, null, 2));
    console.error('Response headers:', JSON.stringify(error.response.headers, null, 2));
    console.error('Response data:', JSON.stringify(error.response.data, null, 2));

    // Handle unauthorized errors (token expired, etc.)
    if (error.response.status === 401) {
      console.error('Unauthorized access - redirecting to login');
      // Clear token and redirect to login
      localStorage.removeItem('token');
      setAuthHeader(null);
      window.location.href = '/login';
    }

    // Format validation errors for display
    if (error.response.status === 422) {
      const validationError = error.response.data;
      // Format validation errors into a more usable structure
      let formattedError = { message: 'Validation error' };

      if (validationError.detail) {
        if (Array.isArray(validationError.detail)) {
          formattedError.message = validationError.detail.map(err =>
            `${err.loc.join('.')}: ${err.msg}`
          ).join('; ');
        } else {
          formattedError.message = String(validationError.detail);
        }
      }

      console.error('Formatted validation error:', formattedError);
      return Promise.reject(formattedError);
    }

    return Promise.reject(error.response.data || error);
  }
);

export default api;