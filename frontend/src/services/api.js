import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api` 
  : '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('quickkart_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token expiry handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If 401 unauthorized on protected routes, clear local storage
      if (window.location.pathname.startsWith('/customer') || 
          window.location.pathname.startsWith('/shop') || 
          window.location.pathname.startsWith('/admin')) {
        // localStorage.removeItem('quickkart_token');
        // localStorage.removeItem('quickkart_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
