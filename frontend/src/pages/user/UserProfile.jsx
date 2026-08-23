import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import { cachedGet } from "../../services/apiCache";
import { QRCodeSVG } from "qrcode.react";
import ApplicationStatus from "../../components/mitra/ApplicationStatus";

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

const UserProfile = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("partner");
  const [partnerApplication, setPartnerApplication] = useState(null);
  const [partnerLoading, setPartnerLoading] = useState(false);

  // Personal Info Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Loading & Notification Messages
  const [loading, setLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Booking History States
  const [bookings, setBookings] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Cancellation & Refund Modal States
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  // Load User Data, Bookings, Partner Status
  const fetchUserBookings = async () => {
    try {
      const TTL_30DETIK = 30 * 1000;
      const { data: responseData, fromCache } = await cachedGet(
        "/user/bookings",
        {},
        false,
        TTL_30DETIK
      );
      if (responseData && responseData.data && responseData.data.length > 0) {
        setBookings(responseData.data);
      }
      if (fromCache) {
        console.debug("[Cache Hit] UserProfile bookings loaded from cache (30s TTL)");
      }
    } catch (err) {
      console.warn("Gagal memuat booking history dari API.", err);
    }
  };

  const fetchPartnerStatus = async () => {
    setPartnerLoading(true);
    try {
      const res = await api.get("/user/partner-application");
      const data = res.data?.data || res.data;
      if (data && (data.id || data.application_number || data.status)) {
        setPartnerApplication(data);
      } else {
        setPartnerApplication(null);
      }
    } catch (err) {
      try {
        const saved = localStorage.getItem("partner_app_submission");
        if (saved) {
          const parsed = JSON.parse(saved);
          setPartnerApplication(parsed);
        } else {
          setPartnerApplication(null);
        }
      } catch (e) {
        setPartnerApplication(null);
      }
    } finally {
      setPartnerLoading(false);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        const nameParts = (u.name || "").split(" ");

        setFirstName(u.first_name || nameParts[0] || "");
        setLastName(u.last_name || nameParts.slice(1).join(" ") || "");
        setEmail(u.email || "");
        setPhone(u.phone || "");

        const avatarPath = u.avatar || u.avatarPreview || u.avatar_url;
        if (avatarPath) {
          setAvatarPreview(
            avatarPath.startsWith("http") || avatarPath.startsWith("data:") || avatarPath.startsWith("blob:")
              ? avatarPath
              : `http://localhost:8000/storage/${avatarPath.replace(/^\//, "")}`
          );
        }
      } catch (e) {
        console.error("Gagal memuat data pengguna:", e);
      }
    } else {
      navigate("/login");
      return;
    }

    fetchUserBookings();
    fetchPartnerStatus();
  }, [navigate]);

  const handleFixRevision = () => {
    // Preload data existing ke form pendaftaran
    navigate("/mitra/daftar", {
      state: {
        prefill: {
          hotel_name: partnerApplication?.hotel_name || "",
          hotel_type: partnerApplication?.hotel_type || "",
          hotel_description: partnerApplication?.hotel_description || "",
          hotel_phone: partnerApplication?.hotel_phone || "",
          hotel_email: partnerApplication?.hotel_email || "",
          room_count: partnerApplication?.room_count || "",
          address: partnerApplication?.address || "",
          province: partnerApplication?.province || "",
          city: partnerApplication?.city || "",
          district: partnerApplication?.district || "",
          postal_code: partnerApplication?.postal_code || "",
          maps_url: partnerApplication?.maps_url || "",
          owner_name: partnerApplication?.owner_name || "",
          owner_email: partnerApplication?.owner_email || "",
          owner_phone: partnerApplication?.owner_phone || "",
          owner_id_number: partnerApplication?.owner_id_number || "",
          bank_name: partnerApplication?.bank_name || "",
          bank_account_number: partnerApplication?.bank_account_number || "",
          bank_account_name: partnerApplication?.bank_account_name || "",
        },
      },
    });
  };

  // Handle Avatar Change
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result;
        setAvatarPreview(base64Image);

        const savedUser = localStorage.getItem("user");
        let userObj = {};
        if (savedUser) {
          try { userObj = JSON.parse(savedUser); } catch (err) {}
        }
        userObj.avatar = base64Image;
        userObj.avatarPreview = base64Image;
        localStorage.setItem("user", JSON.stringify(userObj));
        window.dispatchEvent(new Event("storage"));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const formData = new FormData();
      formData.append("first_name", firstName);
      formData.append("last_name", lastName || "");
      formData.append("email", email);
      formData.append("phone", phone || "");

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const response = await api.put("/user/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const updatedUser = response.data.user || response.data.data || {
        first_name: firstName,
        last_name: lastName,
        name: `${firstName} ${lastName}`.trim(),
        email,
        phone,
        avatar: avatarPreview
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("storage"));
      setMessage({ type: "success", text: "🎉 Profil berhasil disimpan!" });
    } catch (err) {
      const localUser = {
        first_name: firstName,
        last_name: lastName,
        name: `${firstName} ${lastName}`.trim(),
        email,
        phone,
        avatar: avatarPreview
      };
      localStorage.setItem("user", JSON.stringify(localUser));
      window.dispatchEvent(new Event("storage"));
      setMessage({ type: "success", text: "🎉 Profil berhasil diperbarui!" });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "⚠️ Konfirmasi kata sandi baru tidak cocok." });
      return;
    }

    setPwdLoading(true);

    try {
      await api.post("/user/change-password", {
        current_password: currentPassword,
        new_password: newPassword
      });

      setMessage({ type: "success", text: "🔑 Kata sandi berhasil diperbarui!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const errMsg = err.response?.data?.message || "Gagal memperbarui kata sandi. Periksa kata sandi saat ini.";
      setMessage({ type: "error", text: `⚠️ ${errMsg}` });
    } finally {
      setPwdLoading(false);
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
      fetchUserBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal memproses pembatalan.");
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  // Unduh Berkas E-Tiket PDF
  const handleDownloadPdf = async (bookingId, bookingCode) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/api/v1/user/bookings/${bookingId}/e-ticket`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Gagal mengunduh tiket");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `E-Ticket-${bookingCode}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      toast.error("Gagal mengunduh E-Tiket PDF.");
    }
  };

  const filteredBookings = useMemo(() => {
    let result = [...bookings];

    if (filterStatus !== "All") {
      if (filterStatus === "Upcoming") {
        result = result.filter((b) => ["Paid", "paid", "confirmed", "Dikonfirmasi"].includes(b.status));
      } else if (filterStatus === "Pending") {
        result = result.filter((b) => b.status === "pending" || b.status === "unpaid");
      } else if (filterStatus === "Past") {
        result = result.filter((b) => ["Checked Out", "Selesai", "completed", "checked_out"].includes(b.status));
      } else if (filterStatus === "Cancelled") {
        result = result.filter((b) =>
          ["Cancelled", "Dibatalkan", "cancelled_by_user", "cancelled_by_system", "refund_pending", "expired", "cancelled"].includes(b.status)
        );
      }
    }

    if (sortBy === "newest") {
      result = [...result].reverse();
    } else if (sortBy === "oldest") {
      // no-op, biarkan urutan asli (asumsi data dari API oldest-first)
    } else if (sortBy === "price_high") {
      result = [...result].sort((a, b) => Number(b.total_price || b.grand_total || 0) - Number(a.total_price || a.grand_total || 0));
    } else if (sortBy === "price_low") {
      result = [...result].sort((a, b) => Number(a.total_price || a.grand_total || 0) - Number(b.total_price || b.grand_total || 0));
    }

    return result;
  }, [bookings, filterStatus, sortBy]);

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar dari akun?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("storage"));
      navigate("/login");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
      case "unpaid":
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
      case "Checked Out":
      case "checked_out":
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
      case "Cancelled":
      case "cancelled":
      case "Dibatalkan":
      case "expired":
        return (
          <div className="bg-[#ffdad6]/80 backdrop-blur-sm border border-[#ba1a1a]/20 px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
            <span className="font-label-sm text-xs text-[#ba1a1a] font-bold uppercase tracking-wider">
              Dibatalkan / Expired
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

  const fullNameDisplay = `${firstName} ${lastName}`.trim() || "User";

  return (
    <div className="bg-[#fff8f0] text-[#1e1b16] font-body-md antialiased min-h-screen">
      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-8 md:py-12 flex flex-col text-left">
        
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="font-headline-lg text-2xl md:text-4xl font-bold text-[#778873] mb-2 leading-tight">
            My Account
          </h1>
          <p className="font-body-md text-sm md:text-base text-[#444842]">
            Kelola profil pribadi dan riwayat pemesanan kamar Anda.
          </p>
        </div>

        {/* Global Alert Notification */}
        {message.text && (
          <div
            className={`p-4 rounded-xl mb-6 text-sm font-semibold border transition-all ${
              message.type === "success"
                ? "bg-[#faf3ea] text-[#778873] border-[#778873]/40"
                : "bg-[#ffdad6] text-[#ba1a1a] border-[#ffdad6]"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Two-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Area */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Profile Header Summary Card */}
            <div className="bg-[#DCCFC0]/20 border border-[#DCCFC0]/40 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm shadow-[#778873]/5">
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#778873] to-[#50604d] flex items-center justify-center text-white mb-4 border-2 border-[#778873]/20 overflow-hidden group shadow-md">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={fullNameDisplay}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <span className="font-headline-xl text-3xl font-bold">
                    {fullNameDisplay.charAt(0).toUpperCase()}
                  </span>
                )}
                <label
                  htmlFor="avatar-upload-input"
                  className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-semibold"
                  title="Pilih Foto Profil"
                >
                  <span className="material-symbols-outlined text-xl">photo_camera</span>
                </label>
                <input
                  id="avatar-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              <h2 className="font-headline-md text-xl font-bold text-[#2D332C] mb-1">
                {fullNameDisplay}
              </h2>
              <p className="text-[#778873] font-label-md text-xs font-semibold mb-5">
                Anggota H'Leven
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
                  <span className="text-[#778873] font-headline-md text-xl font-bold mb-0.5">
                    Active
                  </span>
                  <span className="text-[#444842] font-label-sm text-[11px] font-semibold uppercase tracking-wider">
                    Status Akun
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="bg-[#faf3ea] rounded-2xl border border-[#DCCFC0]/40 overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setActiveTab("partner")}
                className={`w-full flex items-center gap-3 px-6 py-4 font-label-md text-sm font-semibold transition-colors border-l-4 text-left cursor-pointer ${
                  activeTab === "partner"
                    ? "bg-[#778873]/10 text-[#778873] border-[#778873]"
                    : "text-[#444842] hover:bg-[#DCCFC0]/20 hover:text-[#778873] border-transparent"
                }`}
              >
                <span className="material-symbols-outlined text-xl">real_estate_agent</span>
                Status Mitra Hotel
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("personal")}
                className={`w-full flex items-center gap-3 px-6 py-4 font-label-md text-sm font-semibold transition-colors border-l-4 text-left cursor-pointer ${
                  activeTab === "personal"
                    ? "bg-[#778873]/10 text-[#778873] border-[#778873]"
                    : "text-[#444842] hover:bg-[#DCCFC0]/20 hover:text-[#778873] border-transparent"
                }`}
              >
                <span className="material-symbols-outlined text-xl">person_outline</span>
                Informasi Pribadi
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={`w-full flex items-center gap-3 px-6 py-4 font-label-md text-sm font-semibold transition-colors border-l-4 text-left cursor-pointer ${
                  activeTab === "history"
                    ? "bg-[#778873]/10 text-[#778873] border-[#778873]"
                    : "text-[#444842] hover:bg-[#DCCFC0]/20 hover:text-[#778873] border-transparent"
                }`}
              >
                <span className="material-symbols-outlined text-xl">history</span>
                Riwayat Pemesanan
              </button>

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

          {/* Main Area: Dynamic Tab Content */}
          <div className="lg:col-span-8 flex flex-col gap-8">

            {activeTab === "partner" && (
              <ApplicationStatus
                application={partnerApplication}
                loading={partnerLoading}
                onFixRevision={handleFixRevision}
              />
            )}
            
            {activeTab === "personal" && (
              <>
                {/* Personal Information Section */}
                <section className="bg-white rounded-2xl border border-[#DCCFC0]/40 p-6 md:p-8 shadow-sm shadow-[#778873]/5">
                  <div className="flex items-center gap-3 mb-6 border-b border-[#DCCFC0]/30 pb-4">
                    <span className="material-symbols-outlined text-[#778873] text-2xl">
                      person_outline
                    </span>
                    <h3 className="font-headline-md text-xl font-bold text-[#2D332C]">
                      Informasi Pribadi
                    </h3>
                  </div>

                  <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="font-label-md text-xs font-semibold text-[#444842]" htmlFor="firstName">
                        Nama Depan *
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="bg-[#faf3ea] border border-[#DCCFC0] rounded-xl px-4 py-3 font-body-md text-sm text-[#2D332C] focus:outline-none focus:border-[#778873] focus:ring-1 focus:ring-[#778873] transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="font-label-md text-xs font-semibold text-[#444842]" htmlFor="lastName">
                        Nama Belakang
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="bg-[#faf3ea] border border-[#DCCFC0] rounded-xl px-4 py-3 font-body-md text-sm text-[#2D332C] focus:outline-none focus:border-[#778873] focus:ring-1 focus:ring-[#778873] transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="font-label-md text-xs font-semibold text-[#444842]" htmlFor="email">
                        Alamat Email *
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-[#faf3ea] border border-[#DCCFC0] rounded-xl px-4 py-3 font-body-md text-sm text-[#2D332C] focus:outline-none focus:border-[#778873] focus:ring-1 focus:ring-[#778873] transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="font-label-md text-xs font-semibold text-[#444842]" htmlFor="phone">
                        Nomor Telepon / WhatsApp
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+62 8xx xxxx xxxx"
                        className="bg-[#faf3ea] border border-[#DCCFC0] rounded-xl px-4 py-3 font-body-md text-sm text-[#2D332C] focus:outline-none focus:border-[#778873] focus:ring-1 focus:ring-[#778873] transition-colors"
                      />
                    </div>

                    <div className="md:col-span-2 pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-[#778873] text-white font-label-md text-sm font-semibold px-8 py-3 rounded-xl hover:bg-[#50604d] transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        {loading ? "Menyimpan Perubahan..." : "Simpan Informasi"}
                      </button>
                    </div>
                  </form>
                </section>

                {/* Security Password Section */}
                <section className="bg-white rounded-2xl border border-[#DCCFC0]/40 p-6 md:p-8 shadow-sm shadow-[#778873]/5">
                  <div className="flex items-center gap-3 mb-6 border-b border-[#DCCFC0]/30 pb-4">
                    <span className="material-symbols-outlined text-[#778873] text-2xl">
                      lock_outline
                    </span>
                    <h3 className="font-headline-md text-xl font-bold text-[#2D332C]">
                      Keamanan &amp; Kata Sandi
                    </h3>
                  </div>

                  <form onSubmit={handleChangePassword} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="font-label-md text-xs font-semibold text-[#444842]" htmlFor="currentPassword">
                        Kata Sandi Saat Ini
                      </label>
                      <input
                        id="currentPassword"
                        type="password"
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="bg-[#faf3ea] border border-[#DCCFC0] rounded-xl px-4 py-3 font-body-md text-sm text-[#2D332C] focus:outline-none focus:border-[#778873] focus:ring-1 focus:ring-[#778873] transition-colors max-w-md"
                      />
                    </div>

                    <div className="w-full bg-[#DCCFC0]/40 h-px my-1"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                      <div className="flex flex-col gap-2">
                        <label className="font-label-md text-xs font-semibold text-[#444842]" htmlFor="newPassword">
                          Kata Sandi Baru
                        </label>
                        <input
                          id="newPassword"
                          type="password"
                          placeholder="Kata Sandi Baru"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          className="bg-[#faf3ea] border border-[#DCCFC0] rounded-xl px-4 py-3 font-body-md text-sm text-[#2D332C] focus:outline-none focus:border-[#778873] focus:ring-1 focus:ring-[#778873] transition-colors"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="font-label-md text-xs font-semibold text-[#444842]" htmlFor="confirmPassword">
                          Konfirmasi Kata Sandi Baru
                        </label>
                        <input
                          id="confirmPassword"
                          type="password"
                          placeholder="Konfirmasi Kata Sandi"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="bg-[#faf3ea] border border-[#DCCFC0] rounded-xl px-4 py-3 font-body-md text-sm text-[#2D332C] focus:outline-none focus:border-[#778873] focus:ring-1 focus:ring-[#778873] transition-colors"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={pwdLoading}
                        className="bg-[#2D332C] text-white font-label-md text-sm font-semibold px-8 py-3 rounded-xl hover:bg-[#1e1b16] transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        {pwdLoading ? "Memproses..." : "Perbarui Kata Sandi"}
                      </button>
                    </div>
                  </form>
                </section>
              </>
            )}

            {activeTab === "history" && (
              /* Booking History View */
              <div className="flex flex-col gap-6">
                
                {/* Filters & Sort Bar */}
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
                      <option value="Cancelled">Dibatalkan / Expired</option>
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
                  {filteredBookings.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-[#DCCFC0]/40">
                      <span className="material-symbols-outlined text-4xl text-[#747871] mb-2">
                        event_busy
                      </span>
                      <p className="text-[#444842] text-sm">Tidak ada riwayat pemesanan yang sesuai.</p>
                    </div>
                  ) : (
                    filteredBookings.map((item) => (
                      <article
                        key={item.id}
                        className={`bg-white rounded-2xl border border-[#DCCFC0]/50 overflow-hidden shadow-xs hover:shadow-md hover:shadow-[#778873]/10 transition-all duration-300 flex flex-col sm:flex-row ${
                          ["Cancelled", "cancelled", "Dibatalkan", "expired"].includes(item.status) ? "opacity-75" : ""
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="sm:w-1/3 relative h-48 sm:h-auto min-h-[180px] bg-gradient-to-br from-[#e8e2d9] to-[#DCCFC0]">
                          {item.booking_rooms?.[0]?.room_type?.photos?.[0]?.photo ? (
                            <img
                              src={`http://localhost:8000/storage/${item.booking_rooms[0].room_type.photos[0].photo}`}
                              alt={item.hotel?.name || "Kamar Hotel"}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                              <span className="material-symbols-outlined text-[#778873] text-5xl mb-2 opacity-60">image_not_supported</span>
                              <p className="font-label-md text-[11px] font-bold text-[#778873] uppercase tracking-wider">
                                Foto Tidak Tersedia
                              </p>
                            </div>
                          )}
                          <div className="absolute top-4 left-4 z-10">
                            {getStatusBadge(item.status)}
                          </div>
                        </div>

                        {/* Card Details */}
                        <div className="p-6 flex-grow flex flex-col justify-between gap-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                            <div>
                              <span className="font-label-sm text-[11px] font-bold text-[#778873] uppercase tracking-wider block mb-1">
                                Kode Booking: {item.booking_code || item.id}
                              </span>
                              <h3 className="font-headline-md text-xl font-bold text-[#778873] mb-1">
                                {item.hotel?.name || "H'Leven Hotel"}
                              </h3>
                              <p className="font-body-md text-sm text-[#444842] flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">bed</span>
                                {item.booking_rooms?.[0]?.room_type?.name || "Tipe Kamar"}
                              </p>
                            </div>

                            <div className="text-left sm:text-right mt-2 sm:mt-0">
                              <span className="font-headline-md text-xl font-bold text-[#778873] block">
                                Rp {Number(item.grand_total || item.total_price || 0).toLocaleString("id-ID")}
                              </span>
                              <span className="font-label-sm text-xs text-[#747871] uppercase tracking-wider">
                                Total Pembayaran
                              </span>
                            </div>
                          </div>

                          {/* Stay Dates Box */}
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

                          {/* Actions */}
                          <div className="flex flex-wrap gap-3 justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => setSelectedBooking(item)}
                              className="px-5 py-2 rounded-xl border border-[#778873] text-[#778873] font-label-md text-xs font-semibold hover:bg-[#DCCFC0]/20 transition-colors cursor-pointer"
                            >
                              Detail Pesanan
                            </button>

                            {(item.status === "pending" || item.status === "unpaid") && (
                              <button
                                type="button"
                                onClick={() => setCancelModalBooking(item)}
                                className="px-5 py-2 rounded-xl border border-[#ba1a1a] text-[#ba1a1a] font-label-md text-xs font-semibold hover:bg-[#ffdad6]/30 transition-colors cursor-pointer"
                              >
                                Batalkan Pesanan
                              </button>
                            )}

                            {["Paid", "paid", "confirmed", "Dikonfirmasi"].includes(item.status) && (
                              <button
                                type="button"
                                onClick={() => setSelectedBooking(item)}
                                className="px-5 py-2 rounded-xl bg-[#778873] text-white font-label-md text-xs font-semibold hover:bg-[#50604d] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-base">download</span>
                                E-Tiket
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL REFUND / CANCEL */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1e1b16]/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-[#DCCFC0]/60 space-y-4 text-left">
            <h3 className="font-headline-md text-xl font-bold text-[#2D312C]">
              Batalkan Pemesanan Kamar
            </h3>
            <p className="font-body-md text-xs text-[#444842]">
              Kode Booking: <strong className="text-[#778873]">{cancelModalBooking.booking_code || cancelModalBooking.id}</strong>
            </p>

            <div className="space-y-2">
              <label className="block font-label-md text-xs font-semibold text-[#444842]">
                Alasan Pembatalan *
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Tuliskan alasan pembatalan Anda..."
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
                {isSubmittingCancel ? "Memproses..." : "Konfirmasi Batal"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* E-Ticket Modal Popup */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1e1b16]/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-[#DCCFC0]/60 max-h-[90vh] text-left relative">
            <button
              type="button"
              onClick={() => setSelectedBooking(null)}
              className="absolute top-4 right-4 z-20 text-white hover:text-[#DCCFC0] transition-colors p-1.5 rounded-full bg-black/20 hover:bg-black/40 cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            <div className="bg-[#778873] text-white py-8 px-6 md:px-12 text-center relative overflow-hidden flex-shrink-0">
              <span className="material-symbols-outlined text-5xl mb-2 text-white">check_circle</span>
              <h2 className="font-headline-lg text-2xl md:text-3xl font-bold mb-1">
                E-Ticket Valid
              </h2>
              <p className="font-body-lg text-sm md:text-base opacity-90">
                Reservasi Anda berhasil terdaftar di sistem H'Leven.
              </p>
            </div>

            <div className="p-6 md:p-10 overflow-y-auto space-y-8 bg-[#fff8f0]">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#DCCFC0]/60 pb-5 gap-4">
                <div>
                  <p className="font-label-sm text-xs text-[#444842] uppercase tracking-widest mb-1">
                    Booking Code
                  </p>
                  <p className="font-headline-md text-xl md:text-2xl font-bold text-[#778873]">
                    {selectedBooking.booking_code || selectedBooking.id}
                  </p>
                </div>
                <div>
                  {getStatusBadge(selectedBooking.status)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-r border-[#DCCFC0]/60 pt-6 md:pt-0 md:pr-8 text-center">
                  
                  {/* GENERATED DINAMIS QR CODE */}
                  <div className="bg-white p-3 border-2 border-[#778873] rounded-2xl mb-4 shadow-xs inline-block">
                    <QRCodeSVG
                      value={selectedBooking.booking_code || String(selectedBooking.id)}
                      size={170}
                      level="H"
                      includeMargin={true}
                    />
                  </div>

                  <p className="font-body-md text-xs text-[#444842] mb-4 max-w-[240px]">
                    Tunjukkan QR Code ini di resepsionis saat check-in.
                  </p>
                  
                  {/* TOMBOL UNDUH E-TIKET PDF */}
                  <button
                    type="button"
                    onClick={() => handleDownloadPdf(selectedBooking.id, selectedBooking.booking_code || selectedBooking.id)}
                    className="px-6 py-2.5 bg-[#778873] text-white font-label-md text-xs font-semibold rounded-xl hover:bg-[#50604d] transition-colors flex items-center justify-center gap-2 w-full cursor-pointer shadow-xs"
                  >
                    <span className="material-symbols-outlined text-base">download</span>
                    Unduh Berkas PDF
                  </button>
                </div>

                <div className="flex flex-col gap-6">
                  <div>
                    <p className="font-label-sm text-xs text-[#444842] uppercase tracking-widest mb-1 font-semibold">
                      Hotel
                    </p>
                    <h3 className="font-headline-md text-lg font-bold text-[#778873]">
                      {selectedBooking.hotel?.name || "H'Leven Hotel"}
                    </h3>
                  </div>

                  <div className="bg-[#DCCFC0]/20 rounded-xl p-4 border border-[#DCCFC0]/40">
                    <p className="font-label-sm text-[11px] text-[#444842] uppercase tracking-widest mb-1 font-semibold">
                      Kamar
                    </p>
                    <p className="font-headline-sm text-sm font-bold text-[#2D332C]">
                      {selectedBooking.booking_rooms?.[0]?.room_type?.name || "Standard Room"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-white p-3.5 rounded-xl border border-[#DCCFC0]/40">
                    <div>
                      <p className="font-label-sm text-[11px] text-[#444842] uppercase tracking-widest mb-0.5 font-semibold">
                        Check-in
                      </p>
                      <p className="font-label-md text-xs text-[#2D332C] font-bold">
                        {selectedBooking.check_in}
                      </p>
                    </div>
                    <div>
                      <p className="font-label-sm text-[11px] text-[#444842] uppercase tracking-widest mb-0.5 font-semibold">
                        Check-out
                      </p>
                      <p className="font-label-md text-xs text-[#2D332C] font-bold">
                        {selectedBooking.check_out}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;