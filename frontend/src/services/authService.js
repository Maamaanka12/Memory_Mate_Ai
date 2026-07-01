import api from './api';

export const register = (data) => api.post('/auth/register', data);
export const login    = (data) => api.post('/auth/login', data);

export const saveSession = (token, user) => {
  localStorage.setItem('mm_token', token);
  localStorage.setItem('mm_user', JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem('mm_token');
  localStorage.removeItem('mm_user');
};

export const getStoredUser = () => {
  try { return JSON.parse(localStorage.getItem('mm_user')); }
  catch { return null; }
};

export const getToken = () => localStorage.getItem('mm_token');
