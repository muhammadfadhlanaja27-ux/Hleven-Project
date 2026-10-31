import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";

const STATUS_LABEL = {
  pending: "Pending",
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
      toast.error(err.response?.data?.message || "Failed to load payout list.");
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
      toast.success("Payout status updated successfully.");
      setModal(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 font-hanken">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-newsreader text-[32px] font-semibold text-[#4f604f] tracking-[-0.02em] leading-tight font-['Newsreader',serif]">
            Pencairan Dana
          </h2>
          <p className="font-hanken text-[14px] text-[#747872] mt-1">
            Kelola permintaan pencairan dana dari hotel mitra.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#747872] text-[20px] pointer-events-none">
              search
            </span>
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Cari hotel..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#E5E0D8] rounded-lg font-hanken text-[14px] text-[#191c1b] placeholder-[#747872] focus:outline-none focus:border-[#768875] focus:ring-2 focus:ring-[#768875]/20 transition-all shadow-sm"
            />
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-3.5 py-2 bg-white border border-[#E5E0D8] rounded-lg font-hanken text-[14px] text-[#191c1b] focus:outline-none focus:border-[#768875] focus:ring-2 focus:ring-[#768875]/20 transition-all shadow-sm cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Disetujui</option>
            <option value="paid">Ditransfer</option>
            <option value="rejected">Ditolak</option>
          </select>
        </div>
      </div>

      {/* Card Table */}
      <div className="bg-white rounded-lg shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8] overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-[#E5E0D8] border-t-[#768875] rounded-full animate-spin"></div>
            <p className="font-hanken text-[14px] text-[#747872]">Memuat data pencairan...</p>
          </div>
        ) : payouts.length === 0 ? (
          <p className="py-12 text-center text-[#747872] font-hanken text-[14px]">Belum ada data pencairan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F9F6F1] border-b border-[#E5E0D8] font-hanken text-[12px] font-semibold leading-[1] text-[#434842] uppercase tracking-[0.05em]">
                  <th className="py-4 px-6">Hotel</th>
                  <th className="py-4 px-6">Nominal</th>
                  <th className="py-4 px-6">Rekening</th>
                   <th className="py-4 px-6">Status</th>
                   <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="font-hanken text-[14px] text-[#191c1b] divide-y divide-[#E5E0D8]">
                {payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F9F6F1]/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-medium text-[#191c1b]">{p.hotel?.name || "-"}</div>
                      <div className="text-[12px] text-[#747872]">{p.requester?.email || "-"}</div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-[#191c1b]">{rupiah(p.amount)}</td>
                    <td className="py-4 px-6 text-[#434842]">
                      <div>{p.bank_name}</div>
                      <div className="text-[11px] text-[#747872]">{p.bank_account_number} — {p.bank_account_name}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-hanken text-[11px] font-semibold tracking-[0.05em] uppercase ${STATUS_CLASS[p.status] || "bg-gray-100 text-gray-700"}`}>
                        {STATUS_LABEL[p.status] || p.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-[#747872]">
                      {p.requested_at ? new Date(p.requested_at).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      {p.status === "pending" && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openModal(p, "approved")}
                            className="font-hanken text-[13px] font-semibold text-[#768875] border border-[#768875] px-3 py-1.5 rounded-lg hover:bg-[#768875]/5 active:scale-95"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => openModal(p, "rejected")}
                            className="font-hanken text-[13px] font-medium text-[#ba1a1a] border border-[#ffdad6] hover:bg-[#ffdad6]/40 px-3 py-1.5 rounded-lg active:scale-95"
                          >
                            Tolak
                          </button>
                        </div>
                      )}
                      {p.status === "approved" && (
                        <button
                          onClick={() => openModal(p, "paid")}
                          className="font-hanken text-[13px] font-semibold text-[#768875] border border-[#768875] px-3 py-1.5 rounded-lg hover:bg-[#768875]/5 active:scale-95"
                        >
                          Tandai Ditransfer
                        </button>
                      )}
                      {p.status === "paid" && <span className="text-[#747872] text-xs">{p.reference || "-"}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="bg-[#F9F6F1] border-t border-[#E5E0D8] p-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#747872] font-hanken">
          <span>{total} pengajuan total</span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 border border-[#E5E0D8] rounded-md bg-white hover:bg-[#F9F6F1] disabled:opacity-40 font-medium text-[#434842]"
            >
              Prev
            </button>
            <span className="font-medium text-[#191c1b] px-2">{page} / {lastPage}</span>
            <button
              disabled={page >= lastPage}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border border-[#E5E0D8] rounded-md bg-white hover:bg-[#F9F6F1] disabled:opacity-40 font-medium text-[#434842]"
            >
              Next
            </button>
          </div>
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
                 {submitting ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
