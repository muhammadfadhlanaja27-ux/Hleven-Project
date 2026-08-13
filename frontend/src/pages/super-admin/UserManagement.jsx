import React, { useState, useEffect } from "react";
import Table from "../../components/ui/Table";
import api from "../../services/api";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. State untuk filter pencarian, role, dan status
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // Tambahan state status

  // 2. State untuk Modal Tambah Admin Hotel
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  // Fungsi untuk mengambil data dari backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/super-admin/users", {
        params: {
          search: search,
          role: roleFilter,
          status: statusFilter, // Filter status dikirim ke backend
        },
      });

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
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, roleFilter, statusFilter]); // statusFilter ditambahkan ke array dependency

  // Fungsi untuk mengubah status (Block/Activate)
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "blocked" : "active";

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
      fetchUsers();
    } catch (err) {
      console.error("Gagal update status:", err);
      alert(
        err.response?.data?.message || "Gagal memperbarui status pengguna.",
      );
    }
  };

  // Fungsi untuk menangani penambahan Admin Hotel baru
  // Fungsi untuk menangani penambahan Admin Hotel baru
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    // 1. Validasi kecocokan password
    if (formData.password !== formData.password_confirmation) {
      alert("Password dan Konfirmasi Password tidak cocok!");
      setSubmitLoading(false);
      return;
    }

    // 2. Validasi panjang password (sesuai aturan backend min:8)
    if (formData.password.length < 8) {
      alert("Password minimal harus 8 karakter!");
      setSubmitLoading(false);
      return;
    }

    try {
      // 3. Pisahkan data agar password_confirmation tidak ikut terkirim ke backend
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "admin_hotel",
        status: "active", // Memastikan status default
      };

      await api.post("/super-admin/users", payload);

      alert("Admin Hotel berhasil ditambahkan!");

      // Reset form dan tutup modal
      setFormData({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
      });
      setIsModalOpen(false);

      // Refresh tabel data
      fetchUsers();
    } catch (err) {
      console.error("Gagal menambah admin:", err);

      // Menangkap pesan error spesifik dari Laravel (misal: email sudah terdaftar)
      let errorMessage = "Gagal menambahkan Admin Hotel.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      alert(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Nama", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Role", accessor: "role" },
    {
      header: "Status",
      render: (row) => {
        // Normalisasi teks dari database menjadi huruf kecil semua agar aman
        const statusStr = row.status ? row.status.toLowerCase() : "";
        return (
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${
              statusStr === "active"
                ? "bg-green-100 text-green-800"
                : statusStr === "blocked"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
            }`}
          >
            {row.status}
          </span>
        );
      },
    },
    {
      header: "Aksi",
      render: (row) => {
        const statusStr = row.status ? row.status.toLowerCase() : "";
        return (
          <button
            onClick={() => handleToggleStatus(row.id, statusStr)}
            className={`text-sm font-medium transition-colors ${
              statusStr === "active"
                ? "text-red-600 hover:text-red-900"
                : "text-green-600 hover:text-green-900"
            }`}
          >
            {statusStr === "active" ? "Block" : "Activate"}
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          + Tambah Admin Hotel
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex gap-4 flex-wrap">
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

        {/* Tambahan Filter Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
        >
          <option value="">Semua Status</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

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

      {/* MODAL TAMBAH ADMIN HOTEL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Tambah Admin Hotel Baru</h2>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Konfirmasi Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password_confirmation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password_confirmation: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded font-medium transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className={`px-4 py-2 text-white rounded font-medium transition ${
                    submitLoading
                      ? "bg-green-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {submitLoading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
