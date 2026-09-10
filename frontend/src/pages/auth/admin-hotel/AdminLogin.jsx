import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../../services/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

      // 1. Ambil data dengan aman (menyesuaikan format Laravel)
      const responseData = response.data.data || response.data;
      const token = responseData.token || responseData.access_token;
      const user = responseData.user;

      // 2. Pastikan data tidak kosong
      if (!token || !user) {
        throw new Error("Data token atau user tidak ditemukan dari server.");
      }

      // 3. Validasi Role (Hanya admin_hotel atau super_admin yang boleh masuk)
      if (user.role !== "admin_hotel" && user.role !== "super_admin") {
        setError("Akses ditolak. Anda bukan Admin Hotel.");
        setLoading(false);
        return;
      }

      // 4. Simpan ke localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Login Admin Hotel Berhasil!");

      // 5. Arahkan ke dashboard admin hotel
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Error Login:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Login gagal, periksa email dan password Anda.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full min-h-screen flex flex-col md:flex-row bg-[#f8faf8] font-['Hanken_Grotesk',sans-serif] text-[#191c1b] selection:bg-[#768875] selection:text-white">
      {/* ====== LEFT PANEL (Branding & Visual Hero) ====== */}
      <div className="hidden md:flex w-1/2 bg-[#768875] relative overflow-hidden flex-col justify-between p-12 lg:p-20 z-0 select-none">
        {/* Abstract Fluid Shapes */}
        <div className="absolute -top-[10%] -left-[10%] w-[120%] h-[120%] opacity-25 pointer-events-none">
          <div
            className="absolute top-0 left-0 w-[550px] h-[550px] bg-[#d4e8d2] mix-blend-overlay animate-pulse"
            style={{
              borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
              animationDuration: "12s",
            }}
          />
          <div
            className="absolute bottom-10 right-0 w-[480px] h-[480px] bg-[#677967] mix-blend-overlay"
            style={{
              borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
            }}
          />
          <div
            className="absolute top-1/4 left-1/4 w-[650px] h-[650px] bg-[#d1eac9] mix-blend-overlay"
            style={{
              borderRadius: "50% 50% 20% 80% / 25% 80% 20% 75%",
            }}
          />
        </div>

        {/* Dot Grid Pattern */}
        <div className="absolute top-12 left-12 grid grid-cols-4 gap-2.5 opacity-30 pointer-events-none">
          {Array.from({ length: 24 }).map((_, index) => (
            <div key={index} className="w-1.5 h-1.5 rounded-full bg-white" />
          ))}
        </div>

        {/* Top left mini badge */}
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-semibold tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-[#d4e8d2]" />
            Hotel Management Portal
          </span>
        </div>

        {/* Hero Headline Content */}
        <div className="relative z-10 max-w-lg my-auto">
          <h1 className="font-['Newsreader',serif] text-5xl lg:text-6xl text-white mb-6 leading-[1.15] font-semibold tracking-tight">
            Admin Hotel<br />Management Portal
          </h1>
          <p className="font-['Hanken_Grotesk',sans-serif] text-white/90 text-lg leading-relaxed max-w-md">
            Start Now – Manage Your Hotel Operations &amp; Elevate Guest Experiences.
          </p>
        </div>

        {/* Footer on Left Panel */}
        <div className="relative z-10 text-white/50 text-xs">
          &copy; {new Date().getFullYear()} H&apos;Leven Hospitality Group. All rights reserved.
        </div>
      </div>

      {/* ====== RIGHT PANEL (Login Form) ====== */}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center p-6 sm:p-12 relative min-h-screen">
        <div className="w-full max-w-[400px] py-8">
          {/* Logo / Branding */}
          <div className="text-center mb-10">
            <span className="font-['Newsreader',serif] text-3xl sm:text-4xl text-[#191c1b] tracking-wider font-semibold">
              H&apos;LEVEN
            </span>
          </div>

          {/* Form Header */}
          <div className="text-center mb-8">
            <h2 className="font-['Newsreader',serif] text-3xl sm:text-4xl text-[#191c1b] font-semibold mb-2 tracking-tight">
              Sign in
            </h2>
            <p className="font-['Hanken_Grotesk',sans-serif] text-sm text-[#747872]">
              Grow Your Career With Us
            </p>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="mb-6 p-4 text-sm text-[#93000a] bg-[#ffdad6] border border-[#ffdad6] rounded-xl flex items-start gap-3 animate-fadeIn">
              <span className="material-symbols-outlined text-[20px] text-[#93000a] shrink-0 mt-0.5">
                error
              </span>
              <div className="flex-1 leading-snug">{error}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="w-full flex flex-col gap-5">
            {/* Email Input Group */}
            <div className="flex flex-col gap-2 w-full">
              <label
                className="font-['Hanken_Grotesk',sans-serif] text-xs font-semibold uppercase tracking-wider text-[#434842]"
                htmlFor="email"
              >
                Email Id
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-[#747872] text-[20px] pointer-events-none select-none">
                  mail
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  disabled={loading}
                  className="w-full h-12 pl-12 pr-4 bg-white border border-[#E5E0D8] rounded-lg font-['Hanken_Grotesk',sans-serif] text-[#191c1b] text-sm focus:outline-none focus:border-[#768875] focus:ring-2 focus:ring-[#768875]/20 transition-all placeholder:text-[#c4c8c0] disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password Input Group */}
            <div className="flex flex-col gap-2 w-full">
              <label
                className="font-['Hanken_Grotesk',sans-serif] text-xs font-semibold uppercase tracking-wider text-[#434842]"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-[#747872] text-[20px] pointer-events-none select-none">
                  lock
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  className="w-full h-12 pl-12 pr-12 bg-white border border-[#E5E0D8] rounded-lg font-['Hanken_Grotesk',sans-serif] text-[#191c1b] text-sm focus:outline-none focus:border-[#768875] focus:ring-2 focus:ring-[#768875]/20 transition-all placeholder:text-[#c4c8c0] disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 text-[#747872] hover:text-[#191c1b] transition-colors p-1 flex items-center justify-center rounded focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-3 bg-[#768875] text-white font-['Hanken_Grotesk',sans-serif] font-semibold text-sm rounded-lg hover:bg-[#657764] active:scale-[0.99] transition-all duration-200 shadow-sm hover:shadow-md disabled:bg-[#a2ba9c] disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Micro Footer Notice */}
          <div className="mt-8 text-center">
            <p className="text-xs text-[#747872]">
              Hanya untuk staf &amp; administrator hotel H&apos;Leven terdaftar.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
