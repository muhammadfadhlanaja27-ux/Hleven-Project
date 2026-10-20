import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import WarningList from "../../components/admin-hotel/WarningList";

export default function SuspendedPage() {
  const navigate = useNavigate();
  const [reason, setReason] = useState("");
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hotelStatus, setHotelStatus] = useState("blocked");
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Cek status hotel dari server
  const checkHotelStatus = useCallback(async () => {
    try {
      const res = await api.get("/admin/hotel/profile");
      const status = res.data?.data?.status;
      if (status) {
        setHotelStatus(status);
        if (status === "active") {
          try {
            const u = JSON.parse(localStorage.getItem("user") || "{}");
            u.hotel_status = "active";
            if (u.hotel) u.hotel.status = "active";
            localStorage.setItem("user", JSON.stringify(u));
          } catch (_) {}
        }
      }
    } catch (_) {} finally {
      setCheckingStatus(false);
    }
  }, []);

  const fetchAppeals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/appeals");
      const pag = res.data?.data;
      const list = Array.isArray(pag?.data) ? pag.data : Array.isArray(pag) ? pag : [];
      setAppeals(list);
    } catch (e) {
      setAppeals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHotelStatus();
    fetchAppeals();
  }, [checkHotelStatus, fetchAppeals]);

  const hasPendingSuspend = appeals.some((a) => !a.warning_id && a.status === "pending");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 10) {
      toast.error("Alasan banding minimal 10 karakter");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/admin/appeals", { reason: reason.trim() });
      toast.success("Banding pemulihan akun berhasil diajukan ke Super Admin");
      setReason("");
      fetchAppeals();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengajukan banding");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/admin/login");
  };

  const badge = (s) => {
    if (s === "pending") return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E0F2FE] text-[#0369A1] border border-[#0369A1]/20">Pending</span>;
    if (s === "approved") return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E4EBE0] text-[#4A5D43] border border-[#4A5D43]/20">Disetujui</span>;
    return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ffdad6] text-[#ba1a1a] border border-[#ba1a1a]/20">Ditolak</span>;
  };

  return (
    <div className="min-h-screen bg-[#fcf9f5] flex flex-col items-center justify-start p-6 font-['Hanken_Grotesk',sans-serif]">
      {/* Top Header Bar */}
      <div className="w-full max-w-3xl flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="font-['Newsreader',serif] text-xl font-bold text-[#2D312C]">H&apos;Leven Admin</span>
          <span className="text-xs px-2 py-0.5 rounded bg-[#ffdad6] text-[#93000a] font-semibold uppercase">Status Blokir</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">logout</span>
          <span>Logout</span>
        </button>
      </div>

      <div className="w-full max-w-3xl space-y-6">
        {/* Banner Pemulihan jika Hotel Sudah Aktif */}
        {hotelStatus === "active" ? (
          <div className="bg-[#E4EBE0] border border-[#4A5D43]/30 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="w-12 h-12 rounded-full bg-[#4A5D43] text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">check_circle</span>
              </span>
              <div>
                <h2 className="font-['Newsreader',serif] text-xl font-bold text-[#2D312C]">Hotel Telah Aktif Kembali!</h2>
                <p className="text-xs text-[#434842] mt-1">
                  Permohonan banding Anda telah disetujui oleh Super Admin. Akses dashboard Anda kini telah dipulihkan.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="shrink-0 px-5 py-2.5 bg-[#506147] text-white rounded-xl text-xs font-bold hover:bg-[#3b4b33] transition-colors shadow-sm"
            >
              Masuk Dashboard
            </button>
          </div>
        ) : (
          <div className="bg-[#ffdad6] border border-[#ba1a1a]/30 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="w-12 h-12 rounded-full bg-[#ba1a1a] text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">block</span>
              </span>
              <div>
                <h1 className="font-['Newsreader',serif] text-2xl font-bold text-[#93000a]">Hotel Anda Diblokir Sementara</h1>
                <p className="text-xs text-[#434842] mt-1 leading-relaxed">
                  Hotel diblokir otomatis setelah menerima akumulasi <strong>2 peringatan kepatuhan</strong> dari Super Admin. Akses dashboard operasional, manajemen kamar, dan booking saat ini <strong>terkunci</strong> sampai banding disetujui.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Daftar Peringatan yang Memicu Blokir */}
        <div className="bg-white border border-[#E5E1DA] rounded-2xl p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="font-semibold text-sm text-[#2D312C]">Surat Peringatan Terkait</h2>
            <p className="text-xs text-[#6B6E6A] mt-0.5">
              Tinjau surat peringatan di bawah ini. Anda dapat membuka detail untuk menandai telah dibaca atau mengajukan banding atas poin peringatan tertentu.
            </p>
          </div>
          <WarningList />
        </div>

        {/* Form Banding Pemulihan Akun (hanya jika masih blocked) */}
        {hotelStatus === "blocked" && (
          <div className="bg-white border border-[#E5E1DA] rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-sm text-[#2D312C] mb-1">Aju Banding Pemulihan Akun</h2>
            <p className="text-xs text-[#6B6E6A] mb-4">
              Tuliskan alasan permohonan pembukaan blokir hotel dan rencana mitigasi perbaikan ke depan.
            </p>
            {hasPendingSuspend ? (
              <div className="bg-[#E0F2FE] border border-[#0369A1]/20 rounded-xl p-4 text-xs text-[#0369A1] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">hourglass_top</span>
                <span>Banding pemulihan akun sedang ditinjau oleh Super Admin. Harap tunggu keputusan.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  maxLength={2000}
                  placeholder="Jelaskan alasan banding pemulihan akun dan komitmen kepatuhan hotel Anda..."
                  className="w-full p-3 border border-[#E5E1DA] rounded-xl text-xs focus:outline-none focus:border-[#506147] focus:ring-1 focus:ring-[#506147]"
                />
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-[#6B6E6A]">{reason.length}/2000 karakter</span>
                  <button
                    type="submit"
                    disabled={submitting || !reason.trim()}
                    className="px-5 py-2 bg-[#506147] text-white rounded-xl text-xs font-semibold hover:bg-[#3b4b33] disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {submitting ? "Mengirim..." : "Kirim Banding Pemulihan"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Riwayat Banding */}
        <div className="bg-white border border-[#E5E1DA] rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-sm text-[#2D312C] mb-3">Riwayat Pengajuan Banding</h3>
          {loading ? (
            <p className="text-xs text-[#6B6E6A]">Memuat riwayat...</p>
          ) : appeals.length === 0 ? (
            <p className="text-xs text-[#6B6E6A]">Belum ada riwayat pengajuan banding.</p>
          ) : (
            <div className="space-y-3">
              {appeals.map((a) => (
                <div key={a.id} className="border border-[#E5E1DA] rounded-xl p-4 bg-[#fcf9f5] space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#2D312C]">
                          {a.warning_id ? `Banding Peringatan #WRN-${String(a.warning_id).padStart(4, "0")}` : "Banding Pemulihan Akun"}
                        </span>
                        {a.warning?.title && (
                          <span className="text-[11px] text-[#6B6E6A]">({a.warning.title})</span>
                        )}
                      </div>
                      <p className="text-xs text-[#434842] mt-1 whitespace-pre-wrap">{a.reason}</p>
                    </div>
                    {badge(a.status)}
                  </div>
                  {a.admin_note && (
                    <div className="p-2.5 bg-white border border-[#E5E1DA] rounded-lg text-xs text-[#6B6E6A]">
                      Catatan Super Admin: <span className="text-[#2D312C] font-medium">{a.admin_note}</span>
                    </div>
                  )}
                  <p className="text-[10px] text-[#6B6E6A]/70">
                    Diajukan: {a.created_at ? new Date(a.created_at).toLocaleString("id-ID") : "-"}
                    {a.decided_at ? ` • Diputus: ${new Date(a.decided_at).toLocaleString("id-ID")}` : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
