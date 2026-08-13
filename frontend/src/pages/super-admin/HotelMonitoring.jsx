import React, { useState, useEffect } from 'react';
import Table from '../../components/ui/Table'; // Sesuaikan path jika berbeda
import api from '../../services/api';

const HotelMonitoring = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // Fungsi untuk mengambil data hotel dari backend
  const fetchHotels = async () => {
    try {
      setLoading(true);
      // Asumsi endpoint backend Anda untuk melihat semua hotel adalah GET /super-admin/hotels
      const response = await api.get('/super-admin/hotels', {
        params: { search }
      });
      
      setHotels(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Gagal mengambil data hotel:', err);
      setError('Gagal memuat data hotel.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchHotels();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  // Fungsi untuk mengubah status hotel
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    
    if (!window.confirm(`Yakin ingin mengubah status hotel ini menjadi ${newStatus}?`)) {
      return;
    }

    try {
      await api.patch(`/super-admin/hotels/${id}/status`, { status: newStatus });
      alert('Status hotel berhasil diperbarui!');
      fetchHotels(); 
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memperbarui status hotel.');
    }
  };

  // Definisi kolom tabel untuk Hotel
  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nama Hotel', accessor: 'name' },
    { header: 'Kota', accessor: 'city' },
    { 
      header: 'Admin (Email)', 
      render: (row) => row.admin?.email || '-' 
    },
    { 
      header: 'Status', 
      render: (row) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          row.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Aksi',
      render: (row) => (
        <button 
          onClick={() => handleToggleStatus(row.id, row.status)}
          className={`text-sm font-medium transition-colors ${
            row.status === 'Active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
          }`}
        >
          {row.status === 'Active' ? 'Suspend' : 'Activate'}
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Hotel Monitoring</h1>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex gap-4">
        <input 
          type="text" 
          placeholder="Cari nama hotel atau kota..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-72 focus:outline-none focus:ring-1 focus:ring-green-500"
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-500">Memuat data hotel...</div>
      ) : (
        <Table columns={columns} data={hotels} />
      )}
    </div>
  );
};

export default HotelMonitoring;