import axios, { AxiosInstance, AxiosResponse } from 'axios';

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
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
});

export const apiLogin = async (username: string, password: string): Promise<AxiosResponse> => {
  return api.post('/api/auth/login', { username, password });
};

export const apiMe = async (): Promise<AxiosResponse> => {
  return api.get('/api/auth/me');
};

export const apiGet = async (url: string): Promise<AxiosResponse> => api.get(url);
export const apiPost = async (url: string, data: any): Promise<AxiosResponse> => api.post(url, data);
export const apiPut = async (url: string, data: any): Promise<AxiosResponse> => api.put(url, data);
export const apiDelete = async (url: string): Promise<AxiosResponse> => api.delete(url);

export default api;
