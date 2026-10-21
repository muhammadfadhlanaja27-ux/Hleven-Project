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

const getErrorMessage = (error, fallback) => {
  const data = error.response?.data;
  const firstValidationError = data?.errors && Object.values(data.errors).flat()[0];
  return firstValidationError || data?.message || fallback;
};

const findChannel = (code) =>
  payoutChannels.find((channel) => channel.code === code) || {
    code,
    label: code,
    type: "e_wallet",
    numberLabel: "Nomor HP",
  };

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
  const [destinationForm, setDestinationForm] = useState({
    account_number: "",
    account_name: "",
  });

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
      setSelectedDestinationId((current) => (
        list.some((destination) => String(destination.id) === String(current))
          ? current
          : list[0]
            ? String(list[0].id)
            : ""
      ));
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal memuat data saldo & pencairan."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const additionalChannels = [...new Map(
    destinations
      .filter((destination) => !payoutChannels.some((channel) => channel.code === destination.channel_code))
      .map((destination) => [
        destination.channel_code,
        findChannel(destination.channel_code),
      ]),
  ).values()];
  const channels = [...payoutChannels, ...additionalChannels];

  const selectedDestination = destinations.find(
    (destination) => String(destination.id) === String(selectedDestinationId),
  );
  const bankReady = Boolean(bank?.bank_name && bank?.bank_account_number);
  const hasDestination = Boolean(selectedDestination) || bankReady;
  const minPayout = limits?.min_payout || 0;
  const commissionRate = limits?.commission_rate ?? 0.05;
  const commissionPct = Math.round(commissionRate * 100);
  const netPct = 100 - commissionPct;

  const openNewDestination = () => {
    setEditingDestination({ ...payoutChannels[0], id: null, isNew: true });
    setDestinationForm({ account_number: "", account_name: "" });
  };

  const openEditDestination = (destination) => {
    const channel = findChannel(destination.channel_code);
    setEditingDestination({
      ...channel,
      type: destination.type || channel.type,
      id: destination.id,
      isNew: false,
    });
    setDestinationForm({
      account_number: "",
      account_name: destination.account_name || "",
    });
  };

  const handleChannelChange = (event) => {
    const channel = channels.find((item) => item.code === event.target.value);
    if (!channel) return;
    setEditingDestination({ ...channel, id: null, isNew: true });
  };

  const saveDestination = async (event) => {
    event.preventDefault();
    if (!editingDestination) return;
    setSavingDestination(true);
    try {
      const payload = {
        type: editingDestination.type,
        channel_code: editingDestination.code,
        ...destinationForm,
      };

      if (editingDestination.id) {
        await api.put(`/admin/wallet/destinations/${editingDestination.id}`, payload);
      } else {
        await api.post("/admin/wallet/destinations", payload);
      }

      toast.success("Tujuan pencairan berhasil disimpan.");
      setEditingDestination(null);
      setDestinationForm({ account_number: "", account_name: "" });
      await fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal menyimpan tujuan pencairan."));
    } finally {
      setSavingDestination(false);
    }
  };

  const deleteDestination = async (destination) => {
    if (!window.confirm(`Hapus tujuan ${findChannel(destination.channel_code).label}?`)) return;

    try {
      await api.delete(`/admin/wallet/destinations/${destination.id}`);
      toast.success("Tujuan pencairan dihapus.");
      await fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal menghapus tujuan pencairan."));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast.error("Masukkan nominal pencairan yang valid.");
      return;
    }
    if (!hasDestination) {
      toast.error("Simpan tujuan pencairan terlebih dahulu.");
      return;
    }
    if (minPayout > 0 && Number(amount) < minPayout) {
      toast.error(`Minimal pencairan ${rupiah(minPayout)}.`);
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/admin/payouts", {
        amount: Number(amount),
        note,
        destination_id: selectedDestination?.id ?? undefined,
      });
      toast.success("Pengajuan pencairan berhasil dikirim.");
      setAmount("");
      setNote("");
      await fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal mengajukan pencairan."));
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

      <div className="bg-white rounded-xl border border-[#E5E1DA] shadow-sm p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#2D312C]">Tujuan Pencairan</h2>
            <p className="text-sm text-[#6B6E6A] mt-1">
              Pilih rekening bank atau e-wallet yang akan menerima dana.
            </p>
          </div>
          <button
            type="button"
            onClick={openNewDestination}
            className="rounded-lg border border-[#506147] px-4 py-2 text-sm font-semibold text-[#506147] hover:bg-[#506147]/5"
          >
            + Tambah Tujuan
          </button>
        </div>

        {destinations.length === 0 ? (
          <p className="mt-4 text-sm text-[#6B6E6A]">
            Belum ada tujuan tersimpan. Tambahkan rekening bank atau e-wallet terlebih dahulu.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-[#F0EDE8]">
            {destinations.map((destination) => {
              const channel = findChannel(destination.channel_code);
              return (
                <li key={destination.id} className="py-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="payout-destination"
                      checked={String(selectedDestinationId) === String(destination.id)}
                      onChange={() => setSelectedDestinationId(String(destination.id))}
                      aria-label={`Pilih ${channel.label}`}
                      className="mt-1 accent-[#506147]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#2D312C]">
                        {channel.label} <span className="text-xs font-normal text-[#6B6E6A]">({destination.type === "bank" ? "Bank" : "E-Wallet"})</span>
                      </p>
                      <p className="text-sm text-[#6B6E6A]">
                        {destination.account_name} | {destination.masked_account_number}
                      </p>
                    </div>
                    <div className="flex gap-3 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => openEditDestination(destination)}
                        className="text-sky-700 hover:underline"
                      >
                        Ubah
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteDestination(destination)}
                        className="text-red-700 hover:underline"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {editingDestination && (
          <form onSubmit={saveDestination} className="mt-5 space-y-3 rounded-xl bg-[#FBFBFA] p-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#434842] uppercase tracking-wider">
                Jenis Tujuan
              </label>
              {editingDestination.isNew ? (
                <select
                  value={editingDestination.code}
                  onChange={handleChannelChange}
                  className="w-full p-3 bg-white border border-[#E5E0D8] rounded-lg text-sm focus:outline-none focus:border-[#506147]"
                >
                  {channels.map((channel) => (
                    <option key={channel.code} value={channel.code}>{channel.label}</option>
                  ))}
                </select>
              ) : (
                <p className="text-sm font-semibold text-[#2D312C]">{editingDestination.label}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#434842] uppercase tracking-wider">
                {editingDestination.numberLabel}
              </label>
              <input
                type="text"
                value={destinationForm.account_number}
                onChange={(event) => setDestinationForm({
                  ...destinationForm,
                  account_number: event.target.value.replace(/\D/g, ""),
                })}
                inputMode="numeric"
                minLength={5}
                maxLength={34}
                autoComplete="off"
                required
                className="w-full p-3 bg-white border border-[#E5E0D8] rounded-lg text-sm focus:outline-none focus:border-[#506147]"
              />
              {!editingDestination.isNew && (
                <span className="text-[11px] text-[#6B6E6A]">
                  Masukkan ulang nomor tujuan untuk menyimpan perubahan.
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#434842] uppercase tracking-wider">
                Nama pemilik rekening / akun
              </label>
              <input
                type="text"
                value={destinationForm.account_name}
                onChange={(event) => setDestinationForm({ ...destinationForm, account_name: event.target.value })}
                maxLength={255}
                required
                className="w-full p-3 bg-white border border-[#E5E0D8] rounded-lg text-sm focus:outline-none focus:border-[#506147]"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={savingDestination}
                className="rounded-lg bg-[#506147] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3b4b33] disabled:opacity-60"
              >
                {savingDestination ? "Menyimpan..." : "Simpan Tujuan"}
              </button>
              <button
                type="button"
                onClick={() => setEditingDestination(null)}
                className="rounded-lg border border-[#E5E0D8] px-4 py-2 text-sm font-medium text-[#434842]"
              >
                Batal
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl border border-[#E5E1DA] shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#2D312C] mb-4">Ajukan Pencairan</h2>

          {!hasDestination && (
            <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
              Tujuan pencairan belum tersedia. Tambahkan rekening bank atau e-wallet di atas.
            </div>
          )}

          {hasDestination && (
            <div className="mb-4 text-xs text-[#6B6E6A]">
              Tujuan:{" "}
              <strong>
                {selectedDestination
                  ? `${findChannel(selectedDestination.channel_code).label} — ${selectedDestination.masked_account_number} (${selectedDestination.account_name})`
                  : `${bank.bank_name} — ${bank.bank_account_number}${bank.bank_account_name ? ` (${bank.bank_account_name})` : ""}`}
              </strong>
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
                disabled={submitting || !hasDestination}
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
                  disabled={submitting || !hasDestination}
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
                disabled={submitting || !hasDestination}
                className="w-full p-3 bg-white border border-[#E5E0D8] rounded-lg text-sm focus:outline-none focus:border-[#506147] focus:ring-2 focus:ring-[#506147]/20 disabled:bg-gray-50"
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !hasDestination}
              className="w-full bg-[#506147] text-white text-sm font-semibold py-3 rounded-lg hover:bg-[#3b4b33] transition-all disabled:opacity-50"
            >
              {submitting ? "Mengirim..." : "Ajukan Pencairan"}
            </button>
          </form>
        </div>

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
                    <th className="py-2">Tujuan</th>
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
                      <td className="py-3 text-[#434842]">
                        <div>{p.bank_name}</div>
                        <div className="text-[11px] text-[#6B6E6A]">{p.bank_account_number}</div>
                      </td>
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
