import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";

const fmtRupiah = (val) =>
  "Rp " + Number(val || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 });

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const datePart = String(dateStr).match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  const date = datePart
    ? new Date(`${datePart}T00:00:00`)
    : new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const fmtPaymentMethod = (raw) => {
  if (!raw) return "—";
  const m = String(raw).toLowerCase();
  const map = {
    credit_card: "Credit Card",
    bank_transfer: "Bank Transfer",
    bca_va: "BCA Virtual Account",
    bni_va: "BNI Virtual Account",
    bri_va: "BRI Virtual Account",
    permata_va: "Permata VA",
    echannel: "Mandiri Bill",
    qris: "QRIS",
    gopay: "GoPay",
    shopeepay: "ShopeePay",
    cstore: "Convenience Store",
    akulaku: "Akulaku",
  };
  if (map[m]) return map[m];
  return String(raw).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const TransactionHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [selected, setSelected] = useState(null);
  const selectedRef = useRef(null);
  const pollRef = useRef(null);
  const tickingRef = useRef(false);
  const skippedSyncRef = useRef(new Set());

  const fetchPayments = async (page = 1, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: "10",
      });
      if (filterStatus) params.append("status", filterStatus);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      if (searchDebounced) params.append("search", searchDebounced);

      const response = await api.get(`/hotel/payments?${params.toString()}`);
      if (response.data.success) {
        setPayments(response.data.data);
        setTotalPages(response.data.pagination.last_page);
        setCurrentPage(response.data.pagination.current_page);
        return response.data.data;
      }
    } catch (error) {
      if (!silent) toast.error("Gagal memuat riwayat transaksi.");
    } finally {
      if (!silent) setLoading(false);
    }
    return [];
  };

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetchPayments(1);
  }, [filterStatus, startDate, endDate, searchDebounced]);

  useEffect(() => {
    const tick = async () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      try {
        const params = new URLSearchParams({ page: String(currentPage), per_page: "10" });
        if (filterStatus) params.append("status", filterStatus);
        if (startDate) params.append("start_date", startDate);
        if (endDate) params.append("end_date", endDate);
        if (searchDebounced) params.append("search", searchDebounced);
        const res = await api.get(`/hotel/payments?${params.toString()}`);
        if (!res.data.success) return;
        const list = res.data.data;
        setPayments(list);
        setTotalPages(res.data.pagination.last_page);
        const pendings = list.filter((p) => String(p.payment_status).toLowerCase() === "pending" && !skippedSyncRef.current.has(p.order_id));
        if (pendings.length > 0) {
          let changed = false;
          await Promise.all(pendings.map(async (p) => {
            try {
              const r = await api.post(`/hotel/payments/${p.order_id}/check-status`);
              if (r.data?.not_midtrans) skippedSyncRef.current.add(p.order_id);
              else if (r.data?.success) changed = true;
            } catch (e) {
              const d = e?.response?.data;
              if (d?.not_midtrans || e?.response?.status === 404) skippedSyncRef.current.add(p.order_id);
            }
          }));
          if (changed) {
            const res2 = await api.get(`/hotel/payments?${params.toString()}`);
            if (res2.data.success) {
              setPayments(res2.data.data);
              const curSel = selectedRef.current;
              if (curSel) {
                const upd = res2.data.data.find((x) => x.id === curSel.id);
                if (upd) setSelected(upd);
              }
            }
          }
        }
      } catch {}
      finally { tickingRef.current = false; }
    };
    pollRef.current = setInterval(tick, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [currentPage, filterStatus, startDate, endDate, searchDebounced]);

  const handleSync = async (orderId) => {
    setSyncing(orderId);
    try {
      const response = await api.post(`/hotel/payments/${orderId}/check-status`);
      if (response.data?.not_midtrans) {
        skippedSyncRef.current.add(orderId);
        toast(response.data.message || "Transaksi manual / belum di Midtrans — tidak perlu sync.", { icon: "ℹ️" });
        return;
      }
      if (response.data.success) {
        toast.success("Status transaksi berhasil diperbarui.");
        skippedSyncRef.current.delete(orderId);
        fetchPayments(currentPage, true);
      }
    } catch (error) {
      const status = error?.response?.status;
      const d = error?.response?.data;
      const msg = d?.message || d?.error || "";
      if (d?.not_midtrans || status === 404) {
        skippedSyncRef.current.add(orderId);
        toast(d?.message || msg || "Transaksi belum ada di Midtrans — pembayaran manual / belum Snap.", { icon: "ℹ️" });
      } else {
        toast.error(msg || "Gagal menyinkronkan dengan Midtrans.");
      }
    } finally {
      setSyncing(null);
    }
  };

  const getStatusBadge = (status) => {
    const s = String(status || "").toLowerCase();
    switch (s) {
      case "success":
      case "settlement":
      case "capture":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-wider">Berhasil</span>;
      case "pending":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wider">Menunggu Pembayaran</span>;
      case "expire":
      case "expired":
      case "failure":
      case "failed":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-wider">Kedaluwarsa / Gagal</span>;
      case "cancel":
      case "cancelled":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 uppercase tracking-wider">Dibatalkan</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 uppercase tracking-wider">{status || "—"}</span>;
    }
  };

  return (
    <div className="min-h-full bg-[#fcf9f5] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E4EBE0] text-[#506147]">
              <span className="material-symbols-outlined text-[25px]">receipt_long</span>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#778873]">Keuangan & pembayaran</p>
              <h1 className="font-['Newsreader',serif] text-3xl font-semibold leading-tight text-[#2D312C] sm:text-[2rem]">Riwayat Transaksi</h1>
              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#6B6E6A]">Pantau pembayaran tamu dan kelola status transaksi hotel Anda.</p>
            </div>
          </div>
          <div className="flex w-fit items-center gap-2 rounded-full border border-[#DCE5D7] bg-white px-3.5 py-2 text-xs font-medium text-[#506147] shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#778873] opacity-40"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#687965]"></span>
            </span>
            Diperbarui otomatis tiap 5 detik
          </div>
        </div>

        <section aria-label="Filter transaksi" className="mb-6 rounded-2xl border border-[#E5E1DA] bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#687965]">tune</span>
            <h2 className="text-sm font-semibold text-[#2D312C]">Cari dan filter transaksi</h2>
          </div>
          <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(240px,1.5fr)_minmax(170px,1fr)_minmax(155px,1fr)_minmax(155px,1fr)_auto]">
            <div className="flex min-w-0 flex-col gap-1.5">
              <label htmlFor="transaction-search" className="text-xs font-semibold text-[#5F7161]">Cari transaksi</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#778873] text-[20px]">search</span>
                <input
                  id="transaction-search"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari pesanan, pelanggan..."
                  className="h-11 w-full rounded-xl border border-[#E2DDD3] bg-[#FCFBF8] py-2 pl-10 pr-4 text-sm text-[#2D312C] outline-none transition focus:border-[#778873] focus:ring-4 focus:ring-[#778873]/10"
                />
              </div>
            </div>

            <div className="flex min-w-0 flex-col gap-1.5">
              <label htmlFor="transaction-status" className="text-xs font-semibold text-[#5F7161]">Status pembayaran</label>
              <select
                id="transaction-status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-11 w-full rounded-xl border border-[#E2DDD3] bg-[#FCFBF8] px-3 text-sm text-[#2D312C] outline-none transition focus:border-[#778873] focus:ring-4 focus:ring-[#778873]/10"
              >
                <option value="">Semua Status</option>
                <option value="success">Berhasil</option>
                <option value="pending">Menunggu</option>
                <option value="expired">Kedaluwarsa</option>
                <option value="failed">Gagal</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </div>

            <div className="flex min-w-0 flex-col gap-1.5">
              <label htmlFor="transaction-start-date" className="text-xs font-semibold text-[#5F7161]">Dari tanggal</label>
              <input
                id="transaction-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-11 w-full min-w-0 rounded-xl border border-[#E2DDD3] bg-[#FCFBF8] px-3 text-sm text-[#2D312C] outline-none transition focus:border-[#778873] focus:ring-4 focus:ring-[#778873]/10"
              />
            </div>

            <div className="flex min-w-0 flex-col gap-1.5">
              <label htmlFor="transaction-end-date" className="text-xs font-semibold text-[#5F7161]">Sampai tanggal</label>
              <input
                id="transaction-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-11 w-full min-w-0 rounded-xl border border-[#E2DDD3] bg-[#FCFBF8] px-3 text-sm text-[#2D312C] outline-none transition focus:border-[#778873] focus:ring-4 focus:ring-[#778873]/10"
              />
            </div>

            <button
              onClick={() => { setFilterStatus(""); setStartDate(""); setEndDate(""); setSearch(""); }}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#E2DDD3] px-4 text-sm font-semibold text-[#5F7161] transition hover:border-[#778873] hover:bg-[#F7F8F5]"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
              Reset
            </button>
          </div>
        </section>

      <section aria-label="Daftar transaksi" className="overflow-hidden rounded-2xl border border-[#E5E1DA] bg-white shadow-sm">
        <div className="flex flex-col gap-1 border-b border-[#EEEAE3] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-base font-semibold text-[#2D312C]">Daftar transaksi</h2>
            <p className="mt-0.5 text-xs text-[#7A7D77]">Detail pembayaran dan status pesanan tamu</p>
          </div>
          <span className="text-xs font-medium text-[#778873]">Maksimal 10 transaksi per halaman</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead className="border-b border-[#EEEAE3] bg-[#FAF9F6]">
              <tr>
                <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#737970]">Info pesanan</th>
                <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#737970]">Pelanggan</th>
                <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#737970]">Total pembayaran</th>
                <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#737970]">Metode pembayaran</th>
                <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#737970]">Status</th>
                <th className="px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.1em] text-[#737970]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE1]">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="p-4"><div className="h-12 bg-gray-100 rounded-lg"></div></td>
                  </tr>
                ))
              ) : payments.length > 0 ? (
                payments.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-[#FAFBF8]">
                  <td className="px-5 py-4">
                    <div className="text-sm font-semibold text-[#2D312C]">{p.order_id}</div>
                    <div className="mt-1 text-xs text-[#7A7D77]">
                      {new Date(p.created_at).toLocaleString("id-ID", { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    {p.transaction_id && <div className="mt-1 max-w-[180px] truncate text-[11px] text-[#969991]" title={p.transaction_id}>ID: {p.transaction_id}</div>}
                    </td>
                  <td className="px-5 py-4">
                    <div className="text-sm font-medium text-[#2D312C]">{p.booking?.guests?.[0]?.name || p.booking?.user?.name || "N/A"}</div>
                    <div className="mt-1 text-xs text-[#737970]">{p.booking?.guests?.[0]?.email || p.booking?.user?.email || "-"}</div>
                    {p.booking?.guests?.[0]?.phone && <div className="mt-0.5 text-xs text-[#969991]">{p.booking.guests[0].phone}</div>}
                    </td>
                  <td className="px-5 py-4">
                    <div className="whitespace-nowrap text-sm font-semibold text-[#506147]">{fmtRupiah(p.gross_amount)}</div>
                    </td>
                  <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[19px] text-[#8A9085]">payments</span>
                      <span className="text-sm font-medium text-[#41463F]">{fmtPaymentMethod(p.payment_method)}</span>
                      </div>
                    </td>
                  <td className="px-5 py-4">
                      {getStatusBadge(p.payment_status)}
                    </td>
                  <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelected(p)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2DDD3] text-[#5F7161] transition hover:border-[#506147] hover:bg-[#506147] hover:text-white"
                          title="Lihat Detail"
                          aria-label={`Lihat detail transaksi ${p.order_id}`}
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <button
                          onClick={() => handleSync(p.order_id)}
                          disabled={syncing === p.order_id}
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2DDD3] text-[#5F7161] transition hover:border-[#506147] hover:bg-[#506147] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 ${syncing === p.order_id ? 'animate-spin' : ''}`}
                          title="Sinkronisasi"
                          aria-label={`Sinkronisasi transaksi ${p.order_id}`}
                        >
                          <span className="material-symbols-outlined text-[18px]">sync</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3F5F0] text-[#778873]">
                      <span className="material-symbols-outlined text-[28px]">receipt_long</span>
                    </div>
                    <p className="mt-4 text-sm font-semibold text-[#41463F]">Belum ada transaksi</p>
                    <p className="mt-1 text-xs text-[#858980]">Coba ubah kata kunci atau filter tanggal yang dipilih.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#EEEAE3] bg-[#FAF9F6] px-4 py-3 sm:px-6">
            <button
              disabled={currentPage === 1 || loading}
              onClick={() => fetchPayments(currentPage - 1)}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-[#506147] transition hover:bg-[#E9EEE5] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span> Sebelumnya
            </button>
            <span className="text-xs font-medium text-[#737970]">Halaman <span className="font-semibold text-[#2D312C]">{currentPage}</span> dari {totalPages}</span>
            <button
              disabled={currentPage === totalPages || loading}
              onClick={() => fetchPayments(currentPage + 1)}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-[#506147] transition hover:bg-[#E9EEE5] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Selanjutnya <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        )}
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1e1b16]/40 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#DCCFC0]/60 bg-white text-left shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#2D312C] text-white p-5 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-base">Rincian Transaksi</h3>
                <p className="text-xs opacity-70 mt-1">ID Pesanan: {selected.order_id}</p>
                {selected.transaction_id && <p className="text-xs opacity-60">ID Transaksi: {selected.transaction_id}</p>}
              </div>
              <button onClick={() => setSelected(null)} className="text-white/70 hover:text-white p-1"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-[#5F7161] uppercase tracking-wider mb-1">Data Pelanggan</p>
                  <p className="font-semibold text-[#1C251D]">{selected.booking?.guests?.[0]?.name || selected.booking?.user?.name || "-"}</p>
                  <p className="text-xs text-[#5F7161]">{selected.booking?.guests?.[0]?.email || selected.booking?.user?.email || "-"}</p>
                  <p className="text-xs text-gray-500">{selected.booking?.guests?.[0]?.phone || selected.booking?.user?.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#5F7161] uppercase tracking-wider mb-1">Pembayaran</p>
                  <p className="font-semibold">{fmtPaymentMethod(selected.payment_method)} {selected.payment_method ? "" : "(belum ada)"}</p>
                  <div className="mt-1">{getStatusBadge(selected.payment_status)}</div>
                  <p className="text-xs text-gray-400 mt-1">Total: {fmtRupiah(selected.gross_amount)}</p>
                </div>
              </div>

              <div className="bg-[#F7F6F2] rounded-xl p-4 border border-[#E2DDD3] space-y-2">
                <div className="flex justify-between text-xs"><span className="text-[#5F7161]">Kode Booking</span><span className="font-mono font-bold">{selected.booking?.booking_code || selected.order_id}</span></div>
                <div className="flex justify-between text-xs"><span className="text-[#5F7161]">Check-in</span><span>{formatDate(selected.booking?.check_in)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-[#5F7161]">Check-out</span><span>{formatDate(selected.booking?.check_out)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-[#5F7161]">Status Booking</span><span className="font-semibold capitalize">{selected.booking?.status || "-"}</span></div>
                <div className="flex justify-between text-xs"><span className="text-[#5F7161]">Waktu Dibayar</span><span>{selected.paid_at ? new Date(selected.paid_at).toLocaleString("id-ID") : "-"}</span></div>
                <div className="flex justify-between text-xs"><span className="text-[#5F7161]">Kedaluwarsa</span><span>{selected.expired_at ? new Date(selected.expired_at).toLocaleString("id-ID") : "-"}</span></div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => handleSync(selected.order_id)} disabled={syncing === selected.order_id} className="flex-1 bg-[#5F7161] text-white py-2.5 rounded-xl text-sm font-bold hover:bg-[#4D5E4F] disabled:opacity-50 flex items-center justify-center gap-2">
                  <span className={`material-symbols-outlined text-base ${syncing === selected.order_id ? 'animate-spin' : ''}`}>sync</span> Sinkronisasi
                </button>
                <button onClick={() => setSelected(null)} className="px-6 py-2.5 border border-[#E2DDD3] rounded-xl text-sm font-bold hover:bg-gray-50">Tutup</button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default TransactionHistory;
