import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import { cachedGet } from "../../services/apiCache";

const QR_CODE_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
      <rect width='200' height='200' fill='white'/>
      <g fill='#1e1b16'>
        <rect x='20' y='20' width='50' height='50'/>
        <rect x='130' y='20' width='50' height='50'/>
        <rect x='20' y='130' width='50' height='50'/>
        <rect x='30' y='30' width='10' height='10' fill='white'/>
        <rect x='140' y='30' width='10' height='10' fill='white'/>
        <rect x='30' y='140' width='10' height='10' fill='white'/>
        <rect x='80' y='20' width='10' height='10'/>
        <rect x='100' y='30' width='10' height='10'/>
        <rect x='20' y='80' width='10' height='10'/>
        <rect x='40' y='100' width='10' height='10'/>
        <rect x='60' y='80' width='10' height='10'/>
        <rect x='80' y='100' width='10' height='10'/>
        <rect x='100' y='80' width='10' height='10'/>
        <rect x='120' y='90' width='10' height='10'/>
        <rect x='140' y='100' width='10' height='10'/>
        <rect x='160' y='80' width='10' height='10'/>
        <rect x='180' y='100' width='10' height='10'/>
        <rect x='80' y='120' width='10' height='10'/>
        <rect x='100' y='140' width='10' height='10'/>
        <rect x='120' y='130' width='10' height='10'/>
        <rect x='140' y='150' width='10' height='10'/>
        <rect x='160' y='140' width='10' height='10'/>
        <rect x='100' y='160' width='10' height='10'/>
        <rect x='120' y='180' width='10' height='10'/>
      </g>
    </svg>
  `);

const BookingHistory = () => {
  const navigate = useNavigate();

  // Component States
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All"); // 'All' | 'Paid' | 'Checked Out' | 'Cancelled'
  const [sortBy, setSortBy] = useState("newest"); // 'newest' | 'oldest' | 'price_high'
  const [selectedBooking, setSelectedBooking] = useState(null); // For E-Ticket Modal
  const [user, setUser] = useState(null);

  // Cancellation & Refund Modal States (Phase 1)
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  // Load User & Fetch API Bookings
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Gagal membaca user:", e);
      }
    }

    fetchApiBookings();
  }, []);

  const fetchApiBookings = async (forceRefresh = false) => {
    setBookingsLoading(true);
    try {
      const TTL_30DETIK = 30 * 1000;
      const { data: responseData, fromCache } = await cachedGet(
        "/user/bookings",
        {},
        forceRefresh,
        TTL_30DETIK
      );
      const result = responseData?.data || responseData || [];
      setBookings(Array.isArray(result) ? result : []);
      if (fromCache) {
        console.debug("[Cache Hit] BookingHistory loaded from cache (30s TTL)");
      }
    } catch (err) {
      console.warn("Gagal memuat riwayat pemesanan:", err);
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleProcessCancelOrRefund = async () => {
    if (!cancelModalBooking) return;
    setIsSubmittingCancel(true);

    try {
      const res = await api.post(`/user/bookings/${cancelModalBooking.id}/cancel`, {
        reason: cancelReason,
      });

      toast.success(res.data?.message || "Permintaan pembatalan berhasil diproses.");
      setCancelModalBooking(null);
      setCancelReason("");
      fetchApiBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal memproses pembatalan.");
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  // Filter & Sort Logic
  const filteredBookings = useMemo(() => {
    let result = [...bookings];

    if (filterStatus !== "All") {
      if (filterStatus === "Upcoming") {
        result = result.filter((b) => ["Paid", "paid", "confirmed", "Dikonfirmasi"].includes(b.status));
      } else if (filterStatus === "Pending") {
        result = result.filter((b) => b.status === "pending");
      } else if (filterStatus === "Past") {
        result = result.filter((b) => ["Checked Out", "Selesai", "completed"].includes(b.status));
      } else if (filterStatus === "Cancelled") {
        result = result.filter((b) =>
          ["Cancelled", "Dibatalkan", "cancelled_by_user", "cancelled_by_system", "refund_pending"].includes(b.status)
        );
      }
    }

    if (sortBy === "newest") {
      result.reverse();
    } else if (sortBy === "price_high") {
      result.sort((a, b) => Number(b.total_price || 0) - Number(a.total_price || 0));
    }

    return result;
  }, [bookings, filterStatus, sortBy]);

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("storage"));
      navigate("/login");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <div className="bg-[#FFF0E0] backdrop-blur-sm border border-[#9B5235]/30 px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#9B5235]"></span>
            <span className="font-label-sm text-xs text-[#9B5235] font-bold uppercase tracking-wider">
              Menunggu Bayar
            </span>
          </div>
        );
      case "Paid":
      case "paid":
      case "confirmed":
      case "Dikonfirmasi":
        return (
          <div className="bg-[#4F6F52]/10 backdrop-blur-sm border border-[#4F6F52]/20 px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4F6F52]"></span>
            <span className="font-label-sm text-xs text-[#4F6F52] font-bold uppercase tracking-wider">
              Paid / Dikonfirmasi
            </span>
          </div>
        );
      case "refund_pending":
        return (
          <div className="bg-[#E0F2FE] backdrop-blur-sm border border-[#0369A1]/30 px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0369A1]"></span>
            <span className="font-label-sm text-xs text-[#0369A1] font-bold uppercase tracking-wider">
              Proses Refund
            </span>
          </div>
        );
      case "Checked Out":
      case "Selesai":
      case "completed":
        return (
          <div className="bg-[#645b4f]/10 backdrop-blur-sm border border-[#645b4f]/30 px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#645b4f]"></span>
            <span className="font-label-sm text-xs text-[#645b4f] font-bold uppercase tracking-wider">
              Checked Out
            </span>
          </div>
        );
      case "cancelled_by_system":
        return (
          <div className="bg-[#ffdad6]/80 backdrop-blur-sm border border-[#ba1a1a]/20 px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
            <span className="font-label-sm text-xs text-[#ba1a1a] font-bold uppercase tracking-wider">
              Kedaluwarsa (Sistem)
            </span>
          </div>
        );
      case "Cancelled":
      case "Dibatalkan":
      case "cancelled_by_user":
        return (
          <div className="bg-[#ffdad6]/80 backdrop-blur-sm border border-[#ba1a1a]/20 px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
            <span className="font-label-sm text-xs text-[#ba1a1a] font-bold uppercase tracking-wider">
              Dibatalkan
            </span>
          </div>
        );
      default:
        return (
          <div className="bg-[#778873]/10 backdrop-blur-sm border border-[#778873]/20 px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#778873]"></span>
            <span className="font-label-sm text-xs text-[#778873] font-bold uppercase tracking-wider">
              {status}
            </span>
          </div>
        );
    }
  };

  const getInitialUser = () => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  };
  const initialUser = getInitialUser();
  const initialRole = initialUser?.role || "user";
  const isAdminOrSuperAdmin =
    initialRole === "admin_hotel" || initialRole === "super_admin";

  const getAvatarUrl = () => {
    const a = initialUser?.avatar || initialUser?.avatar_url || initialUser?.avatarPreview;
    if (!a) return null;
    if (a.startsWith("http://") || a.startsWith("https://") || a.startsWith("data:") || a.startsWith("blob:")) return a;
    return `http://localhost:8000/storage/${a.replace(/^\//, "")}`;
  };

  const fullName =
    initialUser?.name ||
    `${initialUser?.first_name || ""} ${initialUser?.last_name || ""}`.trim() ||
    initialUser?.email ||
    "User H'Leven";
  const initialLetter = (fullName.charAt(0) || "U").toUpperCase();

  const accountStatus = (() => {
    const s = String(initialUser?.status || initialRole || "").toLowerCase();
    if (["banned", "suspended", "inactive", "nonaktif"].includes(s)) return { label: "Nonaktif", color: "text-[#ba1a1a]" };
    if (["pending", "waiting", "review"].includes(s)) return { label: "Menunggu", color: "text-[#9B5235]" };
    if (["admin_hotel"].includes(s)) return { label: "Admin Hotel", color: "text-[#778873]" };
    if (["super_admin"].includes(s)) return { label: "Super Admin", color: "text-[#778873]" };
    return { label: "Active", color: "text-[#778873]" };
  })();

  const userAvatar = getAvatarUrl();

  return (
    <div className="bg-[#fff8f0] text-[#1e1b16] font-body-md antialiased min-h-screen">
      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-8 md:py-12 flex flex-col text-left">
        <div className="mb-8">
          <h1 className="font-headline-lg text-2xl md:text-4xl font-bold text-[#778873] mb-2 leading-tight">
            My Account
          </h1>
          <p className="font-body-md text-sm md:text-base text-[#444842]">
            Kelola profil pribadi dan riwayat pemesanan kamar Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-[#DCCFC0]/20 border border-[#DCCFC0]/40 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm shadow-[#778873]/5">
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#778873] to-[#50604d] flex items-center justify-center text-white mb-4 border-2 border-[#778873]/20 overflow-hidden shadow-md">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={fullName}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                ) : (
                  <span className="font-headline-xl text-3xl font-bold">
                    {initialLetter}
                  </span>
                )}
              </div>

              <h2 className="font-headline-md text-xl font-bold text-[#2D332C] mb-1">
                {fullName}
              </h2>
              <p className="text-[#778873] font-label-md text-xs font-semibold mb-5">
                Anggota H&apos;Leven
              </p>

              <div className="w-full bg-[#DCCFC0]/40 h-px mb-5"></div>

              <div className="w-full grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center p-3 bg-white rounded-xl border border-[#DCCFC0]/30 shadow-xs">
                  <span className="text-[#778873] font-headline-md text-xl font-bold mb-0.5">
                    {bookings.length}
                  </span>
                  <span className="text-[#444842] font-label-sm text-[11px] font-semibold uppercase tracking-wider">
                    Total Pesanan
                  </span>
                </div>

                <div className="flex flex-col items-center p-3 bg-white rounded-xl border border-[#DCCFC0]/30 shadow-xs">
                  <span className={`font-headline-md text-xl font-bold mb-0.5 ${accountStatus.color}`}>
                    {accountStatus.label}
                  </span>
                  <span className="text-[#444842] font-label-sm text-[11px] font-semibold uppercase tracking-wider">
                    Status Akun
                  </span>
                </div>
              </div>
            </div>

            <nav className="bg-[#faf3ea] rounded-2xl border border-[#DCCFC0]/40 overflow-hidden shadow-xs">
              {!isAdminOrSuperAdmin && (
                <Link
                  to="/profile"
                  state={{ defaultTab: "partner" }}
                  className="w-full flex items-center gap-3 px-6 py-4 font-label-md text-sm font-semibold transition-colors border-l-4 text-left cursor-pointer text-[#444842] hover:bg-[#DCCFC0]/20 hover:text-[#778873] border-transparent"
                >
                  <span className="material-symbols-outlined text-xl">
                    real_estate_agent
                  </span>
                  Status Mitra Hotel
                </Link>
              )}

              <Link
                to="/profile"
                state={{ defaultTab: "personal" }}
                className="w-full flex items-center gap-3 px-6 py-4 font-label-md text-sm font-semibold transition-colors border-l-4 text-left cursor-pointer text-[#444842] hover:bg-[#DCCFC0]/20 hover:text-[#778873] border-transparent"
              >
                <span className="material-symbols-outlined text-xl">person_outline</span>
                Informasi Pribadi
              </Link>

              <div
                className="w-full flex items-center gap-3 px-6 py-4 font-label-md text-sm font-semibold transition-colors border-l-4 text-left bg-[#778873]/10 text-[#778873] border-[#778873]"
              >
                <span className="material-symbols-outlined text-xl">history</span>
                Riwayat Pemesanan
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-6 py-4 text-[#ba1a1a] hover:bg-[#ffdad6]/30 font-label-md text-sm font-semibold transition-colors border-l-4 border-transparent mt-2 border-t border-[#DCCFC0]/30 text-left cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">logout</span>
                Keluar (Sign Out)
              </button>
            </nav>
          </aside>

          <div className="lg:col-span-8 flex flex-col gap-8">
            <section className="flex-grow flex flex-col gap-6">
          
          {/* Filters & Sort Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#e8e2d9] p-4 rounded-2xl border border-[#DCCFC0]/30 shadow-xs">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="font-body-md text-xs font-semibold text-[#444842] uppercase tracking-wider">
                Filter:
              </span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[#fff8f0] border border-[#DCCFC0] rounded-xl px-3 py-2 text-sm text-[#1e1b16] font-medium focus:outline-none focus:border-[#778873] w-full sm:w-auto"
              >
                <option value="All">Semua Pesanan</option>
                <option value="Pending">Menunggu Pembayaran</option>
                <option value="Upcoming">Upcoming / Lunas</option>
                <option value="Past">Selesai (Checked Out)</option>
                <option value="Cancelled">Dibatalkan / Refund</option>
              </select>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <span className="font-body-md text-xs font-semibold text-[#444842] uppercase tracking-wider">
                Urutkan:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#fff8f0] border border-[#DCCFC0] rounded-xl px-3 py-2 text-sm text-[#1e1b16] font-medium focus:outline-none focus:border-[#778873]"
              >
                <option value="newest">Tanggal (Terbaru)</option>
                <option value="oldest">Tanggal (Terlama)</option>
                <option value="price_high">Harga (Tertinggi)</option>
              </select>
            </div>
          </div>

          {/* Bookings List */}
          <div className="flex flex-col gap-6">
            {bookingsLoading ? (
              <>
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-[#DCCFC0]/50 overflow-hidden shadow-xs flex flex-col sm:flex-row animate-pulse"
                  >
                    <div className="sm:w-1/3 h-48 sm:h-auto min-h-[180px] bg-[#e8e2d9]"></div>
                    <div className="p-6 flex-grow flex flex-col justify-between gap-4">
                      <div className="h-5 w-1/3 bg-[#e8e2d9] rounded mb-3"></div>
                      <div className="h-6 w-2/3 bg-[#e8e2d9] rounded mb-2"></div>
                      <div className="h-4 w-1/2 bg-[#e8e2d9] rounded mb-4"></div>
                      <div className="h-16 w-full bg-[#faf3ea] rounded-xl mb-4"></div>
                      <div className="flex justify-end gap-3">
                        <div className="h-8 w-28 bg-[#e8e2d9] rounded-xl"></div>
                        <div className="h-8 w-32 bg-[#e8e2d9] rounded-xl"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : filteredBookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#DCCFC0]/40">
                <span className="material-symbols-outlined text-4xl text-[#747871] mb-2">
                  event_busy
                </span>
                <p className="text-[#444842] text-sm">Tidak ada riwayat pemesanan yang sesuai dengan filter.</p>
              </div>
            ) : (
              filteredBookings.map((item) => (
                <article
                  key={item.id}
                  className={`bg-white rounded-2xl border border-[#DCCFC0]/50 overflow-hidden shadow-xs hover:shadow-md hover:shadow-[#778873]/10 transition-all duration-300 flex flex-col sm:flex-row ${
                    ["Cancelled", "Dibatalkan", "cancelled_by_user", "cancelled_by_system"].includes(item.status) ? "opacity-75" : ""
                  }`}
                >
                  {/* Thumbnail Image with Status Badge Overlay */}
                  <div className="sm:w-1/3 relative h-48 sm:h-auto min-h-[180px] bg-gradient-to-br from-[#e8e2d9] to-[#DCCFC0]">
                    {item.image || item.room?.photos?.[0]?.url ? (
                      <img
                        src={item.image || item.room?.photos?.[0]?.url}
                        alt={item.hotel_name || item.room?.hotel?.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                        <span className="material-symbols-outlined text-[#778873] text-5xl mb-2 opacity-60">image_not_supported</span>
                        <p className="font-label-md text-[11px] font-bold text-[#778873] uppercase tracking-wider">
                          Belum Ada Foto
                        </p>
                      </div>
                    )}
                    <div className="absolute top-4 left-4 z-10">
                      {getStatusBadge(item.status)}
                    </div>
                  </div>

                  {/* Card Content Details */}
                  <div className="p-6 flex-grow flex flex-col justify-between gap-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                      <div>
                        <span className="font-label-sm text-[11px] font-bold text-[#778873] uppercase tracking-wider block mb-1">
                          ID Order: {item.booking_code || item.id}
                        </span>
                        <h3 className="font-headline-md text-xl font-bold text-[#778873] mb-1">
                          {item.hotel_name || item.room?.hotel?.name || "H'Leven Resort"}
                        </h3>
                        <p className="font-body-md text-sm text-[#444842] flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">bed</span>
                          {item.room_name || item.room?.name}
                        </p>
                        <div className="mt-2">
                          {(item.is_refundable === undefined || item.is_refundable) ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#4F6F52]/10 border border-[#4F6F52]/20 text-[#4F6F52] font-bold text-[10px] uppercase tracking-wider">
                              <span className="material-symbols-outlined text-[12px]">verified</span>
                              Bisa Refund
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ba1a1a]/10 border border-[#ba1a1a]/20 text-[#ba1a1a] font-bold text-[10px] uppercase tracking-wider">
                              <span className="material-symbols-outlined text-[12px]">block</span>
                              Non-Refundable
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-left sm:text-right mt-2 sm:mt-0">
                        <span className="font-headline-md text-xl font-bold text-[#778873] block">
                          Rp {Number(item.total_price || 0).toLocaleString("id-ID")}
                        </span>
                        <span className="font-label-sm text-xs text-[#747871] uppercase tracking-wider">
                          Total Pembayaran
                        </span>
                      </div>
                    </div>

                    {/* Stay Dates Info Box */}
                    <div className="bg-[#faf3ea] rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 border border-[#DCCFC0]/30">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="w-10 h-10 rounded-full bg-[#DCCFC0]/30 flex items-center justify-center text-[#778873] flex-shrink-0">
                          <span className="material-symbols-outlined text-lg">calendar_month</span>
                        </div>
                        <div>
                          <span className="font-label-sm text-[11px] text-[#747871] uppercase tracking-wider block mb-0.5">
                            Check-in
                          </span>
                          <span className="font-body-md text-sm text-[#1e1b16] font-semibold">
                            {item.check_in}
                          </span>
                        </div>
                      </div>

                      <div className="hidden sm:block w-8 h-[1px] bg-[#DCCFC0]"></div>

                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="w-10 h-10 rounded-full bg-[#DCCFC0]/30 flex items-center justify-center text-[#778873] flex-shrink-0">
                          <span className="material-symbols-outlined text-lg">event_available</span>
                        </div>
                        <div>
                          <span className="font-label-sm text-[11px] text-[#747871] uppercase tracking-wider block mb-0.5">
                            Check-out
                          </span>
                          <span className="font-body-md text-sm text-[#1e1b16] font-semibold">
                            {item.check_out}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Actions */}
                    <div className="flex flex-wrap gap-3 justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedBooking(item)}
                        className="px-5 py-2 rounded-xl border border-[#778873] text-[#778873] font-label-md text-xs font-semibold hover:bg-[#DCCFC0]/20 transition-colors cursor-pointer"
                      >
                        View Details
                      </button>

                      {item.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => setCancelModalBooking(item)}
                          className="px-5 py-2 rounded-xl border border-[#ba1a1a] text-[#ba1a1a] font-label-md text-xs font-semibold hover:bg-[#ffdad6]/30 transition-colors cursor-pointer"
                        >
                          Batalkan Pesanan
                        </button>
                      )}

                      {["Paid", "paid", "confirmed", "Dikonfirmasi"].includes(item.status) && (
                        <>
                          <button
                            type="button"
                            onClick={() => setSelectedBooking(item)}
                            className="px-5 py-2 rounded-xl bg-[#778873] text-white font-label-md text-xs font-semibold hover:bg-[#50604d] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-base">download</span>
                            Download E-Ticket
                          </button>

                          <button
                            type="button"
                            onClick={() => setCancelModalBooking(item)}
                            className="px-4 py-2 rounded-xl bg-[#ba1a1a] text-white font-label-md text-xs font-semibold hover:bg-[#93000a] transition-colors cursor-pointer"
                          >
                            Ajukan Refund
                          </button>
                        </>
                      )}

                      {!["Paid", "paid", "confirmed", "Dikonfirmasi", "pending"].includes(item.status) && (
                        <button
                          type="button"
                          onClick={() => navigate(`/hotels/${item.hotel_id || 1}`)}
                          className="px-5 py-2 rounded-xl bg-[#778873] text-white font-label-md text-xs font-semibold hover:bg-[#50604d] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-base">autorenew</span>
                          Book Again
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
            </section>
          </div>
        </div>
      </main>

      {/* MODAL REFUND / CANCEL (Phase 1) */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1e1b16]/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-[#DCCFC0]/60 space-y-4 text-left animate-in zoom-in-95 duration-200">
            <h3 className="font-headline-md text-xl font-bold text-[#2D312C]">
              {cancelModalBooking.status === "pending" ? "Batalkan Pesanan" : "Pengajuan Refund"}
            </h3>
            <p className="font-body-md text-xs text-[#444842]">
              Kode Booking: <strong className="text-[#778873]">{cancelModalBooking.booking_code || cancelModalBooking.id}</strong>
            </p>

            <div className="space-y-2">
              <label className="block font-label-md text-xs font-semibold text-[#444842]">
                Alasan Pembatalan / Refund *
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Tuliskan alasan lengkap..."
                className="w-full p-3 bg-[#fff8f0] border border-[#DCCFC0] rounded-xl text-sm text-[#1e1b16] focus:outline-none focus:border-[#778873]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                disabled={isSubmittingCancel}
                className="px-4 py-2 border border-[#DCCFC0] rounded-xl font-label-md text-xs font-semibold text-[#444842] hover:bg-[#DCCFC0]/20"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleProcessCancelOrRefund}
                disabled={isSubmittingCancel || !cancelReason.trim()}
                className="px-5 py-2 bg-[#ba1a1a] text-white rounded-xl font-label-md text-xs font-semibold hover:bg-[#93000a] disabled:opacity-50 transition-colors shadow-xs"
              >
                {isSubmittingCancel ? "Memproses..." : "Konfirmasi Pembatalan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* E-Ticket Modal Popup (ticket.html design) */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1e1b16]/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-[#DCCFC0]/60 max-h-[90vh] text-left animate-in zoom-in-95 duration-200 relative">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedBooking(null)}
              className="absolute top-4 right-4 z-20 text-white hover:text-[#DCCFC0] transition-colors p-1.5 rounded-full bg-black/20 hover:bg-black/40 cursor-pointer"
              title="Tutup Modal"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            {/* Success Header Banner */}
            <div className="bg-[#778873] text-white py-8 px-6 md:px-12 text-center relative overflow-hidden flex-shrink-0">
              <div
                className="absolute inset-0 opacity-10"
                style={{ backgroundImage: "radial-gradient(circle at 50% 120%, white, transparent)" }}
              ></div>
              <span className="material-symbols-outlined text-5xl mb-2 text-white">check_circle</span>
              <h2 className="font-headline-lg text-2xl md:text-3xl font-bold mb-1">
                Payment Successful
              </h2>
              <p className="font-body-lg text-sm md:text-base opacity-90">
                Your journey with H'Leven has begun.
              </p>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-6 md:p-10 overflow-y-auto space-y-8 bg-[#fff8f0]">
              
              {/* Ticket Reference Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#DCCFC0]/60 pb-5 gap-4">
                <div>
                  <p className="font-label-sm text-xs text-[#444842] uppercase tracking-widest mb-1">
                    Booking Reference
                  </p>
                  <p className="font-headline-md text-xl md:text-2xl font-bold text-[#778873]">
                    {selectedBooking.booking_code || selectedBooking.id}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="font-label-sm text-xs text-[#444842] uppercase tracking-widest mb-1">
                    Status
                  </p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#4F6F52]/10 text-[#4F6F52] font-label-md text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#4F6F52] mr-2"></span>
                    {selectedBooking.status === "Paid" ? "Confirmed" : selectedBooking.status}
                  </span>
                </div>
              </div>

              {/* Grid 2 Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Left Column: QR Code & Actions */}
                <div className="flex flex-col items-center justify-center order-2 md:order-1 border-t md:border-t-0 md:border-r border-[#DCCFC0]/60 pt-6 md:pt-0 md:pr-8 text-center">
                  <div className="bg-[#FDF6ED] p-4 border-2 border-[#778873] rounded-2xl mb-4 shadow-sm">
                    <img
                      src={QR_CODE_PLACEHOLDER}
                      alt="QR Code Tiket"
                      className="w-44 h-44 object-contain mix-blend-multiply"
                    />
                  </div>
                  <p className="font-body-md text-xs text-[#444842] mb-6 max-w-[240px] leading-relaxed">
                    Tunjukkan QR code ini di resepsionis saat check-in untuk proses yang cepat dan mudah.
                  </p>
                  <div className="w-full flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => alert(`📥 Mengunduh E-Tiket PDF untuk Order ID ${selectedBooking.booking_code || selectedBooking.id}...`)}
                      className="w-full bg-[#778873] text-white font-label-md text-sm font-semibold py-3.5 rounded-xl hover:bg-[#50604d] transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg">download</span>
                      Unduh E-Tiket (PDF)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedBooking(null)}
                      className="w-full text-center font-label-md text-xs font-semibold text-[#778873] hover:underline cursor-pointer py-1"
                    >
                      Tutup Pratinjau Tiket
                    </button>
                  </div>
                </div>

                {/* Right Column: Hotel & Stay Details */}
                <div className="flex flex-col gap-6 order-1 md:order-2">
                  {/* Destination */}
                  <div>
                    <p className="font-label-sm text-xs text-[#444842] uppercase tracking-widest mb-1.5 font-semibold">
                      Destination
                    </p>
                    <h3 className="font-headline-md text-lg font-bold text-[#778873] mb-1">
                      {selectedBooking.hotel_name || selectedBooking.room?.hotel?.name || "H'Leven Resort"}
                    </h3>
                    <p className="font-body-md text-xs text-[#444842] flex items-start gap-1">
                      <span className="material-symbols-outlined text-sm mt-0.5">location_on</span>
                      Jl. Resort Impian No. 11, Lembang, Bandung, Indonesia
                    </p>
                  </div>

                  {/* Accommodation */}
                  <div className="bg-[#DCCFC0]/20 rounded-xl p-4 border border-[#DCCFC0]/40">
                    <p className="font-label-sm text-[11px] text-[#444842] uppercase tracking-widest mb-1 font-semibold">
                      Accommodation
                    </p>
                    <p className="font-headline-sm text-sm font-bold text-[#2D332C]">
                      {selectedBooking.room_name || selectedBooking.room?.name || "Executive Suite dengan Kolam Renang"}
                    </p>
                    <p className="font-body-md text-xs text-[#444842] mt-1">
                      1 Kamar • 2 Tamu • Termasuk Sarapan Pagi
                    </p>
                    <div className="mt-2">
                      {(selectedBooking.is_refundable === undefined || selectedBooking.is_refundable) ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#4F6F52]/10 border border-[#4F6F52]/20 text-[#4F6F52] font-bold text-[10px] uppercase tracking-wider">
                          <span className="material-symbols-outlined text-[12px]">verified</span>
                          Booking Bisa Direfund
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ba1a1a]/10 border border-[#ba1a1a]/20 text-[#ba1a1a] font-bold text-[10px] uppercase tracking-wider">
                          <span className="material-symbols-outlined text-[12px]">block</span>
                          Non-Refundable
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dates Grid */}
                  <div className="grid grid-cols-2 gap-4 relative bg-white p-3.5 rounded-xl border border-[#DCCFC0]/40">
                    <div className="absolute left-1/2 top-3 bottom-3 w-px bg-[#DCCFC0]/60 -translate-x-1/2"></div>
                    <div>
                      <p className="font-label-sm text-[11px] text-[#444842] uppercase tracking-widest mb-0.5 font-semibold">
                        Check-in
                      </p>
                      <p className="font-label-md text-xs text-[#2D332C] font-bold">
                        {selectedBooking.check_in || "15 Nov 2024"}
                      </p>
                      <p className="font-body-md text-[11px] text-[#444842] mt-0.5">
                        Mulai 14:00 WIB
                      </p>
                    </div>
                    <div className="pl-3">
                      <p className="font-label-sm text-[11px] text-[#444842] uppercase tracking-widest mb-0.5 font-semibold">
                        Check-out
                      </p>
                      <p className="font-label-md text-xs text-[#2D332C] font-bold">
                        {selectedBooking.check_out || "17 Nov 2024"}
                      </p>
                      <p className="font-body-md text-[11px] text-[#444842] mt-0.5">
                        Hingga 12:00 WIB
                      </p>
                    </div>
                  </div>

                  {/* Guest Info */}
                  <div>
                    <p className="font-label-sm text-xs text-[#444842] uppercase tracking-widest mb-2 font-semibold">
                      Guest Details
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[#2D332C] mb-1">
                      <span className="material-symbols-outlined text-[#778873] text-base">person</span>
                      <span className="font-semibold">{selectedBooking.guest_name || user?.name || "Eleanor Vance"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#444842]">
                      <span className="material-symbols-outlined text-[#778873] text-base">call</span>
                      <span>+62 812-3456-7890</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Decoration */}
              <div className="pt-4 border-t border-dashed border-[#DCCFC0] text-center">
                <p className="font-body-md text-xs text-[#444842] italic">
                  Thank you for choosing H'Leven. We look forward to welcoming you.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;