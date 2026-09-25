import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../../services/api";
import { cachedGet, invalidateCache } from "../../services/apiCache";
import toast from "react-hot-toast";

const SuperAdminHeader = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        setCurrentUser(JSON.parse(userStr));
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
    }
  }, [location]);

  const fetchNotifications = async () => {
    try {
      setLoadingNotif(true);
      const res = await cachedGet('/notifications', {}, true);
      const list = res.data?.data || res.data || [];
      if (Array.isArray(list)) {
        setNotifications(list);
        setUnreadCount(list.filter((n) => !n.is_read).length);
      }
    } catch (e) {
      console.error('Gagal mengambil notifikasi:', e);
    } finally {
      setLoadingNotif(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      invalidateCache('/notifications');
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      toast.success('Notifikasi ditandai dibaca.');
    } catch (e) {
      toast.error('Gagal memperbarui status notifikasi.');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      invalidateCache('/notifications');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success('Semua notifikasi telah dibaca.');
    } catch (e) {
      toast.error('Gagal memperbarui notifikasi.');
    }
  };

  const getPageTitle = () => {
    const pathname = location.pathname;
    if (pathname.includes("/users")) return "Manajemen User";
    if (pathname.includes("/hotels")) return "Manajemen Hotel";
    if (pathname.includes("/facilities")) return "Manajemen Fasilitas";
    if (pathname.includes("/master")) return "Master Data";
    if (pathname.includes("/bookings")) return "Manajemen Pesanan";
    if (pathname.includes("/reviews")) return "Manajemen Ulasan";
    if (pathname.includes("/transactions")) return "Transaksi";
    if (pathname.includes("/reports")) return "Laporan";
    if (pathname.includes("/profile")) return "Profile";
    return "Dashboard Overview";
  };

  return (
    <header className="bg-[#fcf9f5] h-16 border-b border-[#E5E1DA] flex justify-between items-center px-6 sm:px-8 z-40 shrink-0 font-['Hanken_Grotesk',sans-serif]">
      <div className="flex items-center gap-2">
        <button
          className="lg:hidden text-[#2D312C] hover:text-[#506147] transition-colors p-1 mr-1"
          aria-label="Open navigation menu"
          onClick={onMenuClick}
        >
          <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
            menu
          </span>
        </button>

        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 mr-3 pl-2 pr-3 h-9 rounded-lg text-[#506147] hover:bg-[#E4EBE0] hover:text-[#4A5D43] transition-colors border border-transparent hover:border-[#506147]/20 focus:outline-none"
          title="Kembali ke halaman utama"
        >
          <span className="material-symbols-outlined text-[20px] leading-none">
            arrow_back
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline">
            Homepage
          </span>
        </button>

        <span className="text-[#6B6E6A] text-xs font-semibold uppercase tracking-wider">
          Super Admin Portal
        </span>
        <span className="text-[#c4c8be]">/</span>
        <span className="text-[#2D312C] text-sm font-semibold">
          {getPageTitle()}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="text-[#6B6E6A] hover:text-[#506147] transition-colors p-2 rounded-full hover:bg-[#eae8e4] focus:outline-none relative"
            title="Notifikasi"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-[#ba1a1a] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-[#E5E1DA] rounded-xl shadow-xl z-50 overflow-hidden font-['Hanken_Grotesk',sans-serif]">
              <div className="px-4 py-3 bg-[#F9F6F1] border-b border-[#E5E1DA] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-[#2D312C]">Notifikasi</h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-[11px] font-bold">
                      {unreadCount} Baru
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-[#506147] hover:underline font-semibold"
                  >
                    Tandai Semua Dibaca
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#E5E1DA]">
                {loadingNotif ? (
                  <div className="p-6 text-center text-xs text-[#6B6E6A]">Memuat notifikasi...</div>
                ) : notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#6B6E6A]">Tidak ada notifikasi saat ini.</div>
                ) : (
                  notifications.map((n) => {
                    const isWarning = n.type === 'warning' || (n.title || '').toLowerCase().includes('peringatan');
                    const isLowRating = n.type === 'low_rating_alert';
                    return (
                      <div
                        key={n.id}
                        className={`p-3.5 transition-colors flex gap-3 ${
                          !n.is_read ? (isWarning || isLowRating ? 'bg-amber-50/60' : 'bg-[#F2EBE1]/40') : 'hover:bg-[#fcf9f5]'
                        }`}
                      >
                        <div className="shrink-0 mt-0.5">
                          {isLowRating ? (
                            <span className="w-8 h-8 rounded-full bg-amber-400 text-white flex items-center justify-center">
                              <span className="material-symbols-outlined text-[18px]">star_half</span>
                            </span>
                          ) : isWarning ? (
                            <span className="w-8 h-8 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center">
                              <span className="material-symbols-outlined text-[18px]">warning</span>
                            </span>
                          ) : (
                            <span className="w-8 h-8 rounded-full bg-[#E4EBE0] text-[#506147] flex items-center justify-center">
                              <span className="material-symbols-outlined text-[18px]">notifications</span>
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className={`text-xs font-semibold leading-snug ${isWarning || isLowRating ? 'text-amber-700' : 'text-[#2D312C]'}`}>
                              {n.title}
                            </p>
                            {!n.is_read && (
                              <button
                                onClick={() => handleMarkAsRead(n.id)}
                                className="text-[10px] text-[#506147] hover:underline font-semibold ml-2 shrink-0"
                                title="Tandai Dibaca"
                              >
                                Dibaca
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-[#6B6E6A] mt-1 whitespace-pre-wrap leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-[#6B6E6A]/70 mt-1">
                            {n.created_at ? new Date(n.created_at).toLocaleString('id-ID') : ''}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <Link
          to="/super-admin/profile"
          className="flex items-center gap-3 pl-3 border-l border-[#E5E1DA] hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-[#F2EBE1] border border-[#E5E1DA] text-[#506147] font-semibold text-xs flex items-center justify-center shadow-sm uppercase overflow-hidden">
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              currentUser?.name ? currentUser.name.slice(0, 2) : "SA"
            )}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-[#2D312C] leading-none">
              {currentUser?.name || "Super Admin"}
            </p>
            <p className="text-[10px] text-[#6B6E6A] leading-tight mt-0.5">
              {currentUser?.email || "superadmin@hleven.com"}
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default SuperAdminHeader;
