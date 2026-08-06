import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ambil profil user saat pertama kali aplikasi dimuat jika token ada
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await authService.getProfile();
          setUser(response.data);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          localStorage.removeItem('access_token');
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    // Simpan token Sanctum ke localStorage
    localStorage.setItem('access_token', response.data.token);
    setUser(response.data.user);
    return response;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem('access_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);