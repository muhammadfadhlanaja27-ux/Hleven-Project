import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockHotels } from "../../data/mockHotels";
import api from "../../services/api";

const HotelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";

  useEffect(() => {
    const fetchHotelDetail = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/hotels/${id}`);
        if (response.data && response.data.data) {
          setHotel(response.data.data);
        } else {
          throw new Error("Format data backend tidak valid");
        }
      } catch (err) {
        console.warn("Backend Error / Menggunakan Mock Data.");
        const foundMock = mockHotels.find((h) => String(h.id) === String(id));
        setHotel(foundMock || mockHotels[0]);
      } finally {
        setLoading(false);
      }
    };

    fetchHotelDetail();
  }, [id]);

  const getImageUrl = (photoItem) => {
    if (!photoItem) return DEFAULT_IMAGE;
    let path = typeof photoItem === "object" ? photoItem.photo || photoItem.url : photoItem;
    if (!path) return DEFAULT_IMAGE;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `http://localhost:8000/storage/${path.replace(/^\//, '')}`;
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="h-96 bg-gray-200 rounded-2xl mb-8"></div>
        <div className="h-32 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Hotel Tidak Ditemukan</h2>
        <button onClick={() => navigate("/")} className="bg-[var(--accent)] text-white px-6 py-2.5 rounded-lg font-semibold">
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  // 🔴 FALLBACK DATA LOKAL UNTUK KAMAR, FASILITAS, & KOORDINAT MAP
  const mockFallbackHotel = mockHotels.find((h) => String(h.id) === String(id)) || mockHotels[0];
  
  // 1. Fallback Daftar Kamar
  const roomsList = (hotel.rooms && hotel.rooms.length > 0) 
    ? hotel.rooms 
    : (hotel.room_types && hotel.room_types.length > 0)
    ? hotel.room_types
    : (mockFallbackHotel?.rooms || []);

  // 2. Fallback Daftar Fasilitas
  const facilitiesList = (hotel.facilities && hotel.facilities.length > 0)
    ? hotel.facilities
    : (mockFallbackHotel?.facilities || ["Free WiFi", "Kolam Renang", "Restoran", "AC", "Parkir Gratis"]);

  // 3. Fallback Alamat & Koordinat Map
  const hotelAddress = hotel.address || mockFallbackHotel?.address || "Bandung, Jawa Barat";
  const latitude = hotel.latitude || mockFallbackHotel?.latitude || "-6.9147";
  const longitude = hotel.longitude || mockFallbackHotel?.longitude || "107.6098";

  const handleBookRoom = (e, room) => {
    e.preventDefault();
    const targetHotelId = hotel?.id || id || 1;
    const targetRoomId = room?.id || 101;
    navigate(`/booking/${targetHotelId}/${targetRoomId}`);
  };

  const rawPhotos = hotel.photos && hotel.photos.length > 0 ? hotel.photos : [hotel.thumbnail || DEFAULT_IMAGE];
  const photoList = [
    getImageUrl(rawPhotos[0]),
    getImageUrl(rawPhotos[1] || rawPhotos[0]),
    getImageUrl(rawPhotos[2] || rawPhotos[0])
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 px-6 text-left">
      {/* Header Info */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
          <p className="text-gray-600 flex items-center gap-1 text-sm">
            📍 {hotelAddress}
          </p>
        </div>
        <div>
          <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-800 border border-yellow-200 text-sm px-3.5 py-1.5 rounded-full font-bold shadow-sm">
            ★ {hotel.rating || hotel.average_rating || "5.0"} / 5.0
          </span>
        </div>
      </div>

      {/* Image Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 rounded-2xl overflow-hidden shadow-md max-h-[420px]">
        <div className="md:col-span-2 h-[300px] md:h-[420px]">
          <img src={photoList[0]} alt={hotel.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = DEFAULT_IMAGE; }} />
        </div>
        <div className="hidden md:flex flex-col gap-4 h-[420px]">
          <div className="h-1/2 overflow-hidden rounded-r-xl">
            <img src={photoList[1]} alt="View 2" className="w-full h-full object-cover" onError={(e) => { e.target.src = DEFAULT_IMAGE; }} />
          </div>
          <div className="h-1/2 overflow-hidden rounded-r-xl">
            <img src={photoList[2]} alt="View 3" className="w-full h-full object-cover" onError={(e) => { e.target.src = DEFAULT_IMAGE; }} />
          </div>
        </div>
      </div>

      {/* 🟢 Deskripsi, Fasilitas, & Widget Peta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold mb-3 text-gray-800">Tentang Hotel</h2>
          <p className="text-gray-600 leading-relaxed mb-6 text-sm md:text-base whitespace-pre-line">
            {hotel.description || mockFallbackHotel?.description || "Tidak ada deskripsi rinci untuk hotel ini."}
          </p>

          <h2 className="text-xl font-bold mb-3 text-gray-800">Fasilitas Utama</h2>
          <div className="flex flex-wrap gap-2.5">
            {facilitiesList.map((fac, idx) => (
              <span 
                key={idx} 
                className="bg-gray-50 text-gray-700 text-sm px-3.5 py-2 rounded-xl border border-gray-200 font-medium flex items-center gap-1.5"
              >
                <span className="text-emerald-600 font-bold">✓</span> {typeof fac === 'object' ? fac.name : fac}
              </span>
            ))}
          </div>
        </div>

        {/* 🟢 CARD PETA LOKASI */}
        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 flex flex-col justify-between h-fit">
          <div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">Lokasi Hotel</h3>
            <p className="text-xs text-gray-500 mb-4">{hotelAddress}</p>
            
            <div className="w-full h-36 bg-emerald-100/50 rounded-xl border border-emerald-200 flex flex-col items-center justify-center text-emerald-800 mb-4 relative overflow-hidden p-3 text-center">
              <span className="text-2xl mb-1">🗺️</span>
              <span className="text-xs font-semibold">OpenStreetMap View</span>
              <span className="text-[10px] text-gray-500 mt-1">
                Lat: {latitude}, Long: {longitude}
              </span>
            </div>
          </div>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name + " " + hotelAddress)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 text-center py-2.5 rounded-xl text-sm font-semibold transition-colors block shadow-sm"
          >
            Buka di Google Maps ↗
          </a>
        </div>
      </div>

      {/* Daftar Tipe Kamar */}
      <div className="pt-6 border-t border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Pilihan Kamar Tersedia</h2>

        {roomsList && roomsList.length > 0 ? (
          <div className="space-y-4">
            {roomsList.map((room, idx) => (
              <div
                key={room.id || idx}
                className="p-5 border border-gray-200 rounded-2xl bg-white shadow-sm hover:border-[var(--accent)] transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-800">{room.name || room.type || "Kamar Standard"}</h3>
                    {(room.breakfast || room.is_breakfast) && (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded">
                        Free Breakfast
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-3">
                    <span>👥 Kapasitas: {room.capacity || "2"} Dewasa</span>
                    <span>🛏️ {room.bed || room.bed_type || "1 King Bed"}</span>
                  </p>
                </div>

                <div className="text-right flex md:flex-col justify-between items-center md:items-end w-full md:w-auto gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                  <div>
                    <span className="text-2xl font-extrabold text-[var(--accent)]">
                      Rp {room.price ? Number(room.price).toLocaleString("id-ID") : "0"}
                    </span>
                    <span className="text-xs text-gray-400"> /malam</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleBookRoom(e, room)}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-sm cursor-pointer"
                  >
                    Pesan Kamar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200">
            <p className="text-gray-500 text-sm">Belum ada tipe kamar yang terdaftar untuk hotel ini.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelDetail;