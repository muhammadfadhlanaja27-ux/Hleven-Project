import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { StitchContainer, StitchNavbar, StitchContent } from 'google-stitch-ui'; // Fictional UI lib per prompt
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const UserLayout = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('access_token');

  // Proteksi route: Redirect ke login jika tidak ada token Sanctum
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  return (
    <StitchContainer layout="full-width">
      <Navbar />
      <StitchContent className="min-h-screen pt-16 bg-gray-50">
        {/* Child routes (Booking, Profile, History) akan di-render di sini */}
        <Outlet /> 
      </StitchContent>
      <Footer />
    </StitchContainer>
  );
};

export default UserLayout;