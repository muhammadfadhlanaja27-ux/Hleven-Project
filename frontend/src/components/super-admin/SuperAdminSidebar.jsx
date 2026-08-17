import React from "react";
import { NavLink } from "react-router-dom";

// Navigation items matching Stitch Super Admin design and active routes
const navItems = [
  { name: "Dashboard", to: "/super-admin/dashboard", icon: "dashboard" },
  { name: "Hotel Monitoring", to: "/super-admin/hotels", icon: "domain" },
  { name: "Users", to: "/super-admin/users", icon: "group" },
  { name: "Partners", to: "/super-admin/partners", icon: "handshake" },
  { name: "Warning Management", to: "/super-admin/warnings", icon: "warning" },
  { name: "Activity", to: "/super-admin/activity-logs", icon: "history" },
  { name: "Reports", to: "/super-admin/reports", icon: "analytics" },
  { name: "Pengaturan", to: "/super-admin/profile", icon: "settings" },
];

/**
 * SuperAdminSidebar – compact vertical navigation without scrollbar
 */
const SuperAdminSidebar = ({ onLogout }) => {
  return (
    <nav className="flex flex-col h-full bg-[#2e3130] text-white w-[260px] select-none font-hanken overflow-hidden">
      {/* Brand Header (Compact) */}
      <div className="px-6 pt-5 pb-4">
        <h1 className="font-newsreader text-[18px] font-medium leading-tight tracking-wide text-white font-['Newsreader',serif]">
          H'Leven
        </h1>
        <p className="font-hanken text-[12px] text-[#c4c8c0] mt-0.5 font-normal opacity-80 font-['Hanken_Grotesk',sans-serif]">
          Super Admin
        </p>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 flex flex-col gap-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-2.5 font-hanken text-[13.5px] font-['Hanken_Grotesk',sans-serif] transition-all duration-150 ${
                isActive
                  ? "bg-[#4f604f] border-l-4 border-[#768875] text-white font-medium"
                  : "text-[#c4c8c0] opacity-75 hover:opacity-100 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <span
              className="material-symbols-outlined text-[19px] shrink-0"
              aria-hidden="true"
            >
              {item.icon}
            </span>
            <span className="truncate">{item.name}</span>
          </NavLink>
        ))}
      </div>

      {/* Bottom Actions (Support & Logout) */}
      <div className="mt-auto pt-2.5 pb-4 border-t border-white/10 flex flex-col gap-0.5">
        <a
          href="#support"
          className="flex items-center gap-3 px-6 py-2.5 font-hanken text-[13.5px] font-['Hanken_Grotesk',sans-serif] text-[#c4c8c0] opacity-75 hover:opacity-100 hover:bg-white/5 hover:text-white transition-all duration-150"
        >
          <span
            className="material-symbols-outlined text-[19px] shrink-0"
            aria-hidden="true"
          >
            help
          </span>
          <span>Support</span>
        </a>

        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-3 w-full text-left px-6 py-2.5 font-hanken text-[13.5px] font-['Hanken_Grotesk',sans-serif] text-[#c4c8c0] opacity-75 hover:opacity-100 hover:bg-white/5 hover:text-white transition-all duration-150"
        >
          <span
            className="material-symbols-outlined text-[19px] shrink-0"
            aria-hidden="true"
          >
            logout
          </span>
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default SuperAdminSidebar;
