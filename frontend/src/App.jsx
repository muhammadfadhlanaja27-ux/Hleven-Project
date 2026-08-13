import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Layout Components
import Navbar from './components/layouts/NavBar';
import Footer from './components/layouts/Footer';
import SuperAdminLayout from './components/layouts/SuperAdminLayout'; 
import AdminHotelLayout from './components/layouts/AdminHotelLayout'; // Impor Sidebar Admin Hotel

// User / Public Pages
import LandingPage from './Pages/user/LandingPage';
import Login from './Pages/Auth/Login';
import Register from './Pages/Auth/Register';
import UserProfile from './Pages/user/UserProfile';
import HotelDetail from './Pages/user/HotelDetail';

// Admin Hotel Pages
import AdminLogin from './pages/Auth/admin-hotel/AdminLogin';
import Dashboard from './pages/admin-hotel/Dashboard';
import RoomList from './pages/admin-hotel/RoomList';
import RoomCreate from './pages/admin-hotel/RoomCreate';
import BookingList from './pages/admin-hotel/BookingList';

// Super Admin Pages
import SuperAdminLogin from './Pages/Auth/super-admin/SuperAdminLogin'; 
import UserManagement from './Pages/super-admin/UserManagement';
import HotelMonitoring from './Pages/super-admin/HotelMonitoring';
import PartnerApproval from './Pages/super-admin/PartnerApproval';
import WarningManagement from './Pages/super-admin/WarningManagement';
import ActivityLogs from './Pages/super-admin/ActivityLogs';
import Reports from './Pages/super-admin/Reports';
import SuperAdminProfile from './Pages/super-admin/SuperAdminProfile';

// ---------------------------------------------------------
// 1. Layout Wrapper Publik
// ---------------------------------------------------------
const MainLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-grow">
      <Outlet />
    </main>
    <Footer />
  </div>
);

// ---------------------------------------------------------
// 2. SATPAM AMAN: Protected Route untuk Admin Hotel
// ---------------------------------------------------------
const AdminHotelProtectedRoute = () => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  
  if (!token || !userString || userString === "undefined" || userString === "null") {
    return <Navigate to="/admin/login" replace />;
  }

  try {
    const user = JSON.parse(userString);
    if (user.role !== 'admin_hotel' && user.role !== 'super_admin') {
      return <Navigate to="/admin/login" replace />;
    }
  } catch (e) {
    localStorage.clear();
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

// ---------------------------------------------------------
// 3. SATPAM AMAN: Protected Route untuk Super Admin
// ---------------------------------------------------------
const SuperAdminProtectedRoute = () => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  
  if (!token || !userString) {
    return <Navigate to="/super-admin/login" replace />;
  }

  // 🟢 2. DITAMBAHKAN TRY-CATCH UNTUK MENCEGAH WHITE-SCREEN
  try {
    const user = JSON.parse(userString);
    if (user.role !== 'super_admin') {
      return <Navigate to="/super-admin/login" replace />;
    }
  } catch (error) {
    console.error("Gagal parsing data user:", error);
    return <Navigate to="/super-admin/login" replace />;
  }

  return <Outlet />;
};

// ---------------------------------------------------------
// 3. SATPAM FRONTEND UNTUK ADMIN HOTEL
// ---------------------------------------------------------
const AdminHotelProtectedRoute = () => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  
  if (!token || !userString) {
    return <Navigate to="/admin/login" replace />;
  }

  try {
    const user = JSON.parse(userString);
    if (user.role !== 'admin_hotel') {
      return <Navigate to="/admin/login" replace />;
    }
  } catch (error) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

// Dashboard Summary Super Admin Sederhana
const SuperAdminDashboard = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-900">Dashboard Super Admin</h1>
    <p className="text-gray-600">Selamat datang di panel kendali utama H'Leven. Silakan gunakan menu di sebelah kiri untuk mengelola sistem.</p>
  </div>
);

function App() {
  return (
    <Router>
      <div id="root" className="flex flex-col min-h-screen">
        <Routes>
          
          {/* Rute Auth Khusus Admin (Bebas diakses tanpa layout publik) */}
          <Route path="/super-admin/login" element={<SuperAdminLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* GRUP 1: Rute Publik & User Biasa */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/hotels/:id" element={<HotelDetail />} /> {/* 🟢 ROUTE DENGAN IMPORT BERHASIL */}
            
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<UserProfile />} />
          </Route>

          {/* GRUP 2: Rute Khusus Admin Hotel (DIPROTEKSI) */}
          <Route element={<AdminHotelProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/rooms" element={<RoomList />} />
              <Route path="/admin/rooms/create" element={<RoomCreate />} />
              <Route path="/admin/bookings" element={<BookingList />} />
            </Route>
          </Route>

          {/* GRUP 3: Rute Khusus Super Admin (DIPROTEKSI) */}
          <Route element={<SuperAdminProtectedRoute />}>
            <Route path="/super-admin" element={<SuperAdminLayout />}>
              <Route index element={<SuperAdminDashboard />} />
              <Route path="profile" element={<SuperAdminProfile />} /> 
              <Route path="users" element={<UserManagement />} />
              <Route path="hotels" element={<HotelMonitoring />} />
              <Route path="partners" element={<PartnerApproval />} />
              <Route path="warnings" element={<WarningManagement />} />
              <Route path="activity-logs" element={<ActivityLogs />} />
              <Route path="reports" element={<Reports />} />
            </Route>
          </Route>

          {/* Fallback jika route tidak ditemukan */}
          <Route path="*" element={<Navigate to="/" replace />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;