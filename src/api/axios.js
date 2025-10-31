// src/api/axios.js
import axios from 'axios';

// ✅ Deployed backend
const API_BASE_URL = 'https://dating-appbckend.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // optional: timeout in ms
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network errors (CORS, server down, etc.)
    if (!error.response) {
      console.error('Network or CORS error:', error);
      alert('Network error: Could not reach server. Check CORS or backend status.');
      return Promise.reject(error);
    }

    if (error.response.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
