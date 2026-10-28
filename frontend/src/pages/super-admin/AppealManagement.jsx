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
      toast.error("Gagal memuat data banding.");
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
      return <span className="px-sm py-xs rounded-full text-label-md font-semibold bg-surface-container text-on-surface-variant border border-outline-variant">Pending</span>;
    if (s === "approved")
      return <span className="px-sm py-xs rounded-full text-label-md font-semibold bg-secondary-container text-on-secondary-container border border-secondary-container">Disetujui</span>;
    return <span className="px-sm py-xs rounded-full text-label-md font-semibold bg-error-container text-on-error-container border border-error-container">Ditolak</span>;
  };

  return (
    <div className="space-y-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
        <div>
          <h2 className="font-headline-lg text-on-surface">Manajemen Aju Banding</h2>
          <p className="font-body-md text-on-surface-variant mt-xs">
            Review dan putuskan permohonan banding atas surat peringatan maupun pemulihan akun suspend hotel.
          </p>
        </div>
        <div className="flex items-center gap-sm">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-md py-sm border border-outline bg-surface rounded-md text-sm font-medium focus:outline-none focus:border-primary"
          >
            <option value="">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
          </select>
          <button
            onClick={fetchAppeals}
            className="px-sm py-sm border border-outline rounded-md bg-surface text-on-surface-variant hover:bg-surface-container text-xs font-semibold"
            title="Refresh Data"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-lg border border-outline-variant shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-body-md">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant text-label-lg uppercase tracking-wider text-on-surface-variant">
                <th className="p-md">Hotel</th>
                <th className="p-md">Tipe Banding</th>
                <th className="p-md">Pemohon</th>
                <th className="p-md">Alasan</th>
                <th className="p-md">Tanggal</th>
                <th className="p-md">Status</th>
                <th className="p-md text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-lg text-center text-on-surface-variant">Memuat data banding...</td>
                </tr>
              ) : appeals.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-lg text-center text-on-surface-variant">Tidak ada data permohonan banding.</td>
                </tr>
              ) : (
                appeals.map((a) => {
                  const isWarningAppeal = !!a.warning_id;
                  return (
                    <tr key={a.id} className="hover:bg-surface-container-low transition-colors h-[56px]">
                      <td className="p-md font-semibold text-on-surface">{a.hotel?.name || "-"}</td>
                      <td className="p-md">
                        {isWarningAppeal ? (
                          <div className="space-y-xs">
                            <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full text-label-md font-semibold bg-tertiary-container text-on-tertiary-container">
                              <span className="material-symbols-outlined text-[14px]">warning</span>
                              <span>Peringatan #{String(a.warning_id).padStart(4, "0")}</span>
                            </span>
                            {a.warning?.title && (
                              <p className="text-[11px] text-on-surface-variant truncate max-w-[180px]">{a.warning.title}</p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full text-label-md font-semibold bg-error-container text-on-error-container">
                            <span className="material-symbols-outlined text-[14px]">lock_reset</span>
                            <span>Pemulihan Akun</span>
                          </span>
                        )}
                      </td>
                      <td className="p-md text-sm text-on-surface-variant">{a.requester?.name || a.requester?.email || "-"}</td>
                      <td className="p-md text-sm max-w-xs truncate">{a.reason}</td>
                      <td className="p-md text-sm whitespace-nowrap text-on-surface-variant">
                        {a.created_at ? new Date(a.created_at).toLocaleDateString("id-ID") : "-"}
                      </td>
                      <td className="p-md">{badge(a.status)}</td>
                      <td className="p-md text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedAppeal(a);
                            setAdminNote(a.admin_note || "");
                          }}
                          className="px-md py-sm border border-primary text-primary hover:bg-primary hover:text-on-primary rounded-md text-xs font-semibold transition-colors"
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

        <div className="bg-surface-container-low border-t border-outline-variant px-md py-sm flex flex-col sm:flex-row items-center justify-between gap-sm text-xs text-on-surface-variant">
          <span>
            Menampilkan {totalItems > 0 ? (page - 1) * 10 + 1 : 0} hingga {Math.min(page * 10, totalItems)} dari {totalItems} banding
          </span>
          <div className="flex items-center gap-xs">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-sm py-xs border border-outline rounded-md bg-surface hover:bg-surface-container disabled:opacity-40 font-medium text-on-surface-variant"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
              <button
                key={pNum}
                onClick={() => setPage(pNum)}
                className={`px-sm py-xs border rounded-md font-medium transition-colors ${
                  page === pNum
                    ? "bg-primary text-on-primary border-primary"
                    : "bg-surface border-outline text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                {pNum}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages || totalPages === 0}
              className="px-sm py-xs border border-outline rounded-md bg-surface hover:bg-surface-container disabled:opacity-40 font-medium text-on-surface-variant"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedAppeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-on-surface/20 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-modal w-full max-w-lg p-lg space-y-md">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-headline-md text-on-surface">
                  {selectedAppeal.warning_id
                    ? `Banding Peringatan #${String(selectedAppeal.warning_id).padStart(4, "0")}`
                    : `Banding Pemulihan Akun`}
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Hotel: <span className="font-semibold text-on-surface">{selectedAppeal.hotel?.name}</span> • Pemohon: {selectedAppeal.requester?.name || selectedAppeal.requester?.email}
                </p>
              </div>
              {badge(selectedAppeal.status)}
            </div>

            {selectedAppeal.warning && (
              <div className="p-md bg-surface-container-low border border-outline-variant rounded-md text-xs space-y-xs">
                <p className="font-bold text-on-surface">Surat Peringatan yang Dibantah:</p>
                <p className="font-semibold text-on-surface">{selectedAppeal.warning.title}</p>
                <p className="text-on-surface-variant whitespace-pre-wrap">{selectedAppeal.warning.message}</p>
              </div>
            )}

            <div className="p-md bg-surface rounded-md border border-outline-variant space-y-sm text-xs">
              <span className="font-semibold text-on-surface-variant block">Alasan &amp; Argumen Mitra Hotel:</span>
              <p className="text-on-surface whitespace-pre-wrap leading-relaxed">{selectedAppeal.reason}</p>
            </div>

            {selectedAppeal.status === "pending" ? (
              <div className="space-y-sm">
                <label className="block text-xs font-semibold text-on-surface-variant">
                  Catatan Keputusan Super Admin (Opsional):
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  placeholder="Berikan pertimbangan atau catatan atas persetujuan/penolakan ini..."
                  className="w-full p-sm border border-outline bg-surface rounded-md text-xs focus:outline-none focus:border-primary"
                />
                <div className="flex justify-end gap-sm pt-xs flex-wrap">
                  <button
                    type="button"
                    onClick={() => setSelectedAppeal(null)}
                    disabled={isDeciding}
                    className="px-md py-sm border border-outline rounded-md text-xs font-semibold text-on-surface-variant hover:bg-surface-container"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecision("rejected")}
                    disabled={isDeciding}
                    className="px-md py-sm bg-error text-on-error rounded-md text-xs font-semibold disabled:opacity-50 shadow-sm"
                  >
                    {isDeciding ? "Memproses..." : "Tolak Banding"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecision("approved")}
                    disabled={isDeciding}
                    className="px-md py-sm bg-primary text-on-primary rounded-md text-xs font-semibold disabled:opacity-50 shadow-sm"
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
              <div className="space-y-sm text-xs pt-xs">
                {selectedAppeal.admin_note && (
                  <div className="p-md bg-surface border border-outline-variant rounded-md">
                    <span className="font-semibold text-on-surface-variant block mb-xs">Catatan Super Admin:</span>
                    <p className="text-on-surface">{selectedAppeal.admin_note}</p>
                  </div>
                )}
                <div className="flex justify-between items-center text-[11px] text-on-surface-variant">
                  <span>Diputus pada: {selectedAppeal.decided_at ? new Date(selectedAppeal.decided_at).toLocaleString("id-ID") : "-"}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedAppeal(null)}
                    className="px-md py-sm bg-primary text-on-primary rounded-md text-xs font-semibold"
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
