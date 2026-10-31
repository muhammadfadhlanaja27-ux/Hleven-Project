import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";

const PlatformPayoutManagement = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
  
  const [payoutForm, setPayoutForm] = useState({ amount: "", reference: "", admin_note: "" });
  const [settingForm, setSettingForm] = useState({ payout_day: 1, is_active: false, target_email: "" });

  const rupiah = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n || 0);

  const fetchData = async () => {
    try {
      const res = await api.get("/super-admin/platform-payouts");
      setData(res.data.data);
      setSettingForm(res.data.data.settings);
    } catch (e) {
       toast.error("Failed to load commission data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handlePayout = async (e) => {
    e.preventDefault();
    try {
      await api.post("/super-admin/platform-payouts", payoutForm);
      toast.success("Pencairan komisi berhasil dicatat.");
      setIsPayoutModalOpen(false);
      setPayoutForm({ amount: "", reference: "", admin_note: "" });
      fetchData();
    } catch (e) {
       toast.error(e.response?.data?.message || "Failed to disburse commission.");
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      await api.put("/super-admin/platform-payouts/settings", settingForm);
      toast.success("Pengaturan berhasil disimpan.");
      setIsSettingModalOpen(false);
      fetchData();
    } catch (e) {
       toast.error("Failed to save settings.");
    }
  };

  if (loading) return <div className="flex flex-col items-center justify-center py-20"><div className="w-10 h-10 border-4 border-[#E5E0D8] border-t-[#768875] rounded-full animate-spin"></div></div>;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 font-hanken">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-newsreader text-[32px] font-semibold text-[#4f604f] tracking-[-0.02em] leading-tight font-['Newsreader',serif]">
            Pencairan Komisi Platform
          </h2>
          <p className="font-hanken text-[14px] text-[#747872] mt-1">Kelola dan pantau pencairan komisi platform.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setIsSettingModalOpen(true)} className="px-4 py-2 border border-[#E5E0D8] rounded-lg bg-white text-[#434842] hover:bg-[#F9F6F1] font-semibold text-[13px]">Pengaturan</button>
          <button onClick={() => setIsPayoutModalOpen(true)} className="px-5 py-2 rounded-lg bg-[#768875] text-white font-semibold text-[13px] hover:bg-[#4f604f] transition-all">Cairkan Komisi</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8]">
           <p className="text-xs text-[#747872] font-semibold uppercase tracking-wider">Total Commission</p>
          <p className="font-newsreader text-[32px] font-semibold text-[#191c1b] mt-2 leading-none">{rupiah(data.summary.total_commission)}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8]">
          <p className="text-xs text-[#747872] font-semibold uppercase tracking-wider">Sudah Dicairkan</p>
          <p className="font-newsreader text-[32px] font-semibold text-[#4f604f] mt-2 leading-none">{rupiah(data.summary.paid_commission)}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8]">
          <p className="text-xs text-[#747872] font-semibold uppercase tracking-wider">Saldo Tersedia</p>
          <p className="font-newsreader text-[32px] font-semibold text-[#191c1b] mt-2 leading-none">{rupiah(data.summary.available_commission)}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9F6F1] border-b border-[#E5E0D8] font-hanken text-[12px] font-semibold leading-[1] text-[#434842] uppercase tracking-[0.05em]">
                 <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Jumlah</th>
                <th className="py-4 px-6">Referensi</th>
                <th className="py-4 px-6">Catatan</th>
              </tr>
            </thead>
            <tbody className="font-hanken text-[14px] text-[#191c1b] divide-y divide-[#E5E0D8]">
              {data.payouts.data.map(p => (
                <tr key={p.id} className="hover:bg-[#F9F6F1]/50 transition-colors">
                  <td className="py-4 px-6">{new Date(p.created_at).toLocaleDateString("id-ID")}</td>
                  <td className="py-4 px-6 font-semibold">{rupiah(p.amount)}</td>
                  <td className="py-4 px-6 text-[#434842]">{p.reference || "-"}</td>
                  <td className="py-4 px-6 text-[#747872]">{p.admin_note || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#2e3130]/40 backdrop-blur-sm" onClick={() => setIsPayoutModalOpen(false)}></div>
          <form onSubmit={handlePayout} className="relative w-full max-w-lg bg-white rounded-xl shadow-[0_12px_40px_rgba(47,50,49,0.12)] p-7 border border-[#E5E0D8] z-10 font-hanken space-y-4">
            <h3 className="font-newsreader text-[24px] font-semibold text-[#4f604f] pb-4 border-b border-[#E5E0D8]">Cairkan Komisi</h3>
            <input type="number" placeholder="Jumlah" className="w-full h-10 px-3.5 rounded-lg border border-[#E5E0D8] text-[13.5px]" value={payoutForm.amount} onChange={e => setPayoutForm({...payoutForm, amount: e.target.value})} required />
            <input type="text" placeholder="Referensi Transfer" className="w-full h-10 px-3.5 rounded-lg border border-[#E5E0D8] text-[13.5px]" value={payoutForm.reference} onChange={e => setPayoutForm({...payoutForm, reference: e.target.value})} />
            <textarea placeholder="Catatan" className="w-full p-3.5 rounded-lg border border-[#E5E0D8] text-[13.5px]" value={payoutForm.admin_note} onChange={e => setPayoutForm({...payoutForm, admin_note: e.target.value})} rows={3} />
            <div className="flex gap-3 pt-4 border-t border-[#E5E0D8]">
              <button type="button" onClick={() => setIsPayoutModalOpen(false)} className="px-4 py-2 border border-[#E5E0D8] rounded-lg text-[13px] font-semibold text-[#434842]">Batal</button>
              <button type="submit" className="px-5 py-2 bg-[#768875] text-white rounded-lg text-[13px] font-semibold">Cairkan</button>
            </div>
          </form>
        </div>
      )}

      {isSettingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#2e3130]/40 backdrop-blur-sm" onClick={() => setIsSettingModalOpen(false)}></div>
          <form onSubmit={handleUpdateSettings} className="relative w-full max-w-lg bg-white rounded-xl shadow-[0_12px_40px_rgba(47,50,49,0.12)] p-7 border border-[#E5E0D8] z-10 font-hanken space-y-4">
            <h3 className="font-newsreader text-[24px] font-semibold text-[#4f604f] pb-4 border-b border-[#E5E0D8]">Pengaturan Otomatis</h3>
            <label className="block text-xs font-semibold text-[#747872] uppercase">Payout Date (1-28)</label>
            <input type="number" className="w-full h-10 px-3.5 rounded-lg border border-[#E5E0D8] text-[13.5px]" value={settingForm.payout_day} onChange={e => setSettingForm({...settingForm, payout_day: e.target.value})} />
            <label className="flex items-center gap-2 text-[13px] text-[#191c1b]">
              <input type="checkbox" checked={settingForm.is_active} onChange={e => setSettingForm({...settingForm, is_active: e.target.checked})} className="accent-[#768875]" /> Aktifkan Otomatis
            </label>
            <div className="flex gap-3 pt-4 border-t border-[#E5E0D8]">
              <button type="button" onClick={() => setIsSettingModalOpen(false)} className="px-4 py-2 border border-[#E5E0D8] rounded-lg text-[13px] font-semibold text-[#434842]">Batal</button>
               <button type="submit" className="px-5 py-2 bg-[#768875] text-white rounded-lg text-[13px] font-semibold">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PlatformPayoutManagement;
