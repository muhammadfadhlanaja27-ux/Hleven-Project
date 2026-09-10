import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function AdminHotelSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

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
              <span>Room Management</span>
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
              <span>Facilities Management</span>
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
              <span>Bookings Management</span>
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
              <span>Reviews Management</span>
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
  );
}
