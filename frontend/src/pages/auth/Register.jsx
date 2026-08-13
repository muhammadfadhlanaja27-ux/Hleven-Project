import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const Register = () => {
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', password_confirmation: '' 
  });
  const [error, setError] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/register', formData);
      navigate('/login'); // Redirect ke login setelah sukses
    } catch (err) {
      if (err.response && err.response.data.errors) {
        setError(err.response.data.errors);
      } else {
        setError({ general: 'Gagal melakukan registrasi.' });
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-sm border border-[var(--border)]">
      <h2 className="text-2xl font-bold mb-6 text-center">Daftar Akun H'Leven</h2>
      {error.general && <p className="text-red-500 mb-4 text-sm text-center">{error.general}</p>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm mb-1">Nama Lengkap</label>
          <input type="text" className="w-full p-2 border rounded-lg" onChange={(e) => setFormData({...formData, name: e.target.value})} required />
        </div>
        <div className="mb-4">
          <label className="block text-sm mb-1">Email</label>
          <input type="email" className="w-full p-2 border rounded-lg" onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          {error.email && <p className="text-red-500 text-xs mt-1">{error.email[0]}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-sm mb-1">Password</label>
          <input type="password" className="w-full p-2 border rounded-lg" onChange={(e) => setFormData({...formData, password: e.target.value})} required />
        </div>
        <div className="mb-6">
          <label className="block text-sm mb-1">Konfirmasi Password</label>
          <input type="password" className="w-full p-2 border rounded-lg" onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})} required />
        </div>
        <button className="w-full bg-[var(--accent)] text-white py-2 rounded-lg font-semibold hover:opacity-90">
          Daftar
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        Sudah punya akun? <Link to="/login" className="text-[var(--accent)] font-semibold">Masuk di sini</Link>
      </p>
    </div>
  );
};

export default Register;