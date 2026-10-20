import React, { useEffect, useState } from "react";
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

const rupiah = (value) =>
  `Rp ${Number(value || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;

export default function Wallet() {
  const [summary, setSummary] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState("");
  const [editingChannel, setEditingChannel] = useState(null);
  const [form, setForm] = useState({
    account_number: "",
    account_name: "",
  });

  const loadWallet = async () => {
    setLoading(true);
    try {
      const [summaryResponse, destinationResponse, withdrawalResponse] = await Promise.all([
        api.get("/admin/wallet"),
        api.get("/admin/wallet/destinations"),
        api.get("/admin/wallet/withdrawals"),
      ]);
      setSummary(summaryResponse.data.data);
      setDestinations(destinationResponse.data.data);
      setWithdrawals(withdrawalResponse.data.data.data);
      setSelectedChannel((current) => (
        destinationResponse.data.data.some((destination) => destination.channel_code === current)
          ? current
          : destinationResponse.data.data[0]?.channel_code || ""
      ));
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal memuat data saldo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const saveDestination = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const destination = destinations.find(
        (item) => item.channel_code === editingChannel.code,
      );
      const payload = {
        type: editingChannel.type,
        channel_code: editingChannel.code,
        ...form,
      };
      if (destination) {
        await api.put(`/admin/wallet/destinations/${destination.id}`, payload);
      } else {
        await api.post("/admin/wallet/destinations", payload);
      }
      toast.success("Tujuan pencairan berhasil disimpan.");
      setSelectedChannel(editingChannel.code);
      setEditingChannel(null);
      setForm({ account_number: "", account_name: "" });
      await loadWallet();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menyimpan tujuan pencairan.");
    } finally {
      setSaving(false);
    }
  };

  const openEditor = (channel) => {
    const destination = destinations.find((item) => item.channel_code === channel.code);
    setEditingChannel(channel);
    setForm({
      account_number: "",
      account_name: destination?.account_name || "",
    });
  };

  const deleteDestination = async (id) => {
    try {
      await api.delete(`/admin/wallet/destinations/${id}`);
      toast.success("Tujuan pencairan dihapus.");
      await loadWallet();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menghapus tujuan pencairan.");
    }
  };

  const additionalChannels = [...new Map(
    destinations
      .filter((destination) => !payoutChannels.some((channel) => channel.code === destination.channel_code))
      .map((destination) => [
        destination.channel_code,
        {
          code: destination.channel_code,
          label: destination.channel_code,
          type: destination.type,
          numberLabel: destination.type === "bank" ? "Nomor rekening" : "Nomor HP",
        },
      ]),
  ).values()];
  const channels = [...payoutChannels, ...additionalChannels];

  if (loading) {
    return <div className="p-8 text-stone-500">Memuat saldo...</div>;
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-stone-900">Saldo Hotel</h1>
        <p className="mt-1 text-stone-600">Pantau pendapatan, tujuan pencairan, dan riwayat penarikan.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-stone-500">Saldo tertahan</p>
          <p className="mt-2 text-2xl font-semibold">{rupiah(summary?.held_balance)}</p>
          <p className="mt-2 text-sm text-stone-500">Dilepas setelah booking check-out.</p>
        </article>
        <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-stone-500">Saldo tersedia</p>
          <p className="mt-2 text-2xl font-semibold">{rupiah(summary?.available_balance)}</p>
          {summary?.withdrawal_blocked_by_debt && (
            <p className="mt-2 text-sm text-red-700">Penarikan ditahan sampai saldo negatif tertutup pemasukan berikutnya.</p>
          )}
        </article>
      </div>

      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>Penarikan otomatis belum aktif.</strong>{" "}
        {summary?.withdrawals_message} Dana booking lama di Midtrans tidak otomatis menjadi saldo payout XenPlatform.
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Cairkan ke:</h2>
          <p className="mt-1 text-sm text-stone-500">Pilih tujuan, lalu masukkan nomor rekening atau nomor HP terlebih dahulu.</p>
          <ul className="mt-4 divide-y divide-stone-100">
            {channels.map((channel) => {
              const destination = destinations.find((item) => item.channel_code === channel.code);
              const isEditing = editingChannel?.code === channel.code;

              return (
                <li key={channel.code} className="py-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="payout-destination"
                      checked={selectedChannel === channel.code}
                      onChange={() => {
                        setSelectedChannel(channel.code);
                        if (destination) {
                          setEditingChannel(null);
                        } else {
                          openEditor(channel);
                        }
                      }}
                      aria-label={`Pilih ${channel.label}`}
                      className="mt-1 accent-[#506147]"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{channel.label}</span>
                        <button
                          type="button"
                          onClick={() => openEditor(channel)}
                          className="rounded-full border border-sky-300 px-3 py-0.5 text-xs font-medium text-sky-700 hover:bg-sky-50"
                        >
                          Edit
                        </button>
                      </div>
                      {destination ? (
                        <p className="mt-1 text-sm text-stone-600">
                          {destination.account_name} | {destination.masked_account_number}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm text-stone-500">Klik "Edit" untuk isi data.</p>
                      )}
                    </div>
                    {destination && (
                      <button
                        type="button"
                        onClick={() => deleteDestination(destination.id)}
                        className="text-sm font-medium text-red-700 hover:text-red-800"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                  {isEditing && (
                    <form onSubmit={saveDestination} className="ml-7 mt-4 space-y-3 rounded-xl bg-stone-50 p-4">
                      <label className="block text-sm font-medium">
                        {channel.numberLabel}
                        <input
                          type="text"
                          value={form.account_number}
                          onChange={(event) => setForm({
                            ...form,
                            account_number: event.target.value.replace(/\D/g, ""),
                          })}
                          inputMode="numeric"
                          minLength={5}
                          maxLength={34}
                          autoComplete="off"
                          required
                          className="mt-1 w-full rounded-lg border border-stone-300 bg-white p-2.5"
                        />
                      </label>
                      <label className="block text-sm font-medium">
                        Nama pemilik rekening / akun
                        <input
                          value={form.account_name}
                          onChange={(event) => setForm({ ...form, account_name: event.target.value })}
                          maxLength={255}
                          required
                          className="mt-1 w-full rounded-lg border border-stone-300 bg-white p-2.5"
                        />
                      </label>
                      <div className="flex gap-2">
                        <button
                          disabled={saving}
                          className="rounded-lg bg-[#506147] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                        >
                          {saving ? "Menyimpan..." : "Simpan"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingChannel(null)}
                          className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700"
                        >
                          Batal
                        </button>
                      </div>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Informasi penarikan</h2>
          <p className="mt-3 text-sm text-stone-600">
            Simpan nomor rekening atau e-wallet sebelum mengajukan penarikan. Nomor yang tersimpan akan ditampilkan dalam bentuk tersamar.
          </p>
          <p className="mt-3 text-sm text-stone-600">
            Minimum penarikan {rupiah(summary?.minimum_withdrawal)}. Biaya provider akan mengurangi nominal yang diterima.
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Riwayat penarikan</h2>
            <p className="mt-1 text-sm text-stone-500">
              Minimum penarikan {rupiah(summary?.minimum_withdrawal)}. Biaya provider akan mengurangi nominal yang diterima.
            </p>
          </div>
          <button disabled className="rounded-lg bg-stone-300 px-5 py-2.5 font-semibold text-stone-600" title={summary?.withdrawals_message}>
            Tarik saldo
          </button>
        </div>
        {withdrawals.length === 0 ? (
          <p className="mt-5 text-sm text-stone-500">Belum ada penarikan.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-stone-500">
                <tr><th className="py-2">Tanggal</th><th>Nominal</th><th>Diterima</th><th>Status</th></tr>
              </thead>
              <tbody>
                {withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="border-b last:border-0">
                    <td className="py-3">{new Date(withdrawal.requested_at).toLocaleDateString("id-ID")}</td>
                    <td>{rupiah(withdrawal.amount)}</td>
                    <td>{rupiah(withdrawal.net_amount)}</td>
                    <td className="capitalize">{withdrawal.status}</td>
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
