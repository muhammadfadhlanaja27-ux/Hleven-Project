import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';

export default function AdminHotelLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/admin/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-800 text-white flex flex-col shadow-md">
        <div className="p-5 text-xl font-bold tracking-wider border-b border-slate-700 bg-slate-900">
          H'Leven Admin
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link 
            to="/admin/dashboard" 
            className={`block px-4 py-2.5 rounded transition ${isActive('/admin/dashboard') ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-700'}`}
          >
            📊 Dashboard
          </Link>
          <Link 
            to="/admin/rooms" 
            className={`block px-4 py-2.5 rounded transition ${isActive('/admin/rooms') || isActive('/admin/rooms/create') ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-700'}`}
          >
            🛏️ Manajemen Kamar
          </Link>
          <Link 
            to="/admin/bookings" 
            className={`block px-4 py-2.5 rounded transition ${isActive('/admin/bookings') ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-700'}`}
          >
            📋 Manajemen Pesanan
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button 
            onClick={handleLogout}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold transition"
          >
            🚪 Keluar (Logout)
          </button>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}