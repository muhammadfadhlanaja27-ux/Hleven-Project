import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';

export default function AdminHotelLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        setCurrentUser(JSON.parse(userStr));
      }
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/admin/login');
  };

  const isActive = (path) => {
    if (path === '/admin/dashboard') {
      return location.pathname === '/admin/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-[#fcf9f5] font-['Hanken_Grotesk',sans-serif] text-[#1c1c1a] antialiased overflow-hidden">
      {/* ====== SIDEBAR ====== */}
      <aside className="w-[260px] bg-[#2D312C] text-[#D1D5D1] flex flex-col z-50 shrink-0 h-full shadow-lg">
        {/* Brand / Logo */}
        <div className="px-6 py-6 border-b border-white/10">
          <h1 className="font-['Newsreader',serif] text-2xl font-semibold text-white tracking-wide">
            H&apos;Leven Admin
          </h1>
          <p className="text-xs text-[#D1D5D1]/70 font-medium mt-1 uppercase tracking-wider">
            Operational Excellence
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4">
          <ul className="flex flex-col gap-1">
            <li>
              <Link
                to="/admin/dashboard"
                className={`flex items-center px-6 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive('/admin/dashboard')
                    ? 'bg-[#506147] text-white border-l-4 border-[#d6e8c8]'
                    : 'text-[#D1D5D1] hover:bg-[#69795f]/25 hover:text-white border-l-4 border-transparent'
                }`}
              >
                <span className="material-symbols-outlined mr-3 text-[20px]">
                  dashboard
                </span>
                <span>Dashboard</span>
              </Link>
            </li>

            <li>
              <Link
                to="/admin/hotel"
                className={`flex items-center px-6 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive('/admin/hotel')
                    ? 'bg-[#506147] text-white border-l-4 border-[#d6e8c8]'
                    : 'text-[#D1D5D1] hover:bg-[#69795f]/25 hover:text-white border-l-4 border-transparent'
                }`}
              >
                <span className="material-symbols-outlined mr-3 text-[20px]">
                  hotel
                </span>
                <span>Hotel Information</span>
              </Link>
            </li>

            <li>
              <Link
                to="/admin/rooms"
                className={`flex items-center px-6 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive('/admin/rooms')
                    ? 'bg-[#506147] text-white border-l-4 border-[#d6e8c8]'
                    : 'text-[#D1D5D1] hover:bg-[#69795f]/25 hover:text-white border-l-4 border-transparent'
                }`}
              >
                <span className="material-symbols-outlined mr-3 text-[20px]">
                  bed
                </span>
                <span>Rooms</span>
              </Link>
            </li>

            <li>
              <Link
                to="/admin/facilities"
                className={`flex items-center px-6 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive('/admin/facilities')
                    ? 'bg-[#506147] text-white border-l-4 border-[#d6e8c8]'
                    : 'text-[#D1D5D1] hover:bg-[#69795f]/25 hover:text-white border-l-4 border-transparent'
                }`}
              >
                <span className="material-symbols-outlined mr-3 text-[20px]">
                  pool
                </span>
                <span>Facilities</span>
              </Link>
            </li>

            <li>
              <Link
                to="/admin/bookings"
                className={`flex items-center px-6 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive('/admin/bookings')
                    ? 'bg-[#506147] text-white border-l-4 border-[#d6e8c8]'
                    : 'text-[#D1D5D1] hover:bg-[#69795f]/25 hover:text-white border-l-4 border-transparent'
                }`}
              >
                <span className="material-symbols-outlined mr-3 text-[20px]">
                  calendar_today
                </span>
                <span>Bookings</span>
              </Link>
            </li>

            <li>
              <Link
                to="/admin/reviews"
                className={`flex items-center px-6 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive('/admin/reviews')
                    ? 'bg-[#506147] text-white border-l-4 border-[#d6e8c8]'
                    : 'text-[#D1D5D1] hover:bg-[#69795f]/25 hover:text-white border-l-4 border-transparent'
                }`}
              >
                <span className="material-symbols-outlined mr-3 text-[20px]">
                  star
                </span>
                <span>Reviews</span>
              </Link>
            </li>

            <li>
              <Link
                to="/admin/revenue"
                className={`flex items-center px-6 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive('/admin/revenue')
                    ? 'bg-[#506147] text-white border-l-4 border-[#d6e8c8]'
                    : 'text-[#D1D5D1] hover:bg-[#69795f]/25 hover:text-white border-l-4 border-transparent'
                }`}
              >
                <span className="material-symbols-outlined mr-3 text-[20px]">
                  monitoring
                </span>
                <span>Revenue Report</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Bottom Actions */}
        <div className="mt-auto border-t border-white/10 p-3">
          <ul className="flex flex-col gap-1">
            <li>
              <Link
                to="/admin/profile"
                className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive('/admin/profile')
                    ? 'bg-[#506147] text-white'
                    : 'text-[#D1D5D1] hover:bg-[#69795f]/25 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined mr-3 text-[20px]">
                  account_circle
                </span>
                <span>Profile</span>
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2.5 text-sm text-red-300 hover:bg-red-950/40 hover:text-red-200 rounded-lg transition-colors duration-200"
              >
                <span className="material-symbols-outlined mr-3 text-[20px]">
                  logout
                </span>
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>

      {/* ====== MAIN VIEWPORT ====== */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <header className="bg-[#fcf9f5] h-16 border-b border-[#E5E1DA] flex justify-between items-center px-6 sm:px-8 z-40 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 mr-3 pl-2 pr-3 h-9 rounded-lg text-[#506147] hover:bg-[#E4EBE0] hover:text-[#4A5D43] transition-colors border border-transparent hover:border-[#506147]/20 focus:outline-none"
              title="Kembali ke halaman utama"
            >
              <span className="material-symbols-outlined text-[20px] leading-none">
                arrow_back
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline">
                Homepage
              </span>
            </button>
            <span className="text-[#6B6E6A] text-xs font-semibold uppercase tracking-wider">
              Portal Admin Hotel
            </span>
            <span className="text-[#c4c8be]">/</span>
            <span className="text-[#2D312C] text-sm font-semibold">
              {location.pathname.includes('/hotel')
                ? 'Hotel Information'
                : location.pathname.includes('/facilities')
                ? 'Manajemen Fasilitas'
                : location.pathname.includes('/rooms')
                ? 'Manajemen Kamar'
                : location.pathname.includes('/bookings')
                ? 'Manajemen Pesanan'
                : location.pathname.includes('/reviews')
                ? 'Manajemen Ulasan'
                : location.pathname.includes('/revenue')
                ? 'Revenue Report'
                : location.pathname.includes('/profile')
                ? 'Profile'
                : 'Dashboard Overview'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              className="text-[#6B6E6A] hover:text-[#506147] transition-colors p-2 rounded-full hover:bg-[#eae8e4] focus:outline-none"
              title="Notifikasi"
            >
              <span className="material-symbols-outlined text-[20px]">
                notifications
              </span>
            </button>

            {/* User Profile avatar */}
            <Link
              to="/admin/profile"
              className="flex items-center gap-3 pl-3 border-l border-[#E5E1DA] hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-[#F2EBE1] border border-[#E5E1DA] text-[#506147] font-semibold text-xs flex items-center justify-center shadow-sm uppercase overflow-hidden">
                {currentUser?.avatar ? (
                  <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  currentUser?.name ? currentUser.name.slice(0, 2) : 'AH'
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-[#2D312C] leading-none">
                  {currentUser?.name || 'Admin Hotel'}
                </p>
                <p className="text-[10px] text-[#6B6E6A] leading-tight mt-0.5">
                  {currentUser?.email || 'admin@hotel.com'}
                </p>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content Canvas */}
        <main className="flex-1 overflow-y-auto bg-[#fcf9f5]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
