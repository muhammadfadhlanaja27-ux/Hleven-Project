import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Mengambil data dari endpoint yang sudah kita buat di DashboardController
      const response = await api.get('/admin/dashboard-stats');
      setStats(response.data.data);
    } catch (error) {
      console.error("Gagal mengambil data dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Memuat data...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Dashboard Admin Hotel</h1>
      
      {/* Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-500 text-sm">Total Booking</p>
          <h3 className="text-3xl font-bold">{stats?.total_bookings || 0}</h3>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-500 text-sm">Booking Pending</p>
          <h3 className="text-3xl font-bold text-yellow-600">{stats?.pending_bookings || 0}</h3>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-500 text-sm">Total Pendapatan</p>
          <h3 className="text-3xl font-bold text-green-600">Rp {stats?.revenue?.toLocaleString()}</h3>
        </div>
      </div>

      {/* Tabel Recent Bookings */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Pesanan Terbaru</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="pb-3">Kode Booking</th>
              <th className="pb-3">Tamu</th>
              <th className="pb-3">Kamar</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {stats?.recent_bookings.map((booking) => (
              <tr key={booking.id} className="border-b">
                <td className="py-3">{booking.booking_code}</td>
                <td className="py-3">{booking.user?.name}</td>
                <td className="py-3">{booking.booking_rooms[0]?.room_type?.name}</td>
                <td className="py-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}