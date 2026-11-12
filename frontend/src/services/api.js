// Provides the Axios HTTP client used for all backend requests.
import axios from 'axios';

// Configures the backend base URL and JSON request headers.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

// Adds the saved JWT to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirects expired sessions to login and preserves other errors for callers.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config.url.includes('/auth/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// Extracts the backend's friendly message from an Axios error.
export const getError = (err) =>
  err?.response?.data?.message || err?.message || 'Something went wrong';