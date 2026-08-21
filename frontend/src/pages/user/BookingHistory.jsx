import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cachedGet } from "../../services/apiCache";

const QR_CODE_IMAGE = "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80";

const INITIAL_BOOKINGS = [
  {
    id: "HLVN-98234-AX",
    hotel_id: 1,
    hotel_name: "The Sanctuary at Ubud Resort",
    room_name: "Executive Suite dengan Kolam Renang Pribadi",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    check_in: "Jumat, 15 Nov 2024",
    check_out: "Minggu, 17 Nov 2024",
    guest_name: "Eleanor Vance",
    guest_email: "eleanor.vance@example.com",
    price_per_night: 3500000,
    nights: 2,
    tax_and_fees: 1470000,
    total_price: 8470000,
    status: "Paid",
    payment_method: "QRIS Instant",
    is_refundable: true,
  },
  {
    id: "HLVN-44102-BX",
    hotel_id: 2,
    hotel_name: "Maison H'Leven Luxury Heritage",
    room_name: "Classic Balcony Suite",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    check_in: "Rabu, 05 Agt 2024",
    check_out: "Sabtu, 08 Agt 2024",
    guest_name: "Eleanor Vance",
    guest_email: "eleanor.vance@example.com",
    price_per_night: 2800000,
    nights: 3,
    tax_and_fees: 1764000,
    total_price: 10164000,
    status: "Checked Out",
    payment_method: "BCA Virtual Account",
    is_refundable: false,
  },
  {
    id: "HLVN-11920-CX",
    hotel_id: 3,
    hotel_name: "Oasis Resort & Spa Bali",
    room_name: "Water Villa Sunset View",
    image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80",
    check_in: "Senin, 20 Mei 2024",
    check_out: "Senin, 27 Mei 2024",
    guest_name: "Eleanor Vance",
    guest_email: "eleanor.vance@example.com",
    price_per_night: 4200000,
    nights: 7,
    tax_and_fees: 0,
    total_price: 0,
    status: "Cancelled",
    payment_method: "Refunded",
    is_refundable: true,
  }
];

