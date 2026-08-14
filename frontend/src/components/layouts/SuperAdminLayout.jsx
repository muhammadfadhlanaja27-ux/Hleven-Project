import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';

const SuperAdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        // Hapus sesi dan arahkan kembali ke login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/super-admin/login');
    };

    // Daftar menu sidebar
    const navItems = [
        { name: 'Dashboard', path: '/super-admin/dashboard', icon: '📊' },
        { name: 'User Management', path: '/super-admin/users', icon: '👥' },
        { name: 'Hotel Monitoring', path: '/super-admin/hotels', icon: '🏨' },
        { name: 'Partner Approval', path: '/super-admin/partners', icon: '🤝' },
        { name: 'Warning Management', path: '/super-admin/warnings', icon: '⚠️' },
        { name: 'Activity Logs', path: '/super-admin/activity-logs', icon: '📋' },
        { name: 'Reports', path: '/super-admin/reports', icon: '📈' },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            
            {/* --- SIDEBAR KIRI --- */}
            <aside className="w-64 bg-white shadow-md flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-green-600">H'Leven Admin</h2>
                </div>
                
                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1">
                        {navItems.map((item) => {
                            // Cek apakah URL saat ini cocok dengan path menu untuk efek "aktif"
                            const isActive = location.pathname.includes(item.path);
                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={`flex items-center px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors ${
                                            isActive ? 'bg-green-50 text-green-700 font-semibold border-r-4 border-green-600' : ''
                                        }`}
                                    >
                                        <span className="mr-3">{item.icon}</span>
                                        {item.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors font-medium"
                    >
                        Log Out
                    </button>
                </div>
            </aside>

            {/* --- AREA KONTEN KANAN --- */}
            <div className="flex-1 flex flex-col overflow-hidden">
                
                {/* HEADER / TOP NAVBAR */}
                <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-end px-6">
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-700">Super Admin</p>
                            <p className="text-xs text-gray-500">System Administrator</p>
                        </div>
                        <div className="h-10 w-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-inner">
                            SA
                        </div>
                    </div>
                </header>

                {/* MAIN CONTENT (TEMPAT COMPONENT LAIN MUNCUL) */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 relative">
                    {/* Outlet ini WAJIB ada agar rute anak seperti Dashboard bisa dirender */}
                    <Outlet /> 
                </main>

            </div>
        </div>
    );
};

export default SuperAdminLayout;