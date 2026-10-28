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
      .catch((error) => toast.error(error.response?.data?.message || "Gagal memuat ringkasan komisi."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-stone-500">Memuat laporan saldo...</div>;
  if (!wallet) return <div className="p-8 text-stone-500">Data saldo tidak tersedia.</div>;

  const withdrawals = wallet.withdrawals?.data || [];

  return (
    <section className="space-y-md">
      <header>
        <h1 className="font-headline-lg text-on-surface">Saldo & Komisi</h1>
        <p className="font-body-md text-on-surface-variant mt-xs">Ringkasan komisi platform dan status penarikan hotel.</p>
      </header>
      <div className="grid gap-sm md:grid-cols-3">
        <article className="rounded-lg border border-outline-variant bg-surface-container-low p-md shadow-card">
          <p className="font-label-md text-on-surface-variant uppercase tracking-widest">Total komisi tercatat</p>
          <p className="font-headline-md mt-sm text-primary">{rupiah(wallet.commission_total)}</p>
        </article>
        <article className="rounded-lg border border-outline-variant bg-surface-container-low p-md shadow-card">
          <p className="font-label-md text-on-surface-variant uppercase tracking-widest">Komisi tertahan</p>
          <p className="font-headline-md mt-sm text-tertiary">{rupiah(wallet.commission_held)}</p>
        </article>
        <article className="rounded-lg border border-outline-variant bg-surface-container-low p-md shadow-card">
          <p className="font-label-md text-on-surface-variant uppercase tracking-widest">Komisi tersedia</p>
          <p className="font-headline-md mt-sm text-primary">{rupiah(wallet.commission_available)}</p>
        </article>
      </div>
      <div className="rounded-md border border-tertiary-container bg-error-container p-sm font-body-sm text-on-error-container">
        Saldo ini adalah pembukuan internal. Payout dan pencocokan dana provider belum aktif sampai XenPlatform dikonfigurasi.
      </div>
      <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-lg shadow-card">
        <h2 className="font-headline-md text-on-surface">Penarikan hotel</h2>
        {withdrawals.length === 0 ? (
          <p className="font-body-md mt-md text-on-surface-variant">Belum ada riwayat penarikan.</p>
        ) : (
          <div className="mt-md overflow-x-auto">
            <table className="w-full text-left font-body-md">
              <thead className="border-b border-outline-variant text-on-surface-variant">
                <tr>
                  <th className="py-sm font-label-lg">Hotel</th>
                  <th className="py-sm font-label-lg">Nominal</th>
                  <th className="py-sm font-label-lg">Diterima</th>
                  <th className="py-sm font-label-lg">Status</th>
                  <th className="py-sm font-label-lg">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="border-b border-outline-variant last:border-0 h-[56px]">
                    <td className="py-sm">{withdrawal.hotel?.name || `Hotel #${withdrawal.hotel_id}`}</td>
                    <td className="py-sm">{rupiah(withdrawal.amount)}</td>
                    <td className="py-sm">{rupiah(withdrawal.net_amount)}</td>
                    <td className="py-sm capitalize">{withdrawal.status}</td>
                    <td className="py-sm">{new Date(withdrawal.requested_at).toLocaleDateString("id-ID")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
