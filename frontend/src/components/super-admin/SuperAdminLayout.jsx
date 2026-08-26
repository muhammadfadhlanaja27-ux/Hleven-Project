import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import SuperAdminSidebar from "./SuperAdminSidebar";
import SuperAdminHeader from "./SuperAdminHeader";
import { invalidateCache } from "../../services/apiCache";

const SuperAdminLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    invalidateCache();
    navigate("/super-admin/login");
  };

  return (
    <div className="flex h-screen bg-[#fcf9f5] font-['Hanken_Grotesk',sans-serif] text-[#1c1c1a] antialiased overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`
          fixed inset-y-0 left-0 z-50
          transform transition-transform duration-300 ease-in-out

          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}

          lg:relative
          lg:translate-x-0
          lg:flex
          lg:flex-col
          lg:shrink-0
        `}
      >
        <SuperAdminSidebar onLogout={handleLogout} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <SuperAdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto bg-[#fcf9f5]">
          <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
