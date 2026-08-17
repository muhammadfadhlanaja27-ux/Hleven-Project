import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Layout Components
import Navbar from "./components/layouts/NavBar";
import Footer from "./components/layouts/Footer";
import SuperAdminLayout from "./components/super-admin/SuperAdminLayout";
import AdminHotelLayout from "./components/layouts/AdminHotelLayout";

// User / Public Pages
import LandingPage from "./pages/user/LandingPage";
import Login from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register";
import UserProfile from "./pages/user/UserProfile";
import HotelDetail from "./pages/user/HotelDetail";
import BookingPage from "./pages/user/BookingPage";

// Admin Hotel pages
import AdminLogin from "./pages/auth/admin-hotel/AdminLogin";
import Dashboard from "./pages/admin-hotel/Dashboard";
import RoomList from "./pages/admin-hotel/RoomList";
import RoomCreate from "./pages/admin-hotel/RoomCreate";
import BookingList from "./pages/admin-hotel/BookingList";

// Super Admin pages
import SuperAdminLogin from "./pages/auth/super-admin/SuperAdminLogin";
import SuperAdminDashboard from "./pages/super-admin/SuperAdminDashboard";
import UserManagement from "./pages/super-admin/UserManagement";
import HotelMonitoring from "./pages/super-admin/HotelMonitoring";
import PartnerApproval from "./pages/super-admin/PartnerApproval";
import WarningManagement from "./pages/super-admin/WarningManagement";
import ActivityLogs from "./pages/super-admin/ActivityLogs";
import Reports from "./pages/super-admin/Reports";
import SuperAdminProfile from "./pages/super-admin/SuperAdminProfile";

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
// 2. SATPAM AMAN: Protected Route untuk Admin Hotel (Hanya 1 buah)
// ---------------------------------------------------------
const AdminHotelProtectedRoute = () => {
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");

  if (!token || !userString) {
    return <Navigate to="/super-admin/login" replace />;
  }

  try {
    const user = JSON.parse(userString);
    if (user.role !== "admin_hotel" && user.role !== "super_admin") {
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
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");

  if (
    !token ||
    !userString ||
    userString === "undefined" ||
    userString === "null"
  ) {
    return <Navigate to="/super-admin/login" replace />;
  }

  try {
    const user = JSON.parse(userString);
    if (user.role !== "super_admin") {
      return <Navigate to="/super-admin/login" replace />;
    }
  } catch (e) {
    localStorage.clear();
    return <Navigate to="/super-admin/login" replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <Router>
      <div id="root" className="flex flex-col min-h-screen">
        <Toaster position="top-right" />
        <Routes>
          {/* Rute Login Khusus Admin (Bebas Diakses) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/super-admin/login" element={<SuperAdminLogin />} />

          {/* GRUP 1: Rute Publik & User */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/hotels/:id" element={<HotelDetail />} />

            {/* 🟢 SUDAH DIPERBAIKI: Menggunakan parameter :hotelId dan :roomId */}
            <Route path="/booking/:hotelId/:roomId" element={<BookingPage />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<UserProfile />} />
          </Route>

          {/* GRUP 2: Rute Admin Hotel */}
          <Route element={<AdminHotelProtectedRoute />}>
            <Route element={<AdminHotelLayout />}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/rooms" element={<RoomList />} />
              <Route path="/admin/rooms/create" element={<RoomCreate />} />
              <Route path="/admin/bookings" element={<BookingList />} />
            </Route>
          </Route>

          {/* GRUP 3: Rute Khusus Super Admin */}
          <Route element={<SuperAdminProtectedRoute />}>
            <Route path="/super-admin" element={<SuperAdminLayout />}>
              {/* Tambahkan baris di bawah ini agar otomatis redirect ke dashboard */}
              <Route index element={<Navigate to="dashboard" replace />} />

              <Route path="dashboard" element={<SuperAdminDashboard />} />
              <Route path="profile" element={<SuperAdminProfile />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="hotels" element={<HotelMonitoring />} />
              <Route path="partners" element={<PartnerApproval />} />
              <Route path="warnings" element={<WarningManagement />} />
              <Route path="activity-logs" element={<ActivityLogs />} />
              <Route path="reports" element={<Reports />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
