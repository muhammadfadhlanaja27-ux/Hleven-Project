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
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-stone-900">Saldo & Komisi</h1>
        <p className="mt-1 text-stone-600">Ringkasan komisi platform dan status penarikan hotel.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-stone-500">Total komisi tercatat</p>
          <p className="mt-2 text-2xl font-semibold">{rupiah(wallet.commission_total)}</p>
        </article>
        <article className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-stone-500">Komisi tertahan</p>
          <p className="mt-2 text-2xl font-semibold">{rupiah(wallet.commission_held)}</p>
        </article>
        <article className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-stone-500">Komisi tersedia</p>
          <p className="mt-2 text-2xl font-semibold">{rupiah(wallet.commission_available)}</p>
        </article>
      </div>
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        Saldo ini adalah pembukuan internal. Payout dan pencocokan dana provider belum aktif sampai XenPlatform dikonfigurasi.
      </div>
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Penarikan hotel</h2>
        {withdrawals.length === 0 ? (
          <p className="mt-4 text-sm text-stone-500">Belum ada riwayat penarikan.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-stone-500">
                <tr><th className="py-2">Hotel</th><th>Nominal</th><th>Diterima</th><th>Status</th><th>Tanggal</th></tr>
              </thead>
              <tbody>
                {withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="border-b last:border-0">
                    <td className="py-3">{withdrawal.hotel?.name || `Hotel #${withdrawal.hotel_id}`}</td>
                    <td>{rupiah(withdrawal.amount)}</td>
                    <td>{rupiah(withdrawal.net_amount)}</td>
                    <td className="capitalize">{withdrawal.status}</td>
                    <td>{new Date(withdrawal.requested_at).toLocaleDateString("id-ID")}</td>
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
