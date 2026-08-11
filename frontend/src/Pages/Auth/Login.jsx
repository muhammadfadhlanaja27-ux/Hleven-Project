import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/login', formData);
      // Simpan token ke localStorage
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', response.data.data.user);
      
      
      // Redirect ke Landing Page
      navigate('/');
    } catch (err) {
      setError('Email atau password salah.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-sm border border-[var(--border)]">
      <h2 className="text-2xl font-bold mb-6 text-center">Masuk ke H'Leven</h2>
      {error && <p className="text-red-500 mb-4 text-sm text-center">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm mb-1">Email</label>
          <input 
            type="email" 
            className="w-full p-2 border border-[var(--border)] rounded-lg"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm mb-1">Password</label>
          <input 
            type="password" 
            className="w-full p-2 border border-[var(--border)] rounded-lg"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
        </div>
        <button className="w-full bg-[var(--accent)] text-white py-2 rounded-lg font-semibold hover:opacity-90">
          Masuk
        </button>
      </form>
    </div>
  );
};

export default Login;