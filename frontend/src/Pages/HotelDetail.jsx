import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockHotels } from '../data/mockHotels';

const HotelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Cari hotel berdasarkan ID dari param URL
  const hotel = mockHotels.find((h) => h.id === parseInt(id));

  if (!hotel) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Hotel Tidak Ditemukan</h2>
        <button 
          onClick={() => navigate('/')} 
          className="bg-[var(--accent)] text-white px-6 py-2 rounded-lg font-semibold"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  const handleBookRoom = (room) => {
    // Navigasi ke halaman booking dengan membawa data hotel & kamar
    navigate(`/booking/${hotel.id}/${room.id}`);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-6 text-left">
      {/* Header Info */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
        <p className="text-gray-600 mb-1">📍 {hotel.address}</p>
        <span className="inline-block bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full font-semibold">
          ★ {hotel.rating} / 5.0
        </span>
      </div>

      {/* Main Thumbnail */}
      <div className="mb-8 rounded-2xl overflow-hidden shadow-md max-h-[400px]">
        <img 
          src={hotel.thumbnail} 
          alt={hotel.name} 
          className="w-full h-full object-cover" 
        />
      </div>

      {/* Deskripsi & Fasilitas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold mb-3 text-gray-800">Tentang Hotel</h2>
          <p className="text-gray-600 leading-relaxed mb-6">{hotel.description}</p>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-3 text-gray-800">Fasilitas Utama</h2>
          <div className="flex flex-wrap gap-2">
            {hotel.facilities.map((fac, idx) => (
              <span key={idx} className="bg-gray-100 text-gray-700 text-sm px-3 py-1.5 rounded-lg border border-gray-200">
                ✓ {fac}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Daftar Tipe Kamar */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Tipe Kamar Tersedia</h2>
        <div className="space-y-4">
          {hotel.rooms.map((room) => (
            <div 
              key={room.id} 
              className="p-5 border border-[var(--border)] rounded-xl bg-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div>
                <h3 className="text-lg font-bold text-gray-800">{room.name}</h3>
                <p className="text-sm text-gray-500">
                  👥 {room.capacity} | 🛏️ {room.bed}
                </p>
              </div>

              <div className="text-right flex md:flex-col justify-between items-center md:items-end w-full md:w-auto gap-4">
                <div>
                  <span className="text-2xl font-bold text-[var(--accent)]">
                    Rp {room.price.toLocaleString('id-ID')}
                  </span>
                  <span className="text-xs text-gray-500"> /malam</span>
                </div>
                <button 
                  onClick={() => handleBookRoom(room)}
                  className="bg-[var(--accent)] text-white px-5 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Pesan Sekarang
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HotelDetail;