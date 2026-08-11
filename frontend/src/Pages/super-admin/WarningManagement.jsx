import React, { useState, useEffect } from 'react';
import Table from '../../components/ui/Table'; // Sesuaikan path
import api from '../../services/api';

const WarningManagement = () => {
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk Modal Buat Warning Baru
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hotels, setHotels] = useState([]); // Untuk dropdown pilihan hotel
  const [newWarning, setNewWarning] = useState({
    hotel_id: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mengambil daftar Warning
  const fetchWarnings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/super-admin/warnings');
      setWarnings(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Gagal mengambil data warning:', err);
      setError('Gagal memuat data teguran.');
    } finally {
      setLoading(false);
    }
  };

  // Mengambil daftar Hotel untuk Dropdown di dalam Modal
  const fetchHotels = async () => {
    try {
      const response = await api.get('/super-admin/hotels');
      setHotels(response.data.data);
    } catch (err) {
      console.error('Gagal memuat daftar hotel untuk form:', err);
    }
  };

  useEffect(() => {
    fetchWarnings();
    fetchHotels();
  }, []);

  // Fungsi untuk Membuat Warning Baru
  const handleCreateWarning = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post('/super-admin/warnings', newWarning);
      alert('Teguran berhasil dikirim ke hotel!');
      setIsModalOpen(false);
      setNewWarning({ hotel_id: '', message: '' }); // Reset form
      fetchWarnings(); // Refresh tabel
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal membuat teguran baru.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fungsi untuk Menandai Warning sudah Selesai (Resolved)
  const handleResolveWarning = async (id) => {
    if (!window.confirm('Tandai teguran ini sebagai Selesai (Resolved)?')) return;

    try {
      await api.patch(`/super-admin/warnings/${id}/status`, { status: 'Resolved' });
      alert('Status teguran berhasil diperbarui!');
      fetchWarnings();
    } catch (err) {
      alert('Gagal memperbarui status teguran.');
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { 
      header: 'Hotel', 
      render: (row) => row.hotel?.name || 'Hotel Tidak Diketahui'
    },
    { header: 'Pesan Teguran', accessor: 'message' },
    { 
      header: 'Status', 
      render: (row) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          row.status === 'Active' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {row.status}
        </span>
      )
    },
    { header: 'Tanggal', render: (row) => new Date(row.created_at).toLocaleDateString('id-ID') },
    {
      header: 'Aksi',
      render: (row) => (
        row.status === 'Active' ? (
          <button 
            onClick={() => handleResolveWarning(row.id)}
            className="text-green-600 hover:text-green-900 text-sm font-medium"
          >
            Mark as Resolved
          </button>
        ) : (
          <span className="text-gray-400 text-sm italic">Selesai</span>
        )
      )
    }
  ];

  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Warning Management</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
        >
          + Buat Teguran
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-500">Memuat data teguran...</div>
      ) : (
        <Table columns={columns} data={warnings} />
      )}

      {/* MODAL BUAT WARNING BARU */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Buat Teguran Baru</h2>
            
            <form onSubmit={handleCreateWarning} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Hotel</label>
                <select 
                  required
                  value={newWarning.hotel_id}
                  onChange={(e) => setNewWarning({...newWarning, hotel_id: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">-- Pilih Hotel --</option>
                  {hotels.map(hotel => (
                    <option key={hotel.id} value={hotel.id}>{hotel.name} - {hotel.city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pesan Teguran</label>
                <textarea 
                  required
                  rows="4"
                  value={newWarning.message}
                  onChange={(e) => setNewWarning({...newWarning, message: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Jelaskan alasan teguran ini diberikan..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded font-medium"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded font-medium text-white ${
                    isSubmitting ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Teguran'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default WarningManagement;