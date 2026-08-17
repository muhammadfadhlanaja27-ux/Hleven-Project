import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";

const PartnerApproval = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Search & Filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected partner for review modal
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Rejection modal
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectPartnerId, setRejectPartnerId] = useState(null);
  const [rejectLoading, setRejectLoading] = useState(false);

  // Fetch partners
  const fetchPartners = async () => {
    try {
      setLoading(true);
      setError(false);
      const response = await api.get("/super-admin/partners");
      const data = response.data?.data || response.data || [];
      setPartners(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal mengambil data pengajuan:", err);
      setError(true);
      toast.error("Gagal memuat data pengajuan mitra.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menyetujui pengajuan mitra ini?"))
      return;

    try {
      await api.patch(`/super-admin/partners/${id}/approve`);
      toast.success("Pengajuan mitra berhasil disetujui!");
      if (selectedPartner && selectedPartner.id === id) {
        setSelectedPartner((prev) => ({ ...prev, status: "Approved" }));
      }
      fetchPartners();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menyetujui pengajuan.");
    }
  };

  const openRejectModal = (id) => {
    setRejectPartnerId(id);
    setRejectReason("");
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      toast.error("Alasan penolakan wajib diisi!");
      return;
    }

    setRejectLoading(true);
    try {
      await api.patch(`/super-admin/partners/${rejectPartnerId}/reject`, {
        reason: rejectReason,
      });
      toast.success("Pengajuan mitra berhasil ditolak.");
      setIsRejectModalOpen(false);
      if (selectedPartner && selectedPartner.id === rejectPartnerId) {
        setSelectedPartner((prev) => ({ ...prev, status: "Rejected" }));
      }
      fetchPartners();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menolak pengajuan.");
    } finally {
      setRejectLoading(false);
    }
  };

  // Helper formatting initials
  const getInitials = (name) => {
    if (!name) return "PT";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Filtered partners
  const filteredPartners = partners.filter((partner) => {
    const applicantName = (partner.applicant_name || partner.user?.name || "").toLowerCase();
    const hotelName = (partner.hotel_name || "").toLowerCase();
    const email = (partner.email || partner.user?.email || "").toLowerCase();
    const q = search.toLowerCase();

    const matchesSearch =
      !q ||
      applicantName.includes(q) ||
      hotelName.includes(q) ||
      email.includes(q);

    const matchesStatus =
      !statusFilter ||
      (partner.status || "").toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Pagination helper
  const totalItems = filteredPartners.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedPartners = filteredPartners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 font-hanken">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-newsreader text-[32px] font-semibold text-[#4f604f] tracking-[-0.02em] leading-tight font-['Newsreader',serif]">
            Partner Approvals
          </h2>
          <p className="font-hanken text-[14px] text-[#747872] mt-1">
            Review and manage new hotel partner applications and compliance documents.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#747872] text-[20px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              placeholder="Search applications..."
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
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={fetchPartners}
            title="Refresh Data"
            className="flex items-center gap-1.5 px-3 py-2 border border-[#E5E0D8] rounded-lg bg-white text-[#434842] hover:bg-[#F9F6F1] transition-all font-hanken text-[13px] font-semibold shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Data Table Card */}
      <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(47,50,49,0.06)] overflow-hidden border border-[#E5E0D8]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-[#E5E0D8] border-t-[#768875] rounded-full animate-spin"></div>
            <p className="font-hanken text-[14px] text-[#747872]">Memuat pengajuan mitra...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-3 font-hanken">
            <p className="text-[#ba1a1a] font-medium text-[15px]">
              Terjadi kesalahan saat memuat data pengajuan.
            </p>
            <button
              onClick={fetchPartners}
              className="px-4 py-2 bg-[#768875] text-white rounded-lg text-[13px] font-semibold hover:opacity-90 transition-opacity"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[#F9F6F1] border-b border-[#E5E0D8]">
                    <th className="py-4 px-6 font-hanken text-[12px] font-semibold text-[#434842] uppercase tracking-[0.05em]">
                      Owner Name
                    </th>
                    <th className="py-4 px-6 font-hanken text-[12px] font-semibold text-[#434842] uppercase tracking-[0.05em]">
                      Hotel Name
                    </th>
                    <th className="py-4 px-6 font-hanken text-[12px] font-semibold text-[#434842] uppercase tracking-[0.05em]">
                      Date Applied
                    </th>
                    <th className="py-4 px-6 font-hanken text-[12px] font-semibold text-[#434842] uppercase tracking-[0.05em]">
                      Status
                    </th>
                    <th className="py-4 px-6 font-hanken text-[12px] font-semibold text-[#434842] uppercase tracking-[0.05em] text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E0D8] font-hanken text-[13.5px]">
                  {paginatedPartners.length > 0 ? (
                    paginatedPartners.map((row) => {
                      const status = row.status || "Pending";
                      const isPending = status.toLowerCase() === "pending";
                      const isApproved = status.toLowerCase() === "approved";
                      const isRejected = status.toLowerCase() === "rejected";

                      const ownerName = row.applicant_name || row.user?.name || "Partner Owner";
                      const ownerEmail = row.email || row.user?.email || "";
                      const hotelName = row.hotel_name || "New Hotel Property";

                      return (
                        <tr
                          key={row.id}
                          className="hover:bg-[#F9F6F1]/50 transition-colors group cursor-pointer"
                          onClick={() => {
                            setSelectedPartner(row);
                            setIsReviewModalOpen(true);
                          }}
                        >
                          {/* Owner Name */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3.5">
                              <div className="w-9 h-9 rounded-full bg-[#edeeec] text-[#434842] flex items-center justify-center font-newsreader font-semibold text-[14px] shrink-0">
                                {getInitials(ownerName)}
                              </div>
                              <div>
                                <p className="font-semibold text-[#191c1b] group-hover:text-[#4f604f] transition-colors">
                                  {ownerName}
                                </p>
                                {ownerEmail && (
                                  <p className="text-xs text-[#747872] mt-0.5">
                                    {ownerEmail}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Hotel Name */}
                          <td className="py-4 px-6">
                            <p className="font-medium text-[#191c1b]">
                              {hotelName}
                            </p>
                            <p className="text-xs text-[#747872] mt-0.5">
                              {row.city || row.address ? `${row.city || row.address} • ` : ""}
                              {row.rooms_count ? `${row.rooms_count} Rooms` : "Hotel Partner"}
                            </p>
                          </td>

                          {/* Date Applied */}
                          <td className="py-4 px-6 text-[#434842]">
                            {row.created_at
                              ? new Date(row.created_at).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "-"}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-6">
                            {isApproved ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#d1eac9] text-[#0c200c] text-[11px] font-semibold tracking-[0.05em] uppercase">
                                Approved
                              </span>
                            ) : isRejected ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#ffdad6] text-[#93000a] text-[11px] font-semibold tracking-[0.05em] uppercase">
                                Rejected
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#DED3C7] text-[#2F3231] text-[11px] font-semibold tracking-[0.05em] uppercase">
                                Pending
                              </span>
                            )}
                          </td>

                          {/* Action */}
                          <td
                            className="py-4 px-6 text-right whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex justify-end items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedPartner(row);
                                  setIsReviewModalOpen(true);
                                }}
                                className="px-3.5 py-1.5 border border-[#768875] text-[#768875] rounded-lg font-hanken text-[13px] font-semibold hover:bg-[#768875] hover:text-white transition-all active:scale-95 shadow-sm"
                              >
                                View Detail
                              </button>

                              {isPending && (
                                <>
                                  <button
                                    onClick={() => handleApprove(row.id)}
                                    title="Setujui Pengajuan"
                                    className="px-3 py-1.5 bg-[#768875] text-white rounded-lg font-hanken text-[12.5px] font-semibold hover:bg-[#657764] transition-all active:scale-95 shadow-sm"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => openRejectModal(row.id)}
                                    title="Tolak Pengajuan"
                                    className="px-3 py-1.5 border border-[#ba1a1a] text-[#ba1a1a] rounded-lg font-hanken text-[12.5px] font-semibold hover:bg-[#ffdad6]/40 transition-all active:scale-95"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
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
                        Tidak ada data pengajuan mitra yang ditemukan.
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
                {totalItems} pengajuan
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

      {/* Review Application Modal / Detail Panel */}
      {isReviewModalOpen && selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <div
            className="fixed inset-0 bg-[#2e3130]/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsReviewModalOpen(false)}
          ></div>

          {/* Modal Container */}
          <div className="relative bg-white rounded-xl shadow-[0_12px_40px_rgba(47,50,49,0.12)] border border-[#E5E0D8] max-w-3xl w-full z-10 font-hanken overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E5E0D8] flex justify-between items-center bg-[#F9F6F1]">
              <div>
                <h3 className="font-newsreader text-[22px] font-semibold text-[#191c1b] font-['Newsreader',serif]">
                  Review Application: {selectedPartner.hotel_name || "Partner Application"}
                </h3>
                <p className="font-hanken text-[12px] font-semibold tracking-[0.05em] text-[#747872] mt-0.5 uppercase">
                  App ID: #HHL-{String(selectedPartner.id).padStart(4, "0")} • Status:{" "}
                  <span
                    className={
                      (selectedPartner.status || "").toLowerCase() === "approved"
                        ? "text-[#4f604f]"
                        : (selectedPartner.status || "").toLowerCase() === "rejected"
                        ? "text-[#ba1a1a]"
                        : "text-[#DED3C7]"
                    }
                  >
                    {selectedPartner.status || "Pending"}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-[#747872] hover:text-[#191c1b] p-2 rounded-full hover:bg-white/60 transition-colors"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Column 1: Owner & Hotel Info */}
              <div className="flex flex-col gap-6">
                <div>
                  <h4 className="font-hanken text-[11px] font-semibold text-[#434842] uppercase tracking-[0.05em] mb-3 border-b border-[#E5E0D8] pb-2">
                    Owner Information
                  </h4>
                  <div className="grid grid-cols-2 gap-y-3.5 text-[13.5px]">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-[#747872]">
                        Full Name
                      </p>
                      <p className="font-medium text-[#191c1b] mt-0.5">
                        {selectedPartner.applicant_name || selectedPartner.user?.name || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-[#747872]">
                        Phone
                      </p>
                      <p className="font-medium text-[#191c1b] mt-0.5">
                        {selectedPartner.phone || selectedPartner.user?.phone || "-"}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[11px] uppercase tracking-wider text-[#747872]">
                        Email Address
                      </p>
                      <p className="font-medium text-[#191c1b] mt-0.5">
                        {selectedPartner.email || selectedPartner.user?.email || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-hanken text-[11px] font-semibold text-[#434842] uppercase tracking-[0.05em] mb-3 border-b border-[#E5E0D8] pb-2">
                    Hotel Information
                  </h4>
                  <div className="grid grid-cols-2 gap-y-3.5 text-[13.5px]">
                    <div className="col-span-2">
                      <p className="text-[11px] uppercase tracking-wider text-[#747872]">
                        Property Name
                      </p>
                      <p className="font-medium text-[#191c1b] mt-0.5">
                        {selectedPartner.hotel_name || "-"}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[11px] uppercase tracking-wider text-[#747872]">
                        Address &amp; Location
                      </p>
                      <p className="font-medium text-[#191c1b] mt-0.5">
                        {selectedPartner.address || selectedPartner.city || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-[#747872]">
                        Total Rooms
                      </p>
                      <p className="font-medium text-[#191c1b] mt-0.5">
                        {selectedPartner.rooms_count ?? "24 Rooms"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-[#747872]">
                        Application Date
                      </p>
                      <p className="font-medium text-[#191c1b] mt-0.5">
                        {selectedPartner.created_at
                          ? new Date(selectedPartner.created_at).toLocaleDateString("id-ID")
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2: Documents Preview & Actions */}
              <div className="flex flex-col gap-6 justify-between">
                <div>
                  <h4 className="font-hanken text-[11px] font-semibold text-[#434842] uppercase tracking-[0.05em] mb-3 border-b border-[#E5E0D8] pb-2">
                    Document Verification
                  </h4>

                  <div className="flex flex-col gap-3">
                    {selectedPartner.document_url ? (
                      <div className="border border-[#E5E0D8] rounded-lg p-3.5 flex items-center gap-3.5 hover:border-[#768875] transition-colors bg-[#F9F6F1]/40 group">
                        <div className="w-11 h-11 bg-[#edeeec] rounded-lg flex items-center justify-center text-[#747872] group-hover:text-[#4f604f] transition-colors shrink-0">
                          <span className="material-symbols-outlined text-[24px]">
                            description
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#191c1b] text-[13.5px] truncate">
                            Dokumen Legalitas Mitra
                          </p>
                          <a
                            href={selectedPartner.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#768875] hover:underline font-medium mt-0.5 inline-block"
                          >
                            Buka File Dokumen &rarr;
                          </a>
                        </div>
                        <a
                          href={selectedPartner.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#747872] group-hover:text-[#768875] p-1.5"
                          title="Preview"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            visibility
                          </span>
                        </a>
                      </div>
                    ) : (
                      <div className="border border-dashed border-[#E5E0D8] rounded-lg p-6 text-center text-[#747872] text-[13px]">
                        Tidak ada lampiran dokumen digital untuk pengajuan ini.
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Decision Actions */}
                <div className="pt-6 border-t border-[#E5E0D8] flex gap-3">
                  {(selectedPartner.status || "").toLowerCase() === "pending" ? (
                    <>
                      <button
                        onClick={() => openRejectModal(selectedPartner.id)}
                        className="flex-1 py-2.5 border border-[#ba1a1a] text-[#ba1a1a] rounded-lg font-hanken text-[13.5px] font-semibold hover:bg-[#ffdad6]/40 transition-colors shadow-sm active:scale-95"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(selectedPartner.id)}
                        className="flex-1 py-2.5 bg-[#768875] text-white rounded-lg font-hanken text-[13.5px] font-semibold hover:bg-[#657764] transition-colors shadow-sm active:scale-95"
                      >
                        Approve
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsReviewModalOpen(false)}
                      className="w-full py-2.5 border border-[#E5E0D8] text-[#434842] hover:bg-[#F9F6F1] rounded-lg font-hanken text-[13.5px] font-semibold transition-colors"
                    >
                      Tutup
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#2e3130]/40 backdrop-blur-sm"
            onClick={() => setIsRejectModalOpen(false)}
          ></div>

          <div className="relative bg-white rounded-xl shadow-[0_12px_40px_rgba(47,50,49,0.12)] border border-[#E5E0D8] p-6 max-w-md w-full z-10 font-hanken animate-fadeIn">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#E5E0D8]">
              <h3 className="font-newsreader text-[20px] font-semibold text-[#ba1a1a]">
                Tolak Pengajuan Mitra
              </h3>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="text-[#747872] hover:text-[#191c1b]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block font-hanken text-[11px] font-semibold text-[#747872] uppercase tracking-[0.05em] mb-1.5">
                  Alasan Penolakan (Wajib Diisi)
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="Contoh: Dokumen perizinan tidak valid atau belum lengkap..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-3 bg-white border border-[#E5E0D8] rounded-lg font-hanken text-[13.5px] text-[#191c1b] focus:outline-none focus:border-[#ba1a1a] focus:ring-2 focus:ring-[#ba1a1a]/20 transition-all resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end items-center gap-3 pt-3 border-t border-[#E5E0D8]">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-4 py-2 border border-[#E5E0D8] rounded-lg font-hanken text-[13px] font-semibold text-[#434842] hover:bg-[#F9F6F1] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={rejectLoading}
                  className={`px-5 py-2 bg-[#ba1a1a] text-white rounded-lg font-hanken text-[13px] font-semibold hover:bg-[#93000a] transition-all shadow-sm ${
                    rejectLoading ? "opacity-60 cursor-not-allowed" : "active:scale-95"
                  }`}
                >
                  {rejectLoading ? "Menyimpan..." : "Konfirmasi Penolakan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerApproval;