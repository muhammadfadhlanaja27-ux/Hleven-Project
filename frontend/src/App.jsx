import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/NavBar';
import Footer from './components/layout/Footer';
import LandingPage from './pages/LandingPage';
import Login from './Pages/Auth/Login';
import Register from './Pages/Auth/Register';
import HotelDetail from './Pages/HotelDetail';
import BookingPage from './Pages/BookingPage';
function App() {
  return (
    <Router>
      <div id="root">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/hotels/:id" element={<HotelDetail />} />
            <Route path="/booking/:hotelId/:roomId" element={<BookingPage />} /> {/* <-- Route Booking */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;