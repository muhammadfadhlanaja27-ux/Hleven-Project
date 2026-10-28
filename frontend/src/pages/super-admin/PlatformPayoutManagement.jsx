import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";

const PlatformPayoutManagement = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
  
  // Form states
  const [payoutForm, setPayoutForm] = useState({ amount: "", reference: "", admin_note: "" });
  const [settingForm, setSettingForm] = useState({ payout_day: 1, is_active: false, target_email: "" });

  const fetchData = async () => {
    try {
      const res = await api.get("/super-admin/platform-payouts");
      setData(res.data.data);
      setSettingForm(res.data.data.settings);
    } catch (e) {
      toast.error("Gagal memuat data komisi.");
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
      toast.error(e.response?.data?.message || "Gagal mencairkan komisi.");
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
      toast.error("Gagal menyimpan pengaturan.");
    }
  };

  if (loading) return <p className="p-6">Memuat...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Pencairan Komisi Platform</h2>
        <div className="space-x-2">
          <button onClick={() => setIsSettingModalOpen(true)} className="px-4 py-2 bg-gray-200 rounded">Pengaturan</button>
          <button onClick={() => setIsPayoutModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded">Cairkan Komisi</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white shadow rounded-lg border">
          <p className="text-gray-500">Total Komisi</p>
          <p className="text-2xl font-bold">Rp{data.summary.total_commission.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-white shadow rounded-lg border">
          <p className="text-gray-500">Sudah Dicairkan</p>
          <p className="text-2xl font-bold text-green-600">Rp{data.summary.paid_commission.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-white shadow rounded-lg border">
          <p className="text-gray-500">Saldo Tersedia</p>
          <p className="text-2xl font-bold text-blue-600">Rp{data.summary.available_commission.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Tanggal</th>
              <th className="p-3">Jumlah</th>
              <th className="p-3">Referensi</th>
              <th className="p-3">Catatan</th>
            </tr>
          </thead>
          <tbody>
            {data.payouts.data.map(p => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{new Date(p.created_at).toLocaleDateString()}</td>
                <td className="p-3">Rp{p.amount.toLocaleString()}</td>
                <td className="p-3">{p.reference || "-"}</td>
                <td className="p-3">{p.admin_note || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payout Modal */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <form onSubmit={handlePayout} className="bg-white p-6 rounded-lg w-full max-w-sm">
            <h3 className="font-bold mb-4">Cairkan Komisi</h3>
            <input type="number" placeholder="Jumlah" className="w-full p-2 border rounded mb-2" value={payoutForm.amount} onChange={e => setPayoutForm({...payoutForm, amount: e.target.value})} />
            <input type="text" placeholder="Referensi Transfer" className="w-full p-2 border rounded mb-2" value={payoutForm.reference} onChange={e => setPayoutForm({...payoutForm, reference: e.target.value})} />
            <textarea placeholder="Catatan" className="w-full p-2 border rounded mb-4" value={payoutForm.admin_note} onChange={e => setPayoutForm({...payoutForm, admin_note: e.target.value})} />
            <div className="flex gap-2">
              <button type="button" onClick={() => setIsPayoutModalOpen(false)} className="flex-1 p-2 bg-gray-200 rounded">Batal</button>
              <button type="submit" className="flex-1 p-2 bg-blue-600 text-white rounded">Cairkan</button>
            </div>
          </form>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <form onSubmit={handleUpdateSettings} className="bg-white p-6 rounded-lg w-full max-w-sm">
            <h3 className="font-bold mb-4">Pengaturan Otomatis</h3>
            <label className="block mb-2">Tanggal Pencairan (1-28)</label>
            <input type="number" className="w-full p-2 border rounded mb-2" value={settingForm.payout_day} onChange={e => setSettingForm({...settingForm, payout_day: e.target.value})} />
            <label className="flex items-center gap-2 mb-4">
              <input type="checkbox" checked={settingForm.is_active} onChange={e => setSettingForm({...settingForm, is_active: e.target.checked})} /> Aktifkan Otomatis
            </label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setIsSettingModalOpen(false)} className="flex-1 p-2 bg-gray-200 rounded">Batal</button>
              <button type="submit" className="flex-1 p-2 bg-blue-600 text-white rounded">Simpan</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PlatformPayoutManagement;
