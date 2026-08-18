import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { Link } from "react-router-dom";

export default function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await api.get("/admin/hotels");
      const hotels = response.data.data || response.data;

      if (!hotels || hotels.length === 0) {
        setLoading(false);
        return;
      }

      const hotelId = hotels[0].id;
      const roomResponse = await api.get(`/admin/hotels/${hotelId}/rooms`); 

      setRooms(roomResponse.data.data || roomResponse.data);
    } catch (error) {
      console.error("Gagal memuat daftar kamar:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🟢 BARU: Fungsi untuk menghapus tipe kamar berdasarkan ID
  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus tipe kamar ini?")) {
      return;
    }

    try {
      await api.delete(`/admin/rooms/${id}`);
      // Filter state agar kamar yang dihapus langsung hilang dari tabel
      setRooms(rooms.filter((room) => room.id !== id));
      alert("Kamar berhasil dihapus.");
    } catch (error) {
      console.error("Gagal menghapus kamar:", error);
      alert("Terjadi kesalahan saat menghapus kamar.");
    }
  };

  if (loading) return <div className="p-8">Memuat data kamar...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Manajemen Kamar</h1>
        <Link
          to="/admin/rooms/create"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
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
            {rooms.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-4 text-center text-gray-500">
                  Belum ada kamar yang ditambahkan. Silakan buat kamar terlebih dahulu.
                </td>
              </tr>
            ) : (
              rooms.map((room) => (
                <tr key={room.id} className="border-b">
                  <td className="py-3 font-medium">{room.name}</td>
                  <td className="py-3">
                    Rp {Number(room.weekday_price || 0).toLocaleString('id-ID')}
                  </td>
                  <td className="py-3">{room.stock}</td>
                  <td className="py-3">
                    <button className="text-yellow-600 mr-3 hover:underline">Edit</button>
                    {/* 🟢 BARU: Menghubungkan tombol hapus ke fungsi handleDelete */}
                    <button 
                      onClick={() => handleDelete(room.id)} 
                      className="text-red-600 hover:underline"
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