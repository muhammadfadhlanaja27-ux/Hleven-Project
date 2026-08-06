import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import './Register.css';

const HOTEL_IMAGE_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBGHjU2tOXAFZgDyf1GD1wcVwNdc2sLrU5vekcmxwcEHu2yvOZ5iYKPVS8Bk0SBToTM1jsbnIJlyk0sMDMD-1zo5UwhqPKar0VF7qyHBMZ-VgjX0nYFKW4kHmCmKo4LesD5VY2UnBc4axLpuRNW0dWUSbt3TNGtiS4AWxmNLizO-imemEatNgudy-66Z7Q-VSV3W2vnCLxS4KBAQHfel8ufw5-FYVB80w-mc1PZR1azA8VEq_xcwk-CXA';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validasi client-side
    if (formData.password.length < 8) {
      setErrorMsg('Password minimal harus 8 karakter.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Password dan konfirmasi password tidak cocok.');
      return;
    }
    if (!agreedToTerms) {
      setErrorMsg('Anda harus menyetujui syarat dan ketentuan untuk melanjutkan.');
      return;
    }

    setLoading(true);

    try {
      const result = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
      });

      const responseData = result.data?.data || result.data;
      const user = responseData?.user;
      const access_token = responseData?.access_token;

      if (access_token) {
        localStorage.setItem('access_token', access_token);
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }

      if (user && (user.role === 'admin_hotel' || user.role === 'super_admin')) {
        navigate('/admin/dashboard');
      } else {
        navigate('/login');
      }
    } catch (err) {
      const backendError = err?.response?.data?.errors || err?.errors;
      if (backendError) {
        const firstError = Object.values(backendError)[0];
        setErrorMsg(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        setErrorMsg(err?.response?.data?.message || err?.message || 'Registrasi gagal. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <main className="register-card">

        {/* ── Left: Image Panel ── */}
        <div className="register-image-panel">
          <div
            className="register-image-bg"
            role="img"
            aria-label="Luxury hotel pool at sunset — H'Leven"
            style={{ backgroundImage: `url('${HOTEL_IMAGE_URL}')` }}
          />
          <div className="register-image-tint" />
          <div className="register-image-caption">
            <h2>Begin Your Journey</h2>
            <p>
              Experience quiet luxury and unparalleled service. Register to unlock
              exclusive member rates and curated stays.
            </p>
          </div>
        </div>

        {/* ── Right: Form Panel ── */}
        <div className="register-form-panel">

          {/* Back Link */}
          <Link to="/login" className="register-back-link">
            <span className="back-icon material-symbols-outlined">arrow_back</span>
            <span>Back</span>
          </Link>

          {/* Heading */}
          <div className="register-heading">
            <span className="register-brand-name">H'Leven</span>
            <h1 className="register-title">Create an Account</h1>
            <p className="register-subtitle">Please fill in your details to register.</p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="register-alert register-alert-error" role="alert">
              {errorMsg}
            </div>
          )}

          {/* Register Form */}
          <form className="register-form" onSubmit={handleSubmit} noValidate>

            {/* Full Name */}
            <div className="register-field">
              <label className="register-label" htmlFor="name">Full Name</label>
              <div className="register-input-wrapper">
                <span className="register-input-icon material-symbols-outlined">person</span>
                <input
                  id="name"
                  type="text"
                  name="name"
                  className="register-input"
                  placeholder="John Doe"
                  required
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
            <div className="register-field">
              <label className="register-label" htmlFor="email">Email Address</label>
              <div className="register-input-wrapper">
                <span className="register-input-icon material-symbols-outlined">mail</span>
                <input
                  id="email"
                  type="email"
                  name="email"
                  className="register-input"
                  placeholder="john@example.com"
                  required
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="register-field">
              <label className="register-label" htmlFor="phone">
                Phone Number <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span>
              </label>
              <div className="register-input-wrapper">
                <span className="register-input-icon material-symbols-outlined">call</span>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  className="register-input"
                  placeholder="+62 812 3456 7890"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password & Confirm — 2 columns */}
            <div className="register-field-row">
              <div className="register-field">
                <label className="register-label" htmlFor="password">Password</label>
                <div className="register-input-wrapper">
                  <span className="register-input-icon material-symbols-outlined">lock</span>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    className="register-input"
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    minLength={8}
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="register-field">
                <label className="register-label" htmlFor="confirmPassword">Confirm</label>
                <div className="register-input-wrapper">
                  <span className="register-input-icon material-symbols-outlined">lock_reset</span>
                  <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    className="register-input"
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="register-terms">
              <input
                id="terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                disabled={loading}
              />
              <label htmlFor="terms">
                I agree to the{' '}
                <a href="#" onClick={(e) => e.preventDefault()}>
                  Terms and Conditions
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              id="register-submit-btn"
              type="submit"
              className="register-btn"
              disabled={loading}
            >
              {loading ? 'Memproses...' : 'Register Account'}
            </button>

            {/* Login link */}
            <p className="register-login-prompt">
              Already have an account?{' '}
              <Link to="/login" className="register-login-link">
                Login
              </Link>
            </p>

          </form>
        </div>
      </main>
    </div>
  );
}