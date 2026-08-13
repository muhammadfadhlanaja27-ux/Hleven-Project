import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const Register = () => {
  const [formData, setFormData] = useState({ 
    firstName: '',
    lastName: '',
    email: '', 
    phone: '', 
    password: '', 
    password_confirmation: '' 
  });
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setLoading(true);

    // Gabungkan first_name dan last_name untuk field 'name'
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();

    const payload = {
      name: fullName,
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      password_confirmation: formData.password_confirmation
    };

    try {
      const response = await api.post('/register', payload);
      
      // Ambil access_token dari response jika backend mengembalikan token
      const token = 
        response.data?.data?.access_token || 
        response.data?.access_token ||
        response.data?.data?.token || 
        response.data?.token;

      const user = response.data?.data?.user || response.data?.user;

      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        window.dispatchEvent(new Event("storage"));
        navigate('/');
      } else {
        alert('Registrasi berhasil! Silakan masuk ke akun Anda.');
        navigate('/login');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        setError(err.response.data.errors);
      } else if (err.response && err.response.data && err.response.data.message) {
        setError({ general: err.response.data.message });
      } else {
        setError({ general: 'Gagal melakukan registrasi. Periksa koneksi Anda.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-xl shadow-sm border border-[var(--border)] text-left">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Daftar Akun H'Leven</h2>
      
      {error.general && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center border border-red-200">
          {error.general}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Grid Nama Depan & Nama Belakang */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Nama Depan</label>
            <input 
              type="text" 
              className="w-full p-2.5 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-sm"
              placeholder="John"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
              required 
            />
            {error.first_name && <p className="text-red-500 text-xs mt-1">{error.first_name[0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Nama Belakang</label>
            <input 
              type="text" 
              className="w-full p-2.5 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-sm"
              placeholder="Doe"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
            />
            {error.last_name && <p className="text-red-500 text-xs mt-1">{error.last_name[0]}</p>}
          </div>
        </div>

        {/* Email */}
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
          {error.email && <p className="text-red-500 text-xs mt-1">{error.email[0]}</p>}
        </div>

        {/* Nomor Telepon / WhatsApp */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Nomor Telepon / WhatsApp</label>
          <input 
            type="tel" 
            className="w-full p-2.5 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-sm"
            placeholder="081234567890"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})} 
            required 
          />
          {error.phone && <p className="text-red-500 text-xs mt-1">{error.phone[0]}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
          <input 
            type="password" 
            className="w-full p-2.5 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-sm"
            placeholder="Minimal 8 karakter"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
            required 
          />
          {error.password && <p className="text-red-500 text-xs mt-1">{error.password[0]}</p>}
        </div>

        {/* Konfirmasi Password */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Konfirmasi Password</label>
          <input 
            type="password" 
            className="w-full p-2.5 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-sm"
            placeholder="Ketik ulang password"
            value={formData.password_confirmation}
            onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})} 
            required 
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--accent)] text-white py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 mt-2 cursor-pointer"
        >
          {loading ? 'Memproses...' : 'Daftar Sekarang'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-600">
        Sudah punya akun?{' '}
        <Link to="/login" className="text-[var(--accent)] font-semibold hover:underline">
          Masuk di sini
        </Link>
      </p>
    </div>
  );
};

export default Register;