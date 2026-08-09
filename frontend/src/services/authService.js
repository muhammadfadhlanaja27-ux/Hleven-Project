import api from './api';

export const authService = {
  login: async (email, password) => {
    return await api.post('/login', { email, password });
  },

  register: async (userData) => {
    return await api.post('/register', userData);
  },
  
  logout: async () => {
    return await api.post('/logout');
  },

  // Mengambil data user yang sedang login (dibutuhkan oleh AuthContext)
  getProfile: async () => {
    // Rute default Laravel Sanctum biasanya '/user', sesuaikan jika berbeda
    return await api.get('/user'); 
  },

  // Menyimpan perubahan nama, email, dan nomor telepon
  updateProfile: async (data) => {
    // Header Authorization sudah otomatis ditambahkan oleh api.js
    return await api.put('/user/profile', data);
  },

  // Menyimpan perubahan kata sandi
  changePassword: async (data) => {
    return await api.put('/user/change-password', data);
  }
};