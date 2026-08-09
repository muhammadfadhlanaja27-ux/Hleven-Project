import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import './UserProfile.css';

export default function UserProfile() {
    const navigate = useNavigate();

    // State untuk data profil
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    });

    // State untuk keamanan / sandi
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // State untuk indikator loading dan pesan status
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

    // Saat komponen dimuat, ambil data dari localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            const nameParts = (user.name || '').split(' ');
            const fName = nameParts[0] || '';
            const lName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

            setProfileData({
                firstName: fName,
                lastName: lName,
                email: user.email || '',
                phone: user.phone || ''
            });
        } else {
            navigate('/login');
        }
    }, [navigate]);

    // Fungsi untuk handle logout
    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        navigate('/login');
    };

    // Handler perubahan form profil
    const handleProfileChange = (e) => {
        const { id, value } = e.target;
        setProfileData(prev => ({ ...prev, [id]: value }));
    };

    // Handler perubahan form password
    const handlePasswordChange = (e) => {
        const { id, value } = e.target;
        setPasswordData(prev => ({ ...prev, [id]: value }));
    };

    // Fungsi utama saat tombol "Save Changes" ditekan
    const handleSaveChanges = async () => {
        setStatusMsg({ type: '', text: '' });
        setLoading(true);

        try {
            // 1. Jika kolom password diisi, lakukan validasi & update password
            if (passwordData.newPassword) {
                if (!passwordData.currentPassword) {
                    throw new Error('Masukkan kata sandi saat ini untuk mengubah kata sandi.');
                }
                if (passwordData.newPassword !== passwordData.confirmPassword) {
                    throw new Error('Konfirmasi kata sandi baru tidak cocok.');
                }
                if (passwordData.newPassword.length < 8) {
                    throw new Error('Kata sandi baru minimal harus 8 karakter.');
                }

                await authService.changePassword({
                    current_password: passwordData.currentPassword,
                    new_password: passwordData.newPassword
                });

                // Kosongkan form password jika berhasil
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }

            // 2. Kirim update data profil ke database
            const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();
            const updatedPayload = {
                name: fullName,
                email: profileData.email,
                phone: profileData.phone
            };

            const response = await authService.updateProfile(updatedPayload);
            const newUserData = response?.data?.data?.user || updatedPayload;

            // Perbarui data yang tersimpan di localStorage
            const currentUser = JSON.parse(localStorage.getItem('user')) || {};
            localStorage.setItem('user', JSON.stringify({ ...currentUser, ...newUserData }));

            setStatusMsg({ type: 'success', text: 'Perubahan profil berhasil disimpan!' });
        } catch (err) {
            const errorText = err?.response?.data?.message || err?.message || 'Gagal menyimpan perubahan. Periksa kembali data Anda.';
            setStatusMsg({ type: 'error', text: errorText });
        } finally {
            setLoading(false);
            // Hilangkan pesan notifikasi setelah 5 detik
            setTimeout(() => setStatusMsg({ type: '', text: '' }), 5000);
        }
    };

    return (
        <div className="bg-surface text-on-surface font-body-md text-body-md antialiased user-profile-page">

            {/* ── TopNavBar ── */}
            <header className="w-full sticky top-0 bg-off-white dark:bg-surface-dim border-b border-warm-beige/30 shadow-sm shadow-forest-green/5 z-50">
                <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
                    <Link className="text-headline-md font-headline-md font-bold text-forest-green dark:text-primary-fixed-dim" to="/">
                        H'Leven
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link className="text-on-surface-variant dark:text-surface-variant font-medium hover:text-forest-green dark:hover:text-primary-fixed hover:bg-warm-beige/10 transition-colors px-3 py-2 rounded-md" to="/">Hotels</Link>
                        <Link className="text-on-surface-variant dark:text-surface-variant font-medium hover:text-forest-green dark:hover:text-primary-fixed hover:bg-warm-beige/10 transition-colors px-3 py-2 rounded-md" to="/detail">Resorts</Link>
                        <Link className="text-on-surface-variant dark:text-surface-variant font-medium hover:text-forest-green dark:hover:text-primary-fixed hover:bg-warm-beige/10 transition-colors px-3 py-2 rounded-md" to="#">Our Story</Link>
                        <Link className="text-on-surface-variant dark:text-surface-variant font-medium hover:text-forest-green dark:hover:text-primary-fixed hover:bg-warm-beige/10 transition-colors px-3 py-2 rounded-md" to="#">Promotions</Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Link
                            to="/login"
                            className="bg-forest-green text-white px-6 py-2 rounded-full font-label-md text-label-md hover:bg-primary transition-colors active:scale-[0.99] duration-200"
                        >
                            Book Now
                        </Link>
                        <Link to="/profile" className="hidden md:flex text-forest-green dark:text-primary-fixed-dim hover:bg-warm-beige/10 p-2 rounded-full transition-colors">
                            <span className="material-symbols-outlined">person</span>
                        </Link>

                    </div>
                </div>
            </header>

            {/* ── Main Content Canvas ── */}
            <main className="flex-grow w-full px-margin-mobile md:px-margin-desktop py-stack-lg max-w-container-max mx-auto">
                <div className="mb-stack-lg">
                    <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-forest-green mb-2">My Profile</h1>
                    <p className="text-on-surface-variant font-body-md text-body-md">Manage your account settings and personal information.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
                    {/* Sidebar */}
                    <aside className="lg:col-span-4 flex flex-col gap-stack-lg">
                        <div className="bg-warm-beige/20 border border-warm-beige/40 rounded-xl p-6 flex flex-col items-center text-center shadow-sm shadow-forest-green/5">
                            <div className="w-24 h-24 rounded-full bg-forest-green/10 flex items-center justify-center text-forest-green mb-4 border-2 border-forest-green/20 relative overflow-hidden">
                                <span className="material-symbols-outlined text-5xl">person</span>
                            </div>
                            <h2 className="font-headline-md text-text-main mb-1">
                                {`${profileData.firstName} ${profileData.lastName}`.trim() || 'H\'Leven Member'}
                            </h2>
                            <p className="text-forest-green font-label-md mb-6">Active Member</p>
                            <div className="w-full grid grid-cols-2 gap-4">
                                <div className="flex flex-col items-center p-3 bg-surface-container-lowest rounded-lg border border-warm-beige/30">
                                    <span className="text-forest-green font-headline-md text-headline-md mb-1">12</span>
                                    <span className="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">Total Stays</span>
                                </div>
                                <div className="flex flex-col items-center p-3 bg-surface-container-lowest rounded-lg border border-warm-beige/30">
                                    <span className="text-forest-green font-headline-md text-headline-md mb-1">4.5k</span>
                                    <span className="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">Points</span>
                                </div>
                            </div>
                        </div>
                        
                        <nav className="bg-surface-container-low rounded-xl border border-warm-beige/30 overflow-hidden">
                            <a className="flex items-center gap-3 px-6 py-4 bg-forest-green/10 text-forest-green font-label-md text-label-md border-l-4 border-forest-green" href="#">
                                <span className="material-symbols-outlined" data-icon="manage_accounts">manage_accounts</span>
                                Personal Information
                            </a>
                            <a className="flex items-center gap-3 px-6 py-4 text-on-surface-variant hover:bg-warm-beige/20 hover:text-forest-green font-label-md text-label-md transition-colors border-l-4 border-transparent" href="#">
                                <span className="material-symbols-outlined" data-icon="history">history</span>
                                Booking History
                            </a>
                            <a className="flex items-center gap-3 px-6 py-4 text-on-surface-variant hover:bg-warm-beige/20 hover:text-forest-green font-label-md text-label-md transition-colors border-l-4 border-transparent" href="#">
                                <span className="material-symbols-outlined" data-icon="payment">payment</span>
                                Payment Methods
                            </a>
                            <a className="flex items-center gap-3 px-6 py-4 text-on-surface-variant hover:bg-warm-beige/20 hover:text-forest-green font-label-md text-label-md transition-colors border-l-4 border-transparent" href="#">
                                <span className="material-symbols-outlined" data-icon="notifications">notifications</span>
                                Preferences
                            </a>
                        </nav>
                    </aside>

                    {/* Main Form Area */}
                    <div className="lg:col-span-8 flex flex-col gap-stack-lg">

                        {/* Status Message Notification */}
                        {statusMsg.text && (
                            <div className={`p-4 rounded-lg font-body-md text-sm ${statusMsg.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-green-100 text-green-800 border border-green-200'}`}>
                                {statusMsg.text}
                            </div>
                        )}

                        {/* Personal Info Section */}
                        <section className="bg-surface-container-lowest rounded-xl border border-warm-beige/30 p-6 md:p-8 shadow-sm shadow-forest-green/5">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="material-symbols-outlined text-forest-green">person_outline</span>
                                <h3 className="font-headline-md text-text-main">Personal Details</h3>
                            </div>

                            <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => e.preventDefault()}>
                                <div className="flex flex-col gap-2">
                                    <label className="font-label-md text-on-surface-variant" htmlFor="firstName">First Name</label>
                                    <input
                                        className="bg-surface-container-low border border-warm-beige rounded-DEFAULT px-4 py-3 font-body-md text-text-main focus:outline-none focus:border-forest-green focus:ring-1 focus:ring-forest-green transition-colors"
                                        id="firstName"
                                        type="text"
                                        value={profileData.firstName}
                                        onChange={handleProfileChange}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="font-label-md text-on-surface-variant" htmlFor="lastName">Last Name</label>
                                    <input
                                        className="bg-surface-container-low border border-warm-beige rounded-DEFAULT px-4 py-3 font-body-md text-text-main focus:outline-none focus:border-forest-green focus:ring-1 focus:ring-forest-green transition-colors"
                                        id="lastName"
                                        type="text"
                                        value={profileData.lastName}
                                        onChange={handleProfileChange}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="flex flex-col gap-2 md:col-span-2">
                                    <label className="font-label-md text-on-surface-variant" htmlFor="email">Email Address</label>
                                    <input
                                        className="bg-surface-container-low border border-warm-beige rounded-DEFAULT px-4 py-3 font-body-md text-text-main focus:outline-none focus:border-forest-green focus:ring-1 focus:ring-forest-green transition-colors"
                                        id="email"
                                        type="email"
                                        value={profileData.email}
                                        onChange={handleProfileChange}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="flex flex-col gap-2 md:col-span-2">
                                    <label className="font-label-md text-on-surface-variant" htmlFor="phone">Phone Number</label>
                                    <input
                                        className="bg-surface-container-low border border-warm-beige rounded-DEFAULT px-4 py-3 font-body-md text-text-main focus:outline-none focus:border-forest-green focus:ring-1 focus:ring-forest-green transition-colors"
                                        id="phone"
                                        type="tel"
                                        value={profileData.phone}
                                        onChange={handleProfileChange}
                                        disabled={loading}
                                    />
                                </div>
                            </form>
                        </section>

                        {/* Security Section */}
                        <section className="bg-surface-container-lowest rounded-xl border border-warm-beige/30 p-6 md:p-8 shadow-sm shadow-forest-green/5">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="material-symbols-outlined text-forest-green">lock_outline</span>
                                <h3 className="font-headline-md text-text-main">Security</h3>
                            </div>
                            <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
                                <div className="flex flex-col gap-2">
                                    <label className="font-label-md text-on-surface-variant" htmlFor="currentPassword">Current Password</label>
                                    <input
                                        className="bg-surface-container-low border border-warm-beige rounded-DEFAULT px-4 py-3 font-body-md text-text-main focus:outline-none focus:border-forest-green focus:ring-1 focus:ring-forest-green transition-colors max-w-md"
                                        id="currentPassword"
                                        placeholder="••••••••"
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="w-full bg-surface-container-highest h-px max-w-md my-2"></div>
                                <div className="flex flex-col gap-2">
                                    <label className="font-label-md text-on-surface-variant" htmlFor="newPassword">New Password</label>
                                    <input
                                        className="bg-surface-container-low border border-warm-beige rounded-DEFAULT px-4 py-3 font-body-md text-text-main focus:outline-none focus:border-forest-green focus:ring-1 focus:ring-forest-green transition-colors max-w-md"
                                        id="newPassword"
                                        placeholder="New Password"
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="font-label-md text-on-surface-variant" htmlFor="confirmPassword">Confirm New Password</label>
                                    <input
                                        className="bg-surface-container-low border border-warm-beige rounded-DEFAULT px-4 py-3 font-body-md text-text-main focus:outline-none focus:border-forest-green focus:ring-1 focus:ring-forest-green transition-colors max-w-md"
                                        id="confirmPassword"
                                        placeholder="Confirm Password"
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        disabled={loading}
                                    />
                                </div>
                            </form>
                        </section>

                        <div className="flex justify-end gap-4 pt-4">
                            <button
                                onClick={handleLogout}
                                className="bg-red-100 text-red-700 border border-red-200 font-label-md px-6 py-3 rounded-DEFAULT hover:bg-red-200 transition-colors"
                            >
                                Logout
                            </button>
                            <button
                                onClick={handleSaveChanges}
                                disabled={loading}
                                className={`bg-forest-green text-on-primary font-label-md px-8 py-3 rounded-DEFAULT hover:bg-primary transition-colors shadow-sm shadow-forest-green/20 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Menyimpan...' : 'Save Changes'}
                            </button>
                        </div>

                    </div>
                </div>
            </main>
            {/* ── Footer (Shared Component) ── */}
            <footer className="w-full bg-surface-container-highest dark:bg-inverse-surface border-t border-warm-beige/20 mt-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter w-full px-margin-mobile md:px-margin-desktop py-section-gap max-w-container-max mx-auto">
                    {/* Brand & Copyright */}
                    <div className="flex flex-col md:col-span-1">
                        <span className="text-headline-md font-headline-md font-bold text-forest-green dark:text-primary-fixed-dim mb-4">
                            H'Leven
                        </span>
                        <p className="font-label-sm text-label-sm text-on-surface-variant dark:text-surface-variant mt-auto">
                            © 2024 H'Leven Hospitality Group. All rights reserved.
                        </p>
                    </div>

                    {/* Links Column 1 */}
                    <div className="flex flex-col gap-3">
                        <a className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant hover:text-forest-green dark:hover:text-on-primary-container transition-colors" href="#">Privacy Policy</a>
                        <a className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant hover:text-forest-green dark:hover:text-on-primary-container transition-colors" href="#">Terms of Service</a>
                    </div>

                    {/* Links Column 2 */}
                    <div className="flex flex-col gap-3">
                        <a className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant hover:text-forest-green dark:hover:text-on-primary-container transition-colors" href="#">Support Center</a>
                        <a className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant hover:text-forest-green dark:hover:text-on-primary-container transition-colors" href="#">Careers</a>
                    </div>

                    {/* Links Column 3 */}
                    <div className="flex flex-col gap-3">
                        <a className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant hover:text-forest-green dark:hover:text-on-primary-container transition-colors" href="#">Contact Us</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}