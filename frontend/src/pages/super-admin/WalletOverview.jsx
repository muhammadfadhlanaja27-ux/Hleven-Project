import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";

const rupiah = (value) =>
  `Rp ${Number(value || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;

export default function WalletOverview() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/super-admin/wallet")
      .then((response) => setWallet(response.data.data))
       .catch((error) => toast.error(error.response?.data?.message || "Failed to load commission summary."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-stone-500">Memuat laporan saldo...</div>;
   if (!wallet) return <div className="p-8 text-stone-500">Wallet data not available.</div>;

  const withdrawals = wallet.withdrawals?.data || [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 font-hanken">
      {/* Header */}
      <div>
        <h2 className="font-newsreader text-[32px] font-semibold text-[#4f604f] tracking-[-0.02em] leading-tight font-['Newsreader',serif]">
          Manajemen Saldo &amp; Komisi Hotel
        </h2>
        <p className="font-hanken text-[14px] text-[#747872] mt-1">
          Ringkasan komisi platform dan status penarikan hotel mitra.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8]">
           <p className="text-xs text-[#747872] font-semibold uppercase tracking-wider">Recorded Total Commission</p>
          <p className="font-newsreader text-[32px] font-semibold text-[#4f604f] mt-2 leading-none">
            {rupiah(wallet.commission_total)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8]">
          <p className="text-xs text-[#747872] font-semibold uppercase tracking-wider">Komisi Tertahan</p>
          <p className="font-newsreader text-[32px] font-semibold text-[#191c1b] mt-2 leading-none">
            {rupiah(wallet.commission_held)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8]">
          <p className="text-xs text-[#747872] font-semibold uppercase tracking-wider">Komisi Tersedia</p>
          <p className="font-newsreader text-[32px] font-semibold text-[#191c1b] mt-2 leading-none">
            {rupiah(wallet.commission_available)}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-900 leading-relaxed font-hanken">
         <span className="font-bold block mb-0.5">System Note:</span>
        Saldo ini adalah pembukuan internal. Payout dan pencocokan dana provider belum aktif sampai XenPlatform dikonfigurasi.
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8] overflow-hidden">
        <div className="p-6 border-b border-[#E5E0D8]">
          <h3 className="font-newsreader text-[20px] font-semibold text-[#191c1b]">Riwayat Penarikan Hotel</h3>
        </div>
        {withdrawals.length === 0 ? (
          <p className="py-12 text-center text-[#747872] font-hanken text-[14px]">Belum ada riwayat penarikan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F9F6F1] border-b border-[#E5E0D8] font-hanken text-[12px] font-semibold leading-[1] text-[#434842] uppercase tracking-[0.05em]">
                  <th className="py-4 px-6">Hotel</th>
                  <th className="py-4 px-6">Nominal</th>
                  <th className="py-4 px-6">Diterima</th>
                   <th className="py-4 px-6">Status</th>
                   <th className="py-4 px-6">Date</th>
                </tr>
              </thead>
              <tbody className="font-hanken text-[14px] text-[#191c1b] divide-y divide-[#E5E0D8]">
                {withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="hover:bg-[#F9F6F1]/50 transition-colors">
                    <td className="py-4 px-6 font-medium">{withdrawal.hotel?.name || `Hotel #${withdrawal.hotel_id}`}</td>
                    <td className="py-4 px-6 font-semibold">{rupiah(withdrawal.amount)}</td>
                    <td className="py-4 px-6 text-[#434842]">{rupiah(withdrawal.net_amount)}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full font-hanken text-[11px] font-semibold tracking-[0.05em] uppercase bg-[#d1eac9] text-[#0c200c]">
                        {withdrawal.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-[#747872]">{new Date(withdrawal.requested_at).toLocaleDateString("id-ID")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
