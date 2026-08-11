import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockHotels } from '../data/mockHotels';

const BookingPage = () => {
  const { hotelId, roomId } = useParams();
  const navigate = useNavigate();

  const hotel = mockHotels.find((h) => h.id === parseInt(hotelId));
  const room = hotel?.rooms.find((r) => r.id === parseInt(roomId));

  const [guestName, setGuestName] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [nights, setNights] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('BCA');

  if (!hotel || !room) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Data Pemesanan Tidak Valid</h2>
        <button 
          onClick={() => navigate('/')} 
          className="bg-[var(--accent)] text-white px-6 py-2 rounded-lg font-semibold"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  const totalPrice = room.price * nights;

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    alert(`Pemesanan berhasil! Pembayaran via ${paymentMethod} senilai Rp ${totalPrice.toLocaleString('id-ID')} sedang diproses.`);
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-6 text-left">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Formulir Pemesanan & Pembayaran</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Detail Tamu & Jadwal</h2>
          
          <form onSubmit={handleConfirmBooking}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-700">Nama Tamu</label>
              <input 
                type="text" 
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[var(--accent)]"
                required 
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-700">Tanggal Check-In</label>
              <input 
                type="date" 
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[var(--accent)]"
                required 
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-700">Durasi Menginap (Malam)</label>
              <input 
                type="number" 
                min="1"
                value={nights}
                onChange={(e) => setNights(parseInt(e.target.value) || 1)}
                className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[var(--accent)]"
                required 
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">Metode Pembayaran</label>
              <select 
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[var(--accent)] bg-white"
              >
                <option value="BCA">Transfer Bank BCA</option>
                <option value="Mandiri">Transfer Bank Mandiri</option>
                <option value="OVO">E-Wallet (OVO / DANA / GoPay)</option>
                <option value="QRIS">QRIS</option>
              </select>
            </div>

            <button 
              type="submit"
              className="w-full bg-[var(--accent)] text-white py-3 rounded-lg font-bold hover:opacity-95 transition-opacity"
            >
              Konfirmasi & Bayar Sekarang
            </button>
          </form>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl border border-[var(--border)] h-fit">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Ringkasan Pesanan</h2>
          <div className="mb-4 pb-4 border-b border-gray-200">
            <p className="font-semibold text-gray-900">{hotel.name}</p>
            <p className="text-sm text-gray-500">{room.name}</p>
            <p className="text-xs text-gray-400 mt-1">{room.capacity} | {room.bed}</p>
          </div>
          <div className="space-y-2 text-sm mb-4 pb-4 border-b border-gray-200 text-gray-600">
            <div className="flex justify-between">
              <span>Harga per malam</span>
              <span>Rp {room.price.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span>Durasi</span>
              <span>{nights} Malam</span>
            </div>
          </div>
          <div className="flex justify-between items-center font-bold text-lg text-gray-900">
            <span>Total Pembayaran</span>
            <span className="text-[var(--accent)]">Rp {totalPrice.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;