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
        throw new Error("Token autentikasi tidak ditemukan dari server.");
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      window.dispatchEvent(new Event("storage"));
      
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
      <main className="w-full max-w-[1000px] bg-surface-container-lowest rounded-xl shadow-sm shadow-forest-green/5 overflow-hidden flex flex-col md:flex-row relative z-10 border border-warm-beige/30">
        {/* Left Side: Image */}
        <div className="hidden md:block md:w-1/2 relative bg-surface-dim">
          <div className="absolute inset-0 bg-cover bg-center w-full h-full" data-alt="A breathtaking, high-quality photograph of a luxury resort infinity pool at golden hour. The calm water reflects a sophisticated, modern architectural facade bathed in warm, soft sunlight. The scene embodies quiet luxury and exclusivity, utilizing a sophisticated palette of muted earth tones, warm beige stone, and deep forest green foliage, perfectly aligning with a premium hospitality brand aesthetic."
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAfCNjjxx28HhcC3xlxBlcUYHFwteXxHdkx0F4GxqjUEbZFhPgMGpPhLuLUjkvbQ8eDR_zSSM-PzErM2OYg2LKkD05q7NfJVIdfbJL-XCrSA1PFPHf958zLIL4eD45818xKeR5rmIUCa7KRAw76tYHxI-uy46fZeDLnNXqajI68WnS7uPm-D1Dmw0kBx2Pn23h5Ma2pTNqGsfz_hvQ2g6q8w8YEQKlDlvtifknsQh1r7SRv5U4RQGbENQ')" }}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-on-background/20 to-transparent"></div>
        </div>
        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-surface-container-lowest">
          <div className="mb-stack-lg flex items-center justify-center md:justify-start">
            <span className="font-headline-md text-headline-md font-bold text-forest-green">H'Leven</span>
          </div>
          <div className="mb-stack-lg text-center md:text-left">
            <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-stack-sm">Welcome Back</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Please enter your details to access your account.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="floating-input w-full">
              <input
                type="email"
                className="w-full rounded-DEFAULT px-4 py-3 font-body-md text-body-md text-on-surface"
                id="email"
                placeholder=" "
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <label className="font-label-md text-label-md" htmlFor="email">Email Address</label>
            </div>
            <div className="floating-input w-full">
              <input
                type="password"
                className="w-full rounded-DEFAULT px-4 py-3 font-body-md text-body-md text-on-surface"
                id="password"
                placeholder=" "
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <label className="font-label-md text-label-md" htmlFor="password">Password</label>
            </div>
            <div className="flex items-center justify-between pt-stack-sm">
              <div className="flex items-center">
                <input
                  className="h-4 w-4 rounded border-warm-beige text-forest-green focus:ring-forest-green bg-surface-container-lowest"
                  id="remember-me"
                  type="checkbox"
                />
                <label className="ml-2 block font-label-md text-label-md text-on-surface-variant" htmlFor="remember-me">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a
                  className="font-label-md text-label-md text-forest-green hover:text-secondary transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-forest-green after:transition-all after:duration-300 hover:after:w-full"
                  href="#"
                >
                  Forgot password?
                </a>
              </div>
            </div>
            <div className="pt-stack-md">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 rounded-DEFAULT text-on-primary bg-forest-green hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forest-green transition-colors duration-200 font-label-md text-label-md shadow-[0_2px_4px_rgba(119,136,115,0.08)] hover:shadow-[0_4px_8px_rgba(119,136,115,0.12)] hover:-translate-y-[1px]"
              >
                {loading ? 'Memproses...' : 'Login'}
              </button>
            </div>
          </form>
          <div className="mt-stack-lg text-center font-body-md text-body-md text-on-surface-variant">
            Don't have an account?{' '}
            <Link to="/register" className="text-[var(--accent)] font-semibold hover:underline">
              Register
            </Link>
          </div>
        </div>
      </main>
  );
};

export default Login;