import React, { useState, useEffect } from 'react';
import api from "../../services/api";

export default function RevenueReport() {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    total_revenue: 0,
    period_revenue: 0,
    transactions_count: 0,
    details: []
  });
  const [filterPeriod, setFilterPeriod] = useState('monthly');

  useEffect(() => {
    fetchRevenueReport();
  }, [filterPeriod]);

  const fetchRevenueReport = async () => {
    setLoading(true);
    try {
      // Mengambil data laporan pendapatan dari backend dengan parameter period
      const res = await api.get(`/hotel/reports/revenue?period=${filterPeriod}`);
      const data = res.data.data || res.data;
      setReportData(data);
    } catch (error) {
      console.error("Gagal memuat laporan pendapatan:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Memuat laporan pendapatan...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Laporan Pendapatan Hotel</h1>
        
        {/* Filter Periode */}
        <select 
          value={filterPeriod} 
          onChange={(e) => setFilterPeriod(e.target.value)}
          className="border p-2 rounded-lg bg-white shadow-sm"
        >
          <option value="daily">Hari Ini</option>
          <option value="weekly">Minggu Ini</option>
          <option value="monthly">Bulan Ini</option>
          <option value="yearly">Tahun Ini</option>
        </select>
      </div>

      {/* Statistik Ringkas (Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Pendapatan Periode Ini</p>
          <h3 className="text-2xl font-bold text-green-600 mt-2">
            Rp {Number(reportData.period_revenue || 0).toLocaleString('id-ID')}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Total Transaksi Berhasil</p>
          <h3 className="text-2xl font-bold text-blue-600 mt-2">
            {reportData.transactions_count || 0} Pesanan
          </h3>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Hotel</p>
          <h3 className="text-lg font-bold text-gray-800 mt-2 truncate">
            {reportData.hotel_name || '-'}
          </h3>
        </div>
      </div>

      {/* Tabel Rincian / Riwayat Pendapatan */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-bold mb-4 text-gray-800">Rincian Transaksi Masuk</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-gray-600 text-sm">
              <th className="pb-3">Tanggal / Waktu</th>
              <th className="pb-3">Kode Booking</th>
              <th className="pb-3">Metode Pembayaran</th>
              <th className="pb-3 text-right">Jumlah (IDR)</th>
            </tr>
          </thead>
          <tbody>
            {(!reportData.details || reportData.details.length === 0) ? (
              <tr>
                <td colSpan="4" className="py-6 text-center text-gray-400">
                  Belum ada data pendapatan pada periode ini.
                </td>
              </tr>
            ) : (
              reportData.details.map((item, index) => (
                <tr key={index} className="border-b text-sm">
                  <td className="py-3 text-gray-600">{item.date}</td>
                  <td className="py-3 font-semibold text-gray-800">{item.booking_code}</td>
                  <td className="py-3 uppercase text-gray-600">{item.payment_method}</td>
                  <td className="py-3 text-right font-bold text-green-600">
                    + Rp {Number(item.amount || 0).toLocaleString('id-ID')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}