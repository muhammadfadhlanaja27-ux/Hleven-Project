import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";

const SuperAdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    <div style={styles.pageWrapper}>
      {/* ====== LEFT PANEL — Branding ====== */}
      <div style={styles.leftPanel}>
        {/* Decorative background shapes */}
        <div style={styles.decorCircle1} />
        <div style={styles.decorCircle2} />
        <div style={styles.decorLine1} />
        <div style={styles.decorLine2} />

        <div style={styles.brandContent}>
          {/* Logo Mark */}
          <div style={styles.logoMark}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="12" fill="#768875" />
              <path
                d="M14 16h8v16h-8V16zm12 0h8v16h-8V16zM18 24h12"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 style={styles.brandTitle}>H'Leven</h1>
          <div style={styles.brandDivider} />
          <p style={styles.brandTagline}>Authority Portal</p>

          <p style={styles.brandDescription}>
            Sistem manajemen terpusat untuk mengawasi seluruh operasional
            jaringan hotel H'Leven secara real-time.
          </p>

          {/* Feature highlights */}
          <div style={styles.featureList}>
            {[
              { icon: "◆", text: "Monitoring Jaringan Hotel" },
              { icon: "◆", text: "Manajemen Mitra & Pengguna" },
              { icon: "◆", text: "Laporan & Analitik Real-time" },
            ].map((item, i) => (
              <div key={i} style={styles.featureItem}>
                <span style={styles.featureIcon}>{item.icon}</span>
                <span style={styles.featureText}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom info */}
        <p style={styles.leftFooter}>
          © {new Date().getFullYear()} H'Leven Group · All rights reserved
        </p>
      </div>

      {/* ====== RIGHT PANEL — Login Form ====== */}
      <div style={styles.rightPanel}>
        <div style={styles.formContainer}>
          {/* Header */}
          <div style={styles.formHeader}>
            <p style={styles.welcomeLabel}>SUPER ADMIN</p>
            <h2 style={styles.formTitle}>Selamat Datang Kembali</h2>
            <p style={styles.formSubtitle}>
              Masukkan kredensial Anda untuk mengakses portal administrasi.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div style={styles.errorBanner}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="9" cy="9" r="8" stroke="#93000A" strokeWidth="1.5" />
                <path d="M9 5.5v4M9 12h.01" stroke="#93000A" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} style={styles.form}>
            {/* Email */}
            <div style={styles.fieldGroup}>
              <label style={styles.label} htmlFor="sa-email">
                EMAIL
              </label>
              <div style={styles.inputWrapper}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={styles.inputIcon}>
                  <path
                    d="M3 5.25L9 9.75L15 5.25M3 13.5h12a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3A1.5 1.5 0 001.5 6v6A1.5 1.5 0 003 13.5z"
                    stroke="#747872"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  id="sa-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                  placeholder="admin@hleven.com"
                  onFocus={(e) => {
                    e.target.parentElement.style.borderColor = "#768875";
                    e.target.parentElement.style.boxShadow = "0 0 0 3px rgba(118,136,117,0.12)";
                  }}
                  onBlur={(e) => {
                    e.target.parentElement.style.borderColor = "#E5E0D8";
                    e.target.parentElement.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={styles.fieldGroup}>
              <label style={styles.label} htmlFor="sa-password">
                PASSWORD
              </label>
              <div style={styles.inputWrapper}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={styles.inputIcon}>
                  <rect x="3.75" y="8.25" width="10.5" height="7.5" rx="1.5" stroke="#747872" strokeWidth="1.25" />
                  <path d="M6 8.25V5.25a3 3 0 116 0v3" stroke="#747872" strokeWidth="1.25" strokeLinecap="round" />
                </svg>
                <input
                  id="sa-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.input}
                  placeholder="••••••••"
                  onFocus={(e) => {
                    e.target.parentElement.style.borderColor = "#768875";
                    e.target.parentElement.style.boxShadow = "0 0 0 3px rgba(118,136,117,0.12)";
                  }}
                  onBlur={(e) => {
                    e.target.parentElement.style.borderColor = "#E5E0D8";
                    e.target.parentElement.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  tabIndex={-1}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M2.25 2.25l13.5 13.5M7.34 7.34a2.25 2.25 0 003.18 3.18M3.57 5.57C2.37 6.67 1.5 8.07 1.5 9c0 2.49 3.36 5.25 7.5 5.25 1.54 0 2.95-.43 4.14-1.1M9 3.75c4.14 0 7.5 2.76 7.5 5.25 0 .93-.87 2.33-2.07 3.43" stroke="#747872" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M1.5 9c0-2.49 3.36-5.25 7.5-5.25S16.5 6.51 16.5 9s-3.36 5.25-7.5 5.25S1.5 11.49 1.5 9z" stroke="#747872" strokeWidth="1.25" />
                      <circle cx="9" cy="9" r="2.25" stroke="#747872" strokeWidth="1.25" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitButton,
                ...(loading ? styles.submitButtonDisabled : {}),
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = "#657764";
                  e.target.style.boxShadow = "0 6px 24px rgba(118,136,117,0.25)";
                  e.target.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = "#768875";
                  e.target.style.boxShadow = "0 2px 8px rgba(118,136,117,0.15)";
                  e.target.style.transform = "translateY(0)";
                }
              }}
            >
              {loading ? (
                <span style={styles.loadingContent}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    style={styles.spinner}
                  >
                    <circle
                      cx="10"
                      cy="10"
                      r="8"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="2"
                      fill="none"
                    />
                    <path
                      d="M10 2a8 8 0 016.93 4"
                      stroke="#fff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  Memproses...
                </span>
              ) : (
                "Masuk ke Portal"
              )}
            </button>
          </form>

          {/* Footer inside form area */}
          <p style={styles.rightFooter}>
            Akses terbatas hanya untuk Super Administrator H'Leven.
          </p>
        </div>
      </div>

      {/* Inline keyframe animation for the spinner */}
      <style>{`
        @keyframes sa-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes sa-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes sa-fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

/* ============================
   INLINE STYLES (design.md tokens)
   ============================ */
const styles = {
  /* Page wrapper — full viewport split layout */
  pageWrapper: {
    display: "flex",
    height: "100vh",
    width: "100%",
    fontFamily: "'Hanken Grotesk', sans-serif",
    background: "#F9F6F1",
    overflow: "hidden",
  },

  /* ---- LEFT PANEL ---- */
  leftPanel: {
    position: "relative",
    width: "42%",
    height: "100vh",
    background: "linear-gradient(160deg, #2F3231 0%, #3a3e3d 50%, #2F3231 100%)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 40px",
    overflow: "hidden",
    flexShrink: 0,
  },

  /* Decorative shapes */
  decorCircle1: {
    position: "absolute",
    top: "-80px",
    right: "-60px",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    border: "1px solid rgba(118,136,117,0.15)",
    pointerEvents: "none",
  },
  decorCircle2: {
    position: "absolute",
    bottom: "-120px",
    left: "-80px",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    border: "1px solid rgba(118,136,117,0.1)",
    pointerEvents: "none",
  },
  decorLine1: {
    position: "absolute",
    top: "20%",
    left: 0,
    width: "40%",
    height: "1px",
    background: "linear-gradient(90deg, transparent, rgba(118,136,117,0.2), transparent)",
    pointerEvents: "none",
  },
  decorLine2: {
    position: "absolute",
    bottom: "30%",
    right: 0,
    width: "50%",
    height: "1px",
    background: "linear-gradient(270deg, transparent, rgba(118,136,117,0.15), transparent)",
    pointerEvents: "none",
  },

  brandContent: {
    position: "relative",
    zIndex: 1,
    maxWidth: "380px",
    animation: "sa-fadeInUp 0.8s ease-out both",
  },

  logoMark: {
    marginBottom: "16px",
  },

  brandTitle: {
    fontFamily: "'Newsreader', serif",
    fontSize: "36px",
    fontWeight: 600,
    color: "#FFFFFF",
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
    margin: 0,
  },

  brandDivider: {
    width: "48px",
    height: "3px",
    background: "#768875",
    borderRadius: "2px",
    margin: "14px 0",
  },

  brandTagline: {
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontSize: "13px",
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#A2BA9C",
    margin: "0 0 16px 0",
  },

  brandDescription: {
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontSize: "14px",
    lineHeight: 1.6,
    color: "rgba(255,255,255,0.6)",
    margin: "0 0 24px 0",
  },

  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  featureIcon: {
    color: "#768875",
    fontSize: "8px",
  },

  featureText: {
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontSize: "14px",
    color: "rgba(255,255,255,0.75)",
    fontWeight: 400,
  },

  leftFooter: {
    position: "absolute",
    bottom: "20px",
    left: "40px",
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontSize: "11px",
    color: "rgba(255,255,255,0.3)",
    margin: 0,
  },

  /* ---- RIGHT PANEL ---- */
  rightPanel: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 48px",
    background: "#F9F6F1",
    height: "100vh",
    overflowY: "auto",
  },

  formContainer: {
    width: "100%",
    maxWidth: "420px",
    animation: "sa-fadeInUp 0.8s 0.15s ease-out both",
  },

  formHeader: {
    marginBottom: "24px",
  },

  welcomeLabel: {
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.08em",
    color: "#768875",
    margin: "0 0 10px 0",
    textTransform: "uppercase",
  },

  formTitle: {
    fontFamily: "'Newsreader', serif",
    fontSize: "28px",
    fontWeight: 600,
    color: "#2F3231",
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
    margin: "0 0 6px 0",
  },

  formSubtitle: {
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontSize: "14px",
    color: "#747872",
    lineHeight: 1.5,
    margin: 0,
  },

  /* Error */
  errorBanner: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    background: "#FFDAD6",
    border: "1px solid #FFBAB1",
    borderRadius: "8px",
    padding: "12px 16px",
    marginBottom: "24px",
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontSize: "13px",
    color: "#93000A",
    lineHeight: 1.5,
  },

  /* Form */
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  label: {
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.05em",
    color: "#434842",
    margin: 0,
  },

  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    background: "#FFFFFF",
    border: "1px solid #E5E0D8",
    borderRadius: "8px",
    transition: "all 0.2s ease",
  },

  inputIcon: {
    position: "absolute",
    left: "14px",
    pointerEvents: "none",
  },

  input: {
    flex: 1,
    padding: "11px 14px 11px 42px",
    border: "none",
    borderRadius: "8px",
    background: "transparent",
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontSize: "14px",
    color: "#2F3231",
    outline: "none",
    width: "100%",
  },

  eyeButton: {
    position: "absolute",
    right: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    borderRadius: "4px",
    color: "#747872",
  },

  /* Submit */
  submitButton: {
    marginTop: "4px",
    width: "100%",
    padding: "12px 24px",
    background: "#768875",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "8px",
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontSize: "14px",
    fontWeight: 600,
    letterSpacing: "0.01em",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(118,136,117,0.15)",
    transition: "all 0.25s ease",
  },

  submitButtonDisabled: {
    background: "#A2BA9C",
    cursor: "not-allowed",
    boxShadow: "none",
  },

  loadingContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },

  spinner: {
    animation: "sa-spin 0.8s linear infinite",
  },

  rightFooter: {
    marginTop: "20px",
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontSize: "12px",
    color: "#747872",
    textAlign: "center",
  },
};

export default SuperAdminLogin;