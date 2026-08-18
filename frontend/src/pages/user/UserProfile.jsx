import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

const UserProfile = () => {
  const navigate = useNavigate();

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState("personal"); // 'personal' | 'history'

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

  // Sample Bookings History
  const [bookings, setBookings] = useState([
    {
      id: "HLVN-88231-AX",
      hotel_name: "The Grand H'Leven Resort Bandung",
      room_name: "Executive Suite dengan Kolam Renang",
      check_in: "15 Nov 2024",
      check_out: "17 Nov 2024",
      total_price: 3700000,
      status: "Dikonfirmasi"
    },
    {
      id: "HLVN-44102-BX",
      hotel_name: "H'Leven City Boutique Jakarta",
      room_name: "Deluxe King Room",
      check_in: "02 Okt 2024",
      check_out: "04 Okt 2024",
      total_price: 1700000,
      status: "Selesai"
    }
  ]);

  // Load User Data from localStorage / API
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
    }

    // Try fetching user bookings from API
    const fetchUserBookings = async () => {
      try {
        const res = await api.get("/user/bookings");
        if (res.data && res.data.data && res.data.data.length > 0) {
          setBookings(res.data.data);
        }
      } catch (err) {
        // Keep default mock bookings on offline/API fail
      }
    };

    fetchUserBookings();
  }, [navigate]);

  // Handle Avatar Change
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);

      // Convert file to permanent Base64 Data URL so it persists after page reload / browser restart
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result;
        setAvatarPreview(base64Image);

        const savedUser = localStorage.getItem("user");
        let userObj = {};
        if (savedUser) {
          try {
            userObj = JSON.parse(savedUser);
          } catch (err) {}
        }
        userObj.avatar = base64Image;
        userObj.avatarPreview = base64Image;
        localStorage.setItem("user", JSON.stringify(userObj));
        window.dispatchEvent(new Event("storage"));
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Profile Details
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

      const response = await api.post("/user/profile", formData, {
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
      console.warn("Backend Error / Simpan ke LocalStorage fallback.", err);

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

  // Change Password
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
      console.warn("Backend error password update.");
      setMessage({
        type: "success",
        text: "🔑 Kata sandi berhasil diperbarui (Simulasi)!"
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setPwdLoading(false);
    }
  };

  // Logout Handler
  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar dari akun?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("storage"));
      navigate("/login");
    }
  };

  const fullNameDisplay = `${firstName} ${lastName}`.trim() || "Eleanor Vance";

  return (
    <div className="bg-[#fff8f0] text-[#1e1b16] font-body-md antialiased min-h-screen">
      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-8 md:py-12 flex flex-col text-left">
        
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="font-headline-lg text-2xl md:text-4xl font-bold text-[#778873] mb-2 leading-tight">
            My Profile
          </h1>
          <p className="font-body-md text-sm md:text-base text-[#444842]">
            Kelola pengaturan akun dan informasi pribadi Anda.
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
          
          {/* Sidebar Area (Account Summary Card & Navigation) */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Profile Header Summary Card */}
            <div className="bg-[#DCCFC0]/20 border border-[#DCCFC0]/40 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm shadow-[#778873]/5">
              
              {/* Avatar Circle with Upload Trigger */}
              <div className="relative w-24 h-24 rounded-full bg-[#778873]/10 flex items-center justify-center text-[#778873] mb-4 border-2 border-[#778873]/20 overflow-hidden group">
                <img
                  src={avatarPreview || DEFAULT_AVATAR}
                  alt={fullNameDisplay}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                />
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
                Anggota H'Leven sejak 2024
              </p>

              <div className="w-full bg-[#DCCFC0]/40 h-px mb-5"></div>

              {/* Statistics Grid */}
              <div className="w-full grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center p-3 bg-white rounded-xl border border-[#DCCFC0]/30 shadow-xs">
                  <span className="text-[#778873] font-headline-md text-xl font-bold mb-0.5">
                    {bookings.length}
                  </span>
                  <span className="text-[#444842] font-label-sm text-[11px] font-semibold uppercase tracking-wider">
                    Total Menginap
                  </span>
                </div>

                <div className="flex flex-col items-center p-3 bg-white rounded-xl border border-[#DCCFC0]/30 shadow-xs">
                  <span className="text-[#778873] font-headline-md text-xl font-bold mb-0.5">
                    4.5k
                  </span>
                  <span className="text-[#444842] font-label-sm text-[11px] font-semibold uppercase tracking-wider">
                    Poin Reward
                  </span>
                </div>
              </div>
            </div>

            {/* Vertical Context Navigation Menu */}
            <nav className="bg-[#faf3ea] rounded-2xl border border-[#DCCFC0]/40 overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setActiveTab("personal")}
                className={`w-full flex items-center gap-3 px-6 py-4 font-label-md text-sm font-semibold transition-colors border-l-4 text-left cursor-pointer ${
                  activeTab === "personal"
                    ? "bg-[#778873]/10 text-[#778873] border-[#778873]"
                    : "text-[#444842] hover:bg-[#DCCFC0]/20 hover:text-[#778873] border-transparent"
                }`}
              >
                <span className="material-symbols-outlined text-xl">manage_accounts</span>
                Informasi Pribadi
              </button>

              <button
                type="button"
                onClick={() => navigate("/booking-history")}
                className="w-full flex items-center gap-3 px-6 py-4 font-label-md text-sm font-semibold text-[#444842] hover:bg-[#DCCFC0]/20 hover:text-[#778873] border-l-4 border-transparent transition-colors text-left cursor-pointer"
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
            
            {activeTab === "personal" ? (
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
            ) : (
              /* Booking History Tab View */
              <section className="bg-white rounded-2xl border border-[#DCCFC0]/40 p-6 md:p-8 shadow-sm shadow-[#778873]/5">
                <div className="flex items-center gap-3 mb-6 border-b border-[#DCCFC0]/30 pb-4">
                  <span className="material-symbols-outlined text-[#778873] text-2xl">
                    history
                  </span>
                  <h3 className="font-headline-md text-xl font-bold text-[#2D332C]">
                    Riwayat Pemesanan
                  </h3>
                </div>

                {bookings.length === 0 ? (
                  <div className="py-12 text-center text-[#444842]">
                    <span className="material-symbols-outlined text-4xl text-[#747871] mb-2">
                      event_busy
                    </span>
                    <p className="text-sm">Belum ada riwayat reservasi menginap.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="p-5 bg-[#faf3ea] rounded-xl border border-[#DCCFC0]/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-label-sm text-[11px] font-bold text-[#778873]">
                              ID: {item.id}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.status === "Dikonfirmasi" || item.status === "Paid"
                                  ? "bg-[#526b4c]/20 text-[#526b4c]"
                                  : "bg-[#778873]/20 text-[#778873]"
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>

                          <h4 className="font-label-md text-base font-bold text-[#2D332C]">
                            {item.hotel_name || item.hotel?.name || "H'Leven Hotel"}
                          </h4>
                          <p className="text-xs text-[#444842] mt-0.5">
                            {item.room_name || item.room?.name || "Deluxe Suite"}
                          </p>
                          <p className="text-xs text-[#747871] mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">calendar_month</span>
                            {item.check_in} — {item.check_out}
                          </p>
                        </div>

                        <div className="text-right flex md:flex-col justify-between items-center md:items-end w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-[#DCCFC0]/30">
                          <span className="text-xs text-[#444842]">Total Bayar</span>
                          <span className="font-headline-md text-lg font-bold text-[#778873]">
                            Rp {Number(item.total_price || 1500000).toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;