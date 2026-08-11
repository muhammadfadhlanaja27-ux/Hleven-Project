import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../../services/api";

export default function RoomCreate() {
  const [formData, setFormData] = useState({
    name: '', weekday_price: '', weekend_price: '', stock: '', 
    capacity_adult: '', capacity_child: '', breakfast: false
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Perlu ambil hotelId terlebih dahulu (bisa disimpan di state global/context)
      const hotelRes = await api.get('/admin/hotels');
      const hotelId = hotelRes.data.data[0].id;
      
      await api.post(`/admin/hotels/${hotelId}/rooms`, formData);
      alert('Kamar berhasil dibuat!');
      navigate('/admin/rooms');
    } catch (error) {
      alert('Gagal menyimpan kamar: ' + error.response?.data?.message);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">Tambah Tipe Kamar</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Nama Kamar (Contoh: Deluxe)" className="w-full p-2 border rounded" onChange={(e) => setFormData({...formData, name: e.target.value})} required />
        <div className="grid grid-cols-2 gap-4">
          <input type="number" placeholder="Harga Weekday" className="w-full p-2 border rounded" onChange={(e) => setFormData({...formData, weekday_price: e.target.value})} />
          <input type="number" placeholder="Harga Weekend" className="w-full p-2 border rounded" onChange={(e) => setFormData({...formData, weekend_price: e.target.value})} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <input type="number" placeholder="Stok" className="p-2 border rounded" onChange={(e) => setFormData({...formData, stock: e.target.value})} />
          <input type="number" placeholder="Kapasitas Dewasa" className="p-2 border rounded" onChange={(e) => setFormData({...formData, capacity_adult: e.target.value})} />
          <input type="number" placeholder="Kapasitas Anak" className="p-2 border rounded" onChange={(e) => setFormData({...formData, capacity_child: e.target.value})} />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">Simpan Kamar</button>
      </form>
    </div>
  );
}