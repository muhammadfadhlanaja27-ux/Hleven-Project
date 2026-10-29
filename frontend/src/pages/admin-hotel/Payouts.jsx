import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";

const payoutChannels = [
  { code: "BANK", label: "BANK", type: "bank", numberLabel: "Nomor rekening" },
  { code: "GOPAY", label: "GOPAY", type: "e_wallet", numberLabel: "Nomor HP GoPay" },
  { code: "DANA", label: "DANA", type: "e_wallet", numberLabel: "Nomor HP DANA" },
  { code: "OVO", label: "OVO", type: "e_wallet", numberLabel: "Nomor HP OVO" },
  { code: "SHOPEEPAY", label: "SHOPEEPAY", type: "e_wallet", numberLabel: "Nomor HP ShopeePay" },
  { code: "LINKAJA", label: "LINKAJA", type: "e_wallet", numberLabel: "Nomor HP LinkAja" },
];

const STATUS_LABEL = { pending: "Menunggu", approved: "Disetujui", rejected: "Ditolak", paid: "Ditransfer" };
const STATUS_CLASS = {
  pending: "bg-[#FFF0E0] text-[#9B5235]",
  approved: "bg-[#E0F2FE] text-[#0369A1]",
  rejected: "bg-[#FFDAD6] text-[#93000A]",
  paid: "bg-[#E4EBE0] text-[#4A5D43]",
};

const rupiah = (v) => "Rp " + Number(v || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 });
const formatAmountInput = (value) => {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits).toLocaleString("id-ID") : "";
};
const parseAmountInput = (value) => Number(value.replace(/\D/g, "")) || 0;

