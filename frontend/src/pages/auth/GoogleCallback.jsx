import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userData = params.get('user');

    if (token && userData) {
      try {
        const user = JSON.parse(decodeURIComponent(userData));
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Dispatch event to update navbar/UI
        window.dispatchEvent(new Event('storage'));
        
        toast.success('Login Google Berhasil!');
        navigate('/', { replace: true });
      } catch (e) {
        console.error('Error parsing user data:', e);
        toast.error('Gagal memproses data login.');
        navigate('/login');
      }
    } else {
      toast.error('Login Gagal atau Dibatalkan.');
      navigate('/login');
    }
  }, [location, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#778873] mx-auto"></div>
        <p className="mt-4 text-[#444842]">Memproses login Google...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
