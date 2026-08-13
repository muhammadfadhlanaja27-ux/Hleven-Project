import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockHotels } from "../../data/mockHotels";

const BookingPage = () => {
  const { hotelId, roomId } = useParams();
  const navigate = useNavigate();

  // State Data
  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [guestName, setGuestName] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [nights, setNights] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("BCA");

  // Autofill data user dari localStorage jika sudah login
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser?.name) {
          setGuestName(parsedUser.name);
        }
      } catch (err) {
        console.error("Gagal membaca user:", err);
      }
    }
  }, []);

  // AMBIL DATA LANGSUNG DARI MOCK DATA LOKAL (Tanpa panggil API Laravel yang error 500)
  useEffect(() => {
    setLoading(true);

    // Cari hotel & kamar berdasarkan param URL (fleksibel string/number)
    const foundHotel = mockHotels.find((h) => String(h.id) === String(hotelId)) || mockHotels[0];
    const foundRoom = foundHotel?.rooms?.find((r) => String(r.id) === String(roomId)) || foundHotel?.rooms?.[0];

    setHotel(foundHotel);
    setRoom(foundRoom);
    setLoading(false);
  }, [hotelId, roomId]);

  // Hitung durasi malam otomatis jika tanggal check-in & check-out diisi
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const start = new Date(checkInDate);
      const end = new Date(checkOutDate);
      const diffTime = end - start;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        setNights(diffDays);
      }
    }
  }, [checkInDate, checkOutDate]);

  const totalPrice = room ? room.price * nights : 0;

  const handleSubmitBooking = (e) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      alert(
        `🎉 Pemesanan Berhasil (Mode Offline/Mock)!\n\nNama Tamu: ${guestName}\nHotel: ${hotel?.name}\nKamar: ${room?.name}\nTotal Pembayaran: Rp ${totalPrice.toLocaleString("id-ID")}\nMetode: ${paymentMethod}`
      );
      setSubmitting(false);
      navigate("/");
    }, 500);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-64 bg-gray-200 rounded-2xl"></div>
          <div className="h-64 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!hotel || !room) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">
          Data Pemesanan Tidak Valid
        </h2>
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-6 text-left">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Formulir Pemesanan Kamar
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form Pemesanan */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            Detail Tamu & Jadwal Menginap
          </h2>

          <form onSubmit={handleSubmitBooking} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Nama Lengkap Tamu
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Masukkan nama sesuai KTP / Paspor"
                className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Tanggal Check-In
                </label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Tanggal Check-Out
                </label>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Durasi Menginap (Malam)
              </label>
              <input
                type="number"
                min="1"
                value={nights}
                onChange={(e) => setNights(parseInt(e.target.value) || 1)}
                className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Metode Pembayaran
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-white"
              >
                <option value="BCA">Transfer Bank BCA</option>
                <option value="Mandiri">Transfer Bank Mandiri</option>
                <option value="BNI">Transfer Bank BNI</option>
                <option value="QRIS">QRIS / Instant Payment</option>
                <option value="E-Wallet">E-Wallet (OVO / DANA / GoPay)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50 mt-4 cursor-pointer"
            >
              {submitting ? "Memproses Pemesanan..." : "Konfirmasi & Bayar"}
            </button>
          </form>
        </div>

        {/* Ringkasan Pesanan */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 h-fit space-y-4">
          <h2 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-3">
            Ringkasan Pesanan
          </h2>

          <div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
              {hotel.city || "Bandung"}
            </span>
            <h3 className="font-bold text-gray-900 text-lg mt-2">
              {hotel.name}
            </h3>
            <p className="text-xs text-gray-500">{hotel.address}</p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-1">
            <p className="font-semibold text-sm text-gray-800">{room.name}</p>
            <p className="text-xs text-gray-500">
              👥 Kapasitas: {room.capacity || "2"} Dewasa
            </p>
            <p className="text-xs text-gray-500">🛏️ {room.bed || "1 King Bed"}</p>
          </div>

          <div className="space-y-2 text-sm text-gray-600 border-t border-gray-200 pt-3">
            <div className="flex justify-between">
              <span>Harga / malam</span>
              <span>Rp {room.price ? room.price.toLocaleString("id-ID") : "0"}</span>
            </div>
            <div className="flex justify-between">
              <span>Durasi</span>
              <span>{nights} Malam</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-3 flex justify-between items-center font-bold text-gray-900">
            <span>Total Bayar</span>
            <span className="text-xl text-blue-600">
              Rp {totalPrice.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;