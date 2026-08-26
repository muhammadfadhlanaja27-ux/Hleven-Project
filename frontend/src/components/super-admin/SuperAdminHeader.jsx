import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

const SuperAdminHeader = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        setCurrentUser(JSON.parse(userStr));
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
    }
  }, [location]);

  const getPageTitle = () => {
    const pathname = location.pathname;
    if (pathname.includes("/users")) return "Manajemen User";
    if (pathname.includes("/hotels")) return "Manajemen Hotel";
    if (pathname.includes("/facilities")) return "Manajemen Fasilitas";
    if (pathname.includes("/master")) return "Master Data";
    if (pathname.includes("/bookings")) return "Manajemen Pesanan";
    if (pathname.includes("/reviews")) return "Manajemen Ulasan";
    if (pathname.includes("/transactions")) return "Transaksi";
    if (pathname.includes("/reports")) return "Laporan";
    if (pathname.includes("/profile")) return "Profile";
    return "Dashboard Overview";
  };

  return (
    <header className="bg-[#fcf9f5] h-16 border-b border-[#E5E1DA] flex justify-between items-center px-6 sm:px-8 z-40 shrink-0 font-['Hanken_Grotesk',sans-serif]">
      <div className="flex items-center gap-2">
        <button
          className="lg:hidden text-[#2D312C] hover:text-[#506147] transition-colors p-1 mr-1"
          aria-label="Open navigation menu"
          onClick={onMenuClick}
        >
          <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
            menu
          </span>
        </button>

        <button
          onClick={() => navigate("/")}
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
          Super Admin Portal
        </span>
        <span className="text-[#c4c8be]">/</span>
        <span className="text-[#2D312C] text-sm font-semibold">
          {getPageTitle()}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <Link
          to="/super-admin/profile"
          className="flex items-center gap-3 pl-3 border-l border-[#E5E1DA] hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-[#F2EBE1] border border-[#E5E1DA] text-[#506147] font-semibold text-xs flex items-center justify-center shadow-sm uppercase overflow-hidden">
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              currentUser?.name ? currentUser.name.slice(0, 2) : "SA"
            )}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-[#2D312C] leading-none">
              {currentUser?.name || "Super Admin"}
            </p>
            <p className="text-[10px] text-[#6B6E6A] leading-tight mt-0.5">
              {currentUser?.email || "superadmin@hleven.com"}
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default SuperAdminHeader;
