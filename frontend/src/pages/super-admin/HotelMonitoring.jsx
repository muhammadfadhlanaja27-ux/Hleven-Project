import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";

const HotelMonitoring = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // State untuk pencarian dan filter status
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // State untuk Modal Detail
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // State untuk Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchHotels = async () => {
    try {
      setLoading(true);
      setError(false);
      const response = await api.get("/super-admin/hotels", {
        params: {
          search,
          status: statusFilter,
        },
      });

      // Handle data array
      const data = response.data.data || response.data || [];
      setHotels(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal mengambil data hotel:", err);
      setError(true);
      toast.error("Gagal memuat data hotel. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchHotels();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search, statusFilter]);

  const handleToggleStatus = async (id, currentStatus) => {
    const lowerStatus = currentStatus ? currentStatus.toLowerCase() : "";
    const newStatus = lowerStatus === "active" ? "inactive" : "active";

    if (
      !window.confirm(
        `Yakin ingin mengubah status hotel ini menjadi ${newStatus.toUpperCase()}?`
      )
    ) {
      return;
    }

    try {
      await api.patch(`/super-admin/hotels/${id}/status`, {
        status: newStatus,
      });
      toast.success("Status hotel berhasil diperbarui!");
      if (selectedHotel && selectedHotel.id === id) {
        setSelectedHotel((prev) => ({ ...prev, status: newStatus }));
      }
      fetchHotels();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Gagal memperbarui status hotel."
      );
    }
  };

  const handleOpenDetail = (hotel) => {
    setSelectedHotel(hotel);
    setModalOpen(true);
  };

  // Pagination helper
  const totalItems = hotels.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedHotels = hotels.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 font-hanken">
      {/* Page Header & Filter Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-newsreader text-[32px] font-semibold text-[#4f604f] tracking-[-0.02em] leading-tight font-['Newsreader',serif]">
            Hotel Monitoring
          </h2>
          <p className="font-hanken text-[14px] text-[#747872] mt-1">
            Kelola dan pantau seluruh properti hotel mitra dalam jaringan H'Leven.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 md:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#747872] text-[20px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              placeholder="Cari hotel atau kota..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#E5E0D8] rounded-lg font-hanken text-[14px] text-[#191c1b] placeholder-[#747872] focus:outline-none focus:border-[#768875] focus:ring-2 focus:ring-[#768875]/20 transition-all shadow-sm"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-white border border-[#E5E0D8] rounded-lg font-hanken text-[14px] text-[#191c1b] focus:outline-none focus:border-[#768875] focus:ring-2 focus:ring-[#768875]/20 transition-all shadow-sm cursor-pointer"
          >
            <option value="">Semua Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={fetchHotels}
            title="Refresh Data"
            className="flex items-center gap-1.5 px-3 py-2 border border-[#E5E0D8] rounded-lg bg-white text-[#434842] hover:bg-[#F9F6F1] transition-all font-hanken text-[13px] font-semibold shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Data Table Card */}
      <div className="bg-white rounded-lg shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8] overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-[#E5E0D8] border-t-[#768875] rounded-full animate-spin"></div>
            <p className="font-hanken text-[14px] text-[#747872]">Memuat data properti hotel...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-3">
            <p className="font-hanken text-[#ba1a1a] font-medium text-[15px]">
              Terjadi kesalahan saat memuat data hotel.
            </p>
            <button
              onClick={fetchHotels}
              className="px-4 py-2 bg-[#768875] text-white rounded-lg font-hanken text-[13px] font-semibold hover:opacity-90 transition-opacity"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F9F6F1] border-b border-[#E5E0D8] font-hanken text-[12px] font-semibold leading-[1] text-[#434842] uppercase tracking-[0.05em]">
                    <th className="py-4 px-6">Hotel Name &amp; ID</th>
                    <th className="py-4 px-6">Location</th>
                    <th className="py-4 px-6">Admin Contact</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="font-hanken text-[14px] text-[#191c1b] divide-y divide-[#E5E0D8]">
                  {paginatedHotels.length > 0 ? (
                    paginatedHotels.map((hotel) => {
                      const statusStr = hotel.status ? hotel.status.toLowerCase() : "";
                      const isActive = statusStr === "active";
                      const isPending = statusStr === "pending" || statusStr === "pending review";

                      let statusBadge = (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full font-hanken text-[11px] font-semibold tracking-[0.05em] uppercase bg-[#ffdad6] text-[#93000a]">
                          INACTIVE
                        </span>
                      );

                      if (isActive) {
                        statusBadge = (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full font-hanken text-[11px] font-semibold tracking-[0.05em] uppercase bg-[#d1eac9] text-[#0c200c]">
                            ACTIVE
                          </span>
                        );
                      } else if (isPending) {
                        statusBadge = (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full font-hanken text-[11px] font-semibold tracking-[0.05em] uppercase bg-[#DED3C7] text-[#2F3231]">
                            PENDING
                          </span>
                        );
                      }

                      return (
                        <tr
                          key={hotel.id}
                          className="hover:bg-[#F9F6F1]/50 transition-colors"
                        >
                          {/* Hotel Name & ID */}
                          <td className="py-4 px-6">
                            <div className="font-medium text-[#191c1b] font-hanken">
                              {hotel.name}
                            </div>
                            <div className="text-[#747872] text-[12px] mt-0.5">
                              ID: HTL-{String(hotel.id).padStart(4, "0")}
                            </div>
                          </td>

                          {/* Location */}
                          <td className="py-4 px-6 text-[#434842]">
                            {hotel.city?.name ||
                              hotel.city?.city_name ||
                              hotel.address ||
                              "-"}
                          </td>

                          {/* Admin Contact */}
                          <td className="py-4 px-6 text-[#434842]">
                            {hotel.admin?.email || hotel.email || "-"}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-6">{statusBadge}</td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => handleOpenDetail(hotel)}
                              className="font-hanken text-[13px] font-semibold text-[#768875] hover:text-[#4f604f] transition-colors border border-[#768875] px-3 py-1.5 rounded-lg hover:bg-[#768875]/5 active:scale-95"
                            >
                              View Detail
                            </button>

                            <button
                              onClick={() =>
                                handleToggleStatus(hotel.id, hotel.status)
                              }
                              className={`font-hanken text-[13px] font-medium transition-colors px-3 py-1.5 rounded-lg active:scale-95 ${
                                isActive
                                  ? "text-[#747872] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40"
                                  : "text-[#768875] hover:text-[#4f604f] hover:bg-[#d1eac9]/40"
                              }`}
                            >
                              {isActive ? "Suspend" : "Activate"}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-12 text-center text-[#747872] font-hanken text-[14px]"
                      >
                        Tidak ada data hotel yang sesuai dengan filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="bg-[#F9F6F1] border-t border-[#E5E0D8] p-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-body-sm text-[#747872] font-hanken">
              <span className="text-[13px]">
                Menampilkan{" "}
                {totalItems > 0
                  ? (currentPage - 1) * itemsPerPage + 1
                  : 0}{" "}
                hingga {Math.min(currentPage * itemsPerPage, totalItems)} dari{" "}
                {totalItems} hotel
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

      {/* Modal: Hotel Details (matching hotels.html) */}
      {modalOpen && selectedHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#2e3130]/40 backdrop-blur-sm transition-opacity"
            onClick={() => setModalOpen(false)}
          ></div>

          {/* Modal Content */}
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-[0_12px_40px_rgba(47,50,49,0.12)] p-7 border border-[#E5E0D8] z-10 font-hanken animate-fadeIn">
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-[#E5E0D8]">
              <div>
                <h3 className="font-newsreader text-[24px] font-semibold text-[#4f604f] font-['Newsreader',serif]">
                  {selectedHotel.name}
                </h3>
                <p className="font-hanken text-[13px] text-[#747872] mt-1">
                  ID: HTL-{String(selectedHotel.id).padStart(4, "0")} •{" "}
                  {selectedHotel.city?.name ||
                    selectedHotel.city?.city_name ||
                    "Lokasi Mitra"}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-[#747872] hover:text-[#191c1b] p-1.5 rounded-lg hover:bg-[#F9F6F1] transition-colors"
              >
                <span className="material-symbols-outlined text-[22px]">
                  close
                </span>
              </button>
            </div>

            {/* Grid Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block font-hanken text-[11px] font-semibold text-[#747872] uppercase tracking-[0.05em] mb-1">
                  Alamat Lengkap
                </label>
                <p className="font-hanken text-[14px] text-[#191c1b]">
                  {selectedHotel.address || "-"}
                </p>
              </div>

              <div>
                <label className="block font-hanken text-[11px] font-semibold text-[#747872] uppercase tracking-[0.05em] mb-1">
                  Total Kamar
                </label>
                <p className="font-hanken text-[14px] text-[#191c1b]">
                  {selectedHotel.rooms_count ??
                    selectedHotel.total_rooms ??
                    "24 Kamar"}
                </p>
              </div>

              <div>
                <label className="block font-hanken text-[11px] font-semibold text-[#747872] uppercase tracking-[0.05em] mb-1">
                  Admin Hotel (Kontak)
                </label>
                <p className="font-hanken text-[14px] text-[#191c1b]">
                  {selectedHotel.admin?.name
                    ? `${selectedHotel.admin.name} (${selectedHotel.admin.email})`
                    : selectedHotel.admin?.email || selectedHotel.email || "-"}
                </p>
              </div>

              <div>
                <label className="block font-hanken text-[11px] font-semibold text-[#747872] uppercase tracking-[0.05em] mb-1">
                  Status Operasional
                </label>
                <div className="mt-1">
                  {selectedHotel.status?.toLowerCase() === "active" ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full font-hanken text-[11px] font-semibold tracking-[0.05em] uppercase bg-[#d1eac9] text-[#0c200c]">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full font-hanken text-[11px] font-semibold tracking-[0.05em] uppercase bg-[#ffdad6] text-[#93000a]">
                      INACTIVE
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Description or Facilities */}
            {selectedHotel.description && (
              <div className="mb-6">
                <label className="block font-hanken text-[11px] font-semibold text-[#747872] uppercase tracking-[0.05em] mb-1.5">
                  Deskripsi Properti
                </label>
                <p className="font-hanken text-[13px] text-[#434842] leading-relaxed bg-[#F9F6F1] p-3.5 rounded-lg border border-[#E5E0D8]">
                  {selectedHotel.description}
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end items-center gap-3 pt-4 border-t border-[#E5E0D8]">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-[#E5E0D8] rounded-lg font-hanken text-[13px] font-semibold text-[#434842] hover:bg-[#F9F6F1] transition-colors"
              >
                Tutup
              </button>

              <button
                type="button"
                onClick={() => {
                  handleToggleStatus(selectedHotel.id, selectedHotel.status);
                }}
                className={`px-5 py-2 rounded-lg font-hanken text-[13px] font-semibold text-white transition-all shadow-sm ${
                  selectedHotel.status?.toLowerCase() === "active"
                    ? "bg-[#ba1a1a] hover:bg-[#93000a]"
                    : "bg-[#768875] hover:bg-[#4f604f]"
                }`}
              >
                {selectedHotel.status?.toLowerCase() === "active"
                  ? "Suspend Hotel"
                  : "Activate Hotel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelMonitoring;