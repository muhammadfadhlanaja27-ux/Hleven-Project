import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";

const QR_CODE_IMAGE = "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80";

const BookingPage = () => {
  const { hotelId, roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Search parameters for dates
  const searchParams = new URLSearchParams(location.search);
  const paramCheckIn = searchParams.get("checkIn");
  const paramCheckOut = searchParams.get("checkOut");

  const todayStr = new Date().toISOString().split("T")[0];
  const next2Days = new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0];

  // Data States
  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form States
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [checkInDate, setCheckInDate] = useState(paramCheckIn || todayStr);
  const [checkOutDate, setCheckOutDate] = useState(paramCheckOut || next2Days);

  // Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentScreen, setPaymentScreen] = useState("methods"); // 'methods' | 'qris'
  const [orderId, setOrderId] = useState("HLVN-98234-AX");
  const [qrisTimer, setQrisTimer] = useState(15 * 60 - 1); // 14:59

  // Autofill user info from localStorage if logged in
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.name) setFullName(u.name);
        if (u.email) setEmail(u.email);
        if (u.phone) setPhone(u.phone);
      } catch (err) {
        console.error("Gagal membaca data user:", err);
      }
    }
  }, []);

  // Fetch Hotel & Room Data
  useEffect(() => {
    const fetchBookingData = async () => {
      setLoading(true);
      const targetHotelId = hotelId || "1";
      const targetRoomId = roomId || "101";

      try {
        const response = await api.get(`/hotels/${targetHotelId}`);
        if (response.data && response.data.data) {
          const apiHotel = response.data.data;
          const apiRooms = apiHotel.room_types || [];
          const matchedRoomType = apiRooms.find((r) => String(r.id) === String(targetRoomId)) || apiRooms[0];

          if (matchedRoomType) {
            const mappedRoom = {
              id: matchedRoomType.id,
              name: matchedRoomType.name,
              price: matchedRoomType.weekday_price,
              weekday_price: matchedRoomType.weekday_price,
              weekend_price: matchedRoomType.weekend_price,
              capacity: `${matchedRoomType.capacity_adult} Dewasa, ${matchedRoomType.capacity_child} Anak`,
              description: matchedRoomType.description,
            };

            setHotel(apiHotel);
            setRoom(mappedRoom);
          } else {
            setHotel(apiHotel);
            setRoom(null);
          }
        } else {
          setHotel(null);
          setRoom(null);
        }
      } catch (err) {
        console.error("Backend Error / Gagal memuat data booking:", err);
        setHotel(null);
        setRoom(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [hotelId, roomId]);

  // QRIS Timer Interval
  useEffect(() => {
    let timer = null;
    if (showPaymentModal && paymentScreen === "qris" && qrisTimer > 0) {
      timer = setInterval(() => {
        setQrisTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showPaymentModal, paymentScreen, qrisTimer]);

  // Nights and Pricing Breakdown Calculations
  const nightsCount = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 1;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [checkInDate, checkOutDate]);

  const roomPrice = Number(room?.price || room?.weekday_price || 3500000);
  const subtotalPrice = roomPrice * nightsCount;
  const taxAndFees = Math.round(subtotalPrice * 0.21);
  const totalPrice = subtotalPrice + taxAndFees;

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return "15 Nov 2024";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    } catch (e) {
      return dateStr;
    }
  };

  const handleOpenPaymentModal = (e) => {
    e.preventDefault();
    if (!fullName || !email || !phone) {
      alert("Harap lengkapi Data Tamu (Nama, Email, dan No. Telepon).");
      return;
    }
    const generatedOrder = `HLVN-${Math.floor(10000 + Math.random() * 90000)}-AX`;
    setOrderId(generatedOrder);
    setPaymentScreen("methods");
    setShowPaymentModal(true);
  };

  const handleSelectPaymentMethod = (method) => {
    if (method === "qris") {
      setQrisTimer(15 * 60 - 1);
      setPaymentScreen("qris");
    } else {
      // Direct payment confirmation simulation
      confirmPaymentSuccess(method);
    }
  };

  const confirmPaymentSuccess = (methodName = "QRIS") => {
    setSubmitting(true);
    setTimeout(() => {
      alert(
        `🎉 Reservasi Berhasil Dikonfirmasi!\n\n` +
        `Order ID: ${orderId}\n` +
        `Hotel: ${hotel?.name}\n` +
        `Kamar: ${room?.name}\n` +
        `Nama Tamu: ${fullName}\n` +
        `Metode Pembayaran: ${methodName}\n` +
        `Total Dibayar: Rp ${totalPrice.toLocaleString("id-ID")}\n\n` +
        `Terima kasih telah memilih H'Leven!`
      );
      setSubmitting(false);
      setShowPaymentModal(false);
      navigate("/");
    }, 600);
  };

  const formattedTimer = useMemo(() => {
    if (qrisTimer <= 0) return "Waktu Habis";
    const minutes = Math.floor(qrisTimer / 60);
    const seconds = qrisTimer % 60;
    const mStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const sStr = seconds < 10 ? `0${seconds}` : `${seconds}`;
    return `${mStr}:${sStr}`;
  }, [qrisTimer]);

  if (loading) {
    return (
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-12 animate-pulse text-left">
        <div className="h-8 bg-[#DCCFC0]/40 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-[#DCCFC0]/40 rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 h-96 bg-[#DCCFC0]/40 rounded-2xl"></div>
          <div className="lg:col-span-5 h-96 bg-[#DCCFC0]/40 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fff8f0] text-[#1e1b16] font-body-md antialiased min-h-screen">
      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-8 md:py-16 text-left">
        {/* Title Header */}
        <div className="mb-8">
          <h1 className="font-headline-xl text-3xl md:text-5xl font-bold text-[#778873] mb-2 leading-tight">
            Selesaikan Pemesanan Anda
          </h1>
          <p className="font-body-lg text-base md:text-lg text-[#444842]">
            Lengkapi detail di bawah ini untuk mengonfirmasi reservasi Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Guest Data Form & Stay Details */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Dates Summary Section */}
            <section className="bg-white rounded-2xl p-6 border border-[#DCCFC0]/50 shadow-sm">
              <h2 className="font-headline-md text-xl font-bold text-[#778873] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#A1BC98]">calendar_today</span>
                Detail Menginap
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#faf3ea] p-4 rounded-xl border border-[#DCCFC0]/40">
                  <span className="font-label-sm text-xs text-[#444842] uppercase tracking-wider block mb-1">
                    Check-in
                  </span>
                  <div className="font-body-lg text-base font-semibold text-[#2D332C]">
                    {formatDateLabel(checkInDate)}
                  </div>
                  <div className="font-label-sm text-xs text-[#444842] mt-1">
                    Mulai 14:00 WIB
                  </div>
                </div>

                <div className="bg-[#faf3ea] p-4 rounded-xl border border-[#DCCFC0]/40">
                  <span className="font-label-sm text-xs text-[#444842] uppercase tracking-wider block mb-1">
                    Check-out
                  </span>
                  <div className="font-body-lg text-base font-semibold text-[#2D332C]">
                    {formatDateLabel(checkOutDate)}
                  </div>
                  <div className="font-label-sm text-xs text-[#444842] mt-1">
                    Hingga 12:00 WIB
                  </div>
                </div>
              </div>
            </section>

            {/* Guest Details Form */}
            <section className="bg-white rounded-2xl p-6 border border-[#DCCFC0]/50 shadow-sm">
              <h2 className="font-headline-md text-xl font-bold text-[#778873] mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#A1BC98]">person</span>
                Data Tamu
              </h2>

              <form onSubmit={handleOpenPaymentModal} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label-md text-xs font-semibold text-[#444842] mb-2" htmlFor="fullName">
                      Nama Lengkap *
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      placeholder="Sesuai KTP / Paspor"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full bg-[#fff8f0] border border-[#DCCFC0] rounded-xl px-4 py-3 font-body-md text-sm text-[#1e1b16] focus:outline-none focus:border-[#778873] focus:ring-1 focus:ring-[#778873] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-label-md text-xs font-semibold text-[#444842] mb-2" htmlFor="email">
                      Alamat Email *
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="Untuk konfirmasi pemesanan"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-[#fff8f0] border border-[#DCCFC0] rounded-xl px-4 py-3 font-body-md text-sm text-[#1e1b16] focus:outline-none focus:border-[#778873] focus:ring-1 focus:ring-[#778873] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-label-md text-xs font-semibold text-[#444842] mb-2" htmlFor="phone">
                    Nomor Telepon *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="+62 8xx xxxx xxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full bg-[#fff8f0] border border-[#DCCFC0] rounded-xl px-4 py-3 font-body-md text-sm text-[#1e1b16] focus:outline-none focus:border-[#778873] focus:ring-1 focus:ring-[#778873] transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-label-md text-xs font-semibold text-[#444842] mb-2" htmlFor="requests">
                    Permintaan Khusus (Opsional)
                  </label>
                  <textarea
                    id="requests"
                    rows={3}
                    placeholder="Misal: Ranjang tambahan, preferensi lantai atas, check-in terlambat..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full bg-[#fff8f0] border border-[#DCCFC0] rounded-xl px-4 py-3 font-body-md text-sm text-[#1e1b16] focus:outline-none focus:border-[#778873] focus:ring-1 focus:ring-[#778873] transition-colors resize-none"
                  />
                  <p className="font-label-sm text-xs text-[#444842]/80 mt-1.5">
                    *Permintaan khusus bergantung pada ketersediaan saat check-in.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full md:hidden bg-[#778873] text-white font-label-md text-sm font-semibold py-4 rounded-xl hover:bg-[#50604d] transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Lanjut ke Pembayaran
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
              </form>
            </section>
          </div>

          {/* Right Column: Booking Summary & Payment Trigger */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-24 bg-[#e8e2d9] rounded-2xl p-6 flex flex-col gap-5 border border-[#DCCFC0]/60 shadow-md shadow-[#778873]/5">
              <h3 className="font-headline-md text-xl font-bold text-[#778873]">
                Rincian Pemesanan
              </h3>

              {/* Room Info Card */}
              <div className="bg-white rounded-xl overflow-hidden flex border border-[#DCCFC0]/40">
                <img
                  src={room?.thumbnail || hotel?.thumbnail || QR_CODE_IMAGE}
                  alt={room?.name}
                  className="w-1/3 object-cover min-h-[90px]"
                />
                <div className="p-3 flex flex-col justify-center w-2/3 text-left">
                  <span className="font-label-sm text-[11px] font-bold text-[#778873] uppercase tracking-wider mb-0.5">
                    {hotel?.name || "H'Leven Resort"}
                  </span>
                  <h4 className="font-label-md text-sm font-bold text-[#2D332C] line-clamp-2 leading-tight">
                    {room?.name || "Executive Suite dengan Kolam Renang"}
                  </h4>
                  <span className="font-label-sm text-xs text-[#444842] mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">group</span>
                    {room?.capacity || "2 Dewasa"}
                  </span>
                </div>
              </div>

              <hr className="border-t border-[#DCCFC0]/50" />

              {/* Price Breakdown */}
              <div className="space-y-3 font-body-md text-sm text-[#2D332C]">
                <div className="flex justify-between items-center">
                  <span>
                    Tarif Kamar ({nightsCount} Malam)
                    <span className="text-[#444842] text-xs block">Rp {roomPrice.toLocaleString("id-ID")} / malam</span>
                  </span>
                  <span className="font-semibold">Rp {subtotalPrice.toLocaleString("id-ID")}</span>
                </div>

                <div className="flex justify-between items-center text-[#778873]">
                  <span>Pajak &amp; Pelayanan (21%)</span>
                  <span className="font-semibold">Rp {taxAndFees.toLocaleString("id-ID")}</span>
                </div>
              </div>

              <hr className="border-t border-[#DCCFC0]/50" />

              {/* Total Price */}
              <div className="flex justify-between items-end mb-2">
                <span className="font-headline-md text-lg font-bold text-[#2D332C]">Total</span>
                <span className="font-headline-lg text-2xl font-bold text-[#778873]">
                  Rp {totalPrice.toLocaleString("id-ID")}
                </span>
              </div>

              {/* Proceed Button */}
              <button
                type="button"
                onClick={handleOpenPaymentModal}
                className="w-full bg-[#778873] text-white font-label-md text-sm font-semibold py-4 rounded-xl hover:bg-[#50604d] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                Lanjut ke Pembayaran
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>

              <p className="font-label-sm text-xs text-[#444842] text-center flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-sm">shield</span>
                Pembayaran aman dienkripsi
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Payment Modal (Midtrans Gateway Style) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1e1b16]/40 backdrop-blur-sm animate-in fade-in duration-200">
          {paymentScreen === "methods" ? (
            /* Methods Selection Screen */
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden text-left border border-[#DCCFC0]/60 animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="bg-[#778873] text-white p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-label-md text-sm font-bold">H'Leven Hospitality</h3>
                  <p className="font-label-sm text-xs opacity-80">Order ID: {orderId}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="text-white hover:text-[#DCCFC0] transition-colors p-1"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              {/* Amount Header */}
              <div className="p-4 bg-[#f4ede4] text-center border-b border-[#DCCFC0]/40">
                <p className="font-label-sm text-xs text-[#444842] uppercase tracking-wide mb-1">
                  Total Pembayaran
                </p>
                <p className="font-headline-md text-2xl font-bold text-[#2D332C]">
                  Rp {totalPrice.toLocaleString("id-ID")}
                </p>
              </div>

              {/* Payment Methods Scrollable Area */}
              <div className="p-5 overflow-y-auto max-h-[400px] space-y-3">
                <p className="font-label-md text-xs font-semibold text-[#2D332C] uppercase tracking-wider mb-2">
                  Pilih Metode Pembayaran
                </p>

                {/* QRIS Option */}
                <div
                  onClick={() => handleSelectPaymentMethod("qris")}
                  className="border border-[#778873] bg-[#baccb4]/15 rounded-xl p-4 cursor-pointer hover:bg-[#baccb4]/30 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#778873] text-3xl">
                      qr_code_scanner
                    </span>
                    <div>
                      <p className="font-label-md text-sm font-bold text-[#2D332C]">QRIS</p>
                      <p className="font-label-sm text-xs text-[#444842]">GoPay, OVO, ShopeePay, m-BCA, dsb.</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[#778873]">chevron_right</span>
                </div>

                {/* BCA Virtual Account */}
                <div
                  onClick={() => confirmPaymentSuccess("BCA Virtual Account")}
                  className="border border-[#DCCFC0]/60 rounded-xl p-4 cursor-pointer hover:bg-[#faf3ea] transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#2D332C] text-3xl">
                      account_balance
                    </span>
                    <div>
                      <p className="font-label-md text-sm font-bold text-[#2D332C]">BCA Virtual Account</p>
                      <p className="font-label-sm text-xs text-[#444842]">Verifikasi pembayaran otomatis</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[#444842]">chevron_right</span>
                </div>

                {/* Mandiri Virtual Account */}
                <div
                  onClick={() => confirmPaymentSuccess("Mandiri Virtual Account")}
                  className="border border-[#DCCFC0]/60 rounded-xl p-4 cursor-pointer hover:bg-[#faf3ea] transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#2D332C] text-3xl">
                      account_balance
                    </span>
                    <div>
                      <p className="font-label-md text-sm font-bold text-[#2D332C]">Mandiri Virtual Account</p>
                      <p className="font-label-sm text-xs text-[#444842]">Verifikasi pembayaran otomatis</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[#444842]">chevron_right</span>
                </div>

                {/* Credit Card */}
                <div
                  onClick={() => confirmPaymentSuccess("Kartu Kredit / Debit")}
                  className="border border-[#DCCFC0]/60 rounded-xl p-4 cursor-pointer hover:bg-[#faf3ea] transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#2D332C] text-3xl">
                      credit_card
                    </span>
                    <div>
                      <p className="font-label-md text-sm font-bold text-[#2D332C]">Kartu Kredit / Debit</p>
                      <p className="font-label-sm text-xs text-[#444842]">Visa, Mastercard, JCB</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[#444842]">chevron_right</span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-3 bg-[#faf3ea] border-t border-[#DCCFC0]/30 text-center">
                <p className="font-label-sm text-xs text-[#444842]">Secured by Midtrans Gateway</p>
              </div>
            </div>
          ) : (
            /* QRIS Detail Screen */
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden text-left border border-[#DCCFC0]/60 animate-in zoom-in-95 duration-200">
              <div className="bg-[#778873] text-white p-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setPaymentScreen("methods")}
                  className="text-white hover:text-[#DCCFC0] transition-colors flex items-center gap-1 text-sm"
                >
                  <span className="material-symbols-outlined text-xl">arrow_back</span>
                  Kembali
                </button>
                <h3 className="font-label-md text-sm font-bold">Pembayaran QRIS</h3>
                <div className="w-6"></div>
              </div>

              <div className="p-6 flex flex-col items-center justify-center bg-[#FDF6ED] text-center">
                <p className="font-label-md text-xs text-[#2D332C] mb-4">
                  Buka aplikasi e-wallet (GoPay, OVO, m-BCA, dll) dan scan QR Code di bawah.
                </p>

                {/* QR Code Container */}
                <div className="bg-white border-2 border-[#778873] p-4 rounded-2xl shadow-sm mb-6 flex flex-col items-center">
                  <div className="w-48 h-48 bg-white border border-[#DCCFC0]/40 p-2 rounded-xl flex items-center justify-center">
                    <img
                      src={QR_CODE_IMAGE}
                      alt="QR Code QRIS"
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>
                  <p className="font-headline-md text-lg text-[#778873] font-bold tracking-widest mt-3">
                    QRIS
                  </p>
                </div>

                {/* Countdown Timer */}
                <div className="w-full bg-[#f4ede4] rounded-xl p-4 flex items-center justify-between border border-[#DCCFC0]/40 mb-4">
                  <span className="font-label-sm text-xs text-[#444842]">Sisa Waktu Pembayaran</span>
                  <span className="font-label-md text-sm font-bold text-[#ba1a1a] font-mono">
                    {formattedTimer}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => confirmPaymentSuccess("QRIS")}
                  className="w-full bg-[#778873] text-white py-3.5 rounded-xl font-label-md text-sm font-semibold hover:bg-[#50604d] transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  {submitting ? "Memproses..." : "Saya Sudah Bayar"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingPage;