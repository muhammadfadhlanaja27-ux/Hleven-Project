import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State untuk menyimpan data laporan
  const [data, setData] = useState({
    bookings: {},
    revenue: {},
    users: {}
  });

  // State untuk Filter Tanggal
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // State untuk Export
  const [exportType, setExportType] = useState('booking');
  const [isExporting, setIsExporting] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = { start_date: startDate, end_date: endDate };

      // Menjalankan beberapa request API secara bersamaan menggunakan Promise.all
      const [bookingRes, revenueRes, userRes] = await Promise.all([
        api.get('/reports/bookings', { params }),
        api.get('/reports/revenue', { params }),
        api.get('/reports/users', { params })
      ]);

      setData({
        bookings: bookingRes.data.data,
        revenue: revenueRes.data.data,
        users: userRes.data.data
      });
    } catch (err) {
      console.error('Gagal mengambil data laporan:', err);
      setError('Gagal memuat data laporan. Pastikan server backend berjalan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  // Fungsi untuk Export (Download File)
  const handleExport = async (format) => {
    try {
      setIsExporting(true);
      
      const response = await api.get('/reports/export', {
        params: {
          type: exportType,
          format: format,
          start_date: startDate,
          end_date: endDate
        }
      });

      // Backend mengembalikan URL download
      const downloadUrl = response.data.download_url;
      
      if (downloadUrl) {
        // Asumsi base URL backend adalah http://localhost:8000
        window.open(`http://localhost:8000${downloadUrl}`, '_blank');
      } else {
        alert(response.data.message || 'File laporan berhasil dibuat.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengekspor laporan.');
    } finally {
      setIsExporting(false);
    }
  };

  // Helper untuk format Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number || 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Laporan & Analitik</h1>
      </div>

      {/* Kontrol Filter & Export */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-wrap justify-between items-end gap-4">
        
        {/* Filter Tanggal */}
        <div className="flex gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal Mulai</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal Akhir</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-md text-sm font-medium transition-colors border border-gray-300"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Panel Export */}
        <div className="flex items-end gap-2 bg-gray-50 p-2 rounded border border-gray-200">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Jenis Laporan</label>
            <select 
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="booking">Booking</option>
              <option value="revenue">Pendapatan</option>
              <option value="user">Pengguna</option>
              <option value="refund">Refund (Pengembalian)</option>
              <option value="hotel">Hotel</option>
              <option value="partner">Partner</option>
            </select>
          </div>
          <button 
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
          >
            PDF
          </button>
          <button 
            onClick={() => handleExport('excel')}
            disabled={isExporting}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
          >
            Excel
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-500">Memuat data analitik...</div>
      ) : (
        <>
          {/* Grid Kartu Ringkasan Laporan */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card Pendapatan */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-gray-500 text-sm font-medium">Total Pendapatan</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {formatRupiah(data.revenue?.total_revenue)}
              </p>
            </div>

            {/* Card Pemesanan */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-gray-500 text-sm font-medium">Total Pemesanan Selesai</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {data.bookings?.completed || 0} <span className="text-sm font-normal text-gray-500">transaksi</span>
              </p>
              <div className="mt-4 flex gap-4 text-sm text-gray-500">
                <div>Pending: <span className="font-medium text-yellow-600">{data.bookings?.pending || 0}</span></div>
                <div>Batal: <span className="font-medium text-red-600">{data.bookings?.cancelled || 0}</span></div>
              </div>
            </div>

            {/* Card Pengguna Baru */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-gray-500 text-sm font-medium">Total Pengguna Terdaftar</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {data.users?.total_users || 0} <span className="text-sm font-normal text-gray-500">orang</span>
              </p>
              <p className="text-sm text-green-600 mt-2 font-medium">
                +{data.users?.new_users || 0} bulan ini
              </p>
            </div>

          </div>

          {/* BAGIAN GRAFIK PENDAPATAN */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-gray-800 font-bold mb-4">Tren Pendapatan Harian</h3>
            <div className="h-80 w-full">
              {data.revenue?.trend && data.revenue.trend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data.revenue.trend}
                    margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6B7280', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      tickFormatter={(value) => `Rp${value / 1000}k`} 
                    />
                    <Tooltip 
                      formatter={(value) => [formatRupiah(value), "Pendapatan"]}
                      labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#10B981" 
                      strokeWidth={3} 
                      dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Tidak ada data pendapatan untuk rentang tanggal ini.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;