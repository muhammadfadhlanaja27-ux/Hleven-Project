import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Landing from './pages/dashboard/Landing';
import UserProfile from './pages/user/UserProfile'; // 1. Tambahkan import ini

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard Route */}
        <Route path="/dashboard" element={<Landing />} />
        
        {/* Profile Route */}
        <Route path="/profile" element={<UserProfile />} /> {/* 2. Tambahkan rute ini */}

        {/* Default route: root → landing page */}
        <Route path="/" element={<Landing />} />

        {/* Fallback: semua path tidak dikenal → /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;