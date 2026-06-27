import axios from 'axios';

const API_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authAPI = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (name, email, password, companyName, role = 'CLIENT') => {
    const res = await api.post('/auth/register', { name, email, password, companyName, role });
    return res.data;
  },
};

export const categoriesAPI = {
  list: async () => {
    const res = await api.get('/categories');
    return res.data;
  },
  create: async (name, description) => {
    const res = await api.post('/categories', { name, description });
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/categories/${id}`);
    return res.data;
  },
  listQuestions: async (catId) => {
    const res = await api.get(`/categories/${catId}/questions`);
    return res.data;
  },
  createQuestion: async (catId, text, type, options) => {
    const res = await api.post(`/categories/${catId}/questions`, { text, type, options });
    return res.data;
  },
  deleteQuestion: async (id) => {
    const res = await api.delete(`/questions/${id}`);
    return res.data;
  },
  bulkImportQuestions: async (catId, questions) => {
    const res = await api.post(`/categories/${catId}/questions/bulk`, { questions });
    return res.data;
  },
};

export const recordingsAPI = {
  list: async () => {
    const res = await api.get('/recordings');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/recordings/${id}`);
    return res.data;
  },
  upload: async (file, categoryId, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('categoryId', categoryId);
    const res = await api.post('/recordings/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
    return res.data;
  },
  uploadBulk: async (files, categoryId) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('categoryId', categoryId);
    const res = await api.post('/recordings/upload-bulk', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  overrideReview: async (reviewId, answers, overrideStatus) => {
    const res = await api.post(`/reviews/${reviewId}/override`, { answers, overrideStatus });
    return res.data;
  },
  listNotifications: async () => {
    const res = await api.get('/notifications');
    return res.data;
  },
  markNotificationsRead: async () => {
    const res = await api.post('/notifications/read');
    return res.data;
  },
};

export const analyticsAPI = {
  getDashboard: async () => {
    const res = await api.get('/analytics/dashboard');
    return res.data;
  },
  getEarnings: async () => {
    const res = await api.get('/analytics/earnings');
    return res.data;
  },
  getAdminClients: async () => {
    const res = await api.get('/admin/clients');
    return res.data;
  },
};

export default api;
