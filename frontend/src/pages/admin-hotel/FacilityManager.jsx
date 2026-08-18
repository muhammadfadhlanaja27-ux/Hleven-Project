import React, { useState, useEffect } from 'react';
import api from "../../services/api";

export default function FacilityManager() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Hotel'
  });

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      const res = await api.get('/facilities');
      setFacilities(res.data.data || res.data);
    } catch (error) {
      console.error("Gagal memuat fasilitas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/facilities', formData);
      alert('Fasilitas berhasil ditambahkan!');
      setFormData({ name: '', category: 'Hotel' });
      fetchFacilities();
    } catch (error) {
      console.error("Gagal menambah fasilitas:", error);
      alert('Gagal menambah fasilitas. Pastikan nama unik.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus fasilitas ini?")) return;
    try {
      await api.delete(`/facilities/${id}`);
      setFacilities(facilities.filter(f => f.id !== id));
      alert('Fasilitas berhasil dihapus.');
    } catch (error) {
      console.error("Gagal menghapus fasilitas:", error);
      alert('Gagal menghapus fasilitas.');
    }
  };

  if (loading) return <div className="p-8">Memuat fasilitas...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Manajemen Master Fasilitas</h1>

      {/* Form Tambah Fasilitas */}
      <form onSubmit={handleSubmit} className="bg-white p-4 shadow rounded-lg mb-6 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Fasilitas</label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            className="w-full border p-2 rounded" 
            placeholder="Contoh: WiFi Cepat, Kolam Renang" 
            required 
          />
        </div>
        <div className="w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
          <select 
            name="category" 
            value={formData.category} 
            onChange={handleChange} 
            className="w-full border p-2 rounded"
          >
            <option value="Hotel">Hotel</option>
            <option value="Room">Room</option>
            <option value="Bathroom">Bathroom</option>
          </select>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded h-10 hover:bg-blue-700">
          Tambah
        </button>
      </form>

      {/* Daftar Fasilitas */}
      <div className="bg-white shadow rounded-lg p-4">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="pb-2">Nama</th>
              <th className="pb-2">Kategori</th>
              <th className="pb-2 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {facilities.length === 0 ? (
              <tr>
                <td colSpan="3" className="py-4 text-center text-gray-500">Belum ada data fasilitas.</td>
              </tr>
            ) : (
              facilities.map(fac => (
                <tr key={fac.id} className="border-b">
                  <td className="py-3 font-medium">{fac.name}</td>
                  <td className="py-3">
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                      {fac.category}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button 
                      onClick={() => handleDelete(fac.id)}
                      className="text-red-600 hover:underline text-sm font-semibold"
                    >
                      Hapus
                    </button>
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