import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const checkUser = () => {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error("Gagal membaca data user:", e);
        }
      } else {
        setUser(null);
      }
    };

    checkUser();
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setDropdownOpen(false);
    window.dispatchEvent(new Event("storage"));
    alert("Berhasil keluar.");
    navigate("/login");
  };

  const getAvatarUrl = () => {
    if (!user) return DEFAULT_AVATAR;
    const avatarPath = user.avatar || user.avatar_url || user.avatarPreview;
    if (!avatarPath) return DEFAULT_AVATAR;
    if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://") || avatarPath.startsWith("data:") || avatarPath.startsWith("blob:")) {
      return avatarPath;
    }
    return `http://localhost:8000/storage/${avatarPath.replace(/^\//, "")}`;
  };

  const getUserName = () => {
    if (!user) return "User";
    if (user.first_name) return user.first_name;
    if (user.name) return user.name.split(" ")[0];
    return "User";
  };

  return (
    <header className="w-full sticky top-0 bg-[#FDF6ED] border-b border-[#DCCFC0]/30 shadow-sm shadow-[#778873]/5 z-50">
      <div className="flex justify-between items-center w-full px-4 md:px-10 py-4 max-w-[1280px] mx-auto">
        {/* Brand Logo */}
        <Link to="/" className="text-2xl font-bold font-headline-md text-[#778873] tracking-wide">
          H'Leven
        </Link>

        {/* Nav Menu Center */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#444842]">
          <Link to="/" className="hover:text-[#778873] hover:bg-[#DCCFC0]/10 px-3 py-1.5 rounded-lg transition-colors">
            Beranda
          </Link>
          <Link to="/hotels" className="hover:text-[#778873] hover:bg-[#DCCFC0]/10 px-3 py-1.5 rounded-lg transition-colors">
            Hotels
          </Link>
        </nav>

        {/* Right Area (User / Auth) */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 focus:outline-none cursor-pointer p-1 rounded-full hover:bg-[#DCCFC0]/20 transition-colors"
              >
                <img
                  src={getAvatarUrl()}
                  alt="Profile"
                  className="w-9 h-9 rounded-full object-cover border-2 border-[#778873]/40 shadow-xs"
                  onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                />
                <span className="hidden sm:inline font-semibold text-sm text-[#1e1b16]">
                  {getUserName()}
                </span>
                <span className="text-xs text-[#747871]">▼</span>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-3 w-56 bg-[#fff8f0] rounded-2xl shadow-xl border border-[#DCCFC0]/50 py-2 text-left animate-in fade-in duration-200 z-50"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="px-4 py-3 border-b border-[#DCCFC0]/30">
                    <p className="text-sm font-bold text-[#1e1b16]">
                      {user.name || `${user.first_name || ""} ${user.last_name || ""}`.trim()}
                    </p>
                    <p className="text-xs text-[#444842] truncate">{user.email}</p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#1e1b16] hover:bg-[#FDF6ED] transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg text-[#778873]">person</span>
                    Detail Profil Saya
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#ba1a1a] hover:bg-[#ffdad6]/20 transition-colors cursor-pointer border-t border-[#DCCFC0]/30 mt-1"
                  >
                    <span className="material-symbols-outlined text-lg text-[#ba1a1a]">logout</span>
                    Keluar (Logout)
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-semibold text-[#444842] hover:text-[#778873] px-3 py-2"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="bg-[#778873] text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-[#50604d] transition-all shadow-sm"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;