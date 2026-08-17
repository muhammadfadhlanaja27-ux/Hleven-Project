import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * SuperAdminHeader – top navigation bar for Super Admin layout.
 * Height: 72px (as per design). Includes a hamburger button for mobile that
 * triggers the sidebar toggle via the onMenuClick callback.
 */
const SuperAdminHeader = ({ onMenuClick }) => {
  const navigate = useNavigate();

  // Get user data from localStorage for avatar/name
  let userName = "Super Admin";
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.name) {
      userName = user.name;
    }
  } catch (e) {
    // fallback
  }

  return (
    <header
      className="flex items-center justify-between shrink-0 bg-[#F9F6F1] border-b border-[#E5E0D8] px-6 sticky top-0 z-10 w-full font-hanken"
      style={{ height: "72px" }}
    >
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          className="lg:hidden text-[#191c1b] hover:text-[#4f604f] transition-colors p-1"
          aria-label="Open navigation menu"
          onClick={onMenuClick}
        >
          <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
            menu
          </span>
        </button>

        {/* Title – hidden on mobile */}
        <span className="font-newsreader text-[20px] font-medium leading-[1.4] text-[#191c1b] tracking-wider hidden lg:block font-['Newsreader',serif]">
          H'Leven Super Admin
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Action Button */}
        <button
          onClick={() => navigate("/super-admin/dashboard")}
          className="flex items-center gap-2 bg-[#768875] text-[#ffffff] px-4 py-2 rounded-lg font-hanken text-[14px] font-semibold tracking-[0.01em] leading-[1] font-['Hanken_Grotesk',sans-serif] hover:opacity-90 transition-opacity active:scale-95 duration-150"
        >
          Admin Portal
        </button>

        {/* User avatar button -> links to profile */}
        <button
          type="button"
          onClick={() => navigate("/super-admin/profile")}
          title={`Profil ${userName} (Klik untuk Pengaturan Profil)`}
          className="w-10 h-10 rounded-full bg-[#edeeec] flex items-center justify-center hover:bg-[#e7e8e7] hover:ring-2 hover:ring-[#768875] transition-all overflow-hidden border border-[#E5E0D8] cursor-pointer"
        >
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=4f604f&color=fff`}
            alt={userName}
            className="w-full h-full object-cover"
          />
        </button>
      </div>
    </header>
  );
};

export default SuperAdminHeader;
