import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (token) {
      token = token.replace(/^"|"$/g, '');
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || 'Terjadi kesalahan sistem.';

      if (status === 401 && !error.config?.skipAuthRedirect) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = window.location.pathname.startsWith('/super-admin') ? '/super-admin/login' : '/login';
      } else if (status === 403 && error.response.data?.blocked) {
        window.location.href = '/admin/suspended';
      } else if (status >= 500) {
        toast.error('Terjadi kesalahan pada server. Silakan coba lagi nanti.');
      } else if (status !== 422 && status !== 401 && status !== 403) {
        toast.error(message);
      }
    } else {
      toast.error('Gagal terhubung ke server.');
    }
    return Promise.reject(error);
  }
);

export default api;