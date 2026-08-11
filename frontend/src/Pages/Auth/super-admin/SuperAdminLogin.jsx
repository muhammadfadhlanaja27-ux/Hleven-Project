import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api"; // Pastikan path ini benar sesuai struktur folder Anda

const SuperAdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Menembak API Login
      const response = await api.post("/login", {
        email: email,
        password: password,
      });

      // 2. CEK CONSOLE: Kita log hasil aslinya agar ketahuan bentuknya
      console.log("Berhasil hit API! Ini balasan Backend:", response.data);

      // 3. AMBIL DATA DENGAN AMAN
      // Laravel sering menyimpan data di dalam response.data.data
      // atau menggunakan nama 'access_token' alih-alih 'token'
      const responseData = response.data.data || response.data;
      const token = responseData.token || responseData.access_token;
      const user = responseData.user;

      // 4. Cegah error jika format balasan backend ternyata berbeda
      if (!user || !token) {
        setError("Login berhasil, tapi format data dari server tidak dikenali.");
        setLoading(false);
        return;
      }

      // 5. Validasi tambahan: Pastikan yang login benar-benar super_admin
      if (user.role !== "super_admin") {
        setError("Akses ditolak. Anda bukan Super Admin.");
        setLoading(false);
        return;
      }

      // 6. Simpan token ke localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // 7. Arahkan ke halaman Dashboard Super Admin
      navigate("/super-admin");
    } catch (err) {
      // Tangkap detail error di console
      console.error("Login gagal (Catch Error):", err);
      
      // Tampilkan error dari backend jika ada, jika tidak pakai pesan default
      setError(err.response?.data?.message || "Email atau password salah. Pastikan kredensial Anda benar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-700">H'Leven</h1>
          <p className="text-gray-500 mt-2">Portal Super Admin</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="admin@hleven.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white font-medium ${
              loading
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            } transition-colors`}
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SuperAdminLogin;