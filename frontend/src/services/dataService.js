import api from './api';

// ── Dashboard ────────────────────────────────────────────────
export const getDashboard = () => api.get('/dashboard');

// ── Notes ────────────────────────────────────────────────────
export const uploadNote  = (formData) =>
  api.post('/notes/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const getNotes    = ()       => api.get('/notes');
export const getNoteById = (id)     => api.get(`/notes/${id}`);
export const deleteNote  = (id)     => api.delete(`/notes/${id}`);

// ── Quiz ─────────────────────────────────────────────────────
export const generateQuiz  = (data)   => api.post('/quiz/generate', data);
export const submitQuiz    = (data)   => api.post('/quiz/submit', data);
export const getQuizHistory= ()       => api.get('/quiz/history');
export const getQuizById   = (id)     => api.get(`/quiz/${id}`);
export const exportQuizPDF = (id)     =>
  api.get(`/quiz/export/${id}`, { responseType: 'blob' });

// ── Reports ──────────────────────────────────────────────────
export const getReports = () => api.get('/reports');
