import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import { getPublicImageUrl } from "../../services/imageHelper";

import { getStorageUrl } from "../../services/imageUrl";

const AVATAR_COLORS = [
  ["#5F7161", "#4D5E4F"],
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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [avatarErrored, setAvatarErrored] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const notificationRef = useRef(null);

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
    return getStorageUrl(avatarPath);
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

  useEffect(() => {
    if (user?.role !== "user") {
      setUnreadNotifications([]);
      setUnreadCount(0);
      return undefined;
    }

    let active = true;
    const fetchUnreadNotifications = async (showLoading = false) => {
      if (showLoading && active) setNotificationsLoading(true);
      try {
        const response = await api.get("/notifications", {
          params: { is_read: false },
        });
        if (!active) return;
        const notifications = response.data?.data || [];
        setUnreadNotifications(Array.isArray(notifications) ? notifications : []);
        setUnreadCount(Number(response.data?.meta?.total ?? notifications.length));
      } catch (error) {
        if (active) console.warn("Gagal memuat notifikasi:", error);
      } finally {
        if (showLoading && active) setNotificationsLoading(false);
      }
    };

    fetchUnreadNotifications(true);
    const intervalId = setInterval(() => fetchUnreadNotifications(), 30000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (!notificationsOpen) return undefined;
    const handler = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notificationsOpen]);

  const openNotification = async (notification) => {
    if (!notification.is_read) {
      try {
        await api.patch(`/notifications/${notification.id}/read`);
        setUnreadNotifications((current) =>
          current.filter((item) => item.id !== notification.id)
        );
        setUnreadCount((current) => Math.max(0, current - 1));
      } catch (error) {
        console.error("Gagal menandai notifikasi dibaca:", error);
        toast.error("Notifikasi gagal diperbarui.");
        return;
      }
    }

    setNotificationsOpen(false);
    navigate("/profile", { state: { defaultTab: "notifications" } });
  };

  return (
    <>
      <header className="w-full sticky top-0 bg-[#FDF6ED] border-b border-[#DCCFC0]/30 shadow-sm shadow-[#5F7161]/5 z-50">
        <div className="flex justify-between items-center w-full px-4 md:px-10 py-4 max-w-[1280px] mx-auto">
          {/* Brand Logo */}
          <Link to="/" className="text-2xl font-bold font-headline-md text-[#5F7161] tracking-wide">
            H'Leven
          </Link>

          {/* Nav Menu Center */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#444842]">
            <Link to="/" className="hover:text-[#5F7161] hover:bg-[#DCCFC0]/10 px-3 py-1.5 rounded-lg transition-colors">
              Beranda
            </Link>
            <Link to="/hotels" className="hover:text-[#5F7161] hover:bg-[#DCCFC0]/10 px-3 py-1.5 rounded-lg transition-colors">
              Hotels
            </Link>
            <Link to="/mitra" className="hover:text-[#5F7161] hover:bg-[#DCCFC0]/10 px-3 py-1.5 rounded-lg transition-colors">
              Mitra Hotel
            </Link>
          </nav>

          {/* Right Area (User / Auth) */}
          <div className="flex items-center gap-3 md:gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Tombol Khusus Admin / Super Admin (Disamakan dengan tombol Lihat Detail) */}
                {(user.role === "admin_hotel" || user.role === "super_admin") && (
                  <Link
                    to={user.role === "super_admin" ? "/super-admin/dashboard" : "/admin/dashboard"}
                    className="hidden md:flex items-center gap-1.5 bg-[#5F7161] text-white px-4 py-2 rounded-xl text-xs md:text-sm font-semibold hover:bg-[#4D5E4F] transition-all shadow-sm shadow-[#5F7161]/20 active:scale-95 cursor-pointer"
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

                {user.role === "user" && (
                  <div className="relative" ref={notificationRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setNotificationsOpen((open) => !open);
                        setDropdownOpen(false);
                      }}
                      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#DCCFC0]/60 text-[#5F7161] transition-colors hover:bg-[#DCCFC0]/20"
                      aria-label={unreadCount > 0 ? `Notifikasi, ${unreadCount} belum dibaca` : "Notifikasi"}
                      aria-expanded={notificationsOpen}
                      title="Notifikasi"
                    >
                      <span className="material-symbols-outlined text-[22px]">notifications</span>
                      {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#ba1a1a] px-1 text-[10px] font-bold leading-none text-white">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </button>

                    {notificationsOpen && (
                      <div className="absolute right-0 z-50 mt-3 w-[min(90vw,360px)] overflow-hidden rounded-2xl border border-[#DCCFC0]/50 bg-white text-left shadow-[0_10px_40px_rgba(0,0,0,0.12)]">
                        <div className="flex items-center justify-between border-b border-[#DCCFC0]/30 bg-[#FDF6ED]/60 px-4 py-3">
                          <h2 className="text-sm font-bold text-[#2D332C]">Notifikasi</h2>
                          {unreadCount > 0 && (
                            <span className="text-xs font-semibold text-[#778873]">
                              {unreadCount} belum dibaca
                            </span>
                          )}
                        </div>

                        {notificationsLoading ? (
                          <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-[#747871]">
                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                            Memuat notifikasi...
                          </div>
                        ) : unreadNotifications.length === 0 ? (
                          <p className="px-4 py-8 text-center text-sm text-[#747871]">
                            Tidak ada notifikasi baru.
                          </p>
                        ) : (
                          <div className="max-h-[min(60vh,380px)] overflow-y-auto">
                            {unreadNotifications.slice(0, 5).map((notification) => (
                              <button
                                type="button"
                                key={notification.id}
                                onClick={() => openNotification(notification)}
                                className="flex w-full items-start gap-3 border-b border-[#DCCFC0]/20 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[#FDF6ED]"
                              >
                                <span className="material-symbols-outlined mt-0.5 text-[19px] text-[#778873]">
                                  {notification.type === "purchase"
                                    ? "payments"
                                    : notification.type === "refund"
                                    ? "currency_exchange"
                                    : notification.type === "review_request"
                                    ? "rate_review"
                                    : "notifications"}
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-sm font-semibold text-[#2D332C]">
                                    {notification.title}
                                  </span>
                                  <span className="mt-0.5 line-clamp-2 block text-xs text-[#5b6058]">
                                    {notification.message}
                                  </span>
                                </span>
                                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#ba1a1a]" />
                              </button>
                            ))}
                          </div>
                        )}

                        <Link
                          to="/profile"
                          state={{ defaultTab: "notifications" }}
                          onClick={() => setNotificationsOpen(false)}
                          className="block border-t border-[#DCCFC0]/30 px-4 py-3 text-center text-xs font-bold text-[#5F7161] transition-colors hover:bg-[#FDF6ED]"
                        >
                          Lihat semua notifikasi
                        </Link>
                      </div>
                    )}
                  </div>
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
                      className="w-9 h-9 rounded-full object-cover border-2 border-[#5F7161]/30 shadow-sm bg-[#e5e2dd]"
                      loading="lazy"
                      onError={() => setAvatarErrored(true)}
                    />
                    <span className="hidden sm:flex flex-col items-start leading-tight">
                      <span className="font-semibold text-sm text-[#1e1b16]">
                        {getUserName()}
                      </span>
                      {userRoleLabel && (
                        <span className="font-label-sm text-[10px] font-bold tracking-wider uppercase text-[#5F7161]">
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
                          className="w-12 h-12 rounded-full object-cover border-2 border-[#5F7161]/30 bg-[#e5e2dd]"
                          onError={() => setAvatarErrored(true)}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-[#1e1b16] truncate">
                            {getFullName()}
                          </p>
                          <p className="text-xs text-[#444842] truncate">{user.email}</p>
                          {userRoleLabel && (
                            <span className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-[#E8EFE9] text-[#4D5E4F] border border-[#C5D7C7]">
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
                            className="flex items-center gap-2.5 px-5 py-3 text-sm font-semibold text-[#4D5E4F] hover:bg-[#E8EFE9]/40 transition-colors border-b border-[#DCCFC0]/20"
                          >
                            <span className="w-8 h-8 rounded-lg bg-[#E8EFE9] flex items-center justify-center">
                              <span className="material-symbols-outlined text-[18px] text-[#5F7161]">
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
                              className="flex items-center gap-2.5 px-5 py-3 text-sm font-semibold text-[#4D5E4F] hover:bg-[#E8EFE9]/40 transition-colors border-b border-[#DCCFC0]/20"
                            >
                              <span className="w-8 h-8 rounded-lg bg-[#E8EFE9] flex items-center justify-center">
                                <span className="material-symbols-outlined text-[18px] text-[#5F7161]">
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
                  className="text-sm font-semibold text-[#444842] hover:text-[#5F7161] px-3 md:px-4 py-2 rounded-lg hover:bg-[#DCCFC0]/10 transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="bg-[#5F7161] text-white text-sm font-semibold px-4 md:px-5 py-2 rounded-xl hover:bg-[#4D5E4F] transition-all shadow-sm shadow-[#5F7161]/20 active:scale-[0.98] flex items-center gap-1.5"
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