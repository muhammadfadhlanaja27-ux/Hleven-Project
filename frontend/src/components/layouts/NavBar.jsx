import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AVATAR_COLORS = [
  ["#778873", "#50604d"],
  ["#615b54", "#4b463f"],
  ["#7a7369", "#625b54"],
  ["#677967", "#4f604f"],
  ["#4e644b", "#354d33"],
  ["#8a7e6f", "#615b54"],
];

const pickAvatarPalette = (seed) => {
  if (!seed) return AVATAR_COLORS[0];
  let sum = 0;
  for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
};

const generateInitialAvatar = (initial, seed) => {
  const [c1, c2] = pickAvatarPalette(seed);
  const safeInitial = (initial || "U").slice(0, 1).toUpperCase();
  const hex = (s) => s.replace(/#/g, "%23");
  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${hex(c1)}"/><stop offset="100%" stop-color="${hex(c2)}"/></linearGradient></defs><rect width="48" height="48" rx="24" fill="url(#g)"/><text x="24" y="30.5" text-anchor="middle" font-family="Hanken Grotesk,Arial,sans-serif" font-size="20" font-weight="700" fill="white">${safeInitial}</text></svg>`
    )
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [avatarErrored, setAvatarErrored] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const checkUser = () => {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error("Gagal membaca data user:", e);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setAvatarErrored(false);
    };

    checkUser();
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, []);

  const handleConfirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setDropdownOpen(false);
    setShowLogoutModal(false);
    window.dispatchEvent(new Event("storage"));
    toast.success("Berhasil keluar dari akun.");
    navigate("/login");
  };

  const getAvatarUrl = () => {
    if (!user) return null;
    const avatarPath = user.avatar || user.avatar_url || user.avatarPreview;
    if (!avatarPath) return null;
    if (
      avatarPath.startsWith("http://") ||
      avatarPath.startsWith("https://") ||
      avatarPath.startsWith("data:") ||
      avatarPath.startsWith("blob:")
    ) {
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

  const getFullName = () => {
    if (!user) return "User H'Leven";
    const full = user.name || `${user.first_name || ""} ${user.last_name || ""}`.trim();
    return full || user.email || "User H'Leven";
  };

  const getUserInitial = () => {
    if (!user) return "U";
    const fullName = user.name || `${user.first_name || ""} ${user.last_name || ""}`.trim();
    const word = fullName || user.email || "U";
    return word.charAt(0).toUpperCase();
  };

  const avatarSrc = useMemo(() => getAvatarUrl(), [user]);
  const initialAvatar = useMemo(
    () => generateInitialAvatar(getUserInitial(), user?.email || user?.name || user?.id || ""),
    [user]
  );
  const finalAvatar = avatarSrc && !avatarErrored ? avatarSrc : initialAvatar;
  const userRoleLabel = (() => {
    if (!user?.role) return null;
    if (user.role === "admin_hotel") return "Admin Hotel";
    if (user.role === "super_admin") return "Super Admin";
    if (user.role === "user") return null;
    return user.role;
  })();

  const dropdownRef = useRef(null);
  useEffect(() => {
    if (!dropdownOpen) return undefined;
    const handler = (evt) => {
      if (dropdownRef.current && !dropdownRef.current.contains(evt.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  return (
    <>
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
            <Link to="/mitra" className="hover:text-[#778873] hover:bg-[#DCCFC0]/10 px-3 py-1.5 rounded-lg transition-colors">
              Mitra Hotel
            </Link>
          </nav>

          {/* Right Area (User / Auth) */}
          <div className="flex items-center gap-3 md:gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Tombol Khusus Admin / Super Admin */}
                {(user.role === "admin_hotel" || user.role === "super_admin") && (
                  <Link
                    to={user.role === "super_admin" ? "/super-admin/dashboard" : "/admin/dashboard"}
                    className="hidden md:flex items-center gap-1.5 bg-[#778873] text-white px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold hover:bg-[#50604d] transition-all shadow-sm active:scale-95"
                    title="Buka Dashboard Admin"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {user.role === "super_admin" ? "admin_panel_settings" : "dashboard"}
                    </span>
                    <span>
                      {user.role === "super_admin" ? "Super Admin" : "Admin Panel"}
                    </span>
                  </Link>
                )}

                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2.5 focus:outline-none cursor-pointer pl-1 pr-3 py-1 rounded-full hover:bg-[#DCCFC0]/20 transition-colors border border-transparent hover:border-[#DCCFC0]/60"
                  >
                    <img
                      src={finalAvatar}
                      alt={`Foto profil ${getFullName()}`}
                      className="w-9 h-9 rounded-full object-cover border-2 border-[#778873]/30 shadow-sm bg-[#e5e2dd]"
                      loading="lazy"
                      onError={() => setAvatarErrored(true)}
                    />
                    <span className="hidden sm:flex flex-col items-start leading-tight">
                      <span className="font-semibold text-sm text-[#1e1b16]">
                        {getUserName()}
                      </span>
                      {userRoleLabel && (
                        <span className="font-label-sm text-[10px] font-bold tracking-wider uppercase text-[#778873]">
                          {userRoleLabel}
                        </span>
                      )}
                    </span>
                    <span
                      className="material-symbols-outlined text-[16px] text-[#747871] transition-transform"
                      style={{ transform: dropdownOpen ? "rotate(180deg)" : "none" }}
                    >
                      expand_more
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-3 w-[280px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-[#DCCFC0]/50 py-2 text-left animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                      <div className="px-5 py-4 border-b border-[#DCCFC0]/30 flex items-center gap-3 bg-[#FDF6ED]/60 rounded-t-2xl">
                        <img
                          src={finalAvatar}
                          alt="avatar"
                          className="w-12 h-12 rounded-full object-cover border-2 border-[#778873]/30 bg-[#e5e2dd]"
                          onError={() => setAvatarErrored(true)}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-[#1e1b16] truncate">
                            {getFullName()}
                          </p>
                          <p className="text-xs text-[#444842] truncate">{user.email}</p>
                          {userRoleLabel && (
                            <span className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-[#d5e8cf]/50 text-[#3b4b39] border border-[#baccb4]/60">
                              {userRoleLabel}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Menu Admin di Dropdown */}
                      {(user.role === "admin_hotel" || user.role === "super_admin") && (
                        <>
                          <Link
                            to={user.role === "super_admin" ? "/super-admin/dashboard" : "/admin/dashboard"}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-5 py-3 text-sm font-semibold text-[#50604d] hover:bg-[#d5e8cf]/20 transition-colors border-b border-[#DCCFC0]/20"
                          >
                            <span className="w-8 h-8 rounded-lg bg-[#d5e8cf]/50 flex items-center justify-center">
                              <span className="material-symbols-outlined text-[18px] text-[#50604d]">
                                {user.role === "super_admin" ? "admin_panel_settings" : "dashboard"}
                              </span>
                            </span>
                            <div className="flex flex-col">
                              <span>{user.role === "super_admin" ? "Dashboard Super Admin" : "Dashboard Admin Hotel"}</span>
                              <span className="text-[11px] font-normal text-[#747871]">Kelola operasional hotel</span>
                            </div>
                          </Link>
                          <div className="md:hidden">
                            <Link
                              to={user.role === "super_admin" ? "/super-admin/dashboard" : "/admin/dashboard"}
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-5 py-3 text-sm font-semibold text-[#50604d] hover:bg-[#d5e8cf]/20 transition-colors border-b border-[#DCCFC0]/20"
                            >
                              <span className="w-8 h-8 rounded-lg bg-[#d5e8cf]/50 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[18px] text-[#50604d]">
                                  {user.role === "super_admin" ? "admin_panel_settings" : "dashboard"}
                                </span>
                              </span>
                              <span>Buka Admin Panel</span>
                            </Link>
                          </div>
                        </>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-5 py-3 text-sm text-[#1e1b16] hover:bg-[#FDF6ED] transition-colors"
                      >
                        <span className="w-8 h-8 rounded-lg bg-[#eae1d8]/50 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[18px] text-[#615b54]">person</span>
                        </span>
                        <div className="flex flex-col">
                          <span className="font-semibold">Detail Profil Saya</span>
                          <span className="text-[11px] font-normal text-[#747871]">Ubah data &amp; avatar</span>
                        </div>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          setShowLogoutModal(true);
                        }}
                        className="w-full text-left flex items-center gap-2.5 px-5 py-3 text-sm text-[#ba1a1a] hover:bg-[#ffdad6]/15 transition-colors cursor-pointer border-t border-[#DCCFC0]/30 mt-1 rounded-b-2xl"
                      >
                        <span className="w-8 h-8 rounded-lg bg-[#ffdad6]/30 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[18px] text-[#ba1a1a]">logout</span>
                        </span>
                        <div className="flex flex-col">
                          <span className="font-bold">Keluar (Logout)</span>
                          <span className="text-[11px] font-normal text-[#ba1a1a]/70">Akhiri sesi Anda</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 md:gap-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-[#444842] hover:text-[#778873] px-3 md:px-4 py-2 rounded-lg hover:bg-[#DCCFC0]/10 transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="bg-[#778873] text-white text-sm font-semibold px-4 md:px-5 py-2 rounded-xl hover:bg-[#50604d] transition-all shadow-sm active:scale-[0.98] flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px] hidden sm:inline">person_add</span>
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MODAL KONFIRMASI LOGOUT KUSTOM */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1e1b16]/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-[#DCCFC0]/60 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">logout</span>
            </div>
            <div>
              <h3 className="font-headline-md text-lg font-bold text-[#2D332C]">Konfirmasi Keluar</h3>
              <p className="font-body-md text-xs text-[#444842] mt-1">Apakah Anda yakin ingin keluar dari akun H'Leven Anda?</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 border border-[#DCCFC0] rounded-xl font-label-md text-xs font-semibold text-[#444842] hover:bg-[#DCCFC0]/20 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="flex-1 py-2.5 bg-[#ba1a1a] text-white rounded-xl font-label-md text-xs font-semibold hover:bg-[#93000a] transition-colors shadow-xs cursor-pointer"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;