import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'fproject-production-c2c0.up.railway.app/api';
export const API_BASE_URL = API_URL.replace('/api', '');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getCurrentUserId = () => {
  if (typeof window === 'undefined') return undefined;
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return user?.id;
  } catch {
    return undefined;
  }
};

export const login = async (credentials) => {
  const response = await api.post('/login', credentials);
  return response.data;
};

export const getUsers = async (search = '') => {
  const url = search ? `/users?search=${encodeURIComponent(search)}` : '/users';
  const response = await api.get(url);
  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export const getRequests = async (params) => {
  const userId = getCurrentUserId();
  const response = await api.get('/requests', {
    params: { ...(params || {}), userId },
  });
  return response.data;
};

export const createRequest = async (payload) => {
  const response = await api.post('/requests', payload);
  return response.data;
};

export const submitRequestForReview = async (requestId, userId) => {
  const response = await api.post(`/requests/${requestId}/submit`, { userId });
  return response.data;
};

export const getRequestById = async (requestId) => {
  const userId = getCurrentUserId();
  const response = await api.get(`/requests/${requestId}`, {
    params: { userId },
  });
  return response.data;
};

export const updateRequestStep = async (requestId, payload) => {
  const response = await api.patch(`/requests/${requestId}/step`, payload);
  return response.data;
};

export const updateRequestStepBatch = async (payload) => {
  const response = await api.patch('/requests/batch/step', payload);
  return response.data;
};

export const uploadRequestDocument = async (requestId, file, userId, documentType) => {
  const formData = new FormData();
  formData.append('file', file);
  if (userId) formData.append('userId', userId);
  if (documentType) formData.append('documentType', documentType);

  const response = await api.post(`/requests/${requestId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getNotifications = async (userId) => {
  const response = await api.get(`/notifications/${userId}`);
  return response.data;
};

export const markNotificationAsRead = async (id) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async (userId) => {
  const response = await api.patch(`/notifications/user/${userId}/read-all`);
  return response.data;
};

export default api;
