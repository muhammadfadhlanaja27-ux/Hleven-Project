import React, { useState, useEffect } from "react";
import Table from "../../components/ui/Table";
import api from "../../services/api";

const HotelMonitoring = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State untuk pencarian dan filter status
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const response = await api.get("/super-admin/hotels", {
        params: { 
          search, 
          status: statusFilter // Kirim status filter ke backend
        },
      });

      setHotels(response.data.data);
      setError(null);
    } catch (err) {
      console.error("Gagal mengambil data hotel:", err);
      setError("Gagal memuat data hotel.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchHotels();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, statusFilter]); // Tambahkan statusFilter agar otomatis memuat ulang saat diganti

  const handleToggleStatus = async (id, currentStatus) => {
    // Karena di backend menggunakan huruf kecil, kita sesuaikan logikanya
    const lowerStatus = currentStatus ? currentStatus.toLowerCase() : "";
    const newStatus = lowerStatus === "active" ? "inactive" : "active";

    if (
      !window.confirm(
        `Yakin ingin mengubah status hotel ini menjadi ${newStatus}?`
      )
    ) {
      return;
    }

    try {
      await api.patch(`/super-admin/hotels/${id}/status`, {
        status: newStatus,
      });
      alert("Status hotel berhasil diperbarui!");
      fetchHotels();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal memperbarui status hotel.");
    }
  };

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Nama Hotel", accessor: "name" },
    {
      header: "Kota",
      render: (row) => row.city?.name || row.city?.city_name || "-",
    },
    {
      header: "Admin (Email)",
      render: (row) => row.admin?.email || "-",
    },
    {
      header: "Status",
      render: (row) => {
        const statusStr = row.status ? row.status.toLowerCase() : "";
        return (
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${
              statusStr === "active"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
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
            onClick={() => handleToggleStatus(row.id, row.status)}
            className={`text-sm font-medium transition-colors ${
              statusStr === "active"
                ? "text-red-600 hover:text-red-900"
                : "text-green-600 hover:text-green-900"
            }`}
          >
            {statusStr === "active" ? "Inactive" : "Active"}
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Hotel Monitoring</h1>
      </div>

      {/* Baris Filter & Pencarian */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Cari nama hotel..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-72 focus:outline-none focus:ring-1 focus:ring-green-500"
        />

        {/* Dropdown Filter Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
        >
          <option value="">Semua Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-500">
          Memuat data hotel...
        </div>
      ) : (
        <Table columns={columns} data={hotels} />
      )}
    </div>
  );
};

export default HotelMonitoring;