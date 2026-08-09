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
  }
};