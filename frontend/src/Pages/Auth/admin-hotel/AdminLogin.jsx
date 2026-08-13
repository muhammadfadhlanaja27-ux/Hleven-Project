import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Memanggil endpoint login backend
      const response = await api.post("/login", { email, password });

      // 1. AMBIL DATA DENGAN BENAR (Menyesuaikan format Laravel)
      const responseData = response.data.data || response.data;
      const token = responseData.token || responseData.access_token;
      const user = responseData.user;

      // 2. PASTIKAN DATA TIDAK KOSONG
      if (!token || !user) {
        throw new Error("Data token atau user tidak ditemukan dari server.");
      }

      // 3. VALIDASI ROLE (Hanya admin_hotel atau super_admin yang boleh masuk)
      if (user.role !== "admin_hotel" && user.role !== "super_admin") {
        setError("Akses ditolak. Anda bukan Admin Hotel.");
        setLoading(false);
        return;
      }

      // 4. Simpan ke localStorage dengan format yang benar
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      alert("Login Admin Hotel Berhasil!");

      // 5. Arahkan ke halaman dashboard admin
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Error Login:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Login gagal, periksa email dan password Anda.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          Login Admin H'Leven
        </h2>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              className="w-full p-2 border border-gray-300 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              className="w-full p-2 border border-gray-300 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition duration-200"
            disabled={loading}
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
