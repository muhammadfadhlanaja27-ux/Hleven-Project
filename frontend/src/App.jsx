import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Layout/NavBar';
import Footer from './components/Layout/Footer';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <Router>
      <div id="root">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            {/* Halaman lain untuk User (Login, Register, Detail Hotel, dll) akan ditambahkan di sini */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
