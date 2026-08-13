import React, { useState, useEffect } from 'react';
import Table from '../../components/ui/Table'; // Sesuaikan path jika berbeda
import api from '../../services/api';

const PartnerApproval = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State untuk Modal Document Review
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      // Endpoint untuk mengambil daftar pengajuan mitra (biasanya difilter yang berstatus Pending)
      const response = await api.get('/super-admin/partners');
      setPartners(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Gagal mengambil data pengajuan:', err);
      setError('Gagal memuat data pengajuan mitra.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  // Fungsi untuk Update Status (Approve/Reject)
  const handleUpdateStatus = async (id, status) => {
    const actionText = status === 'Approved' ? 'menyetujui' : 'menolak';
    
    if (!window.confirm(`Apakah Anda yakin ingin ${actionText} pengajuan mitra ini?`)) {
      return;
    }

    try {
      await api.patch(`/super-admin/partners/${id}/status`, { status });
      alert(`Pengajuan berhasil di-${status.toLowerCase()}!`);
      fetchPartners(); // Refresh data
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memperbarui status pengajuan.');
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nama Pemohon', accessor: 'applicant_name' },
    { header: 'Nama Hotel', accessor: 'hotel_name' },
    { 
      header: 'Status', 
      render: (row) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          row.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
          row.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Dokumen',
      render: (row) => (
        <button 
          onClick={() => {
            setSelectedDoc(row.document_url); // Set URL dokumen dari backend
            setIsModalOpen(true);
          }}
          className="text-blue-600 hover:text-blue-900 text-sm font-medium underline"
        >
          Review Dokumen
        </button>
      )
    },
    {
      header: 'Aksi',
      render: (row) => (
        row.status === 'Pending' ? (
          <div className="flex gap-2">
            <button 
              onClick={() => handleUpdateStatus(row.id, 'Approved')}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium"
            >
              Approve
            </button>
            <button 
              onClick={() => handleUpdateStatus(row.id, 'Rejected')}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium"
            >
              Reject
            </button>
          </div>
        ) : (
          <span className="text-gray-400 text-sm italic">Selesai</span>
        )
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Partner Approval</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-500">Memuat data pengajuan...</div>
      ) : (
        <Table columns={columns} data={partners} />
      )}

      {/* Modal Sederhana untuk Review Dokumen */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Review Dokumen Mitra</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-red-500 font-bold text-xl"
              >
                &times;
              </button>
            </div>
            
            <div className="border border-gray-200 p-2 rounded h-96 flex items-center justify-center bg-gray-50">
              {/* Jika berupa gambar, gunakan <img src={selectedDoc} /> */}
              {/* Jika PDF, bisa pakai iframe atau tag <object> */}
              {selectedDoc ? (
                <img src={selectedDoc} alt="Dokumen Mitra" className="max-h-full max-w-full object-contain" />
              ) : (
                <p className="text-gray-500">Dokumen tidak tersedia atau URL tidak valid.</p>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerApproval;