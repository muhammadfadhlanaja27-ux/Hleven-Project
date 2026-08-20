import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      navigate('/');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || 'Email atau password salah.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    /* flex-grow agar mengisi sisa tinggi layar (MainLayout sudah punya flex-col min-h-screen) */
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

            {/* Email Input — Floating Label */}
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

            {/* Password Input — Floating Label */}
            <div className="floating-input w-full">
              <input
                type="password"
                id="password"
                className="w-full rounded px-4 py-3 font-body-md text-[16px] text-[#1e1b16]"
                placeholder=" "
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <label className="font-label-md text-[14px]" htmlFor="password">Password</label>
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
                <a
                  href="#"
                  className="font-label-md text-[14px] text-[#778873] hover:text-[#4c6546] transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-[#778873] after:transition-all after:duration-300 hover:after:w-full"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-[1rem]">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded text-white bg-[#778873] hover:bg-[#4c6546] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#778873] transition-colors duration-200 font-label-md text-[14px] shadow-[0_2px_4px_rgba(119,136,115,0.08)] hover:shadow-[0_4px_8px_rgba(119,136,115,0.12)] hover:-translate-y-[1px] disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Memproses...' : 'Login'}
              </button>
            </div>
          </form>

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
    </div>
  );
};

export default Login;