export default function Payouts() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingDestination, setSavingDestination] = useState(false);
  const [balance, setBalance] = useState(null);
  const [bank, setBank] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [limits, setLimits] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [selectedDestinationId, setSelectedDestinationId] = useState("");
  const [editingDestination, setEditingDestination] = useState(null);
  const [destinationForm, setDestinationForm] = useState({ account_number: "", account_name: "" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/payouts");
      const data = res.data?.data || {};
      const list = Array.isArray(data.destinations) ? data.destinations : [];
      setBalance(data.balance || null);
      setBank(data.bank || null);
      setPayouts(data.payouts || []);
      setLimits(data.limits || null);
      setDestinations(list);
      if (list.length && !selectedDestinationId) setSelectedDestinationId(String(list[0].id));
    } catch (err) {
      toast.error("Gagal memuat data keuangan.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveDestination = async (e) => {
    e.preventDefault();
    setSavingDestination(true);
    try {
      const payload = { type: editingDestination.type, channel_code: editingDestination.code, ...destinationForm };
      if (editingDestination.id) await api.put(`/admin/wallet/destinations/${editingDestination.id}`, payload);
      else await api.post("/admin/wallet/destinations", payload);
      toast.success("Tujuan pencairan disimpan.");
      setEditingDestination(null);
      fetchData();
    } catch (err) {
      toast.error("Gagal menyimpan tujuan.");
    } finally { setSavingDestination(false); }
  };

  const handleDeleteDestination = async (id) => {
    if (!confirm("Hapus tujuan ini?")) return;
    try {
      await api.delete(`/admin/wallet/destinations/${id}`);
      toast.success("Tujuan dihapus.");
      fetchData();
    } catch (err) { toast.error("Gagal menghapus."); }
  };

  const handlePayoutSubmit = async (e) => {
    e.preventDefault();
    const num = parseAmountInput(amount);
    if (!num || num < (limits?.min_payout || 0)) {
      toast.error(`Minimal pencairan ${rupiah(limits?.min_payout)}`);
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/admin/payouts", { amount: num, note, destination_id: selectedDestinationId });
      toast.success("Pengajuan berhasil dikirim.");
      setAmount(""); setNote("");
      fetchData();
    } catch (err) {
      toast.error("Gagal mengajukan pencairan.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-sm text-[#6B6E6A]">Memuat data...</div>;

  return (
    <div className="min-h-screen bg-[#fcf9f5] text-[#1c1c1a] font-['Hanken_Grotesk',sans-serif] p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h2 className="font-['Newsreader',serif] text-3xl sm:text-4xl font-semibold text-[#2D312C] tracking-tight">
            Saldo & Pencairan
          </h2>
          <p className="text-base text-[#6B6E6A] mt-1">Kelola pendapatan hotel dan tarik saldo ke rekening Anda.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#506147] rounded-2xl p-6 shadow-md text-white">
            <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">Saldo Tersedia</p>
            <p className="font-['Newsreader',serif] text-3xl font-bold mt-2">{rupiah(balance?.available_balance)}</p>
          </div>
          <div className="bg-white border border-[#E5E1DA] rounded-2xl p-6 shadow-sm">
            <p className="text-[11px] font-bold text-[#6B6E6A] uppercase tracking-wider">Total Pendapatan</p>
            <p className="font-['Newsreader',serif] text-2xl font-bold text-[#2D312C] mt-2">{rupiah(balance?.net_revenue)}</p>
          </div>
          <div className="bg-white border border-[#E5E1DA] rounded-2xl p-6 shadow-sm">
            <p className="text-[11px] font-bold text-[#6B6E6A] uppercase tracking-wider">Sudah Dicairkan</p>
            <p className="font-['Newsreader',serif] text-2xl font-bold text-[#2D312C] mt-2">{rupiah(balance?.total_paid_out)}</p>
          </div>
          <div className="bg-[#F2EBE1] border border-[#E5E1DA] rounded-2xl p-6 shadow-sm">
            <p className="text-[11px] font-bold text-[#7A5C3C] uppercase tracking-wider">Komisi Platform</p>
            <p className="font-['Newsreader',serif] text-2xl font-bold text-[#7A5C3C] mt-2">{rupiah(balance?.platform_commission)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form & Destination */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-[#E5E1DA] p-6 shadow-sm">
              <h3 className="font-bold text-[#2D312C] mb-4">Ajukan Pencairan</h3>
              <form onSubmit={handlePayoutSubmit} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-[#6B6E6A] uppercase block mb-1.5">Nominal (Rp)</label>
                  <input type="text" value={amount} onChange={(e) => setAmount(formatAmountInput(e.target.value))} placeholder="0" className="w-full h-11 px-4 rounded-xl border border-[#E5E1DA] font-bold text-[#2D312C] outline-none focus:border-[#506147]" />
                  <p className="text-[10px] text-[#6B6E6A] mt-1">Minimal pencairan {rupiah(limits?.min_payout)}</p>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#6B6E6A] uppercase block mb-1.5">Tujuan Pencairan</label>
                  <select value={selectedDestinationId} onChange={(e) => setSelectedDestinationId(e.target.value)} className="w-full h-11 px-3 rounded-xl border border-[#E5E1DA] text-sm font-semibold outline-none focus:border-[#506147]">
                    {destinations.map(d => (
                      <option key={d.id} value={d.id}>{d.channel_code} - {d.account_name}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="w-full h-12 bg-[#506147] text-white rounded-xl font-bold hover:bg-[#3b4b33] transition-all shadow-md active:scale-[0.98]">Cairkan Sekarang</button>
              </form>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E1DA] p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-[#2D312C]">Rekening Tujuan</h3>
                <button onClick={() => setEditingDestination({ ...payoutChannels[0], isNew: true })} className="text-[11px] font-bold text-[#506147] hover:underline uppercase">+ Tambah</button>
              </div>
              <div className="space-y-3">
                {destinations.map(d => (
                  <div key={d.id} className="p-3 bg-[#fcf9f5] border border-[#E5E1DA] rounded-xl flex justify-between items-center group">
                    <div>
                      <p className="text-xs font-bold text-[#2D312C]">{d.channel_code}</p>
                      <p className="text-[11px] text-[#6B6E6A]">{d.account_name} • {d.masked_account_number}</p>
                    </div>
                    <button onClick={() => handleDeleteDestination(d.id)} className="opacity-0 group-hover:opacity-100 text-[#BA1A1A] transition-all"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* History */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E1DA] overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-[#E5E1DA] bg-[#F9F6F1]">
              <h3 className="font-bold text-[#757870] uppercase text-xs tracking-wider">Riwayat Pencairan</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="border-b border-[#E5E1DA] bg-[#FBFBFA]">
                  <tr>
                    {["Tanggal", "Nominal", "Status", "Tujuan"].map(h => (
                      <th key={h} className="px-6 py-3 text-[11px] font-bold text-[#6B6E6A] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EDE9]">
                  {payouts.map(p => (
                    <tr key={p.id} className="hover:bg-[#A8BBA2]/5 transition-colors">
                      <td className="px-6 py-4 text-xs text-[#6B6E6A]">{new Date(p.requested_at).toLocaleDateString("id-ID")}</td>
                      <td className="px-6 py-4 text-sm font-bold text-[#2D312C]">{rupiah(p.amount)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_CLASS[p.status]}`}>
                          {STATUS_LABEL[p.status] || p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-[#6B6E6A]">{p.bank_name || p.destination_name}</td>
                    </tr>
                  ))}
                  {payouts.length === 0 && <tr><td colSpan="4" className="py-12 text-center text-sm text-[#6B6E6A]">Belum ada riwayat pencairan.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Destination Modal */}
      {editingDestination && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#2D312C]/40 backdrop-blur-sm" onClick={() => setEditingDestination(null)}></div>
          <form onSubmit={handleSaveDestination} className="relative bg-white rounded-2xl shadow-2xl border border-[#E5E1DA] max-w-sm w-full z-10 p-6 space-y-4">
            <h3 className="font-['Newsreader',serif] text-2xl font-semibold text-[#2D312C]">Tujuan Pencairan</h3>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#6B6E6A] uppercase block">Pilih Layanan</label>
              <select onChange={(e) => setEditingDestination({ ...payoutChannels.find(c => c.code === e.target.value), isNew: true })} className="w-full h-10 px-3 rounded-lg border border-[#E5E1DA] text-sm outline-none">
                {payoutChannels.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#6B6E6A] uppercase block">Nomor Akun / Rekening</label>
              <input type="text" required value={destinationForm.account_number} onChange={e => setDestinationForm({ ...destinationForm, account_number: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-[#E5E1DA] text-sm outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#6B6E6A] uppercase block">Nama Pemilik Akun</label>
              <input type="text" required value={destinationForm.account_name} onChange={e => setDestinationForm({ ...destinationForm, account_name: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-[#E5E1DA] text-sm outline-none" />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setEditingDestination(null)} className="flex-1 h-10 border border-[#E5E1DA] rounded-lg text-xs font-bold">Batal</button>
              <button type="submit" disabled={savingDestination} className="flex-1 h-10 bg-[#506147] text-white rounded-lg text-xs font-bold shadow-md">{savingDestination ? "..." : "Simpan"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
