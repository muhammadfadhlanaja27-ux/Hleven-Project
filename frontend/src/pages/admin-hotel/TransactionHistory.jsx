import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";

const fmtRupiah = (val) =>
  "Rp " + Number(val || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 });

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
      if (!silent) toast.error("Failed to load transaction history.");
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
    pollRef.current = setInterval(tick, 2000);
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
        toast.success("Transaction status updated.");
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
        toast.error(msg || "Failed to sync with Midtrans.");
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
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-wider">Settlement</span>;
      case "pending":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wider">Pending</span>;
      case "expire":
      case "expired":
      case "failure":
      case "failed":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-wider">Expired / Failed</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 uppercase tracking-wider">{status || "—"}</span>;
    }
  };

  return (
    <div className="p-6 min-h-screen bg-[#F8F9F8]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1C251D] font-['Newsreader',serif]">Transaction History</h1>
          <p className="text-sm text-[#5F7161]">View and manage all guest payments and transaction status. Auto-refresh every 5s.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#E8E2D9] mb-6 flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5 flex-1 min-w-[220px]">
          <label className="text-xs font-bold text-[#5F7161] uppercase tracking-wider">Search</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#757870] text-[20px]">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order, customer..."
              className="w-full pl-10 pr-4 py-2 bg-[#F7F6F2] border border-[#E2DDD3] rounded-xl text-sm text-[#1C251D] focus:ring-2 focus:ring-[#5F7161]/20 outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#5F7161] uppercase tracking-wider">Payment Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#F7F6F2] border border-[#E2DDD3] rounded-xl px-4 py-2 text-sm text-[#1C251D] focus:ring-2 focus:ring-[#5F7161]/20 outline-none min-w-[160px]"
          >
            <option value="">All Status</option>
            <option value="success">Settlement</option>
            <option value="pending">Pending</option>
            <option value="expire">Expired / Failure</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#5F7161] uppercase tracking-wider">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-[#F7F6F2] border border-[#E2DDD3] rounded-xl px-4 py-2 text-sm text-[#1C251D] focus:ring-2 focus:ring-[#5F7161]/20 outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#5F7161] uppercase tracking-wider">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-[#F7F6F2] border border-[#E2DDD3] rounded-xl px-4 py-2 text-sm text-[#1C251D] focus:ring-2 focus:ring-[#5F7161]/20 outline-none"
          />
        </div>

        <button
          onClick={() => { setFilterStatus(""); setStartDate(""); setEndDate(""); setSearch(""); }}
          className="px-4 py-2 text-sm font-bold text-[#5F7161] hover:bg-[#5F7161]/5 transition-colors rounded-xl underline"
        >
          Reset Filters
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#E8E2D9] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F7F6F2] border-b border-[#E8E2D9]">
              <tr>
                <th className="p-4 text-xs font-bold text-[#5F7161] uppercase tracking-wider">Order Info</th>
                <th className="p-4 text-xs font-bold text-[#5F7161] uppercase tracking-wider">Customer</th>
                <th className="p-4 text-xs font-bold text-[#5F7161] uppercase tracking-wider">Amount</th>
                <th className="p-4 text-xs font-bold text-[#5F7161] uppercase tracking-wider">Payment Method</th>
                <th className="p-4 text-xs font-bold text-[#5F7161] uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-[#5F7161] uppercase tracking-wider text-center">Actions</th>
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
                  <tr key={p.id} className="hover:bg-[#FDFCFB] transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-[#1C251D] text-sm">{p.order_id}</div>
                      <div className="text-[10px] text-[#5F7161] mt-0.5">
                        Created: {new Date(p.created_at).toLocaleString("en-GB", { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {p.transaction_id && <div className="text-[10px] text-gray-400 truncate max-w-[160px]">Trx: {p.transaction_id}</div>}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-[#1C251D] text-sm">{p.booking?.guests?.[0]?.name || p.booking?.user?.name || "N/A"}</div>
                      <div className="text-xs text-[#5F7161]">{p.booking?.guests?.[0]?.email || p.booking?.user?.email || "-"}</div>
                      {p.booking?.guests?.[0]?.phone && <div className="text-[11px] text-gray-400">{p.booking.guests[0].phone}</div>}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-[#5F7161] text-sm">{fmtRupiah(p.gross_amount)}</div>
                      <div className="text-[10px] text-gray-400">Total Payment</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-gray-400 text-lg">payments</span>
                        <span className="text-sm text-[#1C251D] font-medium">{fmtPaymentMethod(p.payment_method)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(p.payment_status)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelected(p)}
                          className="inline-flex items-center justify-center p-2 rounded-xl border border-[#E2DDD3] hover:bg-[#5F7161] hover:text-white hover:border-[#5F7161] transition-all"
                          title="View Detail"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <button
                          onClick={() => handleSync(p.order_id)}
                          disabled={syncing === p.order_id}
                          className={`inline-flex items-center justify-center p-2 rounded-xl border border-[#E2DDD3] hover:bg-[#5F7161] hover:text-white hover:border-[#5F7161] transition-all ${syncing === p.order_id ? 'animate-spin opacity-50' : ''}`}
                          title="Sync with Midtrans"
                        >
                          <span className="material-symbols-outlined text-[18px]">sync</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-12 text-center">
                    <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">receipt_long</span>
                    <p className="text-gray-400 text-sm italic">No transactions found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 bg-[#F7F6F2] border-t border-[#E8E2D9] flex items-center justify-between">
            <button
              disabled={currentPage === 1 || loading}
              onClick={() => fetchPayments(currentPage - 1)}
              className="px-4 py-2 text-sm font-bold text-[#5F7161] disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span> Previous
            </button>
            <span className="text-xs font-bold text-[#5F7161] uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
            <button
              disabled={currentPage === totalPages || loading}
              onClick={() => fetchPayments(currentPage + 1)}
              className="px-4 py-2 text-sm font-bold text-[#5F7161] disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Next <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1e1b16]/40 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-[#DCCFC0]/60 text-left" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#2D312C] text-white p-5 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-base">Transaction Detail</h3>
                <p className="text-xs opacity-70 mt-1">Order ID: {selected.order_id}</p>
                {selected.transaction_id && <p className="text-xs opacity-60">Trx ID: {selected.transaction_id}</p>}
              </div>
              <button onClick={() => setSelected(null)} className="text-white/70 hover:text-white p-1"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-[#5F7161] uppercase tracking-wider mb-1">Customer</p>
                  <p className="font-semibold text-[#1C251D]">{selected.booking?.guests?.[0]?.name || selected.booking?.user?.name || "-"}</p>
                  <p className="text-xs text-[#5F7161]">{selected.booking?.guests?.[0]?.email || selected.booking?.user?.email || "-"}</p>
                  <p className="text-xs text-gray-500">{selected.booking?.guests?.[0]?.phone || selected.booking?.user?.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#5F7161] uppercase tracking-wider mb-1">Payment</p>
                  <p className="font-semibold">{fmtPaymentMethod(selected.payment_method)} {selected.payment_method ? "" : "(belum ada)"}</p>
                  <div className="mt-1">{getStatusBadge(selected.payment_status)}</div>
                  <p className="text-xs text-gray-400 mt-1">Gross: {fmtRupiah(selected.gross_amount)}</p>
                </div>
              </div>

              <div className="bg-[#F7F6F2] rounded-xl p-4 border border-[#E2DDD3] space-y-2">
                <div className="flex justify-between text-xs"><span className="text-[#5F7161]">Booking Code</span><span className="font-mono font-bold">{selected.booking?.booking_code || selected.order_id}</span></div>
                <div className="flex justify-between text-xs"><span className="text-[#5F7161]">Check-in</span><span>{selected.booking?.check_in || "-"}</span></div>
                <div className="flex justify-between text-xs"><span className="text-[#5F7161]">Check-out</span><span>{selected.booking?.check_out || "-"}</span></div>
                <div className="flex justify-between text-xs"><span className="text-[#5F7161]">Booking Status</span><span className="font-semibold capitalize">{selected.booking?.status || "-"}</span></div>
                <div className="flex justify-between text-xs"><span className="text-[#5F7161]">Paid At</span><span>{selected.paid_at ? new Date(selected.paid_at).toLocaleString("id-ID") : "-"}</span></div>
                <div className="flex justify-between text-xs"><span className="text-[#5F7161]">Expired At</span><span>{selected.expired_at ? new Date(selected.expired_at).toLocaleString("id-ID") : "-"}</span></div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => handleSync(selected.order_id)} disabled={syncing === selected.order_id} className="flex-1 bg-[#5F7161] text-white py-2.5 rounded-xl text-sm font-bold hover:bg-[#4D5E4F] disabled:opacity-50 flex items-center justify-center gap-2">
                  <span className={`material-symbols-outlined text-base ${syncing === selected.order_id ? 'animate-spin' : ''}`}>sync</span> Sync with Midtrans
                </button>
                <button onClick={() => setSelected(null)} className="px-6 py-2.5 border border-[#E2DDD3] rounded-xl text-sm font-bold hover:bg-gray-50">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
