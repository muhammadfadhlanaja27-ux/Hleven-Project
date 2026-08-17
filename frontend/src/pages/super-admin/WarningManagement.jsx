import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";

const WarningManagement = () => {
  const [warnings, setWarnings] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Search & Filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // State Modal Buat Warning Baru
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWarning, setNewWarning] = useState({
    hotel_id: "",
    title: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Modal Detail Warning
  const [selectedWarning, setSelectedWarning] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchWarnings = async () => {
    try {
      setLoading(true);
      setError(false);
      const response = await api.get("/super-admin/warnings");
      const data = response.data?.data || response.data || [];
      setWarnings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal mengambil data warning:", err);
      setError(true);
      toast.error("Gagal memuat data peringatan.");
    } finally {
      setLoading(false);
    }
  };

  const fetchHotels = async () => {
    try {
      const response = await api.get("/super-admin/hotels");
      const data = response.data?.data || response.data || [];
      setHotels(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal memuat daftar hotel:", err);
    }
  };

  useEffect(() => {
    fetchWarnings();
    fetchHotels();
  }, []);

  // Submit Buat Warning
  const handleCreateWarning = async (e) => {
    e.preventDefault();
    if (!newWarning.hotel_id || !newWarning.title || !newWarning.message) {
      toast.error("Semua kolom formulir wajib diisi!");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/super-admin/warnings", newWarning);
      toast.success("Peringatan kepatuhan berhasil dikirim ke hotel!");
      setIsModalOpen(false);
      setNewWarning({ hotel_id: "", title: "", message: "" });
      fetchWarnings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal membuat surat peringatan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Menandai Warning Selesai (Resolved)
  const handleResolveWarning = async (id) => {
    if (!window.confirm("Tandai peringatan kepatuhan ini sebagai Selesai (Resolved)?"))
      return;

    try {
      await api.patch(`/super-admin/warnings/${id}/status`, { status: "resolved" });
      toast.success("Status peringatan berhasil diubah menjadi Resolved!");
      if (selectedWarning && selectedWarning.id === id) {
        setSelectedWarning((prev) => ({ ...prev, status: "resolved" }));
      }
      fetchWarnings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal memperbarui status.");
    }
  };

  // Filtered Warnings
  const filteredWarnings = warnings.filter((item) => {
    const hotelName = (item.hotel?.name || item.hotel_name || "").toLowerCase();
    const title = (item.title || "").toLowerCase();
    const message = (item.message || "").toLowerCase();
    const q = search.toLowerCase();

    const matchesSearch =
      !q || hotelName.includes(q) || title.includes(q) || message.includes(q);

    const status = (item.status || "pending").toLowerCase();
    const matchesStatus =
      !statusFilter || status === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalItems = filteredWarnings.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedWarnings = filteredWarnings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 font-hanken">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-newsreader text-[32px] font-semibold text-[#4f604f] tracking-[-0.02em] leading-tight font-['Newsreader',serif]">
            Warning Management
          </h2>
          <p className="font-hanken text-[14px] text-[#747872] mt-1">
            Manage and monitor formal compliance warnings issued to hotel partners.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 md:w-60">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#747872] text-[20px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              placeholder="Search warnings..."
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
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={fetchWarnings}
            title="Refresh Data"
            className="flex items-center gap-1.5 px-3 py-2 border border-[#E5E0D8] rounded-lg bg-white text-[#434842] hover:bg-[#F9F6F1] transition-all font-hanken text-[13px] font-semibold shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>

          {/* Button Issue Warning */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#768875] text-white rounded-lg font-hanken text-[13.5px] font-semibold hover:bg-[#657764] transition-all shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Issue Warning</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(47,50,49,0.06)] overflow-hidden border border-[#E5E0D8]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-[#E5E0D8] border-t-[#768875] rounded-full animate-spin"></div>
            <p className="font-hanken text-[14px] text-[#747872]">Memuat data surat peringatan...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-3 font-hanken">
            <p className="text-[#ba1a1a] font-medium text-[15px]">
              Terjadi kesalahan saat memuat data teguran.
            </p>
            <button
              onClick={fetchWarnings}
              className="px-4 py-2 bg-[#768875] text-white rounded-lg text-[13px] font-semibold hover:opacity-90 transition-opacity"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="bg-[#F9F6F1] border-b border-[#E5E0D8]">
                    <th className="py-4 px-6 font-hanken text-[12px] font-semibold text-[#434842] uppercase tracking-[0.05em] w-36">
                      Date
                    </th>
                    <th className="py-4 px-6 font-hanken text-[12px] font-semibold text-[#434842] uppercase tracking-[0.05em]">
                      Hotel
                    </th>
                    <th className="py-4 px-6 font-hanken text-[12px] font-semibold text-[#434842] uppercase tracking-[0.05em]">
                      Subject &amp; Message
                    </th>
                    <th className="py-4 px-6 font-hanken text-[12px] font-semibold text-[#434842] uppercase tracking-[0.05em] text-center w-36">
                      Status
                    </th>
                    <th className="py-4 px-6 font-hanken text-[12px] font-semibold text-[#434842] uppercase tracking-[0.05em] text-right w-36">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E0D8] font-hanken text-[13.5px]">
                  {paginatedWarnings.length > 0 ? (
                    paginatedWarnings.map((row) => {
                      const isResolved = (row.status || "").toLowerCase() === "resolved";
                      const hotelName = row.hotel?.name || row.hotel_name || "Hotel Partner";
                      const hotelCity = row.hotel?.city?.name || row.hotel?.address || "";

                      return (
                        <tr
                          key={row.id}
                          className="hover:bg-[#F9F6F1]/50 transition-colors group cursor-pointer"
                          onClick={() => {
                            setSelectedWarning(row);
                            setIsDetailModalOpen(true);
                          }}
                        >
                          {/* Date */}
                          <td className="py-4 px-6 whitespace-nowrap text-[#747872]">
                            {row.created_at
                              ? new Date(row.created_at).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "2-digit",
                                  year: "numeric",
                                })
                              : "-"}
                          </td>

                          {/* Hotel */}
                          <td className="py-4 px-6">
                            <p className="font-semibold text-[#191c1b] group-hover:text-[#4f604f] transition-colors">
                              {hotelName}
                            </p>
                            {hotelCity && (
                              <p className="text-xs text-[#747872] mt-0.5">
                                {hotelCity}
                              </p>
                            )}
                          </td>

                          {/* Subject & Message */}
                          <td className="py-4 px-6 max-w-xs md:max-w-sm">
                            <p className="font-medium text-[#191c1b] truncate">
                              {row.title}
                            </p>
                            <p className="text-xs text-[#747872] truncate mt-0.5">
                              {row.message}
                            </p>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-6 text-center">
                            {isResolved ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d1eac9] text-[#0c200c] text-[11px] font-semibold uppercase tracking-[0.05em]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#768875]"></span>
                                Resolved
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdad6] text-[#93000a] text-[11px] font-semibold uppercase tracking-[0.05em]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]"></span>
                                Pending
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td
                            className="py-4 px-6 text-right whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-end gap-2">
                              {!isResolved && (
                                <button
                                  onClick={() => handleResolveWarning(row.id)}
                                  className="px-3 py-1.5 bg-[#768875] text-white rounded-lg font-hanken text-[12px] font-semibold hover:bg-[#657764] transition-all active:scale-95 shadow-sm"
                                  title="Mark as Resolved"
                                >
                                  Resolve
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  setSelectedWarning(row);
                                  setIsDetailModalOpen(true);
                                }}
                                className="px-3 py-1.5 border border-[#E5E0D8] text-[#434842] rounded-lg font-hanken text-[12px] font-semibold hover:bg-[#F9F6F1] transition-all"
                                title="Lihat Detail"
                              >
                                Detail
                              </button>
                            </div>
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
                        Tidak ada surat peringatan kepatuhan yang ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="bg-[#F9F6F1] border-t border-[#E5E0D8] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-body-sm text-[#747872] font-hanken">
              <span className="text-[13px]">
                Menampilkan{" "}
                {totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}{" "}
                hingga {Math.min(currentPage * itemsPerPage, totalItems)} dari{" "}
                {totalItems} peringatan
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

      {/* Modal Detail Warning */}
      {isDetailModalOpen && selectedWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#2e3130]/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDetailModalOpen(false)}
          ></div>

          <div className="relative bg-white rounded-xl shadow-[0_12px_40px_rgba(47,50,49,0.12)] border border-[#E5E0D8] max-w-lg w-full z-10 font-hanken p-6 animate-fadeIn">
            <div className="flex justify-between items-center pb-4 border-b border-[#E5E0D8]">
              <div>
                <h3 className="font-newsreader text-[20px] font-semibold text-[#191c1b] font-['Newsreader',serif]">
                  Compliance Warning Detail
                </h3>
                <p className="text-xs text-[#747872] mt-0.5">
                  ID: #WRN-{String(selectedWarning.id).padStart(4, "0")}
                </p>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-[#747872] hover:text-[#191c1b] p-1.5"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="py-4 space-y-4 text-[13.5px]">
              <div>
                <label className="text-[11px] font-semibold text-[#747872] uppercase tracking-[0.05em] block mb-1">
                  Target Hotel
                </label>
                <p className="font-semibold text-[#191c1b]">
                  {selectedWarning.hotel?.name || selectedWarning.hotel_name || "Hotel Partner"}
                </p>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#747872] uppercase tracking-[0.05em] block mb-1">
                  Subject / Perihal
                </label>
                <p className="font-medium text-[#191c1b]">
                  {selectedWarning.title}
                </p>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#747872] uppercase tracking-[0.05em] block mb-1">
                  Pesan Peringatan
                </label>
                <div className="p-3.5 bg-[#F9F6F1] rounded-lg border border-[#E5E0D8] text-[#191c1b] whitespace-pre-wrap leading-relaxed">
                  {selectedWarning.message}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-[11px] font-semibold text-[#747872] uppercase tracking-[0.05em] block mb-1">
                    Tanggal Penerbitan
                  </label>
                  <p className="text-[#434842]">
                    {selectedWarning.created_at
                      ? new Date(selectedWarning.created_at).toLocaleString("id-ID")
                      : "-"}
                  </p>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#747872] uppercase tracking-[0.05em] block mb-1">
                    Status Peringatan
                  </label>
                  {(selectedWarning.status || "").toLowerCase() === "resolved" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#d1eac9] text-[#0c200c] text-[11px] font-semibold uppercase tracking-[0.05em]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#768875]"></span>
                      Resolved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ffdad6] text-[#93000a] text-[11px] font-semibold uppercase tracking-[0.05em]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]"></span>
                      Pending
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E0D8] flex justify-end gap-3">
              {(selectedWarning.status || "").toLowerCase() !== "resolved" && (
                <button
                  onClick={() => handleResolveWarning(selectedWarning.id)}
                  className="px-4 py-2 bg-[#768875] text-white rounded-lg font-hanken text-[13px] font-semibold hover:bg-[#657764] transition-all shadow-sm active:scale-95"
                >
                  Tandai Selesai (Resolve)
                </button>
              )}
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 border border-[#E5E0D8] text-[#434842] hover:bg-[#F9F6F1] rounded-lg font-hanken text-[13px] font-semibold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Buat Warning Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#2e3130]/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          ></div>

          <div className="relative bg-white rounded-xl shadow-[0_12px_40px_rgba(47,50,49,0.12)] border border-[#E5E0D8] max-w-lg w-full z-10 font-hanken p-6 animate-fadeIn">
            <div className="flex justify-between items-center pb-4 border-b border-[#E5E0D8]">
              <div>
                <h3 className="font-newsreader text-[20px] font-semibold text-[#191c1b] font-['Newsreader',serif]">
                  Issue Compliance Warning
                </h3>
                <p className="text-xs text-[#747872] mt-0.5">
                  Terbitkan surat peringatan resmi kepada mitra hotel.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#747872] hover:text-[#191c1b] p-1.5"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateWarning} className="space-y-4 pt-4">
              <div>
                <label className="block font-hanken text-[11px] font-semibold text-[#747872] uppercase tracking-[0.05em] mb-1.5">
                  Pilih Hotel Mitra <span className="text-[#ba1a1a]">*</span>
                </label>
                <select
                  required
                  value={newWarning.hotel_id}
                  onChange={(e) =>
                    setNewWarning({ ...newWarning, hotel_id: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E5E0D8] rounded-lg font-hanken text-[13.5px] text-[#191c1b] focus:outline-none focus:border-[#768875] focus:ring-2 focus:ring-[#768875]/20 transition-all cursor-pointer"
                >
                  <option value="">-- Pilih Hotel --</option>
                  {hotels.map((hotel) => (
                    <option key={hotel.id} value={hotel.id}>
                      {hotel.name} {hotel.city?.name ? `(${hotel.city.name})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-hanken text-[11px] font-semibold text-[#747872] uppercase tracking-[0.05em] mb-1.5">
                  Judul / Perihal Peringatan <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newWarning.title}
                  onChange={(e) =>
                    setNewWarning({ ...newWarning, title: e.target.value })
                  }
                  placeholder="Contoh: Keterlambatan Pelaporan Keuangan..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E5E0D8] rounded-lg font-hanken text-[13.5px] text-[#191c1b] placeholder-[#747872] focus:outline-none focus:border-[#768875] focus:ring-2 focus:ring-[#768875]/20 transition-all"
                />
              </div>

              <div>
                <label className="block font-hanken text-[11px] font-semibold text-[#747872] uppercase tracking-[0.05em] mb-1.5">
                  Pesan &amp; Uraian Peringatan <span className="text-[#ba1a1a]">*</span>
                </label>
                <textarea
                  required
                  rows="4"
                  value={newWarning.message}
                  onChange={(e) =>
                    setNewWarning({ ...newWarning, message: e.target.value })
                  }
                  placeholder="Jelaskan alasan dan instruksi tindak lanjut yang harus dilakukan mitra..."
                  className="w-full p-3 bg-white border border-[#E5E0D8] rounded-lg font-hanken text-[13.5px] text-[#191c1b] placeholder-[#747872] focus:outline-none focus:border-[#768875] focus:ring-2 focus:ring-[#768875]/20 transition-all resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E5E0D8]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#E5E0D8] rounded-lg font-hanken text-[13px] font-semibold text-[#434842] hover:bg-[#F9F6F1] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-5 py-2 bg-[#768875] text-white rounded-lg font-hanken text-[13px] font-semibold hover:bg-[#657764] transition-all shadow-sm ${
                    isSubmitting ? "opacity-60 cursor-not-allowed" : "active:scale-95"
                  }`}
                >
                  {isSubmitting ? "Mengirim..." : "Terbitkan Peringatan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarningManagement;