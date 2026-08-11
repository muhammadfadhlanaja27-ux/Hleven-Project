import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const SuperAdminLayout = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100 text-gray-700';

  return (
    <div className="flex h-screen bg-[#F8F9FA]">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-xl font-bold text-green-700">H'Leven Admin</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <Link to="/super-admin" className={`block px-3 py-2 rounded-md font-medium transition-colors ${isActive('/super-admin')}`}>
            Dashboard
          </Link>
          <Link to="/super-admin/users" className={`block px-3 py-2 rounded-md font-medium transition-colors ${isActive('/super-admin/users')}`}>
            User Management
          </Link>
          <Link to="/super-admin/hotels" className={`block px-3 py-2 rounded-md font-medium transition-colors ${isActive('/super-admin/hotels')}`}>
            Hotel Monitoring
          </Link>
          <Link to="/super-admin/partners" className={`block px-3 py-2 rounded-md font-medium transition-colors ${isActive('/super-admin/partners')}`}>
            Partner Approval
          </Link>
          <Link to="/super-admin/warnings" className={`block px-3 py-2 rounded-md font-medium transition-colors ${isActive('/super-admin/warnings')}`}>
            Warning Management
          </Link>
          <Link to="/super-admin/activity-logs" className={`block px-3 py-2 rounded-md font-medium transition-colors ${isActive('/super-admin/activity-logs')}`}>
            Activity Logs
          </Link>
          <Link to="/super-admin/reports" className={`block px-3 py-2 rounded-md font-medium transition-colors ${isActive('/super-admin/reports')}`}>
            Reports
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-6 z-10">
          <div className="text-gray-500 font-medium"></div>
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-green-200 border border-green-500 flex items-center justify-center font-bold text-green-700">
              SA
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8F9FA] p-6">
          <Outlet /> 
        </main>
      </div>
      
    </div>
  );
};

export default SuperAdminLayout;