const BookingHistory = () => {
  const navigate = useNavigate();

  // Component States
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [filterStatus, setFilterStatus] = useState("All"); // 'All' | 'Paid' | 'Checked Out' | 'Cancelled'
  const [sortBy, setSortBy] = useState("newest"); // 'newest' | 'oldest' | 'price_high'
  const [selectedBooking, setSelectedBooking] = useState(null); // For E-Ticket Modal
  const [user, setUser] = useState(null);

  // Load User & Fetch API Bookings
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Gagal membaca user:", e);
      }
    }

    const fetchApiBookings = async () => {
      try {
        const TTL_30DETIK = 30 * 1000;
        const { data: responseData, fromCache } = await cachedGet(
          "/user/bookings",
          {},
          false,
          TTL_30DETIK
        );
        if (responseData && responseData.data && responseData.data.length > 0) {
          setBookings(responseData.data);
        }
        if (fromCache) {
          console.debug("[Cache Hit] BookingHistory loaded from cache (30s TTL)");
        }
      } catch (err) {
        // Fallback to INITIAL_BOOKINGS when API is unavailable
      }
    };

    fetchApiBookings();
  }, []);

  // Filter & Sort Logic
  const filteredBookings = useMemo(() => {
    let result = [...bookings];

    if (filterStatus !== "All") {
      if (filterStatus === "Upcoming") {
        result = result.filter((b) => b.status === "Paid" || b.status === "Dikonfirmasi");
      } else if (filterStatus === "Past") {
        result = result.filter((b) => b.status === "Checked Out" || b.status === "Selesai");
      } else if (filterStatus === "Cancelled") {
        result = result.filter((b) => b.status === "Cancelled" || b.status === "Dibatalkan");
      }
    }

    if (sortBy === "newest") {
      result.reverse();
    } else if (sortBy === "price_high") {
      result.sort((a, b) => Number(b.total_price || 0) - Number(a.total_price || 0));
    }

    return result;
  }, [bookings, filterStatus, sortBy]);

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("storage"));
      navigate("/login");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Paid":
      case "Dikonfirmasi":
        return (
          <div className="bg-[#4F6F52]/10 backdrop-blur-sm border border-[#4F6F52]/20 px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4F6F52]"></span>
            <span className="font-label-sm text-xs text-[#4F6F52] font-bold uppercase tracking-wider">
              Paid / Dikonfirmasi
            </span>
          </div>
        );
      case "Checked Out":
      case "Selesai":
        return (
          <div className="bg-[#645b4f]/10 backdrop-blur-sm border border-[#645b4f]/30 px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#645b4f]"></span>
            <span className="font-label-sm text-xs text-[#645b4f] font-bold uppercase tracking-wider">
              Checked Out
            </span>
          </div>
        );
      case "Cancelled":
      case "Dibatalkan":
        return (
          <div className="bg-[#ffdad6]/80 backdrop-blur-sm border border-[#ba1a1a]/20 px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
            <span className="font-label-sm text-xs text-[#ba1a1a] font-bold uppercase tracking-wider">
              Dibatalkan
            </span>
          </div>
        );
      default:
        return (
          <div className="bg-[#778873]/10 backdrop-blur-sm border border-[#778873]/20 px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#778873]"></span>
            <span className="font-label-sm text-xs text-[#778873] font-bold uppercase tracking-wider">
              {status}
            </span>
          </div>
        );
    }
  };

  return (
    <div className="bg-[#fff8f0] text-[#1e1b16] font-body-md antialiased min-h-screen">
      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-8 md:py-16 flex flex-col md:flex-row gap-8 text-left">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-24">
            <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-[#778873] mb-6">
              My Account
            </h1>
            <nav className="flex flex-col gap-2">
              <Link
                to="/profile"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#444842] hover:bg-[#DCCFC0]/30 hover:text-[#778873] transition-colors group font-label-md text-sm font-semibold"
              >
                <span className="material-symbols-outlined text-[#747871] group-hover:text-[#778873] transition-colors">
                  person_outline
                </span>
                Personal Information
              </Link>

              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#DCCFC0]/40 text-[#778873] border-l-4 border-[#778873] shadow-xs font-label-md text-sm font-bold">
                <span className="material-symbols-outlined text-[#778873]">history</span>
                Booking History
              </div>

              <a
                href="#payment"
                onClick={(e) => { e.preventDefault(); alert("Fitur Payment Methods tersimpan."); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#444842] hover:bg-[#DCCFC0]/30 hover:text-[#778873] transition-colors group font-label-md text-sm font-semibold"
              >
                <span className="material-symbols-outlined text-[#747871] group-hover:text-[#778873] transition-colors">
                  credit_card
                </span>
                Payment Methods
              </a>

              <a
                href="#preferences"
                onClick={(e) => { e.preventDefault(); alert("Fitur Preferences tersimpan."); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#444842] hover:bg-[#DCCFC0]/30 hover:text-[#778873] transition-colors group font-label-md text-sm font-semibold"
              >
                <span className="material-symbols-outlined text-[#747871] group-hover:text-[#778873] transition-colors">
                  tune
                </span>
                Preferences
              </a>

              <div className="mt-4 pt-4 border-t border-[#DCCFC0]/50">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#ba1a1a] hover:bg-[#ffdad6]/20 transition-colors group font-label-md text-sm font-semibold text-left cursor-pointer"
                >
                  <span className="material-symbols-outlined group-hover:text-[#ba1a1a] transition-colors">
                    logout
                  </span>
                  Sign Out
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="flex-grow flex flex-col gap-6">
          
          {/* Filters & Sort Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#e8e2d9] p-4 rounded-2xl border border-[#DCCFC0]/30 shadow-xs">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="font-body-md text-xs font-semibold text-[#444842] uppercase tracking-wider">
                Filter:
              </span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[#fff8f0] border border-[#DCCFC0] rounded-xl px-3 py-2 text-sm text-[#1e1b16] font-medium focus:outline-none focus:border-[#778873] w-full sm:w-auto"
              >
                <option value="All">Semua Pesanan</option>
                <option value="Upcoming">Upcoming / Lunas</option>
                <option value="Past">Selesai (Checked Out)</option>
                <option value="Cancelled">Dibatalkan</option>
              </select>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <span className="font-body-md text-xs font-semibold text-[#444842] uppercase tracking-wider">
                Urutkan:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#fff8f0] border border-[#DCCFC0] rounded-xl px-3 py-2 text-sm text-[#1e1b16] font-medium focus:outline-none focus:border-[#778873]"
              >
                <option value="newest">Tanggal (Terbaru)</option>
                <option value="oldest">Tanggal (Terlama)</option>
                <option value="price_high">Harga (Tertinggi)</option>
              </select>
            </div>
          </div>

          {/* Bookings List */}
          <div className="flex flex-col gap-6">
            {filteredBookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#DCCFC0]/40">
                <span className="material-symbols-outlined text-4xl text-[#747871] mb-2">
                  event_busy
                </span>
                <p className="text-[#444842] text-sm">Tidak ada riwayat pemesanan yang sesuai dengan filter.</p>
              </div>
            ) : (
              filteredBookings.map((item) => (
                <article
                  key={item.id}
                  className={`bg-white rounded-2xl border border-[#DCCFC0]/50 overflow-hidden shadow-xs hover:shadow-md hover:shadow-[#778873]/10 transition-all duration-300 flex flex-col sm:flex-row ${
                    item.status === "Cancelled" || item.status === "Dibatalkan" ? "opacity-75" : ""
                  }`}
                >
                  {/* Thumbnail Image with Status Badge Overlay */}
                  <div className="sm:w-1/3 relative h-48 sm:h-auto min-h-[180px]">
                    <img
                      src={item.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"}
                      alt={item.hotel_name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 z-10">
                      {getStatusBadge(item.status)}
                    </div>
                  </div>

                  {/* Card Content Details */}
                  <div className="p-6 flex-grow flex flex-col justify-between gap-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                      <div>
                        <span className="font-label-sm text-[11px] font-bold text-[#778873] uppercase tracking-wider block mb-1">
                          ID Order: {item.id}
                        </span>
                        <h3 className="font-headline-md text-xl font-bold text-[#778873] mb-1">
                          {item.hotel_name}
                        </h3>
                        <p className="font-body-md text-sm text-[#444842] flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">bed</span>
                          {item.room_name}
                        </p>
                        <div className="mt-2">
                          {item.is_refundable ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#4F6F52]/10 border border-[#4F6F52]/20 text-[#4F6F52] font-bold text-[10px] uppercase tracking-wider">
                              <span className="material-symbols-outlined text-[12px]">verified</span>
                              Bisa Refund
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ba1a1a]/10 border border-[#ba1a1a]/20 text-[#ba1a1a] font-bold text-[10px] uppercase tracking-wider">
                              <span className="material-symbols-outlined text-[12px]">block</span>
                              Non-Refundable
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-left sm:text-right mt-2 sm:mt-0">
                        <span className="font-headline-md text-xl font-bold text-[#778873] block">
                          Rp {Number(item.total_price || 0).toLocaleString("id-ID")}
                        </span>
                        <span className="font-label-sm text-xs text-[#747871] uppercase tracking-wider">
                          Total Pembayaran
                        </span>
                      </div>
                    </div>

                    {/* Stay Dates Info Box */}
                    <div className="bg-[#faf3ea] rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 border border-[#DCCFC0]/30">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="w-10 h-10 rounded-full bg-[#DCCFC0]/30 flex items-center justify-center text-[#778873] flex-shrink-0">
                          <span className="material-symbols-outlined text-lg">calendar_month</span>
                        </div>
                        <div>
                          <span className="font-label-sm text-[11px] text-[#747871] uppercase tracking-wider block mb-0.5">
                            Check-in
                          </span>
                          <span className="font-body-md text-sm text-[#1e1b16] font-semibold">
                            {item.check_in}
                          </span>
                        </div>
                      </div>

                      <div className="hidden sm:block w-8 h-[1px] bg-[#DCCFC0]"></div>

                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="w-10 h-10 rounded-full bg-[#DCCFC0]/30 flex items-center justify-center text-[#778873] flex-shrink-0">
                          <span className="material-symbols-outlined text-lg">event_available</span>
                        </div>
                        <div>
                          <span className="font-label-sm text-[11px] text-[#747871] uppercase tracking-wider block mb-0.5">
                            Check-out
                          </span>
                          <span className="font-body-md text-sm text-[#1e1b16] font-semibold">
                            {item.check_out}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedBooking(item)}
                        className="px-5 py-2 rounded-xl border border-[#778873] text-[#778873] font-label-md text-xs font-semibold hover:bg-[#DCCFC0]/20 transition-colors cursor-pointer"
                      >
                        View Details
                      </button>

                      {item.status === "Paid" || item.status === "Dikonfirmasi" ? (
                        <button
                          type="button"
                          onClick={() => setSelectedBooking(item)}
                          className="px-5 py-2 rounded-xl bg-[#778873] text-white font-label-md text-xs font-semibold hover:bg-[#50604d] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-base">download</span>
                          Download E-Ticket
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => navigate(`/hotels/${item.hotel_id || 1}`)}
                          className="px-5 py-2 rounded-xl bg-[#778873] text-white font-label-md text-xs font-semibold hover:bg-[#50604d] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-base">autorenew</span>
                          Book Again
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>

      {/* E-Ticket Modal Popup (ticket.html design) */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1e1b16]/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-[#DCCFC0]/60 max-h-[90vh] text-left animate-in zoom-in-95 duration-200 relative">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedBooking(null)}
              className="absolute top-4 right-4 z-20 text-white hover:text-[#DCCFC0] transition-colors p-1.5 rounded-full bg-black/20 hover:bg-black/40 cursor-pointer"
              title="Tutup Modal"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            {/* Success Header Banner */}
            <div className="bg-[#778873] text-white py-8 px-6 md:px-12 text-center relative overflow-hidden flex-shrink-0">
              <div
                className="absolute inset-0 opacity-10"
                style={{ backgroundImage: "radial-gradient(circle at 50% 120%, white, transparent)" }}
              ></div>
              <span className="material-symbols-outlined text-5xl mb-2 text-white">check_circle</span>
              <h2 className="font-headline-lg text-2xl md:text-3xl font-bold mb-1">
                Payment Successful
              </h2>
              <p className="font-body-lg text-sm md:text-base opacity-90">
                Your journey with H'Leven has begun.
              </p>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-6 md:p-10 overflow-y-auto space-y-8 bg-[#fff8f0]">
              
              {/* Ticket Reference Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#DCCFC0]/60 pb-5 gap-4">
                <div>
                  <p className="font-label-sm text-xs text-[#444842] uppercase tracking-widest mb-1">
                    Booking Reference
                  </p>
                  <p className="font-headline-md text-xl md:text-2xl font-bold text-[#778873]">
                    {selectedBooking.id}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="font-label-sm text-xs text-[#444842] uppercase tracking-widest mb-1">
                    Status
                  </p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#4F6F52]/10 text-[#4F6F52] font-label-md text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#4F6F52] mr-2"></span>
                    {selectedBooking.status === "Paid" ? "Confirmed" : selectedBooking.status}
                  </span>
                </div>
              </div>

              {/* Grid 2 Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Left Column: QR Code & Actions */}
                <div className="flex flex-col items-center justify-center order-2 md:order-1 border-t md:border-t-0 md:border-r border-[#DCCFC0]/60 pt-6 md:pt-0 md:pr-8 text-center">
                  <div className="bg-[#FDF6ED] p-4 border-2 border-[#778873] rounded-2xl mb-4 shadow-sm">
                    <img
                      src={QR_CODE_IMAGE}
                      alt="QR Code Tiket"
                      className="w-44 h-44 object-contain mix-blend-multiply"
                    />
                  </div>
                  <p className="font-body-md text-xs text-[#444842] mb-6 max-w-[240px] leading-relaxed">
                    Tunjukkan QR code ini di resepsionis saat check-in untuk proses yang cepat dan mudah.
                  </p>
                  <div className="w-full flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => alert(`📥 Mengunduh E-Tiket PDF untuk Order ID ${selectedBooking.id}...`)}
                      className="w-full bg-[#778873] text-white font-label-md text-sm font-semibold py-3.5 rounded-xl hover:bg-[#50604d] transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg">download</span>
                      Unduh E-Tiket (PDF)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedBooking(null)}
                      className="w-full text-center font-label-md text-xs font-semibold text-[#778873] hover:underline cursor-pointer py-1"
                    >
                      Tutup Pratinjau Tiket
                    </button>
                  </div>
                </div>

                {/* Right Column: Hotel & Stay Details */}
                <div className="flex flex-col gap-6 order-1 md:order-2">
                  {/* Destination */}
                  <div>
                    <p className="font-label-sm text-xs text-[#444842] uppercase tracking-widest mb-1.5 font-semibold">
                      Destination
                    </p>
                    <h3 className="font-headline-md text-lg font-bold text-[#778873] mb-1">
                      {selectedBooking.hotel_name || "H'Leven Resort"}
                    </h3>
                    <p className="font-body-md text-xs text-[#444842] flex items-start gap-1">
                      <span className="material-symbols-outlined text-sm mt-0.5">location_on</span>
                      Jl. Resort Impian No. 11, Lembang, Bandung, Indonesia
                    </p>
                  </div>

                  {/* Accommodation */}
                  <div className="bg-[#DCCFC0]/20 rounded-xl p-4 border border-[#DCCFC0]/40">
                    <p className="font-label-sm text-[11px] text-[#444842] uppercase tracking-widest mb-1 font-semibold">
                      Accommodation
                    </p>
                    <p className="font-headline-sm text-sm font-bold text-[#2D332C]">
                      {selectedBooking.room_name || "Executive Suite dengan Kolam Renang"}
                    </p>
                    <p className="font-body-md text-xs text-[#444842] mt-1">
                      1 Kamar • 2 Tamu • Termasuk Sarapan Pagi
                    </p>
                    <div className="mt-2">
                      {(selectedBooking.is_refundable === undefined || selectedBooking.is_refundable) ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#4F6F52]/10 border border-[#4F6F52]/20 text-[#4F6F52] font-bold text-[10px] uppercase tracking-wider">
                          <span className="material-symbols-outlined text-[12px]">verified</span>
                          Booking Bisa Direfund
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ba1a1a]/10 border border-[#ba1a1a]/20 text-[#ba1a1a] font-bold text-[10px] uppercase tracking-wider">
                          <span className="material-symbols-outlined text-[12px]">block</span>
                          Non-Refundable
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dates Grid */}
                  <div className="grid grid-cols-2 gap-4 relative bg-white p-3.5 rounded-xl border border-[#DCCFC0]/40">
                    <div className="absolute left-1/2 top-3 bottom-3 w-px bg-[#DCCFC0]/60 -translate-x-1/2"></div>
                    <div>
                      <p className="font-label-sm text-[11px] text-[#444842] uppercase tracking-widest mb-0.5 font-semibold">
                        Check-in
                      </p>
                      <p className="font-label-md text-xs text-[#2D332C] font-bold">
                        {selectedBooking.check_in || "15 Nov 2024"}
                      </p>
                      <p className="font-body-md text-[11px] text-[#444842] mt-0.5">
                        Mulai 14:00 WIB
                      </p>
                    </div>
                    <div className="pl-3">
                      <p className="font-label-sm text-[11px] text-[#444842] uppercase tracking-widest mb-0.5 font-semibold">
                        Check-out
                      </p>
                      <p className="font-label-md text-xs text-[#2D332C] font-bold">
                        {selectedBooking.check_out || "17 Nov 2024"}
                      </p>
                      <p className="font-body-md text-[11px] text-[#444842] mt-0.5">
                        Hingga 12:00 WIB
                      </p>
                    </div>
                  </div>

                  {/* Guest Info */}
                  <div>
                    <p className="font-label-sm text-xs text-[#444842] uppercase tracking-widest mb-2 font-semibold">
                      Guest Details
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[#2D332C] mb-1">
                      <span className="material-symbols-outlined text-[#778873] text-base">person</span>
                      <span className="font-semibold">{selectedBooking.guest_name || user?.name || "Eleanor Vance"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#444842]">
                      <span className="material-symbols-outlined text-[#778873] text-base">call</span>
                      <span>+62 812-3456-7890</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Decoration */}
              <div className="pt-4 border-t border-dashed border-[#DCCFC0] text-center">
                <p className="font-body-md text-xs text-[#444842] italic">
                  Thank you for choosing H'Leven. We look forward to welcoming you.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
