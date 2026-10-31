import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";

export default function AppealManagement() {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedAppeal, setSelectedAppeal] = useState(null);
  const [adminNote, setAdminNote] = useState("");
  const [isDeciding, setIsDeciding] = useState(false);

  const fetchAppeals = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get("/super-admin/appeals", { params });
      const data = res.data?.data;
      setAppeals(Array.isArray(data?.data) ? data.data : []);
      setTotalPages(data?.last_page || 1);
      setTotalItems(data?.total || 0);
    } catch (e) {
      toast.error("Failed to load appeal data.");
      setAppeals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppeals();
  }, [statusFilter, page]);

  const handleDecision = async (status) => {
    if (!selectedAppeal) return;
    setIsDeciding(true);
    try {
      const res = await api.patch(`/super-admin/appeals/${selectedAppeal.id}/status`, {
        status,
        admin_note: adminNote.trim() || null,
      });
      toast.success(res.data?.message || `Banding ${status}`);
      setSelectedAppeal(null);
      setAdminNote("");
      fetchAppeals();
    } catch (err) {
       toast.error(err.response?.data?.message || "Failed to process appeal");
    } finally {
      setIsDeciding(false);
    }
  };

  const badge = (s) => {
    if (s === "pending")
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E0F2FE] text-[#0369A1] border border-[#0369A1]/20">Pending</span>;
    if (s === "approved")
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E4EBE0] text-[#4A5D43] border border-[#4A5D43]/20">Disetujui</span>;
    return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ffdad6] text-[#ba1a1a] border border-[#ba1a1a]/20">Ditolak</span>;
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 font-hanken">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-newsreader text-[32px] font-semibold text-[#4f604f] tracking-[-0.02em] leading-tight font-['Newsreader',serif]">
            Manajemen Aju Banding
          </h2>
          <p className="font-hanken text-[14px] text-[#747872] mt-1">
            Review dan putuskan permohonan banding atas surat peringatan maupun pemulihan akun suspend hotel.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2 bg-white border border-[#E5E0D8] rounded-lg font-hanken text-[14px] text-[#191c1b] focus:outline-none focus:border-[#768875] focus:ring-2 focus:ring-[#768875]/20 transition-all shadow-sm cursor-pointer"
          >
             <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
          </select>
          <button
            onClick={fetchAppeals}
            className="flex items-center gap-1.5 px-3 py-2 border border-[#E5E0D8] rounded-lg bg-white text-[#434842] hover:bg-[#F9F6F1] transition-all font-hanken text-[13px] font-semibold shadow-sm"
            title="Refresh Data"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9F6F1] border-b border-[#E5E0D8] font-hanken text-[12px] font-semibold leading-[1] text-[#434842] uppercase tracking-[0.05em]">
                 <th className="py-4 px-6">Hotel</th>
                 <th className="py-4 px-6">Appeal Type</th>
                 <th className="py-4 px-6">Requester</th>
                 <th className="py-4 px-6">Reason</th>
                 <th className="py-4 px-6">Date</th>
                 <th className="py-4 px-6">Status</th>
                 <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="font-hanken text-[14px] text-[#191c1b] divide-y divide-[#E5E0D8]">
               {loading ? (
                 <tr>
                   <td colSpan="7" className="py-12 text-center text-[#747872]">Loading appeal data...</td>
                 </tr>
               ) : appeals.length === 0 ? (
                 <tr>
                   <td colSpan="7" className="py-12 text-center text-[#747872]">No appeal data available.</td>
                 </tr>
              ) : (
                appeals.map((a) => {
                  const isWarningAppeal = !!a.warning_id;
                  return (
                    <tr key={a.id} className="hover:bg-[#F9F6F1]/50 transition-colors">
                      <td className="py-4 px-6 font-medium text-[#191c1b]">{a.hotel?.name || "-"}</td>
                      <td className="py-4 px-6">
                        {isWarningAppeal ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-hanken text-[11px] font-semibold tracking-[0.05em] uppercase bg-amber-50 text-amber-900 border border-amber-200">
                              <span className="material-symbols-outlined text-[13px]">warning</span>
                              <span>Peringatan #{String(a.warning_id).padStart(4, "0")}</span>
                            </span>
                            {a.warning?.title && (
                              <p className="text-[11px] text-[#747872] truncate max-w-[180px]">{a.warning.title}</p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-hanken text-[11px] font-semibold tracking-[0.05em] uppercase bg-red-50 text-red-900 border border-red-200">
                            <span className="material-symbols-outlined text-[13px]">lock_reset</span>
                            <span>Pemulihan Akun</span>
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-xs text-[#747872]">{a.requester?.name || a.requester?.email || "-"}</td>
                      <td className="py-4 px-6 text-xs max-w-xs truncate text-[#434842]">{a.reason}</td>
                      <td className="py-4 px-6 text-xs whitespace-nowrap text-[#747872]">
                        {a.created_at ? new Date(a.created_at).toLocaleDateString("id-ID") : "-"}
                      </td>
                      <td className="py-4 px-6">{badge(a.status)}</td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedAppeal(a);
                            setAdminNote(a.admin_note || "");
                          }}
                          className="font-hanken text-[13px] font-semibold text-[#768875] hover:text-[#4f604f] transition-colors border border-[#768875] px-3 py-1.5 rounded-lg hover:bg-[#768875]/5 active:scale-95"
                        >
                          {a.status === "pending" ? "Proses" : "Detail"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="bg-[#F9F6F1] border-t border-[#E5E0D8] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#747872] font-hanken">
           <span>
             Showing {totalItems > 0 ? (page - 1) * 10 + 1 : 0} to {Math.min(page * 10, totalItems)} of {totalItems} appeals
           </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-[#E5E0D8] rounded-md bg-white hover:bg-[#F9F6F1] disabled:opacity-40 font-medium text-[#434842]"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
              <button
                key={pNum}
                onClick={() => setPage(pNum)}
                className={`px-3 py-1 border rounded-md font-medium transition-colors ${
                  page === pNum
                    ? "bg-[#768875] text-white border-[#768875]"
                    : "bg-white border-[#E5E0D8] text-[#434842] hover:bg-[#F9F6F1]"
                }`}
              >
                {pNum}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages || totalPages === 0}
              className="px-3 py-1 border border-[#E5E0D8] rounded-md bg-white hover:bg-[#F9F6F1] disabled:opacity-40 font-medium text-[#434842]"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modal Detail / Keputusan */}
      {selectedAppeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-[#E5E1DA] w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-['Newsreader',serif] text-xl font-bold text-[#2D312C]">
                  {selectedAppeal.warning_id
                    ? `Banding Peringatan #${String(selectedAppeal.warning_id).padStart(4, "0")}`
                    : `Banding Pemulihan Akun`}
                </h3>
                <p className="text-xs text-[#6B6E6A]">
                  Hotel: <span className="font-semibold text-[#2D312C]">{selectedAppeal.hotel?.name}</span> • Requester: {selectedAppeal.requester?.name || selectedAppeal.requester?.email}
                </p>
              </div>
              {badge(selectedAppeal.status)}
            </div>

            {/* Target Surat Peringatan jika banding warning */}
            {selectedAppeal.warning && (
              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-xs space-y-1">
                <p className="font-bold text-amber-900">Surat Peringatan yang Dibantah:</p>
                <p className="font-semibold text-[#2D312C]">{selectedAppeal.warning.title}</p>
                <p className="text-[#6B6E6A] whitespace-pre-wrap">{selectedAppeal.warning.message}</p>
              </div>
            )}

            {/* Alasan Banding dari Mitra */}
            <div className="p-4 bg-[#fcf9f5] rounded-xl border border-[#E5E1DA] space-y-1.5 text-xs">
              <span className="font-semibold text-[#6B6E6A] block">Alasan &amp; Argumen Mitra Hotel:</span>
              <p className="text-[#2D312C] whitespace-pre-wrap leading-relaxed">{selectedAppeal.reason}</p>
            </div>

            {selectedAppeal.status === "pending" ? (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[#6B6E6A]">
                  Catatan Keputusan Super Admin (Opsional):
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  placeholder="Berikan pertimbangan atau catatan atas persetujuan/penolakan ini..."
                  className="w-full p-3 border border-[#E5E1DA] rounded-xl text-xs focus:outline-none focus:border-[#506147]"
                />
                <div className="flex justify-end gap-2 pt-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setSelectedAppeal(null)}
                    disabled={isDeciding}
                    className="px-4 py-2 border border-[#E5E1DA] rounded-xl text-xs font-semibold text-[#6B6E6A] hover:bg-[#F2EBE1]"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecision("rejected")}
                    disabled={isDeciding}
                    className="px-4 py-2 bg-[#ba1a1a] text-white rounded-xl text-xs font-semibold hover:bg-[#93000a] disabled:opacity-50 shadow-sm"
                  >
                    {isDeciding ? "Memproses..." : "Tolak Banding"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecision("approved")}
                    disabled={isDeciding}
                    className="px-5 py-2 bg-[#506147] text-white rounded-xl text-xs font-semibold hover:bg-[#3b4b33] disabled:opacity-50 shadow-sm"
                  >
                    {isDeciding
                      ? "Memproses..."
                      : selectedAppeal.warning_id
                      ? "Setujui & Batalkan Warning"
                      : "Setujui & Buka Blokir"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs pt-1">
                {selectedAppeal.admin_note && (
                  <div className="p-3 bg-white border border-[#E5E1DA] rounded-xl">
                    <span className="font-semibold text-[#6B6E6A] block mb-0.5">Catatan Super Admin:</span>
                    <p className="text-[#2D312C]">{selectedAppeal.admin_note}</p>
                  </div>
                )}
                <div className="flex justify-between items-center text-[11px] text-[#6B6E6A]/70">
                  <span>Diputus pada: {selectedAppeal.decided_at ? new Date(selectedAppeal.decided_at).toLocaleString("id-ID") : "-"}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedAppeal(null)}
                    className="px-5 py-2 bg-[#506147] text-white rounded-xl text-xs font-semibold"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
