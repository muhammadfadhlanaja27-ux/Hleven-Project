import React, { useState, useEffect } from 'react';
import api from "../../services/api";
import { useNavigate } from 'react-router-dom';

export default function RoomCreate() {
  const navigate = useNavigate();
  const [facilitiesList, setFacilitiesList] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    weekday_price: '',
    weekend_price: '',
    stock: '',
    adult_capacity: '',
    child_capacity: '',
    facilities: [],
    photos: []
  });

  useEffect(() => {
    // Ambil daftar fasilitas
    api.get('/facilities').then(res => {
      const data = res.data.data || res.data;
      setFacilitiesList(data);
    }).catch(err => {
      console.error("Gagal memuat fasilitas:", err);
    });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  const handleFileChange = (e) => {
    setFormData({ ...formData, photos: e.target.files });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 🟢 DIPERBAIKI: Mengambil ID hotel langsung dari profil admin yang sedang login
      const hotelRes = await api.get('/admin/hotel/profile');
      
      // Menangani berbagai kemungkinan struktur respons Laravel (baik terbungkus data maupun objek langsung)
      const hotelData = hotelRes.data.data || hotelRes.data;
      const hotelId = hotelData.id;

      if (!hotelId) {
        alert('Data hotel tidak ditemukan untuk akun admin ini. Pastikan profil hotel sudah dibuat.');
        return;
      }

      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('weekday_price', formData.weekday_price);
      data.append('weekend_price', formData.weekend_price);
      data.append('stock', formData.stock);
      data.append('adult_capacity', formData.adult_capacity);
      data.append('child_capacity', formData.child_capacity || 0);

      formData.facilities.forEach(facId => {
        data.append('facilities[]', facId);
      });

      if (formData.photos) {
        for (let i = 0; i < formData.photos.length; i++) {
          data.append('photos[]', formData.photos[i]);
        }
      }

      await api.post(`/admin/hotels/${hotelId}/rooms`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Tipe kamar berhasil dibuat!');
      navigate('/admin/rooms');
    } catch (error) {
      console.error("Gagal membuat kamar:", error);
      // Menampilkan pesan error spesifik dari backend jika ada (misal validasi 422 atau pesan 500)
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Terjadi kesalahan saat menyimpan kamar.';
      alert(errorMsg);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow rounded-lg my-6">
      <h1 className="text-2xl font-bold mb-6">Tambah Tipe Kamar Baru</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium text-sm text-gray-700">Nama Kamar</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border p-2 rounded mt-1" required />
        </div>

        <div>
          <label className="block font-medium text-sm text-gray-700">Deskripsi Kamar</label>
          <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border p-2 rounded mt-1" rows="3"></textarea>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-sm text-gray-700">Harga Weekday (Rp)</label>
            <input type="number" name="weekday_price" value={formData.weekday_price} onChange={handleChange} className="w-full border p-2 rounded mt-1" required />
          </div>
          <div>
            <label className="block font-medium text-sm text-gray-700">Harga Weekend (Rp)</label>
            <input type="number" name="weekend_price" value={formData.weekend_price} onChange={handleChange} className="w-full border p-2 rounded mt-1" required />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block font-medium text-sm text-gray-700">Stok Kamar</label>
            <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full border p-2 rounded mt-1" required />
          </div>
          <div>
            <label className="block font-medium text-sm text-gray-700">Kapasitas Dewasa</label>
            <input type="number" name="adult_capacity" value={formData.adult_capacity} onChange={handleChange} className="w-full border p-2 rounded mt-1" required />
          </div>
          <div>
            <label className="block font-medium text-sm text-gray-700">Kapasitas Anak</label>
            <input type="number" name="child_capacity" value={formData.child_capacity} onChange={handleChange} className="w-full border p-2 rounded mt-1" />
          </div>
        </div>

        <div>
          <label className="block font-medium text-sm text-gray-700 mb-2">Fasilitas Kamar</label>
          <div className="grid grid-cols-2 gap-2 border p-3 rounded max-h-40 overflow-y-auto">
            {facilitiesList.map(fac => (
              <label key={fac.id} className="flex items-center space-x-2 text-sm">
                <input type="checkbox" value={fac.id} onChange={handleCheckboxChange} />
                <span>{fac.name} ({fac.category})</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-medium text-sm text-gray-700">Foto Kamar (Bisa pilih lebih dari satu)</label>
          <input type="file" multiple onChange={handleFileChange} className="w-full border p-2 rounded mt-1" accept="image/*" />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700">
          Simpan Kamar
        </button>
      </form>
    </div>
  );
}