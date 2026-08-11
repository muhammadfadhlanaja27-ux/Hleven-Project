import React, { useState, useEffect } from 'react';
import Table from '../../components/ui/Table'; // Sesuaikan path jika berbeda
import api from '../../services/api';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk Filter
  const [searchActivity, setSearchActivity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      // Memanggil API GET /activity-logs dengan parameter filter
      const response = await api.get('/activity-logs', {
        params: {
          activity: searchActivity,
          start_date: startDate,
          end_date: endDate,
        }
      });
      
      setLogs(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Gagal mengambil data log aktivitas:', err);
      setError('Gagal memuat log aktivitas. Pastikan server berjalan.');
    } finally {
      setLoading(false);
    }
  };

  // Efek untuk memanggil data saat pertama kali dimuat atau saat filter berubah
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLogs();
    }, 500); // Debounce 500ms agar tidak spam API saat mengetik

    return () => clearTimeout(delayDebounceFn);
  }, [searchActivity, startDate, endDate]);

  const columns = [
    { header: 'Waktu', render: (row) => new Date(row.created_at).toLocaleString('id-ID') },
    { 
      header: 'Pengguna', 
      render: (row) => (
        <span className="font-medium text-gray-900">{row.user}</span>
      )
    },
    { 
      header: 'Aktivitas', 
      render: (row) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
          {row.activity}
        </span>
      )
    },
    { header: 'Deskripsi', accessor: 'description' },
    { 
      header: 'Alamat IP', 
      render: (row) => (
        <span className="text-gray-500 text-sm font-mono">{row.ip_address}</span>
      ) 
    }
  ];

  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
      </div>

      {/* Bagian Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Cari Aktivitas</label>
          <input 
            type="text" 
            placeholder="Misal: Update Status..." 
            value={searchActivity}
            onChange={(e) => setSearchActivity(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-64 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

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

        <button 
          onClick={() => {
            setSearchActivity('');
            setStartDate('');
            setEndDate('');
          }}
          className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-md text-sm font-medium transition-colors border border-gray-300"
        >
          Reset Filter
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-500">Memuat log aktivitas...</div>
      ) : (
        <Table columns={columns} data={logs} />
      )}

    </div>
  );
};

export default ActivityLogs;