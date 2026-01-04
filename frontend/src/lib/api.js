import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cam_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access (e.g., clear token)
      localStorage.removeItem('cam_admin_token');
      // Optional: Redirect to login or let the app handle it
    }
    return Promise.reject(error);
  }
);

export const apiLogin = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

export const apiMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Generic CRUD helpers
export const get = async (url, params) => {
  const response = await api.get(url, { params });
  return response.data;
};

export const post = async (url, data) => {
  const response = await api.post(url, data);
  return response.data;
};

export const put = async (url, data) => {
  const response = await api.put(url, data);
  return response.data;
};

export const del = async (url) => {
  const response = await api.delete(url);
  return response.data;
};

export default api;
