import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../services/api";

const DEFAULT_ROOM_IMAGES = [
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"
];

const RoomDetail = () => {
  const { hotelId, roomId } = useParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Reservation Form State
  const todayStr = new Date().toISOString().split("T")[0];
  const next4Days = new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0];

  const [checkInDate, setCheckInDate] = useState(todayStr);
  const [checkOutDate, setCheckOutDate] = useState(next4Days);
  const [guestCount, setGuestCount] = useState("2 Tamu Dewasa");

  useEffect(() => {
    const fetchDetail = async () => {
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
            const thumbnailPhoto = matchedRoomType.photos && matchedRoomType.photos.length > 0 
              ? (matchedRoomType.photos.find(p => p.is_thumbnail) || matchedRoomType.photos[0]) 
              : null;
            const photoPath = thumbnailPhoto ? (thumbnailPhoto.photo || thumbnailPhoto.url) : null;
            const roomImage = photoPath 
              ? (photoPath.startsWith('http') ? photoPath : `http://localhost:8000/storage/${photoPath.replace(/^\//, '')}`)
              : null;

            const mappedRoom = {
              id: matchedRoomType.id,
              name: matchedRoomType.name,
              price: matchedRoomType.weekday_price,
              weekday_price: matchedRoomType.weekday_price,
              weekend_price: matchedRoomType.weekend_price,
              thumbnail: roomImage,
              capacity: `${matchedRoomType.capacity_adult} Dewasa, ${matchedRoomType.capacity_child} Anak`,
              description: matchedRoomType.description,
              bed: matchedRoomType.description?.includes("Bed") ? matchedRoomType.description : "1 King Bed",
              breakfast: matchedRoomType.breakfast,
              smoking_area: matchedRoomType.smoking_area,
              stock: matchedRoomType.stock,
              photos: matchedRoomType.photos || []
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
        console.error("Backend API Error/Offline:", err);
        setHotel(null);
        setRoom(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [hotelId, roomId]);

  // Price & Nights Calculation
  const nightsCount = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 1;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [checkInDate, checkOutDate]);

  const roomPrice = Number(room?.price || room?.weekday_price || 3200000);
  const subtotalPrice = roomPrice * nightsCount;
  const taxAndFees = Math.round(subtotalPrice * 0.21);
  const totalPrice = subtotalPrice + taxAndFees;

  const getImageUrl = (photoItem, fallbackIdx = 0) => {
    if (!photoItem) return DEFAULT_ROOM_IMAGES[fallbackIdx % DEFAULT_ROOM_IMAGES.length];
    let path = typeof photoItem === "object" ? photoItem.photo || photoItem.url : photoItem;
    if (!path) return DEFAULT_ROOM_IMAGES[fallbackIdx % DEFAULT_ROOM_IMAGES.length];
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `http://localhost:8000/storage/${path.replace(/^\//, '')}`;
  };

  const photosList = room?.photos && room.photos.length > 0
    ? room.photos.map((p, i) => getImageUrl(p, i))
    : (hotel?.photos && hotel.photos.length > 0
        ? hotel.photos.map((p, i) => getImageUrl(p, i))
        : DEFAULT_ROOM_IMAGES);

  const handleReserve = (e) => {
    e.preventDefault();
    const hId = hotel?.id || hotelId || 1;
    const rId = room?.id || roomId || 101;
    navigate(`/booking/${hId}/${rId}?checkIn=${checkInDate}&checkOut=${checkOutDate}`);
  };

  if (loading) {
    return (
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-12 animate-pulse text-left">
        <div className="h-6 bg-[#DCCFC0]/40 rounded w-1/4 mb-4"></div>
        <div className="h-10 bg-[#DCCFC0]/40 rounded w-1/2 mb-6"></div>
        <div className="h-[500px] bg-[#DCCFC0]/40 rounded-2xl mb-8"></div>
        <div className="h-40 bg-[#DCCFC0]/40 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#fff8f0] text-[#1e1b16] font-body-md antialiased min-h-screen">
      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-8 md:py-12 flex flex-col gap-10 text-left">
        
        {/* Breadcrumb & Title Area */}
        <section className="flex flex-col gap-4">
          <nav className="flex items-center space-x-2 text-xs font-medium text-[#444842]/80">
            <Link to="/hotels" className="hover:text-[#778873] transition-colors">
              Hotels
            </Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <Link to={`/hotels/${hotel?.id || 1}`} className="hover:text-[#778873] transition-colors">
              {hotel?.name || "H'Leven Hotel"}
            </Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-[#778873] font-semibold">{room?.name || "Executive Suite"}</span>
          </nav>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="font-headline-xl text-3xl md:text-5xl font-bold text-[#1e1b16] mb-3 leading-tight">
                {room?.name || "Executive Suite with Private Pool"}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-[#444842]">
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-lg text-[#778873]">group</span>
                  {room?.capacity || "2 Adults"}
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#DCCFC0]"></div>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-lg text-[#778873]">bed</span>
                  {room?.bed || "1 King Bed"}
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#DCCFC0]"></div>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-lg text-[#778873]">aspect_ratio</span>
                  {room?.sqm || "80 sqm"}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end">
              <span className="text-xs font-semibold text-[#444842] uppercase tracking-wider">Mulai dari</span>
              <div className="font-headline-lg text-2xl md:text-3xl font-bold text-[#778873]">
                Rp {roomPrice.toLocaleString("id-ID")}{" "}
                <span className="text-sm font-normal text-[#444842]">/ malam</span>
              </div>
            </div>
          </div>
        </section>

        {/* Hero Photo Mosaic Gallery */}
        <section className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-[400px] md:h-[550px] rounded-2xl overflow-hidden shadow-sm">
          {/* Main Hero Photo (Left 2 cols x 2 rows) */}
          <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden bg-[#e8e2d9]">
            <img
              src={photosList[0]}
              alt="Main Bedroom View"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer"
              onClick={() => setShowPhotoModal(true)}
              onError={(e) => { e.target.src = DEFAULT_ROOM_IMAGES[0]; }}
            />
          </div>

          {/* Sub Photo 1: Bathroom */}
          <div className="hidden md:block relative group overflow-hidden bg-[#e8e2d9]">
            <img
              src={photosList[1] || photosList[0]}
              alt="Bathroom View"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer"
              onClick={() => setShowPhotoModal(true)}
              onError={(e) => { e.target.src = DEFAULT_ROOM_IMAGES[1]; }}
            />
          </div>

          {/* Sub Photo 2: Private Pool */}
          <div className="hidden md:block relative group overflow-hidden bg-[#e8e2d9]">
            <img
              src={photosList[2] || photosList[0]}
              alt="Private Pool View"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer"
              onClick={() => setShowPhotoModal(true)}
              onError={(e) => { e.target.src = DEFAULT_ROOM_IMAGES[2]; }}
            />
          </div>

          {/* Sub Photo 3: Living Area with View All Photos Overlay */}
          <div className="hidden md:block md:col-span-2 relative group overflow-hidden bg-[#e8e2d9] cursor-pointer">
            <img
              src={photosList[3] || photosList[0]}
              alt="Living Area View"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
              onError={(e) => { e.target.src = DEFAULT_ROOM_IMAGES[3]; }}
            />
            <div
              onClick={() => setShowPhotoModal(true)}
              className="absolute inset-0 bg-black/30 flex items-center justify-center transition-colors group-hover:bg-black/40"
            >
              <button
                type="button"
                className="bg-[#FDF6ED] text-[#778873] px-6 py-3 rounded-full font-label-md text-sm font-semibold flex items-center gap-2 shadow-md hover:bg-white transition-all transform hover:-translate-y-0.5"
              >
                <span className="material-symbols-outlined text-lg">grid_view</span>
                View All {photosList.length} Photos
              </button>
            </div>
          </div>
        </section>

        {/* Main Content Layout: Details vs Sticky Booking Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
          
          {/* Left Column: Description, Amenities, Policies */}
          <div className="lg:col-span-8 flex flex-col gap-10 pr-0 lg:pr-4">
            
            {/* About This Room */}
            <section>
              <h2 className="font-headline-md text-2xl font-bold text-[#1e1b16] mb-4">
                Tentang Kamar Ini
              </h2>
              <p className="font-body-md text-base text-[#444842] leading-relaxed whitespace-pre-line">
                {room?.description ||
                  `Nikmati privasi dan ketenangan tak tertandingi di ${room?.name || "Executive Suite"}. Dirancang sebagai tempat peristirahatan modern, ruang seluas ${room?.sqm || '80 sqm'} ini menggabungkan kemewahan kontemporer dengan elemen alam yang menenangkan. Kamar ini dilengkapi dengan area santai terpisah, kamar mandi marmer mewah dengan bathtub berukuran besar, serta jendela besar yang menghadap langsung ke panorama alam yang indah.`}
              </p>
            </section>

            <hr className="border-[#DCCFC0]/40" />

            {/* Room Amenities Grid */}
            <section>
              <h2 className="font-headline-md text-2xl font-bold text-[#1e1b16] mb-6">
                Fasilitas Kamar
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#778873] text-2xl">pool</span>
                  <div>
                    <h3 className="font-label-md text-sm font-semibold text-[#1e1b16]">Private Infinity Pool</h3>
                    <p className="font-body-md text-xs text-[#444842]/80 mt-0.5">Pengaturan suhu air</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#778873] text-2xl">bathtub</span>
                  <div>
                    <h3 className="font-label-md text-sm font-semibold text-[#1e1b16]">Kamar Mandi Marmer</h3>
                    <p className="font-body-md text-xs text-[#444842]/80 mt-0.5">Bathub &amp; rain shower</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#778873] text-2xl">coffee_maker</span>
                  <div>
                    <h3 className="font-label-md text-sm font-semibold text-[#1e1b16]">Mesin Kopi Nespresso</h3>
                    <p className="font-body-md text-xs text-[#444842]/80 mt-0.5">Kapsul harian gratis</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#778873] text-2xl">room_service</span>
                  <div>
                    <h3 className="font-label-md text-sm font-semibold text-[#1e1b16]">Layanan Kamar 24/7</h3>
                    <p className="font-body-md text-xs text-[#444842]/80 mt-0.5">Menu dalam kamar</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#778873] text-2xl">kitchen</span>
                  <div>
                    <h3 className="font-label-md text-sm font-semibold text-[#1e1b16]">Mini Bar Premium</h3>
                    <p className="font-body-md text-xs text-[#444842]/80 mt-0.5">Pilihan minuman &amp; camilan</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#778873] text-2xl">wifi</span>
                  <div>
                    <h3 className="font-label-md text-sm font-semibold text-[#1e1b16]">WiFi Kecepatan Tinggi</h3>
                    <p className="font-body-md text-xs text-[#444842]/80 mt-0.5">Akses gratis tanpa batas</p>
                  </div>
                </div>
              </div>
            </section>

            <hr className="border-[#DCCFC0]/40" />

            {/* Room Policies */}
            <section>
              <h2 className="font-headline-md text-2xl font-bold text-[#1e1b16] mb-6">
                Kebijakan Kamar
              </h2>
              <ul className="space-y-5">
                <li class="flex items-start gap-4">
                  <span className="material-symbols-outlined text-[#747871] mt-0.5">schedule</span>
                  <div>
                    <h4 className="font-label-md text-sm font-semibold text-[#1e1b16]">Waktu Check-in &amp; Check-out</h4>
                    <p className="font-body-md text-xs text-[#444842] mt-0.5">Check-in mulai pukul 14:00 WIB. Check-out maksimal pukul 12:00 WIB.</p>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-[#747871] mt-0.5">smoke_free</span>
                  <div>
                    <h4 className="font-label-md text-sm font-semibold text-[#1e1b16]">Kebijakan Bebas Asap Rokok</h4>
                    <p className="font-body-md text-xs text-[#444842] mt-0.5">Semua kamar bebas dari asap rokok. Area merokok khusus tersedia di teras luar.</p>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-[#747871] mt-0.5">pets</span>
                  <div>
                    <h4 className="font-label-md text-sm font-semibold text-[#1e1b16]">Hewan Peliharaan</h4>
                    <p className="font-body-md text-xs text-[#444842] mt-0.5">Hewan peliharaan tidak diperkenankan masuk untuk menjaga higienitas seluruh tamu.</p>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-[#747871] mt-0.5">event_busy</span>
                  <div>
                    <h4 className="font-label-md text-sm font-semibold text-[#1e1b16]">Pembatalan</h4>
                    <p className="font-body-md text-xs text-[#444842] mt-0.5">Pembatalan gratis hingga 3 hari sebelum jadwal kedatangan.</p>
                  </div>
                </li>
              </ul>
            </section>
          </div>

          {/* Right Column: Interactive Sticky Booking Card */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-[100px] bg-[#DCCFC0]/20 border border-[#DCCFC0]/60 rounded-2xl p-6 shadow-md shadow-[#778873]/5">
              <div className="flex justify-between items-baseline mb-6">
                <span className="font-headline-md text-2xl font-bold text-[#778873]">
                  Rp {roomPrice.toLocaleString("id-ID")}
                </span>
                <span className="font-body-md text-xs text-[#444842]">/ malam</span>
              </div>

              {/* Dates Input Controls */}
              <div className="flex flex-col gap-4 mb-6">
                <div className="grid grid-cols-2 gap-2">
                  <div className="border border-[#DCCFC0] rounded-xl p-3 bg-[#FDF6ED] focus-within:border-[#778873] transition-colors">
                    <label className="block font-label-sm text-[10px] font-semibold text-[#444842] uppercase tracking-wider mb-1">
                      Check-In
                    </label>
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full bg-transparent border-none p-0 text-xs font-semibold text-[#1e1b16] outline-none cursor-pointer"
                    />
                  </div>

                  <div className="border border-[#DCCFC0] rounded-xl p-3 bg-[#FDF6ED] focus-within:border-[#778873] transition-colors">
                    <label className="block font-label-sm text-[10px] font-semibold text-[#444842] uppercase tracking-wider mb-1">
                      Check-Out
                    </label>
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full bg-transparent border-none p-0 text-xs font-semibold text-[#1e1b16] outline-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Guests Select */}
                <div className="border border-[#DCCFC0] rounded-xl p-3 bg-[#FDF6ED] focus-within:border-[#778873] transition-colors">
                  <label className="block font-label-sm text-[10px] font-semibold text-[#444842] uppercase tracking-wider mb-1">
                    Jumlah Tamu
                  </label>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    className="w-full bg-transparent border-none p-0 text-xs font-semibold text-[#1e1b16] outline-none cursor-pointer"
                  >
                    <option value="1 Tamu Dewasa">1 Tamu Dewasa</option>
                    <option value="2 Tamu Dewasa">2 Tamu Dewasa</option>
                    <option value="4 Tamu Dewasa">4 Tamu Dewasa</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Price Breakdown */}
              <div className="space-y-3 mb-6 font-body-md text-xs text-[#444842]">
                <div className="flex justify-between">
                  <span>Rp {roomPrice.toLocaleString("id-ID")} x {nightsCount} malam</span>
                  <span className="font-semibold">Rp {subtotalPrice.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pajak &amp; Biaya Layanan (21%)</span>
                  <span className="font-semibold">Rp {taxAndFees.toLocaleString("id-ID")}</span>
                </div>
                <hr className="border-[#DCCFC0]/50 my-2" />
                <div className="flex justify-between font-label-md text-sm font-bold text-[#1e1b16]">
                  <span>Total Harga</span>
                  <span className="text-[#778873]">Rp {totalPrice.toLocaleString("id-ID")}</span>
                </div>
              </div>

              {/* Reserve Action Button */}
              <button
                type="button"
                onClick={handleReserve}
                className="w-full bg-[#778873] text-white py-3.5 rounded-xl font-label-md text-sm font-semibold hover:bg-[#50604d] transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Pesan Sekarang
              </button>
              <p className="text-center font-body-md text-[11px] text-[#444842] mt-3">
                Anda belum dikenakan biaya pada tahap ini
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Lightbox Modal for All Photos */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#fff8f0] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 relative text-left">
            <div className="flex justify-between items-center mb-4 border-b border-[#DCCFC0]/40 pb-3">
              <h3 className="font-headline-md text-xl font-bold text-[#778873]">
                Galeri Foto {room?.name || "Kamar"}
              </h3>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="text-[#1e1b16] hover:text-[#778873] p-1 text-2xl font-bold"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {photosList.map((photo, i) => (
                <div key={i} className="h-64 rounded-xl overflow-hidden bg-[#eee7de]">
                  <img src={photo} alt={`Foto Kamar ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomDetail;
