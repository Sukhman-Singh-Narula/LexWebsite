// src/services/api.ts with enhanced error handling
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
      // Clone the data for manipulation if needed
      let requestData = config.data;

      // If it's a JSON string, parse it for better viewing
      if (typeof requestData === 'string' && requestData.startsWith('{')) {
        try {
          requestData = JSON.parse(requestData);
        } catch (e) {
          // Not JSON, leave as is
        }
      }

      // Special handling for case creation/updates to normalize status field
      if (
        (config.url?.includes('/cases') && config.method === 'post') ||
        (config.url?.includes('/cases/') && config.method === 'put')
      ) {
        if (typeof requestData === 'object' && requestData !== null) {
          // Ensure status is lowercase
          if (requestData.status) {
            requestData.status = requestData.status.toLowerCase();

            // Update the config.data with the normalized data
            if (typeof config.data === 'string') {
              config.data = JSON.stringify(requestData);
            } else {
              config.data = requestData;
            }
          }
        }
      }

      console.log('Request payload:', typeof requestData === 'object' ?
        JSON.stringify(requestData, null, 2) :
        String(requestData));
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
      const responsePreview = typeof response.data === 'object' ?
        JSON.stringify(response.data, null, 2).substring(0, 200) + '...' :
        String(response.data).substring(0, 200) + '...';
      console.log('Response data:', responsePreview);
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
    console.error('Request data:', typeof error.config.data === 'string' ?
      error.config.data :
      JSON.stringify(error.config.data || {}, null, 2));
    console.error('Response headers:', JSON.stringify(error.response.headers, null, 2));
    console.error('Response data:', typeof error.response.data === 'object' ?
      JSON.stringify(error.response.data, null, 2) :
      error.response.data);

    // Handle unauthorized errors (token expired, etc.)
    if (error.response.status === 401) {
      console.error('Unauthorized access - redirecting to login');
      // Clear token and redirect to login
      localStorage.removeItem('token');
      setAuthHeader(null);
      window.location.href = '/login';
    }

    // Format validation errors for display
    if (error.response.status === 422 || error.response.status === 400) {
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