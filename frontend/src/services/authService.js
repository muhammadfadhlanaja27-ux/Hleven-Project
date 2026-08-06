import apiClient from './api';

export const authService = {
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/login', { email, password });
      return response.data; // Mengembalikan standar response JSON (success, message, data)
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  logout: async () => {
    try {
      const response = await apiClient.post('/logout');
      localStorage.removeItem('access_token');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getProfile: async () => {
    try {
      const response = await apiClient.get('/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};