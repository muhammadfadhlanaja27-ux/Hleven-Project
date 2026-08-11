import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Landing from './pages/dashboard/Landing';
import UserProfile from './pages/user/UserProfile';

// Import Admin
import AdminLogin from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import RoomList from './pages/admin/RoomList';
import RoomCreate from './pages/admin/RoomCreate'; // ← Import baru
import BookingList from './pages/admin/BookingList'; // ← Import baru

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard Route */}
        <Route path="/dashboard" element={<Landing />} />

        {/* Profile Route */}
        <Route path="/profile" element={<UserProfile />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/rooms" element={<RoomList />} />
        <Route path="/admin/rooms/create" element={<RoomCreate />} /> {/* ← Rute baru */}
        <Route path="/admin/bookings" element={<BookingList />} /> {/* ← Rute baru */}

        {/* Default route: root → landing page */}
        <Route path="/" element={<Landing />} />

        {/* Fallback: semua path tidak dikenal → /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
