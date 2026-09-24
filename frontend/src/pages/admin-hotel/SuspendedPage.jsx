import React, { useState, useEffect } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function SuspendedPage() {
  const [reason, setReason] = useState("");
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchAppeals = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/appeals");
      const pag = res.data?.data;
      const list = Array.isArray(pag?.data) ? pag.data : Array.isArray(pag) ? pag : [];
      setAppeals(list);
    } catch (e) {
      setAppeals([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAppeals(); }, []);

  const hasPending = appeals.some((a) => a.status === "pending");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 10) {
      toast.error("Alasan minimal 10 karakter");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/admin/appeals", { reason: reason.trim() });
      toast.success("Banding berhasil diajukan");
      setReason("");
      fetchAppeals();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengajukan banding");
    } finally { setSubmitting(false); }
  };

  const badge = (s) => {
    if (s === "pending") return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E0F2FE] text-[#0369A1] border border-[#0369A1]/20">Pending</span>;
    if (s === "approved") return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E4EBE0] text-[#4A5D43] border border-[#4A5D43]/20">Disetujui</span>;
    return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ffdad6] text-[#ba1a1a] border border-[#ba1a1a]/20">Ditolak</span>;
  };

  return (
    <div className="min-h-screen bg-[#fcf9f5] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6">
        <div className="bg-[#ffdad6] border border-[#ba1a1a]/30 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="w-12 h-12 rounded-full bg-[#ba1a1a] text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">block</span>
            </span>
            <div>
              <h1 className="font-['Newsreader',serif] text-2xl font-bold text-[#93000a]">Hotel Anda Diblokir</h1>
              <p className="text-sm text-[#434842] mt-1 leading-relaxed">
                Hotel diblokir otomatis setelah menerima <strong>2 peringatan</strong> dari Super Admin. Akses dashboard, manajemen kamar, booking, dan laporan <strong>terkunci</strong> sampai banding disetujui. Silakan ajukan banding di bawah.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E5E1DA] rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-[#2D312C] mb-1">Aju Banding</h2>
          <p className="text-xs text-[#6B6E6A] mb-4">Tuliskan alasan banding. Jika ditolak, Anda boleh mengajukan banding ulang.</p>
          {hasPending ? (
            <div className="bg-[#E0F2FE] border border-[#0369A1]/20 rounded-xl p-4 text-sm text-[#0369A1]">
              Banding pending sedang diproses Super Admin. Tunggu keputusan sebelum mengajukan lagi.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                maxLength={2000}
                placeholder="Jelaskan alasan banding dan perbaikan yang akan dilakukan..."
                className="w-full p-3 border border-[#E5E1DA] rounded-xl text-sm focus:outline-none focus:border-[#506147] focus:ring-2 focus:ring-[#506147]/20"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#6B6E6A]">{reason.length}/2000</span>
                <button
                  type="submit"
                  disabled={submitting || !reason.trim()}
                  className="px-6 py-2.5 bg-[#506147] text-white rounded-xl text-sm font-semibold hover:bg-[#3b4b33] disabled:opacity-50 transition-colors"
                >
                  {submitting ? "Mengirim..." : "Kirim Banding"}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="bg-white border border-[#E5E1DA] rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-[#2D312C] mb-3">Riwayat Banding</h3>
          {loading ? (
            <p className="text-sm text-[#6B6E6A]">Memuat...</p>
          ) : appeals.length === 0 ? (
            <p className="text-sm text-[#6B6E6A]">Belum ada banding.</p>
          ) : (
            <div className="space-y-3">
              {appeals.map((a) => (
                <div key={a.id} className="border border-[#E5E1DA] rounded-xl p-4 bg-[#fcf9f5]">
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-sm text-[#2D312C] whitespace-pre-wrap flex-1">{a.reason}</p>
                    {badge(a.status)}
                  </div>
                  {a.admin_note && <p className="text-xs text-[#6B6E6A] mt-2">Catatan Super Admin: <span className="text-[#2D312C]">{a.admin_note}</span></p>}
                  <p className="text-[11px] text-[#6B6E6A]/70 mt-1">{a.created_at ? new Date(a.created_at).toLocaleString("id-ID") : ""}{a.decided_at ? ` • Diputus ${new Date(a.decided_at).toLocaleString("id-ID")}` : ""}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
