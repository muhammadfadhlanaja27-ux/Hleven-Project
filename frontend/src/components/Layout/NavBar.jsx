import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <header className="border-b border-[var(--border)] py-4 px-6 flex justify-between items-center bg-[var(--bg)] sticky top-0 z-50">
      <Link to="/" className="text-2xl font-bold tracking-tight text-[var(--text-h)]">
        H'<span className="text-[var(--accent)]">Leven</span>
      </Link>
      <nav className="flex items-center gap-6">
        <Link to="/" className="text-sm font-medium hover:text-[var(--text-h)] transition">
          Beranda
        </Link>
        <Link to="/login" className="text-sm font-medium px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--accent-bg)] transition">
          Masuk
        </Link>
        <Link to="/register" className="text-sm font-medium px-4 py-2 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition">
          Daftar
        </Link>
      </nav>
    </header>
  );
};

export default Navbar;