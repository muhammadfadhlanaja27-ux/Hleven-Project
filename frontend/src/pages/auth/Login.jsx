import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import './Login.css';

const HOTEL_IMAGE_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAfCNjjxx28HhcC3xlxBlcUYHFwteXxHdkx0F4GxqjUEbZFhPgMGpPhLuLUjkvbQ8eDR_zSSM-PzErM2OYg2LKkD05q7NfJVIdfbJL-XCrSA1PFPHf958zLIL4eD45818xKeR5rmIUCa7KRAw76tYHxI-uy46fZeDLnNXqajI68WnS7uPm-D1Dmw0kBx2Pn23h5Ma2pTNqGsfz_hvQ2g6q8w8YEQKlDlvtifknsQh1r7SRv5U4RQGbENQ';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const result = await authService.login(email, password);
      const { user, access_token } = result.data;

      // Validasi role: Hanya Admin Hotel atau Super Admin yang boleh masuk
      if (user.role !== 'admin_hotel' && user.role !== 'super_admin') {
        setErrorMsg('Akses ditolak. Halaman ini khusus untuk Admin Hotel.');
        setLoading(false);
        return;
      }

      // Simpan token dan data user
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect ke Dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      setErrorMsg(
        err?.message || 'Terjadi kesalahan saat login. Periksa email dan password Anda.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <main className="login-card">

        {/* ── Left Side: Image Panel ── */}
        <div className="login-image-panel">
          <div
            className="login-image-bg"
            role="img"
            aria-label="Luxury resort infinity pool at golden hour — H'Leven"
            style={{ backgroundImage: `url('${HOTEL_IMAGE_URL}')` }}
          />
          <div className="login-image-overlay" />
        </div>

        {/* ── Right Side: Form Panel ── */}
        <div className="login-form-panel">

          {/* Brand Logo */}
          <div className="login-brand">
            <span className="login-brand-name">H'Leven</span>
          </div>

          {/* Heading */}
          <div className="login-heading">
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">
              Please enter your details to access your account.
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="login-error" role="alert">
              {errorMsg}
            </div>
          )}

          {/* Login Form */}
          <form className="login-form" onSubmit={handleLogin} noValidate>

            {/* Email Input (Floating Label) */}
            <div className="floating-input">
              <input
                id="email"
                type="email"
                name="email"
                placeholder=" "
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <label htmlFor="email">Email Address</label>
            </div>

            {/* Password Input (Floating Label) */}
            <div className="floating-input">
              <input
                id="password"
                type="password"
                name="password"
                placeholder=" "
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <label htmlFor="password">Password</label>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="login-options-row">
              <div className="login-remember-me">
                <input
                  id="remember-me"
                  type="checkbox"
                  name="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me">Remember me</label>
              </div>

              <a href="#" className="login-forgot-link">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <div className="login-submit-wrapper">
              <button
                id="login-submit-btn"
                type="submit"
                className="login-btn"
                disabled={loading}
              >
                {loading ? 'Memproses...' : 'Login'}
              </button>
            </div>
          </form>

          {/* Register Link */}
          <div className="login-register-prompt">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="login-register-link">
              Register
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}