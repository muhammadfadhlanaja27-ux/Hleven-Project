import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";

const STATUS_LABEL = {
  pending: "Menunggu",
  approved: "Disetujui",
  rejected: "Ditolak",
  paid: "Ditransfer",
};

const STATUS_CLASS = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
  paid: "bg-emerald-100 text-emerald-700",
};

const rupiah = (v) => "Rp " + Number(v || 0).toLocaleString("id-ID");

export default function PayoutManagement() {
  const [loading, setLoading] = useState(true);
  const [payouts, setPayouts] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/super-admin/payouts", {
        params: { page, status: status || undefined, search: search || undefined },
      });
      const paginator = res.data?.data || {};
      setPayouts(paginator.data || []);
      setLastPage(paginator.last_page || 1);
      setTotal(paginator.total || 0);
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal memuat daftar pencairan.");
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openModal = (payout, action) => {
    setModal({ payout, action, admin_note: "", reference: "" });
  };

  const handleAction = async () => {
    if (!modal) return;
    setSubmitting(true);
    try {
      await api.patch(`/super-admin/payouts/${modal.payout.id}/status`, {
        status: modal.action,
        admin_note: modal.admin_note || undefined,
        reference: modal.reference || undefined,
      });
      toast.success("Status pencairan berhasil diperbarui.");
      setModal(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal memperbarui status.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-['Newsreader',serif] text-3xl font-semibold text-[#2D312C]">
            Pencairan Dana
          </h1>
          <p className="text-sm text-[#6B6E6A] mt-1">Kelola permintaan pencairan dana dari hotel mitra.</p>
        </div>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari hotel..."
            className="px-3 py-2 border border-[#E5E0D8] rounded-lg text-sm focus:outline-none focus:border-[#506147]"
          />
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-[#E5E0D8] rounded-lg text-sm focus:outline-none focus:border-[#506147]"
          >
            <option value="">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="approved">Disetujui</option>
            <option value="paid">Ditransfer</option>
            <option value="rejected">Ditolak</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E1DA] shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-[#6B6E6A]">Memuat...</p>
        ) : payouts.length === 0 ? (
          <p className="p-6 text-sm text-[#6B6E6A]">Belum ada data pencairan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-[#6B6E6A] bg-[#F6F3EF]">
                  <th className="px-4 py-3">Hotel</th>
                  <th className="px-4 py-3">Nominal</th>
                  <th className="px-4 py-3">Rekening</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id} className="border-t border-[#F0EDE8]">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[#2D312C]">{p.hotel?.name || "-"}</div>
                      <div className="text-[11px] text-[#6B6E6A]">{p.requester?.email || "-"}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#2D312C]">{rupiah(p.amount)}</td>
                    <td className="px-4 py-3 text-[#434842]">
                      <div>{p.bank_name}</div>
                      <div className="text-[11px] text-[#6B6E6A]">{p.bank_account_number} — {p.bank_account_name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_CLASS[p.status] || "bg-gray-100 text-gray-700"}`}>
                        {STATUS_LABEL[p.status] || p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#6B6E6A]">
                      {p.requested_at ? new Date(p.requested_at).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {p.status === "pending" && (
                        <>
                          <button onClick={() => openModal(p, "approved")} className="text-blue-700 text-xs font-semibold hover:underline mr-3">
                            Setujui
                          </button>
                          <button onClick={() => openModal(p, "rejected")} className="text-red-700 text-xs font-semibold hover:underline">
                            Tolak
                          </button>
                        </>
                      )}
                      {p.status === "approved" && (
                        <button onClick={() => openModal(p, "paid")} className="text-emerald-700 text-xs font-semibold hover:underline">
                          Tandai Ditransfer
                        </button>
                      )}
                      {p.status === "paid" && <span className="text-[#6B6E6A] text-xs">{p.reference || "-"}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-[#6B6E6A]">
        <span>{total} pengajuan</span>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 border border-[#E5E0D8] rounded-lg disabled:opacity-40"
          >
            Sebelumnya
          </button>
          <span>{page} / {lastPage}</span>
          <button
            disabled={page >= lastPage}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 border border-[#E5E0D8] rounded-lg disabled:opacity-40"
          >
            Berikutnya
          </button>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-[#2D312C] mb-1">
              {modal.action === "approved" ? "Setujui Pencairan" : modal.action === "rejected" ? "Tolak Pencairan" : "Tandai Ditransfer"}
            </h3>
            <p className="text-sm text-[#6B6E6A] mb-4">
              {modal.payout.hotel?.name} — {rupiah(modal.payout.amount)}
            </p>
            <div className="space-y-4">
              {modal.action === "paid" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#434842] uppercase tracking-wider">No. Referensi Transfer</label>
                  <input
                    value={modal.reference}
                    onChange={(e) => setModal({ ...modal, reference: e.target.value })}
                    className="w-full p-3 border border-[#E5E0D8] rounded-lg text-sm focus:outline-none focus:border-[#506147]"
                  />
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#434842] uppercase tracking-wider">
                  {modal.action === "rejected" ? "Alasan Penolakan" : "Catatan (opsional)"}
                </label>
                <textarea
                  rows={3}
                  value={modal.admin_note}
                  onChange={(e) => setModal({ ...modal, admin_note: e.target.value })}
                  className="w-full p-3 border border-[#E5E0D8] rounded-lg text-sm focus:outline-none focus:border-[#506147]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setModal(null)} disabled={submitting} className="px-4 py-2 text-sm rounded-lg border border-[#E5E0D8] text-[#434842]">
                Batal
              </button>
              <button
                onClick={handleAction}
                disabled={submitting}
                className="px-4 py-2 text-sm rounded-lg bg-[#506147] text-white font-semibold hover:bg-[#3b4b33] disabled:opacity-50"
              >
                {submitting ? "Menyimpan..." : "Konfirmasi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
