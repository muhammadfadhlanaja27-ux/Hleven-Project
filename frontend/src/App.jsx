import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Layout Components
import Navbar from './components/layout/NavBar';
import Footer from './components/layout/Footer';
import SuperAdminLayout from './layouts/SuperAdminLayout';

// User / Public Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Landing from './pages/dashboard/Landing';
import UserProfile from './pages/user/UserProfile';


// Admin Pages
import AdminLogin from './pages/auth/admin_hotel/login';
import Dashboard from './pages/auth/Dashboard';
import RoomList from './pages/auth/RoomList';
import RoomCreate from './pages/auth/RoomCreate';
import BookingList from './pages/auth/BookingList';
import HotelDetail from './Pages/HotelDetail';
import BookingPage from './Pages/BookingPage';


// Super Admin Pages
import UserManagement from './pages/UserManagement';
import SuperAdminLogin from './pages/SuperAdminLogin'; // Pastikan path import ini sesuai dengan lokasi file Anda

// ---------------------------------------------------------
// Layout Wrapper untuk Halaman Publik & Admin Hotel
// (Menjaga agar Navbar & Footer hanya muncul di sini)
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

// Placeholder untuk Halaman Super Admin yang belum dibuat
const SuperAdminDashboard = () => <div className="text-2xl font-bold">Dashboard Summary</div>;
const HotelMonitoring = () => <div className="text-2xl font-bold">Hotel Monitoring</div>;
const PartnerApproval = () => <div className="text-2xl font-bold">Partner Approval</div>;
const WarningManagement = () => <div className="text-2xl font-bold">Warning Management</div>;
const ActivityLogs = () => <div className="text-2xl font-bold">Activity Logs</div>;
const Reports = () => <div className="text-2xl font-bold">Reporting</div>;

function App() {
  return (
    <Router>
      <div id="root" className="flex flex-col min-h-screen">
        <Routes>
          
          {/* Rute Login Super Admin yang berdiri sendiri (Tanpa Navbar/Footer/Sidebar) */}
          <Route path="/super-admin/login" element={<SuperAdminLogin />} />

          {/* GRUP 1: Rute dengan Navbar & Footer Global */}
          <Route element={<MainLayout />}>
            {/* Public & User Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/hotels/:id" element={<HotelDetail />} />
            <Route path="/booking/:hotelId/:roomId" element={<BookingPage />} /> {/* <-- Route Booking */}
            <Route path="/dashboard" element={<Landing />} />
            <Route path="/profile" element={<UserProfile />} />

            {/* Admin Hotel Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/rooms" element={<RoomList />} />
            <Route path="/admin/rooms/create" element={<RoomCreate />} />
            <Route path="/admin/bookings" element={<BookingList />} />
          </Route>

          {/* GRUP 2: Rute Khusus Super Admin (Menggunakan Layout Sendiri) */}
          <Route path="/super-admin" element={<SuperAdminLayout />}>
            <Route index element={<SuperAdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="hotels" element={<HotelMonitoring />} />
            <Route path="partners" element={<PartnerApproval />} />
            <Route path="warnings" element={<WarningManagement />} />
            <Route path="activity-logs" element={<ActivityLogs />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* Fallback: Redirect ke /login jika path tidak ditemukan */}
          <Route path="*" element={<Navigate to="/login" replace />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;