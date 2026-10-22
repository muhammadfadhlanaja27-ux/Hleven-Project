import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isTermsAgreed, setIsTermsAgreed] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});

    if (!isTermsAgreed) {
      setError({ general: 'Anda harus menyetujui Syarat dan Ketentuan terlebih dahulu.' });
      return;
    }

    setLoading(true);

    const fullName = `${formData.firstName} ${formData.lastName}`.trim();

    const payload = {
      name: fullName,
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      password_confirmation: formData.password_confirmation
    };

    try {
      const response = await api.post('/register', payload);

      const token =
        response.data?.data?.access_token ||
        response.data?.access_token ||
        response.data?.data?.token ||
        response.data?.token;

      const user = response.data?.data?.user || response.data?.user;

      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        window.dispatchEvent(new Event('storage'));
        navigate('/');
      } else {
        navigate('/login');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        setError(err.response.data.errors);
      } else if (err.response && err.response.data && err.response.data.message) {
        setError({ general: err.response.data.message });
      } else {
        setError({ general: 'Gagal melakukan registrasi. Periksa koneksi Anda.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAgreeTermsModal = () => {
    setIsTermsAgreed(true);
    setShowTermsModal(false);
  };

  return (
    <main className="flex-grow flex items-center justify-center p-[var(--spacing-margin-mobile)] md:p-[var(--spacing-margin-desktop)] py-[5rem]">
      <div className="w-full max-w-[1280px] grid grid-cols-1 md:grid-cols-2 bg-[#faf3ea] rounded-xl overflow-hidden shadow-sm border border-[#DCCFC0]/30 min-h-[700px]">

        {/* Image Side */}
        <div className="hidden md:block relative h-full w-full">
          <div className="absolute inset-0 bg-[#778873]/20 z-10 mix-blend-multiply"></div>
          <div
            className="absolute inset-0 bg-cover bg-center w-full h-full z-0"
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBGHjU2tOXAFZgDyf1GD1wcVwNdc2sLrU5vekcmxwcEHu2yvOZ5iYKPVS8Bk0SBToTM1jsbnIJlyk0sMDMD-1zo5UwhqPKar0VF7qyHBMZ-VgjX0nYFKW4kHmCmKo4LesD5VY2UnBc4axLpuRNW0dWUSbt3TNGtiS4AWxmNLizO-imemEatNgudy-66Z7Q-VSV3W2vnCLxS4KBAQHfel8ufw5-FYVB80w-mc1PZR1azA8VEq_xcwk-CXA')" }}
          ></div>
          <div className="absolute bottom-0 left-0 p-12 z-20 w-full bg-gradient-to-t from-[#1e1b16]/80 to-transparent text-white">
            <h2 className="font-headline-md text-[32px] text-[#FDF6ED] mb-2">Begin Your Journey</h2>
            <p className="font-body-lg text-[18px] text-[#e8e2d9] max-w-md leading-relaxed">
              Experience quiet luxury and unparalleled service. Register to unlock exclusive member rates and curated stays.
            </p>
          </div>
        </div>

        {/* Form Side */}
        <div className="p-8 md:p-16 flex flex-col justify-center relative bg-[#FDF6ED]">

          {/* Back button */}
          <Link
            to="/"
            className="inline-flex items-center text-[#778873] hover:text-[#50604d] transition-colors absolute top-8 left-8 md:left-16 group"
          >
            <span className="material-symbols-outlined mr-2 transition-transform group-hover:-translate-x-1">arrow_back</span>
            <span className="font-label-md text-[14px]">Back</span>
          </Link>

          {/* Header */}
          <div className="text-center md:text-left mt-12 md:mt-0 mb-10">
            <h1 className="font-headline-md text-[24px] font-bold text-[#778873] mb-2">H'Leven</h1>
            <h2 className="font-headline-md text-[28px] md:text-[32px] text-[#2D332C] mb-4">Create an Account</h2>
            <p className="font-body-md text-[16px] text-[#444842]">Please fill in your details to register.</p>
          </div>

          {/* Error umum */}
          {error.general && (
            <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm font-medium flex items-center gap-2 border border-red-200">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{error.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-[1rem] w-full max-w-md mx-auto md:mx-0">

            {/* Nama Depan */}
            <div>
              <label className="block font-label-md text-[14px] text-[#778873] mb-1" htmlFor="firstName">
                Full Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#747871] text-[20px]">person</span>
                <input
                  id="firstName"
                  type="text"
                  className="w-full pl-10 pr-4 py-3 bg-[#e8e2d9] border border-[#DCCFC0] rounded font-body-md text-[16px] text-[#2D332C] focus:border-[#778873] focus:ring-1 focus:ring-[#778873] outline-none transition-colors"
                  placeholder="John Doe"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              {error.first_name && <p className="text-red-500 text-xs mt-1">{error.first_name[0]}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block font-label-md text-[14px] text-[#778873] mb-1" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#747871] text-[20px]">mail</span>
                <input
                  id="email"
                  type="email"
                  className="w-full pl-10 pr-4 py-3 bg-[#e8e2d9] border border-[#DCCFC0] rounded font-body-md text-[16px] text-[#2D332C] focus:border-[#778873] focus:ring-1 focus:ring-[#778873] outline-none transition-colors"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              {error.email && <p className="text-red-500 text-xs mt-1">{error.email[0]}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block font-label-md text-[14px] text-[#778873] mb-1" htmlFor="phone">
                Phone Number
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#747871] text-[20px]">call</span>
                <input
                  id="phone"
                  type="tel"
                  className="w-full pl-10 pr-4 py-3 bg-[#e8e2d9] border border-[#DCCFC0] rounded font-body-md text-[16px] text-[#2D332C] focus:border-[#778873] focus:ring-1 focus:ring-[#778873] outline-none transition-colors"
                  placeholder="+62 8xx xxxx xxxx"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              {error.phone && <p className="text-red-500 text-xs mt-1">{error.phone[0]}</p>}
            </div>

            {/* Password & Konfirmasi dengan Toggle Show/Hide */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[1rem]">
              <div>
                <label className="block font-label-md text-[14px] text-[#778873] mb-1" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#747871] text-[20px]">lock</span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-10 pr-10 py-3 bg-[#e8e2d9] border border-[#DCCFC0] rounded font-body-md text-[16px] text-[#2D332C] focus:border-[#778873] focus:ring-1 focus:ring-[#778873] outline-none transition-colors"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#747871] hover:text-[#2D332C] transition-colors focus:outline-none"
                    tabIndex={-1}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {error.password && <p className="text-red-500 text-xs mt-1">{error.password[0]}</p>}
              </div>

              <div>
                <label className="block font-label-md text-[14px] text-[#778873] mb-1" htmlFor="confirmPassword">
                  Confirm
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#747871] text-[20px]">lock_reset</span>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className="w-full pl-10 pr-10 py-3 bg-[#e8e2d9] border border-[#DCCFC0] rounded font-body-md text-[16px] text-[#2D332C] focus:border-[#778873] focus:ring-1 focus:ring-[#778873] outline-none transition-colors"
                    placeholder="••••••••"
                    value={formData.password_confirmation}
                    onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#747871] hover:text-[#2D332C] transition-colors focus:outline-none"
                    tabIndex={-1}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showConfirmPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Terms and Conditions Checkbox + Trigger Modal */}
            <div className="flex items-start mt-[1rem]">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  checked={isTermsAgreed}
                  onChange={(e) => setIsTermsAgreed(e.target.checked)}
                  className="w-4 h-4 text-[#778873] border-[#DCCFC0] rounded focus:ring-[#778873] bg-[#e8e2d9] cursor-pointer"
                  required
                />
              </div>
              <div className="ml-3 text-sm">
                <label className="font-body-md text-[14px] text-[#444842]" htmlFor="terms">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-[#778873] hover:underline font-semibold cursor-pointer"
                  >
                    Terms and Conditions
                  </button>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#778873] hover:bg-[#50604d] text-white font-label-md text-[14px] py-4 rounded transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#778873]/20 mt-[2rem] disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Memproses...' : 'Register Account'}
            </button>

            <p className="text-center font-body-md text-[16px] text-[#444842] mt-[1rem]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#778873] font-medium hover:underline">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* MODAL POPUP: TERMS AND CONDITIONS */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1e1b16]/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FDF6ED] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-[#DCCFC0] flex flex-col max-h-[85vh] text-left">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-[#DCCFC0] flex items-center justify-between bg-[#faf3ea]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#778873] text-2xl">gavel</span>
                <h3 className="font-headline-md text-xl font-bold text-[#2D332C]">
                  Syarat dan Ketentuan (Terms & Conditions)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="p-1 rounded-full text-[#747871] hover:bg-[#DCCFC0]/30 transition-colors"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Modal Body / Isi Dokumen Terms */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-[#444842] font-body-md text-sm leading-relaxed">
              <section>
                <h4 className="font-headline-sm text-base font-bold text-[#778873] mb-1">
                  1. Ketentuan Akun & Keanggotaan
                </h4>
                <p>
                  Dengan membuat akun di platform <strong>H'Leven</strong>, Anda menjamin bahwa informasi yang Anda berikan adalah akurat, sah, dan terkini. Anda bertanggung jawab penuh untuk menjaga kerahasiaan kata sandi dan seluruh aktivitas yang terjadi di bawah akun Anda.
                </p>
              </section>

              <section>
                <h4 className="font-headline-sm text-base font-bold text-[#778873] mb-1">
                  2. Pemesanan & Pembayaran Kamar
                </h4>
                <p>
                  Setiap reservasi kamar yang dilakukan melalui layanan kami akan dikonfirmasi setelah pembayaran terverifikasi. Harga ketersediaan kamar yang ditampilkan sudah mencakup pajak layanan kecuali dinyatakan lain.
                </p>
              </section>

              <section>
                <h4 className="font-headline-sm text-base font-bold text-[#778873] mb-1">
                  3. Kebijakan Pembatalan & Pengembalian Dana
                </h4>
                <p>
                  Pembatalan pesanan mengacu pada ketentuan masing-masing tipe kamar. Kamar dengan label <em>refundable</em> dapat diajukan pembatalan sesuai batas waktu yang ditentukan sebelum periode check-in.
                </p>
              </section>

              <section>
                <h4 className="font-headline-sm text-base font-bold text-[#778873] mb-1">
                  4. Privasi & Perlindungan Data
                </h4>
                <p>
                  Data pribadi Anda seperti nama, email, dan nomor telepon hanya digunakan untuk keperluan transaksi reservasi serta peningkatan layanan platform H'Leven. Kami tidak akan memperjualbelikan data Anda kepada pihak ketiga.
                </p>
              </section>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#DCCFC0] bg-[#faf3ea] flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-[#747871]">
                Harap baca seluruh poin sebelum menyetujui pendaftaran.
              </p>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowTermsModal(false)}
                  className="flex-1 sm:flex-none px-5 py-2.5 border border-[#DCCFC0] rounded-xl font-label-md text-xs font-semibold text-[#444842] hover:bg-[#DCCFC0]/20 transition-colors"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleAgreeTermsModal}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-[#778873] text-white rounded-xl font-label-md text-xs font-semibold hover:bg-[#50604d] transition-colors shadow-xs"
                >
                  Saya Setuju
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </main>
  );
};

export default Register;