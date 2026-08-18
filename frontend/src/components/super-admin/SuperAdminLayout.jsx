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
    <div className="flex h-screen overflow-hidden bg-warm-surface font-hanken">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          w-[260px]
          bg-deep-charcoal text-white
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
      </aside>

      {/* Main Area — takes remaining width, locked to viewport height */}
      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
        {/* Header — fixed height, never shrinks */}
        <SuperAdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Content — scrollable area fills remaining height */}
        <main className="flex-1 overflow-y-auto overflow-x-auto">
          <div className="p-4 sm:p-5 lg:p-6 xl:p-8 2xl:p-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
