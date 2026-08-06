import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  StitchCard, 
  StitchInput, 
  StitchButton, 
  StitchAlert 
} from 'google-stitch-ui'; // Menggunakan Google Stitch UI Components

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      // Redirect ke Landing Page atau Halaman Utama setelah berhasil
      navigate('/');
    } catch (err) {
      setError(err.message || 'Email atau password salah.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <StitchCard className="w-full max-w-md p-6 shadow-lg rounded-xl bg-white">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Masuk ke H'Leven
        </h2>
        <p className="text-sm text-center text-gray-500 mb-6">
          Temukan dan pesan hotel favoritmu dengan mudah.
        </p>

        {error && (
          <StitchAlert type="error" className="mb-4">
            {error}
          </StitchAlert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <StitchInput
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <StitchInput
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />
          </div>

          <StitchButton
            type="submit"
            variant="primary"
            disabled={submitting}
            className="w-full mt-2"
          >
            {submitting ? 'Memproses...' : 'Masuk'}
          </StitchButton>
        </form>

        <p className="text-xs text-center text-gray-600 mt-6">
          Belum punya akun?{' '}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">
            Daftar Sekarang
          </Link>
        </p>
      </StitchCard>
    </div>
  );
};

export default Login;