import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';

  const resetForgotState = () => {
    setShowForgotModal(false);
    setForgotStep(1);
    setForgotEmail('');
    setForgotOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotError('');
    setForgotLoading(false);
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);

    try {
      const response = await api.post('/forgot-password', { email: forgotEmail });
      toast.success(response.data?.message || 'Kode OTP dikirim ke email');
      setForgotStep(2);
    } catch (err) {
                  setForgotError(err.response?.data?.message || 'Failed to send OTP. Ensure the email is registered.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);

    try {
      const response = await api.post('/verify-otp', {
        email: forgotEmail,
        otp: forgotOtp,
      });
      toast.success(response.data?.message || 'Kode OTP valid');
      setForgotStep(3);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Kode OTP tidak valid atau sudah kadaluarsa.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError('');

    if (newPassword !== confirmPassword) {
      setForgotError('Password confirmation does not match');
      return;
    }

    setForgotLoading(true);
    try {
      const response = await api.post('/reset-password', {
        email: forgotEmail,
        otp: forgotOtp,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      toast.success(response.data?.message || 'Password updated successfully');
      resetForgotState();
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Reset password gagal. Periksa kembali kode OTP.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/login', formData);

      const token =
        response.data?.data?.access_token ||
        response.data?.access_token ||
        response.data?.data?.token ||
        response.data?.token;

      const user = response.data?.data?.user || response.data?.user;

      if (!token) {
        throw new Error('Token autentikasi tidak ditemukan dari server.');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      window.dispatchEvent(new Event('storage'));
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || 'Incorrect email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center p-[var(--spacing-margin-mobile)] md:p-[var(--spacing-margin-desktop)]">
      <main className="w-full max-w-[1000px] bg-white rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row relative z-10 border border-[#DCCFC0]/30">

        {/* Left Side: Image */}
        <div className="hidden md:block md:w-1/2 relative bg-[#e0d9d0]">
          <div
            className="absolute inset-0 bg-cover bg-center w-full h-full"
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAfCNjjxx28HhcC3xlxBlcUYHFwteXxHdkx0F4GxqjUEbZFhPgMGpPhLuLUjkvbQ8eDR_zSSM-PzErM2OYg2LKkD05q7NfJVIdfbJL-XCrSA1PFPHf958zLIL4eD45818xKeR5rmIUCa7KRAw76tYHxI-uy46fZeDLnNXqajI68WnS7uPm-D1Dmw0kBx2Pn23h5Ma2pTNqGsfz_hvQ2g6q8w8YEQKlDlvtifknsQh1r7SRv5U4RQGbENQ')" }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#1e1b16]/20 to-transparent"></div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">

          {/* Brand Logo */}
          <div className="mb-[2rem] flex items-center justify-center md:justify-start">
            <span className="font-headline-md text-[24px] font-bold text-[#778873]">H'Leven</span>
          </div>

          {/* Heading */}
          <div className="mb-[2rem] text-center md:text-left">
            <h1 className="font-headline-md text-[28px] md:text-[32px] text-[#1e1b16] mb-[0.5rem]">Welcome Back</h1>
            <p className="font-body-md text-[16px] text-[#444842]">Please enter your details to access your account.</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm font-medium flex items-center gap-2 border border-red-200">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-[1rem]">

            {/* Email Input */}
            <div className="floating-input w-full">
              <input
                type="email"
                id="email"
                className="w-full rounded px-4 py-3 font-body-md text-[16px] text-[#1e1b16]"
                placeholder=" "
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <label className="font-label-md text-[14px]" htmlFor="email">Email Address</label>
            </div>

            {/* Password Input dengan Toggle Show/Hide */}
            <div className="floating-input w-full relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="w-full rounded px-4 py-3 pr-10 font-body-md text-[16px] text-[#1e1b16]"
                placeholder=" "
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <label className="font-label-md text-[14px]" htmlFor="password">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-[#747871] hover:text-[#1e1b16] transition-colors focus:outline-none"
                tabIndex={-1}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-[0.5rem]">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember-me"
                  className="h-4 w-4 rounded border-[#DCCFC0] text-[#778873] focus:ring-[#778873] bg-white cursor-pointer"
                />
                <label
                  className="ml-2 block font-label-md text-[14px] text-[#444842] cursor-pointer"
                  htmlFor="remember-me"
                >
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(true);
                    setForgotStep(1);
                    setForgotEmail(formData.email || '');
                  }}
                  className="font-label-md text-[14px] text-[#778873] hover:text-[#4c6546] transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-[#778873] after:transition-all after:duration-300 hover:after:w-full"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-[1rem]">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded text-white bg-[#778873] hover:bg-[#4c6546] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#778873] transition-colors duration-200 font-label-md text-[14px] shadow-[0_2px_4px_rgba(119,136,115,0.08)] hover:shadow-[0_4px_8px_rgba(119,136,115,0.12)] hover:-translate-y-[1px] disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Processing...' : 'Login'}
                </button>
            </div>
          </form>

          {/* Social Login Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#DCCFC0]/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-[#747871] font-body-sm">Or continue with</span>
            </div>
          </div>

          {/* Google Login Button */}
          <button
            onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/auth/google`}
            className="w-full flex justify-center items-center gap-3 py-3 px-4 rounded border border-[#DCCFC0] bg-white text-[#444842] hover:bg-[#faf3ea] transition-all duration-200 font-label-md text-[14px] shadow-sm cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7v2.25h2.91c1.7-1.56 2.68-3.86 2.68-6.58z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.25c-.8.54-1.83.86-3.05.86-2.34 0-4.32-1.58-5.03-3.7H1.06v2.29C2.54 15.96 5.58 18 9 18z" />
              <path fill="#FBBC05" d="M3.97 10.73c-.18-.54-.28-1.12-.28-1.73s.1-1.19.28-1.73V4.98H1.06C.38 6.19 0 7.55 0 9s.38 2.81 1.06 4.02l2.91-2.29z" />
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.89 11.43 0 9 0 5.58 0 2.54 2.04 1.06 4.98l2.91 2.29C4.68 5.16 6.66 3.58 9 3.58z" />
            </svg>
            Google
          </button>

          {/* Register Link */}
          <div className="mt-[2rem] text-center font-body-md text-[16px] text-[#444842]">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-label-md text-[14px] text-[#778873] font-bold hover:text-[#4c6546] transition-colors underline decoration-[#DCCFC0] underline-offset-4 hover:decoration-[#778873]"
            >
              Register
            </Link>
          </div>

        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-[#DCCFC0]/40 p-6 md:p-8 relative">
            <button
              type="button"
              onClick={resetForgotState}
              className="absolute top-4 right-4 text-[#747871] hover:text-[#1e1b16]"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <h2 className="font-headline-md text-[22px] font-bold text-[#1e1b16] mb-1">
                  {forgotStep === 1
                    ? 'Forgot Password'
                    : forgotStep === 2
                    ? 'Verify OTP Code'
                    : 'Reset Password'}
                </h2>
                <p className="font-body-md text-[14px] text-[#444842] mb-4">
                  {forgotStep === 1
                    ? 'Enter your account email to receive a verification OTP code.'
                    : forgotStep === 2
                    ? `Enter the 6-digit OTP code sent to ${forgotEmail}.`
                    : 'Create a new password for your account.'}
                </p>

            {forgotError && (
              <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm font-medium flex items-center gap-2 border border-red-200">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{forgotError}</span>
              </div>
            )}

            {forgotStep === 1 && (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#747871] mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full px-3 py-2.5 rounded border border-[#DCCFC0] text-sm focus:outline-none focus:border-[#778873]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 px-4 rounded text-white bg-[#778873] hover:bg-[#4c6546] font-medium text-sm disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {forgotLoading ? 'Sending OTP...' : 'Send OTP Code'}
                </button>
              </form>
            )}

            {forgotStep === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#747871] mb-1">
                    Kode OTP (6 digit)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full px-3 py-2.5 rounded border border-[#DCCFC0] text-sm tracking-widest text-center font-bold focus:outline-none focus:border-[#778873]"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-[#747871] pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep(1);
                      setForgotError('');
                    }}
                    className="hover:underline text-[#778873] cursor-pointer"
                  >
                    Change Email
                  </button>
                  <button
                    type="button"
                    disabled={forgotLoading}
                    onClick={handleRequestOtp}
                    className="hover:underline text-[#778873] disabled:opacity-50 cursor-pointer"
                  >
                    Resend OTP
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading || forgotOtp.length < 6}
                  className="w-full py-2.5 px-4 rounded text-white bg-[#778873] hover:bg-[#4c6546] font-medium text-sm disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {forgotLoading ? 'Verifying...' : 'Continue to New Password'}
                </button>
              </form>
            )}

            {forgotStep === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#747871] mb-1">
                    New Password (min 8 chars)
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 pr-10 rounded border border-[#DCCFC0] text-sm focus:outline-none focus:border-[#778873]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 text-[#747871] hover:text-[#1e1b16] cursor-pointer"
                      tabIndex={-1}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showNewPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#747871] mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 rounded border border-[#DCCFC0] text-sm focus:outline-none focus:border-[#778873]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 px-4 rounded text-white bg-[#778873] hover:bg-[#4c6546] font-medium text-sm disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {forgotLoading ? 'Saving...' : 'Save New Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;