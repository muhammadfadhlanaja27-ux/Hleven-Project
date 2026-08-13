import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const UserProfile = () => {
  const navigate = useNavigate();

  // State Form Profil
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  // State Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Loading & Message
  const [loading, setLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Load Data User
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

        if (u.avatar) {
          setAvatarPreview(
            u.avatar.startsWith("http")
              ? u.avatar
              : `http://localhost:8000/storage/${u.avatar.replace(/^\//, "")}`
          );
        }
      } catch (e) {
        console.error("Gagal membaca user data", e);
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // Handle Pilih File Foto Profil
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file)); // Preview instan di browser
    }
  };

  // Simpan Perubahan Profil ke Database
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

      // 🔴 Endpoint mengarah ke /user/profile
      const response = await api.post("/user/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedUser = response.data.user || response.data.data;

      // Update LocalStorage dengan data resmi terbaru dari database
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      if (updatedUser.avatar) {
        setAvatarPreview(
          updatedUser.avatar.startsWith("http")
            ? updatedUser.avatar
            : `http://localhost:8000/storage/${updatedUser.avatar.replace(/^\//, "")}`
        );
      }

      // Beritahu Navbar agar memuat nama & avatar baru
      window.dispatchEvent(new Event("storage"));

      setMessage({ type: "success", text: "🎉 Profil berhasil disimpan ke database!" });
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "❌ Gagal menyimpan data profil ke database.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Ganti Password ke Database
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "⚠️ Konfirmasi kata sandi baru tidak cocok." });
      return;
    }

    setPwdLoading(true);

    try {
      // 🔴 Endpoint mengarah ke /user/change-password
      await api.post("/user/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });

      setMessage({ type: "success", text: "🔑 Kata sandi berhasil diperbarui!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "❌ Kata sandi saat ini salah.",
      });
    } finally {
      setPwdLoading(false);
    }
  };

  // Logout
  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("storage"));
      navigate("/login");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 text-left">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Pengaturan Profil Saya</h1>

      {message.text && (
        <div
          className={`p-4 rounded-2xl mb-6 text-sm font-semibold border ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-red-50 text-red-600 border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Info & Foto */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-center">
            <div className="relative w-28 h-28 mx-auto mb-4">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-28 h-28 rounded-full object-cover border-4 border-gray-100 shadow-sm"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-blue-600 text-white font-bold text-3xl flex items-center justify-center border-4 border-blue-100 mx-auto">
                  {firstName ? firstName.charAt(0).toUpperCase() : "U"}
                </div>
              )}
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-blue-600 text-white p-2.5 rounded-full cursor-pointer hover:bg-blue-700 shadow-md transition-all text-xs"
                title="Pilih Foto Baru"
              >
                📷
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            <h2 className="font-bold text-lg text-gray-900">{`${firstName} ${lastName}`.trim()}</h2>
            <p className="text-xs text-gray-500 mb-4">{email}</p>

            <button
              onClick={handleLogout}
              className="w-full bg-red-50 text-red-600 border border-red-200 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-100 transition-all cursor-pointer"
            >
              🚪 Keluar dari Akun
            </button>
          </div>
        </div>

        {/* Form Edit & Ganti Password */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b border-gray-100 pb-3">
              Informasi Pribadi
            </h2>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Depan</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Belakang</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nomor HP / WhatsApp</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="081234567890"
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-all text-sm shadow-sm cursor-pointer disabled:opacity-50"
              >
                {loading ? "Menyimpan ke Database..." : "Simpan Perubahan Profil"}
              </button>
            </form>
          </div>

          {/* Form Ganti Password */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b border-gray-100 pb-3">
              Ubah Kata Sandi
            </h2>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Kata Sandi Saat Ini</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Kata Sandi Baru</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Konfirmasi Kata Sandi Baru</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={pwdLoading}
                className="bg-gray-800 text-white font-semibold px-6 py-3 rounded-xl hover:bg-gray-900 transition-all text-sm shadow-sm cursor-pointer disabled:opacity-50"
              >
                {pwdLoading ? "Memproses..." : "Perbarui Kata Sandi"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;