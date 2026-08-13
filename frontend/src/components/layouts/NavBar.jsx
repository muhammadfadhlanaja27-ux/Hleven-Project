import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Ambil data user dari localStorage
  useEffect(() => {
    const checkUser = () => {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error("Failed to parse user data", e);
        }
      } else {
        setUser(null);
      }
    };

    checkUser();
    // Listening event jika ada perubahan storage
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setDropdownOpen(false);
    alert("Berhasil keluar.");
    navigate("/login");
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm relative z-50">
      {/* Brand Logo */}
      <Link to="/" className="text-2xl font-extrabold text-[var(--accent)] tracking-wide">
        H'Leven
      </Link>

      {/* Nav Menu Center */}
      <div className="hidden md:flex items-center space-x-6 text-sm font-semibold text-gray-700">
        <Link to="/" className="hover:text-[var(--accent)] transition-colors">Beranda</Link>
        <Link to="/hotels" className="hover:text-[var(--accent)] transition-colors">Jelajah Hotel</Link>
      </div>

      {/* Right Area (User / Auth) */}
      <div className="flex items-center gap-4">
        {user ? (
          /* Avatar & Dropdown saat User Login */
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 focus:outline-none cursor-pointer"
            >
              {user.avatar ? (
                <img
                  src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:8000/storage/${user.avatar}`}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-[var(--accent)]"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center border-2 border-blue-200">
                  {getInitial(user.name || user.first_name)}
                </div>
              )}
              <span className="hidden sm:inline font-semibold text-sm text-gray-800">
                {user.first_name || user.name?.split(" ")[0] || "User"}
              </span>
              <span className="text-xs text-gray-500">▼</span>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div 
                className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 text-left animate-in fade-in slide-in-from-top-2 duration-200"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-bold text-gray-900">{user.name || `${user.first_name || ''} ${user.last_name || ''}`}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  👤 Detail Profil Saya
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer border-t border-gray-100 mt-1"
                >
                  🚪 Keluar (Logout)
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Tombol Login / Register jika belum login */
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-gray-700 hover:text-[var(--accent)] px-3 py-2"
            >
              Masuk
            </Link>
            <Link
              to="/register"
              className="bg-[var(--accent)] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-all shadow-sm"
            >
              Daftar
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;