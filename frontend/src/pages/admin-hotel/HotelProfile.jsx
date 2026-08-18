import React, { useState, useEffect } from 'react';
import api from "../../services/api";

export default function HotelProfile() {
  const [loading, setLoading] = useState(true);
  const [facilitiesList, setFacilitiesList] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    banner: null,
    facilities: []
  });

  useEffect(() => {
    fetchHotelProfile();
    fetchFacilities();
  }, []);

  const fetchHotelProfile = async () => {
    try {
      const res = await api.get('/admin/hotel/profile');
      const hotel = res.data.data;
      setFormData({
        name: hotel.name || '',
        description: hotel.description || '',
        address: hotel.address || '',
        phone: hotel.phone || '',
        banner: null,
        facilities: hotel.facilities ? hotel.facilities.map(f => f.id) : []
      });
    } catch (error) {
      console.error("Gagal memuat profil hotel:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFacilities = async () => {
    try {
      const res = await api.get('/facilities');
      setFacilitiesList(res.data.data || res.data);
    } catch (error) {
      console.error("Gagal memuat fasilitas:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, banner: e.target.files[0] });
  };

  const handleCheckboxChange = (e) => {
    const id = parseInt(e.target.value);
    const current = formData.facilities;
    if (e.target.checked) {
      setFormData({ ...formData, facilities: [...current, id] });
    } else {
      setFormData({ ...formData, facilities: current.filter(item => item !== id) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('address', formData.address);
      data.append('phone', formData.phone);
      if (formData.banner) {
        data.append('banner', formData.banner);
      }
      formData.facilities.forEach(facId => {
        data.append('facilities[]', facId);
      });

      await api.post('/admin/hotel/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Profil hotel berhasil diperbarui!');
    } catch (error) {
      console.error("Gagal memperbarui profil:", error);
      alert('Terjadi kesalahan saat memperbarui profil.');
    }
  };

  if (loading) return <div className="p-8">Memuat profil hotel...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow rounded-lg my-6">
      <h1 className="text-2xl font-bold mb-6">Kelola Profil Hotel</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium text-sm text-gray-700">Nama Hotel</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border p-2 rounded mt-1" required />
        </div>

        <div>
          <label className="block font-medium text-sm text-gray-700">Deskripsi Hotel</label>
          <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border p-2 rounded mt-1" rows="3"></textarea>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-sm text-gray-700">Alamat</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full border p-2 rounded mt-1" />
          </div>
          <div>
            <label className="block font-medium text-sm text-gray-700">Nomor Telepon</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full border p-2 rounded mt-1" />
          </div>
        </div>

        <div>
          <label className="block font-medium text-sm text-gray-700 mb-2">Fasilitas Hotel</label>
          <div className="grid grid-cols-2 gap-2 border p-3 rounded max-h-40 overflow-y-auto">
            {facilitiesList.map(fac => (
              <label key={fac.id} className="flex items-center space-x-2 text-sm">
                <input 
                  type="checkbox" 
                  value={fac.id} 
                  checked={formData.facilities.includes(fac.id)}
                  onChange={handleCheckboxChange} 
                />
                <span>{fac.name} ({fac.category})</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-medium text-sm text-gray-700">Banner / Foto Utama Hotel</label>
          <input type="file" onChange={handleFileChange} className="w-full border p-2 rounded mt-1" accept="image/*" />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700">
          Simpan Perubahan Profil
        </button>
      </form>
    </div>
  );
}