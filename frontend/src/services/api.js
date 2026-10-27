import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Accept': 'application/json',
  },
  withCredentials: true, // Tambahkan baris ini
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
    if (error.response && error.response.status === 401 && !error.config?.skipAuthRedirect) {
      if (window.location.pathname.startsWith('/super-admin') && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/super-admin/login';
      } else if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else if (error.response && error.response.status === 403 && error.response.data?.blocked) {
      try {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        u.hotel_status = 'blocked';
        localStorage.setItem('user', JSON.stringify(u));
      } catch (_) {}
      if (!window.location.pathname.startsWith('/admin/suspended')) {
        window.location.href = '/admin/suspended';
      }
    }
    return Promise.reject(error);
  }
);

export default api;