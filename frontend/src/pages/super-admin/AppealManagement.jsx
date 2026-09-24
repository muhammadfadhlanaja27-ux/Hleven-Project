import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";

export default function AppealManagement() {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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
    } catch (e) {
      toast.error("Gagal memuat banding");
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
      toast.error(err.response?.data?.message || "Gagal memproses banding");
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-['Newsreader',serif] text-3xl font-semibold text-[#2D312C]">Manajemen Aju Banding</h2>
          <p className="text-sm text-[#6B6E6A] mt-1">Review permohonan banding dari hotel yang diblokir.</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-[#E5E1DA] rounded-xl text-sm bg-white font-medium"
        >
          <option value="">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Disetujui</option>
          <option value="rejected">Ditolak</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E1DA] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#F2EBE1] border-b border-[#E5E1DA] text-xs uppercase tracking-wider text-[#6B6E6A]">
                <th className="p-4">Hotel</th>
                <th className="p-4">Pemohon</th>
                <th className="p-4">Alasan</th>
                <th className="p-4">Tanggal</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E1DA]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-[#6B6E6A]">Memuat...</td>
                </tr>
              ) : appeals.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-[#6B6E6A]">Tidak ada data banding.</td>
                </tr>
              ) : (
                appeals.map((a) => (
                  <tr key={a.id} className="hover:bg-[#fcf9f5]">
                    <td className="p-4 font-semibold text-[#2D312C]">{a.hotel?.name || "-"}</td>
                    <td className="p-4 text-xs text-[#6B6E6A]">{a.requester?.name || a.requester?.email || "-"}</td>
                    <td className="p-4 text-xs max-w-xs truncate">{a.reason}</td>
                    <td className="p-4 text-xs whitespace-nowrap text-[#6B6E6A]">
                      {a.created_at ? new Date(a.created_at).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td className="p-4">{badge(a.status)}</td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedAppeal(a);
                          setAdminNote(a.admin_note || "");
                        }}
                        className="px-3 py-1.5 border border-[#506147] text-[#506147] hover:bg-[#506147] hover:text-white rounded-lg text-xs font-semibold"
                      >
                        {a.status === "pending" ? "Proses" : "Detail"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedAppeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-[#E5E1DA] w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-['Newsreader',serif] text-xl font-bold text-[#2D312C]">
                  Banding: {selectedAppeal.hotel?.name}
                </h3>
                <p className="text-xs text-[#6B6E6A]">Diajukan oleh {selectedAppeal.requester?.name || selectedAppeal.requester?.email}</p>
              </div>
              {badge(selectedAppeal.status)}
            </div>

            <div className="p-4 bg-[#fcf9f5] rounded-xl border border-[#E5E1DA] space-y-2 text-xs">
              <span className="font-semibold text-[#6B6E6A] block">Alasan Banding:</span>
              <p className="text-[#2D312C] whitespace-pre-wrap leading-relaxed">{selectedAppeal.reason}</p>
            </div>

            {selectedAppeal.status === "pending" ? (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[#6B6E6A]">Catatan Keputusan (Opsional):</label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  placeholder="Berikan alasan persetujuan atau penolakan..."
                  className="w-full p-3 border border-[#E5E1DA] rounded-xl text-xs focus:outline-none focus:border-[#506147]"
                />
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAppeal(null)}
                    disabled={isDeciding}
                    className="px-4 py-2 border border-[#E5E1DA] rounded-xl text-xs font-semibold text-[#6B6E6A]"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecision("rejected")}
                    disabled={isDeciding}
                    className="px-5 py-2 bg-[#ba1a1a] text-white rounded-xl text-xs font-semibold hover:bg-[#93000a] disabled:opacity-50"
                  >
                    {isDeciding ? "Memproses..." : "Tolak Banding"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecision("approved")}
                    disabled={isDeciding}
                    className="px-5 py-2 bg-[#506147] text-white rounded-xl text-xs font-semibold hover:bg-[#3b4b33] disabled:opacity-50"
                  >
                    {isDeciding ? "Memproses..." : "Setujui & Buka Blokir"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                {selectedAppeal.admin_note && (
                  <p className="text-[#6B6E6A]">Catatan: <span className="text-[#2D312C]">{selectedAppeal.admin_note}</span></p>
                )}
                <div className="flex justify-end pt-2">
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
