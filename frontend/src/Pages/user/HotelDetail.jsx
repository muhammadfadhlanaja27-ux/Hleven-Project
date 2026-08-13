import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockHotels } from "../../data/mockHotels";
import api from "../../services/api"; // Sesuaikan path Axios API kamu

const HotelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotelDetail = async () => {
      setLoading(true);
      try {
        // Panggil API Backend
        const response = await api.get(`/hotels/${id}`);
        setHotel(response.data.data);
      } catch (err) {
        console.warn("Backend mengembalikan error / 404, menggunakan Mock Data lokal.");

        // FALLBACK: Ambil dari file mockHotels.js lokal kamu
        const foundMock = mockHotels.find((h) => h.id === parseInt(id));
        setHotel(foundMock || null);
      } finally {
        setLoading(false);
      }
    };

    fetchHotelDetail();
  }, [id]);

  // Loading Skeleton State
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

  // Not Found State
  if (!hotel) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">
          Hotel Tidak Ditemukan
        </h2>
        <p className="text-gray-500 mb-6">
          Maaf, data hotel dengan ID #{id} tidak ada dalam katalog kami.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-[var(--accent)] text-white px-6 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-all shadow-sm"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  const handleBookRoom = (room) => {
    // Navigasi ke checkout dengan data hotel & room ID
    navigate(`/booking/${hotel.id}/${room.id}`);
  };

  // Ambil galeri foto (atau pakai fallback thumbnail jika galeri kosong)
  const galleryPhotos = hotel.photos && hotel.photos.length > 0
    ? hotel.photos
    : [hotel.thumbnail, hotel.thumbnail, hotel.thumbnail];

  return (
    <div className="max-w-5xl mx-auto py-8 px-6 text-left">
      {/* 1. Header Info & Rating */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
          <p className="text-gray-600 flex items-center gap-1 text-sm">
            📍 {hotel.address || "Lokasi tidak tersedia"}
          </p>
        </div>
        <div>
          <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-800 border border-yellow-200 text-sm px-3.5 py-1.5 rounded-full font-bold shadow-sm">
            ★ {hotel.rating || hotel.average_rating || "5.0"} / 5.0
          </span>
        </div>
      </div>

      {/* 2. Image Gallery Grid (1 Hero Utama + 2 Thumbnails) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 rounded-2xl overflow-hidden shadow-md max-h-[420px]">
        <div className="md:col-span-2 h-[300px] md:h-[420px]">
          <img
            src={galleryPhotos[0]}
            alt={hotel.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="hidden md:flex flex-col gap-4 h-[420px]">
          <div className="h-1/2 overflow-hidden rounded-r-xl">
            <img
              src={galleryPhotos[1] || galleryPhotos[0]}
              alt={`${hotel.name} view 2`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="h-1/2 overflow-hidden rounded-r-xl relative">
            <img
              src={galleryPhotos[2] || galleryPhotos[0]}
              alt={`${hotel.name} view 3`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
            <button className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/20 hover:bg-black/80 transition-colors">
              Lihat Galeri Foto
            </button>
          </div>
        </div>
      </div>

      {/* 3. Detail Deskripsi, Fasilitas, & Widget Peta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold mb-3 text-gray-800">
            Tentang Hotel
          </h2>
          <p className="text-gray-600 leading-relaxed mb-6 whitespace-pre-line text-sm md:text-base">
            {hotel.description || "Tidak ada deskripsi rinci untuk hotel ini."}
          </p>

          <h2 className="text-xl font-bold mb-3 text-gray-800">
            Fasilitas Utama
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {hotel.facilities && hotel.facilities.length > 0 ? (
              hotel.facilities.map((fac, idx) => (
                <span
                  key={idx}
                  className="bg-gray-50 text-gray-700 text-sm px-3.5 py-2 rounded-xl border border-gray-200 font-medium flex items-center gap-1.5"
                >
                  <span className="text-emerald-600">✓</span> {fac}
                </span>
              ))
            ) : (
              <p className="text-gray-400 text-sm">Fasilitas umum standar tersedia.</p>
            )}
          </div>
        </div>

        {/* Card Peta Lokasi (OpenStreetMap Integrasi) */}
        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 flex flex-col justify-between h-fit">
          <div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">Lokasi Hotel</h3>
            <p className="text-xs text-gray-500 mb-4">{hotel.address}</p>

            {/* Box Map Preview Mock */}
            <div className="w-full h-36 bg-emerald-100/50 rounded-xl border border-emerald-200 flex flex-col items-center justify-center text-emerald-800 mb-4 relative overflow-hidden">
              <span className="text-2xl mb-1">🗺️</span>
              <span className="text-xs font-semibold">OpenStreetMap View</span>
              <span className="text-[10px] text-gray-500">
                Lat: {hotel.latitude || "-6.9147"}, Long: {hotel.longitude || "107.6098"}
              </span>
            </div>
          </div>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name + " " + hotel.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 text-center py-2 rounded-lg text-sm font-semibold transition-colors block"
          >
            Buka di Google Maps ↗
          </a>
        </div>
      </div>

      {/* 4. Daftar Tipe Kamar */}
      <div className="pt-6 border-t border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Pilihan Kamar Tersedia
        </h2>

        {hotel.rooms && hotel.rooms.length > 0 ? (
          <div className="space-y-4">
            {hotel.rooms.map((room) => (
              <div
                key={room.id}
                className="p-5 border border-gray-200 rounded-2xl bg-white shadow-sm hover:border-[var(--accent)] transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-800">{room.name}</h3>
                    {room.breakfast && (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded">
                        Free Breakfast
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-3">
                    <span>👥 Kapasitas: {room.capacity || "2"} Dewasa</span>
                    <span>🛏️ {room.bed || "1 King Bed"}</span>
                  </p>
                </div>

                <div className="text-right flex md:flex-col justify-between items-center md:items-end w-full md:w-auto gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                  <div>
                    <span className="text-2xl font-extrabold text-[var(--accent)]">
                      Rp {room.price ? room.price.toLocaleString("id-ID") : "0"}
                    </span>
                    <span className="text-xs text-gray-400"> /malam</span>
                  </div>
                  <button
                    onClick={() => handleBookRoom(room)}
                    className="bg-[var(--accent)] text-white px-6 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-all shadow-sm"
                  >
                    Pesan Kamar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200">
            <p className="text-gray-500 text-sm">
              Belum ada tipe kamar yang terdaftar untuk hotel ini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelDetail;