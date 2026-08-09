import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1', // Sesuaikan dengan port Laravel-mu
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Menyisipkan token otomatis jika user sudah login
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;