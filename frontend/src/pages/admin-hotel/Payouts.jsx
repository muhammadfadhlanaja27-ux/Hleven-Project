import React, { useState, useEffect } from "react";
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

export default function Payouts() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [balance, setBalance] = useState(null);
  const [bank, setBank] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [limits, setLimits] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/payouts");
      const data = res.data?.data || {};
      setBalance(data.balance || null);
      setBank(data.bank || null);
      setPayouts(data.payouts || []);
      setLimits(data.limits || null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal memuat data pencairan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const minPayout = limits?.min_payout || 0;
  const commissionRate = limits?.commission_rate ?? 0.05;
  const commissionPct = Math.round(commissionRate * 100);
  const netPct = 100 - commissionPct;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast.error("Masukkan nominal pencairan yang valid.");
      return;
    }
    if (minPayout > 0 && Number(amount) < minPayout) {
      toast.error(`Minimal pencairan ${rupiah(minPayout)}.`);
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/admin/payouts", { amount: Number(amount), note });
      toast.success("Pengajuan pencairan berhasil dikirim.");
      setAmount("");
      setNote("");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengajukan pencairan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadInvoice = async (id) => {
    try {
      const response = await api.get(`/admin/payouts/${id}/invoice`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice-Pencairan-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Invoice berhasil diunduh.");
    } catch (err) {
      toast.error("Gagal mengunduh invoice.");
    }
  };

  const bankReady = bank?.bank_name && bank?.bank_account_number;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="font-['Newsreader',serif] text-3xl font-semibold text-[#2D312C]">
          Saldo &amp; Pencairan
        </h1>
        <p className="text-sm text-[#6B6E6A] mt-1">
          Pendapatan bersih hotel setelah dipotong komisi platform {commissionPct}%.
        </p>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Saldo Tersedia", value: balance?.available_balance, highlight: true },
          { label: `Pendapatan Bersih (${netPct}%)`, value: balance?.net_revenue },
          { label: "Sudah Dicairkan", value: balance?.total_paid_out },
          { label: `Komisi Platform (${commissionPct}%)`, value: balance?.platform_commission },
        ].map((c) => (
          <div
            key={c.label}
            className={`rounded-xl border p-5 shadow-sm ${
              c.highlight ? "bg-[#506147] text-white border-[#506147]" : "bg-white border-[#E5E1DA] text-[#2D312C]"
            }`}
          >
            <p className={`text-xs font-semibold uppercase tracking-wider ${c.highlight ? "text-white/80" : "text-[#6B6E6A]"}`}>
              {c.label}
            </p>
            <p className="text-xl font-bold mt-2">{loading ? "..." : rupiah(c.value)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request form */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-[#E5E1DA] shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#2D312C] mb-4">Ajukan Pencairan</h2>

          {!bankReady && (
            <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
              Rekening bank belum lengkap. Isi di menu{" "}
              <a href="/admin/hotel" className="underline font-bold">Hotel Information</a> terlebih dahulu.
            </div>
          )}

          {bankReady && (
            <div className="mb-4 text-xs text-[#6B6E6A]">
              Tujuan: <strong>{bank.bank_name}</strong> — {bank.bank_account_number}
              {bank.bank_account_name ? ` (${bank.bank_account_name})` : ""}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#434842] uppercase tracking-wider">
                Nominal (Rp)
              </label>
              <input
                type="number"
                min={minPayout || 1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={submitting || !bankReady}
                placeholder="0"
                className="w-full p-3 bg-white border border-[#E5E0D8] rounded-lg text-sm focus:outline-none focus:border-[#506147] focus:ring-2 focus:ring-[#506147]/20 disabled:bg-gray-50"
              />
              {minPayout > 0 && (
                <span className="text-[11px] text-[#6B6E6A]">Minimal {rupiah(minPayout)}.</span>
              )}
              {balance && balance.available_balance >= minPayout && (
                <button
                  type="button"
                  onClick={() => setAmount(String(Math.floor(balance.available_balance)))}
                  disabled={submitting || !bankReady}
                  className="self-start text-[11px] text-[#506147] font-semibold hover:underline disabled:opacity-50"
                >
                  Cairkan semua ({rupiah(balance.available_balance)})
                </button>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#434842] uppercase tracking-wider">
                Catatan (opsional)
              </label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={submitting || !bankReady}
                className="w-full p-3 bg-white border border-[#E5E0D8] rounded-lg text-sm focus:outline-none focus:border-[#506147] focus:ring-2 focus:ring-[#506147]/20 disabled:bg-gray-50"
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !bankReady}
              className="w-full bg-[#506147] text-white text-sm font-semibold py-3 rounded-lg hover:bg-[#3b4b33] transition-all disabled:opacity-50"
            >
              {submitting ? "Mengirim..." : "Ajukan Pencairan"}
            </button>
          </form>
        </div>

        {/* History */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E1DA] shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#2D312C] mb-4">Riwayat Pencairan</h2>
          {loading ? (
            <p className="text-sm text-[#6B6E6A]">Memuat...</p>
          ) : payouts.length === 0 ? (
            <p className="text-sm text-[#6B6E6A]">Belum ada pengajuan pencairan.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-[#6B6E6A] border-b border-[#E5E1DA]">
                    <th className="py-2">Tanggal</th>
                    <th className="py-2">Nominal</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Catatan</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => (
                    <tr key={p.id} className="border-b border-[#F0EDE8]">
                      <td className="py-3 text-[#434842]">
                        {p.requested_at ? new Date(p.requested_at).toLocaleDateString("id-ID") : "-"}
                      </td>
                      <td className="py-3 font-semibold text-[#2D312C]">{rupiah(p.amount)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_CLASS[p.status] || "bg-gray-100 text-gray-700"}`}>
                          {STATUS_LABEL[p.status] || p.status}
                        </span>
                      </td>
                      <td className="py-3 text-[#6B6E6A]">
                        {p.admin_note || p.note || "-"}
                        {p.reference ? <span className="block text-[11px]">Ref: {p.reference}</span> : null}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDownloadInvoice(p.id)}
                          className="text-[#506147] text-xs font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[16px]">download</span>
                          Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
