import React, { useEffect, useState } from 'react';
import api from "../../services/api";
import { Link } from 'react-router-dom';

export default function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    // Asumsi hotelId didapat dari data user di localStorage atau endpoint khusus
    // Untuk awal, kita ambil semua kamar hotel milik admin yang login
    try {
      const response = await api.get('/admin/hotels'); // Ambil info hotel dulu
      const hotelId = response.data.data[0].id; 
      const roomResponse = await api.get(`/admin/hotels/${hotelId}/rooms`);
      setRooms(roomResponse.data.data);
    } catch (error) {
      console.error("Gagal memuat kamar:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Manajemen Kamar</h1>
        <Link to="/admin/rooms/create" className="bg-blue-600 text-white px-4 py-2 rounded">
          Tambah Kamar
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-4">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left">
              <th className="pb-2">Nama Kamar</th>
              <th className="pb-2">Harga (Weekday)</th>
              <th className="pb-2">Stok</th>
              <th className="pb-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => (
              <tr key={room.id} className="border-b">
                <td className="py-3">{room.name}</td>
                <td className="py-3">Rp {room.weekday_price.toLocaleString()}</td>
                <td className="py-3">{room.stock}</td>
                <td className="py-3">
                  <button className="text-yellow-600 mr-2">Edit</button>
                  <button className="text-red-600">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
