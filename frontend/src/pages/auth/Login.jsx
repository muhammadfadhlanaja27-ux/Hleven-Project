import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/login', formData);
      
      // Ambil access_token dari response AuthController
      const token = 
        response.data?.data?.access_token || 
        response.data?.access_token ||
        response.data?.data?.token || 
        response.data?.token;

      const user = 
        response.data?.data?.user || 
        response.data?.user;

      if (!token) {
        throw new Error("Token autentikasi tidak ditemukan dari server.");
      }

      // Simpan ke LocalStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Trigger pembaruan UI Navbar
      window.dispatchEvent(new Event("storage"));
      
      navigate('/');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || 'Email atau password salah.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-xl shadow-sm border border-[var(--border)] text-left">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Masuk ke H'Leven</h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
          <input 
            type="email" 
            className="w-full p-2.5 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-sm"
            placeholder="nama@email.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
          <input 
            type="password" 
            className="w-full p-2.5 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-sm"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--accent)] text-white py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 mt-2 cursor-pointer"
        >
          {loading ? 'Memproses...' : 'Masuk'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-600">
        Belum punya akun?{' '}
        <Link to="/register" className="text-[var(--accent)] font-semibold hover:underline">
          Daftar di sini
        </Link>
      </p>
    </div>
  );
};

export default Login;