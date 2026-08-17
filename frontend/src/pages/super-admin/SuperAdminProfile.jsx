import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

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

  // Ambil data user yang sedang login dari localStorage saat halaman dimuat
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData) {
        setName(userData.name || '');
        setEmail(userData.email || '');
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Fungsi Update Profil
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);

    const updatePromise = api.put('/user/profile', { name, email });

    toast.promise(updatePromise, {
      loading: 'Menyimpan profil...',
      success: () => {
        try {
          const userData = JSON.parse(localStorage.getItem('user')) || {};
          userData.name = name;
          userData.email = email;
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (err) {
          console.error(err);
        }
        return 'Profil berhasil diperbarui!';
      },
      error: (err) => err.response?.data?.message || 'Gagal memperbarui profil.'
    });

    try {
      await updatePromise;
    } catch (error) {
      // Error handled by toast
    } finally {
      setLoadingProfile(false);
    }
  };

  // Fungsi Update Password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Password baru dan konfirmasi tidak cocok!');
      return;
    }

    setLoadingPassword(true);

    const updatePromise = api.put('/user/change-password', {
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: confirmPassword
    });

    toast.promise(updatePromise, {
      loading: 'Memperbarui password...',
      success: () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        return 'Password berhasil diubah!';
      },
      error: (err) => err.response?.data?.message || 'Gagal mengubah password.'
    });

    try {
      await updatePromise;
    } catch (error) {
      // Error handled by toast
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 font-hanken">
      {/* Header */}
      <div>
        <h2 className="font-newsreader text-[32px] font-semibold text-[#4f604f] tracking-[-0.02em] leading-tight font-['Newsreader',serif]">
          Pengaturan Profil
        </h2>
        <p className="font-hanken text-[15px] text-[#747872] mt-1">
          Kelola informasi data diri dan keamanan akun Super Administrator H'Leven.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Ubah Profil */}
        <div className="bg-white p-7 rounded-lg shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8]">
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-[#E5E0D8]">
            <span className="material-symbols-outlined text-[#768875]">person</span>
            <h3 className="font-newsreader text-[20px] font-medium text-[#2F3231]">Data Diri</h3>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div>
              <label className="block font-hanken text-[12px] font-semibold tracking-[0.05em] uppercase text-[#434842] mb-1.5">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loadingProfile}
                className="w-full px-4 py-2.5 bg-white border border-[#E5E0D8] rounded-lg font-hanken text-[14px] text-[#2F3231] focus:outline-none focus:border-[#768875] focus:ring-2 focus:ring-[#768875]/20 disabled:bg-[#f2f4f2] transition-all"
                required
              />
            </div>

            <div>
              <label className="block font-hanken text-[12px] font-semibold tracking-[0.05em] uppercase text-[#434842] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loadingProfile}
                className="w-full px-4 py-2.5 bg-white border border-[#E5E0D8] rounded-lg font-hanken text-[14px] text-[#2F3231] focus:outline-none focus:border-[#768875] focus:ring-2 focus:ring-[#768875]/20 disabled:bg-[#f2f4f2] transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loadingProfile}
              className={`w-full py-3 rounded-lg text-white font-hanken text-[14px] font-semibold tracking-[0.01em] transition-all ${
                loadingProfile ? 'bg-[#A2BA9C] cursor-not-allowed' : 'bg-[#768875] hover:bg-[#657764] shadow-sm'
              }`}
            >
              {loadingProfile ? 'Menyimpan...' : 'Simpan Profil'}
            </button>
          </form>
        </div>

        {/* Form Ubah Password */}
        <div className="bg-white p-7 rounded-lg shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8]">
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-[#E5E0D8]">
            <span className="material-symbols-outlined text-[#768875]">lock</span>
            <h3 className="font-newsreader text-[20px] font-medium text-[#2F3231]">Ubah Password</h3>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-5">
            <div>
              <label className="block font-hanken text-[12px] font-semibold tracking-[0.05em] uppercase text-[#434842] mb-1.5">
                Password Saat Ini
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={loadingPassword}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-white border border-[#E5E0D8] rounded-lg font-hanken text-[14px] text-[#2F3231] focus:outline-none focus:border-[#768875] focus:ring-2 focus:ring-[#768875]/20 disabled:bg-[#f2f4f2] transition-all"
                required
              />
            </div>

            <div>
              <label className="block font-hanken text-[12px] font-semibold tracking-[0.05em] uppercase text-[#434842] mb-1.5">
                Password Baru
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loadingPassword}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-white border border-[#E5E0D8] rounded-lg font-hanken text-[14px] text-[#2F3231] focus:outline-none focus:border-[#768875] focus:ring-2 focus:ring-[#768875]/20 disabled:bg-[#f2f4f2] transition-all"
                required
              />
            </div>

            <div>
              <label className="block font-hanken text-[12px] font-semibold tracking-[0.05em] uppercase text-[#434842] mb-1.5">
                Konfirmasi Password Baru
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loadingPassword}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-white border border-[#E5E0D8] rounded-lg font-hanken text-[14px] text-[#2F3231] focus:outline-none focus:border-[#768875] focus:ring-2 focus:ring-[#768875]/20 disabled:bg-[#f2f4f2] transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loadingPassword}
              className={`w-full py-3 rounded-lg text-white font-hanken text-[14px] font-semibold tracking-[0.01em] transition-all ${
                loadingPassword ? 'bg-[#747872] cursor-not-allowed' : 'bg-[#2F3231] hover:bg-[#1a1c1b] shadow-sm'
              }`}
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