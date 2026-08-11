import React, { useState, useEffect } from "react";
import Table from "../../components/ui/Table";
import api from "../../services/api"; // Pastikan path ini sesuai dengan lokasi api.js Anda

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk filter pencarian dan role
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Fungsi untuk mengambil data dari backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Memanggil GET /super-admin/users dengan query parameter
      const response = await api.get("/super-admin/users", {
        params: {
          search: search,
          role: roleFilter,
        },
      });

      // Mengambil array data dari struktur JSON backend
      setUsers(response.data.data);
      setError(null);
    } catch (err) {
      console.error("Gagal mengambil data user:", err);
      setError("Gagal memuat data pengguna. Pastikan server backend berjalan.");
    } finally {
      setLoading(false);
    }
  };

  // Memanggil fetchUsers saat komponen dimuat atau filter berubah
  useEffect(() => {
    // Kita gunakan setTimeout sebagai debounce sederhana agar tidak terlalu sering menembak API saat mengetik
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, roleFilter]);

  // Fungsi untuk mengubah status (Block/Activate)
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Blocked" : "Active";

    // Konfirmasi sebelum melakukan aksi
    if (
      !window.confirm(
        `Apakah Anda yakin ingin mengubah status pengguna ini menjadi ${newStatus}?`,
      )
    ) {
      return;
    }

    try {
      await api.patch(`/super-admin/users/${id}/status`, {
        status: newStatus,
      });

      alert("Status berhasil diperbarui!");
      fetchUsers(); // Refresh data setelah berhasil update
    } catch (err) {
      console.error("Gagal update status:", err);
      alert(
        err.response?.data?.message || "Gagal memperbarui status pengguna.",
      );
    }
  };

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Nama", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Role", accessor: "role" },
    {
      header: "Status",
      render: (row) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            row.status === "Active"
              ? "bg-green-100 text-green-800"
              : row.status === "Blocked"
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Aksi",
      render: (row) => (
        <button
          onClick={() => handleToggleStatus(row.id, row.status)}
          className={`text-sm font-medium transition-colors ${
            row.status === "Active"
              ? "text-red-600 hover:text-red-900"
              : "text-green-600 hover:text-green-900"
          }`}
        >
          {row.status === "Active" ? "Block" : "Activate"}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
          + Tambah Admin Hotel
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex gap-4">
        <input
          type="text"
          placeholder="Cari nama atau email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-64 focus:outline-none focus:ring-1 focus:ring-green-500"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
        >
          <option value="">Semua Role</option>
          <option value="user">User</option>
          <option value="admin_hotel">Admin Hotel</option>
          <option value="super_admin">Super Admin</option>
        </select>
      </div>

      {/* Render Error, Loading, atau Tabel */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-500">Memuat data...</div>
      ) : (
        <Table columns={columns} data={users} />
      )}
    </div>
  );
};

export default UserManagement;
