import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout Components
import Navbar from './components/layout/NavBar';
import Footer from './components/layout/Footer';

// User / Public Pages
import LandingPage from './pages/LandingPage'; // Menggunakan LandingPage terbaru Anda
import Login from './pages/auth/admin_hotel/login';
import Register from './pages/auth/Register';
import Landing from './pages/dashboard/Landing'; // Jika ini berbeda dengan LandingPage, tetap dipertahankan
import UserProfile from './pages/user/UserProfile';

// Admin Pages
import AdminLogin from './pages/auth/admin_hotel/login';
import Dashboard from './pages/auth/Dashboard';
import RoomList from './pages/auth/RoomList';
import RoomCreate from './pages/auth/RoomCreate';
import BookingList from './pages/auth/BookingList';

function App() {
  return (
    <Router>
      <div id="root" className="flex flex-col min-h-screen">
        {/* Navbar akan muncul di semua halaman */}
        <Navbar /> 

        {/* Konten utama aplikasi */}
        <main className="flex-grow">
          <Routes>
            {/* Public & User Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Landing />} />
            <Route path="/profile" element={<UserProfile />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/rooms" element={<RoomList />} />
            <Route path="/admin/rooms/create" element={<RoomCreate />} />
            <Route path="/admin/bookings" element={<BookingList />} />

            {/* Fallback: semua path tidak dikenal → /login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>

        {/* Footer akan muncul di semua halaman */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
