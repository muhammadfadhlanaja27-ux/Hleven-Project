import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const SuperAdminProfile = () => {
  // State untuk Data Profil
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // State untuk Ubah Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // State untuk Status UI
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Ambil data user yang sedang login dari localStorage saat halaman dimuat
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setName(userData.name || '');
      setEmail(userData.email || '');
    }
  }, []);

  // Fungsi Update Profil
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.put('/user/profile', { name, email });
      setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
      
      // Update data di localStorage agar selaras
      const userData = JSON.parse(localStorage.getItem('user'));
      userData.name = name;
      userData.email = email;
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal memperbarui profil.' });
    } finally {
      setLoadingProfile(false);
    }
  };

  // Fungsi Update Password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoadingPassword(true);
    setMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Password baru dan konfirmasi tidak cocok!' });
      setLoadingPassword(false);
      return;
    }

    try {
      await api.put('/user/change-password', {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword
      });
      setMessage({ type: 'success', text: 'Password berhasil diubah!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal mengubah password.' });
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Profil</h1>
        <p className="text-gray-600">Kelola informasi data diri dan keamanan akun Super Admin Anda.</p>
      </div>

      {/* Pesan Sukses / Error Global */}
      {message.text && (
        <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Ubah Profil */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Data Diri</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loadingProfile}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
            >
              {loadingProfile ? 'Menyimpan...' : 'Simpan Profil'}
            </button>
          </form>
        </div>

        {/* Form Ubah Password */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Ubah Password</h2>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Password Saat Ini</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password Baru</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Konfirmasi Password Baru</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loadingPassword}
              className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900 transition"
            >
              {loadingPassword ? 'Memperbarui...' : 'Perbarui Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminProfile;