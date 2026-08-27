import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { cachedGet, getCachedData, getCacheKey, invalidateCache } from "../../services/apiCache";
import { toast } from "react-hot-toast";

const UserManagement = () => {
  const initialKey = getCacheKey("/super-admin/users", { search: "", role: "", status: "" });
  const cachedInitialUsers = getCachedData(initialKey)?.data || getCachedData(initialKey) || null;

  const [users, setUsers] = useState(Array.isArray(cachedInitialUsers) ? cachedInitialUsers : []);
  const [loading, setLoading] = useState(!cachedInitialUsers);
  const [error, setError] = useState(null);

  // Filter States
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal Tambah Admin Hotel
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    hotel_name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  // Fetch Users
  const fetchUsers = async (forceRefresh = false) => {
    const key = getCacheKey("/super-admin/users", {
      search: search,
      role: roleFilter,
      status: statusFilter,
    });
    const cached = getCachedData(key);

    if (!forceRefresh && cached) {
      const data = cached.data || cached || [];
      setUsers(Array.isArray(data) ? data : []);
      setLoading(false);
    } else if (users.length === 0 || forceRefresh) {
      if (users.length === 0) setLoading(true);
    }

    try {
      setError(null);
      const response = await cachedGet(
        "/super-admin/users",
        {
          params: {
            search: search,
            role: roleFilter,
            status: statusFilter,
          },
        },
        forceRefresh
      );

      const data = response.data?.data || response.data || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal mengambil data user:", err);
      if (users.length === 0) {
        setError("Gagal memuat data pengguna. Pastikan server backend berjalan.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers(false);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, roleFilter, statusFilter]);

  // Toggle Status (Block / Activate)
  const handleToggleStatus = async (id, currentStatus) => {
    const isCurrentlyActive = currentStatus?.toLowerCase() === "active";
    const newStatus = isCurrentlyActive ? "blocked" : "active";

    if (
      !window.confirm(
        `Apakah Anda yakin ingin mengubah status pengguna ini menjadi ${newStatus.toUpperCase()}?`
      )
    ) {
      return;
    }

    try {
      await api.patch(`/super-admin/users/${id}/status`, {
        status: newStatus,
      });

      invalidateCache("/super-admin/users");
      invalidateCache("/super-admin/dashboard");
      toast.success("Status pengguna berhasil diperbarui!");
      fetchUsers(true);
    } catch (err) {
      console.error("Gagal update status:", err);
      toast.error(
        err.response?.data?.message || "Gagal memperbarui status pengguna."
      );
    }
  };

  // Ubah Role Pengguna
  const handleRoleChange = async (userId, newRole, userName) => {
    if (
      !window.confirm(
        `Apakah Anda yakin ingin mengubah role ${userName} menjadi ${formatRole(newRole)}?`
      )
    ) {
      return;
    }

    try {
      await api.patch(`/super-admin/users/${userId}/role`, {
        role: newRole,
      });

      invalidateCache("/super-admin/users");
      invalidateCache("/super-admin/dashboard");
      toast.success("Role pengguna berhasil diperbarui!");
      fetchUsers(true);
    } catch (err) {
      console.error("Gagal update role:", err);
      toast.error(
        err.response?.data?.message || "Gagal memperbarui role pengguna."
      );
    }
  };

  // Create Admin Hotel
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    if (formData.password !== formData.password_confirmation) {
      toast.error("Password dan Konfirmasi Password tidak cocok!");
      setSubmitLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password minimal harus 8 karakter!");
      setSubmitLoading(false);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        hotel_name: formData.hotel_name,
        email: formData.email,
        password: formData.password,
        role: "admin_hotel",
        status: "active",
      };

      await api.post("/super-admin/users", payload);

      invalidateCache("/super-admin/users");
      invalidateCache("/super-admin/dashboard");
      toast.success("Admin Hotel & Properti berhasil ditambahkan!");
      setFormData({
        name: "",
        hotel_name: "",
        email: "",
        password: "",
        password_confirmation: "",
      });
      setIsModalOpen(false);
      fetchUsers(true);
    } catch (err) {
      console.error("Gagal menambah admin:", err);
      toast.error(err.response?.data?.message || "Gagal menambahkan Admin Hotel.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Avatar initial generator
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Role display formatter
  const formatRole = (role) => {
    if (!role) return "-";
    if (role === "super_admin") return "Super Admin";
    if (role === "admin_hotel") return "Hotel Admin";
    if (role === "user") return "Customer / User";
    return role.replace("_", " ");
  };

  // Color generator for avatar based on role
  const getAvatarBg = (role) => {
    if (role === "super_admin") return "bg-[#4f604f] text-white";
    if (role === "admin_hotel") return "bg-[#d1eac9] text-[#0c200c]";
    return "bg-[#ece1d4] text-[#201b13]";
  };

  // Pagination helper
  const totalItems = users.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedUsers = users.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 font-hanken">
      {/* Page Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-newsreader text-[32px] font-semibold text-[#4f604f] tracking-[-0.02em] leading-tight font-['Newsreader',serif]">
            User Management
          </h2>
          <p className="font-hanken text-[14px] text-[#747872] mt-1">
            Kelola data administrator hotel, mitra, dan hak akses pengguna sistem.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-[#768875] text-white font-hanken text-[14px] font-semibold tracking-[0.01em] rounded-lg hover:bg-[#657764] shadow-sm hover:shadow transition-all duration-150 flex items-center gap-2 active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>+ Tambah Admin Hotel</span>
        </button>
      </div>

      {/* Filters & Search Card */}
      <div className="bg-white rounded-xl p-5 shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8] flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full lg:w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#747872] text-[20px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#E5E0D8] bg-white focus:outline-none focus:border-[#768875] focus:ring-2 focus:ring-[#768875]/20 font-hanken text-[14px] text-[#191c1b] placeholder-[#747872] transition-all"
          />
        </div>

        {/* Dropdowns & Refresh */}
        <div className="flex flex-wrap w-full lg:w-auto gap-3 items-center">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="flex-1 sm:w-44 px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] bg-white focus:outline-none focus:border-[#768875] focus:ring-2 focus:ring-[#768875]/20 font-hanken text-[14px] text-[#191c1b] cursor-pointer"
          >
            <option value="">Semua Role</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin_hotel">Admin Hotel</option>
            <option value="user">User / Pelanggan</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 sm:w-44 px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] bg-white focus:outline-none focus:border-[#768875] focus:ring-2 focus:ring-[#768875]/20 font-hanken text-[14px] text-[#191c1b] cursor-pointer"
          >
            <option value="">Semua Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked / Inactive</option>
            <option value="pending">Pending</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={() => fetchUsers(true)}
            title="Refresh Data"
            className="p-2.5 border border-[#E5E0D8] rounded-lg bg-white text-[#434842] hover:bg-[#F9F6F1] transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px] block">refresh</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-[#ffdad6] border border-[#ffbab1] text-[#93000a] px-5 py-4 rounded-lg font-hanken text-[14px] flex items-center gap-3">
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Data Table Container */}
      <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(47,50,49,0.06)] overflow-hidden border border-[#E5E0D8]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-[#E5E0D8] border-t-[#768875] rounded-full animate-spin"></div>
            <p className="font-hanken text-[14px] text-[#747872]">Memuat data pengguna...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F9F6F1] border-b border-[#E5E0D8]">
                    <th className="px-6 py-4 font-hanken text-[12px] font-semibold text-[#434842] uppercase tracking-[0.05em]">
                      Name &amp; Email
                    </th>
                    <th className="px-6 py-4 font-hanken text-[12px] font-semibold text-[#434842] uppercase tracking-[0.05em]">
                      Role
                    </th>
                    <th className="px-6 py-4 font-hanken text-[12px] font-semibold text-[#434842] uppercase tracking-[0.05em]">
                      Hotel / Afiliasi
                    </th>
                    <th className="px-6 py-4 font-hanken text-[12px] font-semibold text-[#434842] uppercase tracking-[0.05em]">
                      Status
                    </th>
                    <th className="px-6 py-4 font-hanken text-[12px] font-semibold text-[#434842] uppercase tracking-[0.05em] text-right">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E0D8]">
                  {paginatedUsers.length > 0 ? (
                    paginatedUsers.map((user) => {
                      const statusStr = user.status ? user.status.toLowerCase() : "";
                      const isActive = statusStr === "active";
                      const isBlocked = statusStr === "blocked" || statusStr === "inactive";

                      return (
                        <tr
                          key={user.id}
                          className="hover:bg-[#F9F6F1]/50 transition-colors group"
                        >
                          {/* Name & Email with Avatar */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3.5">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-newsreader font-semibold text-[15px] shrink-0 ${getAvatarBg(
                                  user.role
                                )}`}
                              >
                                {getInitials(user.name)}
                              </div>
                              <div>
                                <p className="font-hanken text-[14px] font-medium text-[#191c1b] group-hover:text-[#4f604f] transition-colors">
                                  {user.name}
                                </p>
                                <p className="font-hanken text-[13px] text-[#747872]">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="px-6 py-4">
                            {user.role === "super_admin" ? (
                              <span className="font-hanken text-[13.5px] text-[#191c1b] font-medium">
                                {formatRole(user.role)}
                              </span>
                            ) : (
                              <select
                                value={user.role}
                                onChange={(e) =>
                                  handleRoleChange(user.id, e.target.value, user.name)
                                }
                                className="font-hanken text-[13.5px] text-[#191c1b] font-medium bg-transparent border border-[#E5E0D8] rounded-lg px-2.5 py-1.5 cursor-pointer hover:border-[#768875] focus:outline-none focus:border-[#768875] focus:ring-2 focus:ring-[#768875]/20 transition-all"
                              >
                                <option value="admin_hotel">Hotel Admin</option>
                                <option value="user">Customer / User</option>
                              </select>
                            )}
                          </td>

                          {/* Property Association */}
                          <td className="px-6 py-4">
                            <span className="font-hanken text-[13.5px] text-[#434842]">
                              {user.hotel?.name ||
                                (user.role === "super_admin"
                                  ? "H'Leven HQ"
                                  : "-")}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            {isActive ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-[0.05em] uppercase font-hanken bg-[#d1eac9] text-[#0c200c]">
                                Active
                              </span>
                            ) : isBlocked ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-[0.05em] uppercase font-hanken bg-[#ffdad6] text-[#93000a]">
                                Blocked
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-[0.05em] uppercase font-hanken bg-[#DED3C7] text-[#2F3231]">
                                {user.status || "Pending"}
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            {user.role !== "super_admin" ? (
                              <button
                                onClick={() =>
                                  handleToggleStatus(user.id, user.status)
                                }
                                title={isActive ? "Blokir Pengguna" : "Aktifkan Pengguna"}
                                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-hanken text-[13px] font-medium transition-all active:scale-95 ${
                                  isActive
                                    ? "text-[#ba1a1a] hover:bg-[#ffdad6]/40 border border-[#ffdad6]"
                                    : "text-[#768875] hover:bg-[#d1eac9]/40 border border-[#d1eac9]"
                                }`}
                              >
                                <span className="material-symbols-outlined text-[17px]">
                                  {isActive ? "block" : "lock_open"}
                                </span>
                                <span>{isActive ? "Block" : "Activate"}</span>
                              </button>
                            ) : (
                              <span className="text-[12px] text-[#747872] italic px-2">
                                System Protected
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-12 text-center text-[#747872] font-hanken text-[14px]"
                      >
                        Tidak ada data pengguna yang sesuai dengan kriteria pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-[#E5E0D8] bg-[#F9F6F1] flex flex-col sm:flex-row items-center justify-between gap-3 text-body-sm text-[#747872] font-hanken">
              <span className="text-[13px]">
                Menampilkan{" "}
                {totalItems > 0
                  ? (currentPage - 1) * itemsPerPage + 1
                  : 0}{" "}
                hingga {Math.min(currentPage * itemsPerPage, totalItems)} dari{" "}
                {totalItems} pengguna
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-[#E5E0D8] rounded-md bg-white hover:bg-[#F9F6F1] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-[13px] font-medium text-[#434842]"
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 border rounded-md text-[13px] font-medium transition-colors ${
                        currentPage === pageNum
                          ? "bg-[#768875] text-white border-[#768875]"
                          : "bg-white border-[#E5E0D8] text-[#434842] hover:bg-[#F9F6F1]"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                )}

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1 border border-[#E5E0D8] rounded-md bg-white hover:bg-[#F9F6F1] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-[13px] font-medium text-[#434842]"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* MODAL TAMBAH ADMIN HOTEL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <div
            className="fixed inset-0 bg-[#2e3130]/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          ></div>

          {/* Modal Container */}
          <div className="relative bg-white rounded-xl p-7 w-full max-w-lg shadow-[0_12px_40px_rgba(47,50,49,0.12)] border border-[#E5E0D8] z-10 font-hanken animate-fadeIn">
            {/* Header */}
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-[#E5E0D8]">
              <div>
                <h3 className="font-newsreader text-[24px] font-semibold text-[#4f604f] font-['Newsreader',serif]">
                  Tambah Admin Hotel
                </h3>
                <p className="font-hanken text-[13px] text-[#747872] mt-0.5">
                  Buat akun pengelola hotel baru untuk mitra jaringan H'Leven.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#747872] hover:text-[#191c1b] p-1.5 rounded-lg hover:bg-[#F9F6F1] transition-colors"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block font-hanken text-[11px] font-semibold text-[#747872] uppercase tracking-[0.05em] mb-1.5">
                  Nama Lengkap Admin
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. M. Gustave"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-white border border-[#E5E0D8] rounded-lg font-hanken text-[14px] text-[#191c1b] focus:outline-none focus:border-[#768875] focus:ring-2 focus:ring-[#768875]/20 transition-all"
                />
              </div>

              <div>
                <label className="block font-hanken text-[11px] font-semibold text-[#747872] uppercase tracking-[0.05em] mb-1.5">
                  Nama Hotel / Properti
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grand H'Leven Hotel & Resort"
                  value={formData.hotel_name}
                  onChange={(e) =>
                    setFormData({ ...formData, hotel_name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-white border border-[#E5E0D8] rounded-lg font-hanken text-[14px] text-[#191c1b] focus:outline-none focus:border-[#768875] focus:ring-2 focus:ring-[#768875]/20 transition-all"
                />
              </div>

              <div>
                <label className="block font-hanken text-[11px] font-semibold text-[#747872] uppercase tracking-[0.05em] mb-1.5">
                  Alamat Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@hotelmitra.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-white border border-[#E5E0D8] rounded-lg font-hanken text-[14px] text-[#191c1b] focus:outline-none focus:border-[#768875] focus:ring-2 focus:ring-[#768875]/20 transition-all"
                />
              </div>

              <div>
                <label className="block font-hanken text-[11px] font-semibold text-[#747872] uppercase tracking-[0.05em] mb-1.5">
                  Password Akun
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimal 8 karakter"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-white border border-[#E5E0D8] rounded-lg font-hanken text-[14px] text-[#191c1b] focus:outline-none focus:border-[#768875] focus:ring-2 focus:ring-[#768875]/20 transition-all"
                />
              </div>

              <div>
                <label className="block font-hanken text-[11px] font-semibold text-[#747872] uppercase tracking-[0.05em] mb-1.5">
                  Konfirmasi Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Ulangi password di atas"
                  value={formData.password_confirmation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password_confirmation: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 bg-white border border-[#E5E0D8] rounded-lg font-hanken text-[14px] text-[#191c1b] focus:outline-none focus:border-[#768875] focus:ring-2 focus:ring-[#768875]/20 transition-all"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end items-center gap-3 pt-5 border-t border-[#E5E0D8] mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#E5E0D8] rounded-lg font-hanken text-[13px] font-semibold text-[#434842] hover:bg-[#F9F6F1] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className={`px-5 py-2 rounded-lg font-hanken text-[13px] font-semibold text-white transition-all shadow-sm ${
                    submitLoading
                      ? "bg-[#A2BA9C] cursor-not-allowed"
                      : "bg-[#768875] hover:bg-[#657764]"
                  }`}
                >
                  {submitLoading ? "Menyimpan..." : "Simpan Admin"}
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
