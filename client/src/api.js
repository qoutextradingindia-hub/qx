import axios from 'axios';

// Get base URL - Always use VPS URL for production
const getBaseURL = () => {
  // For production deployment, use live backend URL
  return 'https://qx-yb3z.onrender.com/api';
  
  // For local development, use this instead:
  // return 'http://localhost:5000/api';
};

// Centralized API instance for all backend calls
const API = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor for adding auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
