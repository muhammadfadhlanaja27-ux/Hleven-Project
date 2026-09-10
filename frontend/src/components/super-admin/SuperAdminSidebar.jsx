import React from "react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { name: "Dashboard", to: "/super-admin/dashboard", icon: "dashboard" },
  { name: "Hotel Monitoring", to: "/super-admin/hotels", icon: "hotel" },
  { name: "Users Management", to: "/super-admin/users", icon: "group" },
  { name: "Partner Approvals", to: "/super-admin/partners", icon: "handshake" },
  { name: "Warning Management", to: "/super-admin/warnings", icon: "warning" },
  { name: "Activity Logs", to: "/super-admin/activity-logs", icon: "history" },
  { name: "Reports & Analytics", to: "/super-admin/reports", icon: "monitoring" },
];

const SuperAdminSidebar = ({ onLogout }) => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/super-admin/dashboard") {
      return location.pathname === "/super-admin/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-[260px] bg-[#2D312C] text-[#D1D5D1] flex flex-col z-50 shrink-0 h-full shadow-lg">
      <div className="px-6 py-6 border-b border-white/10">
        <h1 className="font-['Newsreader',serif] text-2xl font-semibold text-white tracking-wide">
          H&apos;Leven Super Admin
        </h1>
        <p className="text-xs text-[#D1D5D1]/70 font-medium mt-1 uppercase tracking-wider">
          Full Control Dashboard
        </p>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-all duration-200 ${isActive(item.to)
                  ? 'bg-[#506147] text-white border-l-4 border-[#d6e8c8]'
                  : 'text-[#D1D5D1] hover:bg-[#69795f]/25 hover:text-white border-l-4 border-transparent'
                  }`}
              >
                <span className="material-symbols-outlined mr-3 text-[20px]">
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto border-t border-white/10 p-3">
        <ul className="flex flex-col gap-1">
          <li>
            <Link
              to="/super-admin/profile"
              className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${isActive('/super-admin/profile')
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
              onClick={onLogout}
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
};

export default SuperAdminSidebar;
