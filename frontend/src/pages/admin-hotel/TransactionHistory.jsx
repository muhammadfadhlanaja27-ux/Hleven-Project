import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";

const fmtRupiah = (val) =>
  "Rp " + Number(val || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 });

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const datePart = String(dateStr).match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  const date = datePart ? new Date(`${datePart}T00:00:00`) : new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
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
  return map[m] || String(raw).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
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
      const params = new URLSearchParams({ page: String(page), per_page: "10" });
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
              if (e?.response?.data?.not_midtrans || e?.response?.status === 404) skippedSyncRef.current.add(p.order_id);
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
      } catch {} finally { tickingRef.current = false; }
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
        toast("Manual transaction / not in Midtrans.", { icon: "ℹ️" });
        return;
      }
      if (response.data.success) {
        toast.success("Success, transaction status updated.");
        skippedSyncRef.current.delete(orderId);
        fetchPayments(currentPage, true);
      }
    } catch (error) {
      const d = error?.response?.data;
      if (d?.not_midtrans || error?.response?.status === 404) {
        skippedSyncRef.current.add(orderId);
        toast("Transaction not found in Midtrans.", { icon: "ℹ️" });
      } else {
        toast.error("Failed to sync with Midtrans.");
      }
    } finally { setSyncing(null); }
  };

  const getStatusBadge = (status) => {
    const s = String(status || "").toLowerCase();
    const style = "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider";
    switch (s) {
      case "success": case "settlement": case "capture": return <span className={`${style} bg-[#E4EBE0] text-[#4A5D43]`}>Success</span>;
      case "pending": return <span className={`${style} bg-[#FFF0E0] text-[#9B5235]`}>Pending</span>;
      case "expire": case "expired": case "failure": case "failed": return <span className={`${style} bg-[#FFDAD6] text-[#93000A]`}>Failed/Expired</span>;
      case "cancel": case "cancelled": return <span className={`${style} bg-[#F0EDE9] text-[#6B6E6A]`}>Cancelled</span>;
      default: return <span className={`${style} bg-gray-100 text-gray-700`}>{status || "—"}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf9f5] text-[#1c1c1a] font-['Hanken_Grotesk',sans-serif] p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h2 className="font-['Newsreader',serif] text-3xl sm:text-4xl font-semibold text-[#2D312C] tracking-tight">
              Transaction History
            </h2>
            <p className="text-base text-[#6B6E6A] mt-1">Monitor guest payments and manage transaction statuses.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#E5E1DA] bg-white px-4 py-2 text-[11px] font-semibold text-[#506147]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#506147] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#506147]"></span>
            </span>
            AUTO-SYNC ON
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-2xl border border-[#E5E1DA] p-6 shadow-[0px_4px_24px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-[#6B6E6A]">tune</span>
            <h3 className="font-semibold text-[#2D312C]">Filter Transaksi</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order/guest..." className="h-11 px-4 rounded-xl border border-[#E5E1DA] text-sm focus:border-[#506147] outline-none" />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-11 px-4 rounded-xl border border-[#E5E1DA] text-sm focus:border-[#506147] outline-none">
              <option value="">All Statuses</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-11 px-4 rounded-xl border border-[#E5E1DA] text-sm focus:border-[#506147] outline-none" />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-11 px-4 rounded-xl border border-[#E5E1DA] text-sm focus:border-[#506147] outline-none" />
          </div>
        </div>

        {/* Transaction Table */}
        <div className="bg-white rounded-2xl border border-[#E5E1DA] overflow-hidden shadow-[0px_4px_24px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#F9F6F1] border-b border-[#E5E1DA]">
                <tr>
                  {["Order Info", "Customer", "Total Amount", "Method", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-4 text-[12px] font-bold text-[#757870] uppercase tracking-[0.1em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EDE9]">
                {loading ? (
                  Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan="6" className="p-8"><div className="h-12 bg-gray-100 rounded-xl animate-pulse"></div></td></tr>)
                ) : payments.length > 0 ? (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-[#A8BBA2]/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-[#2D312C]">{p.order_id}</div>
                        <div className="text-[11px] text-[#6B6E6A] mt-1">{formatDate(p.created_at)}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">{p.booking?.guests?.[0]?.name || "N/A"}</td>
                      <td className="px-6 py-4 text-sm font-bold text-[#506147]">{fmtRupiah(p.gross_amount)}</td>
                      <td className="px-6 py-4 text-sm font-medium">{fmtPaymentMethod(p.payment_method)}</td>
                      <td className="px-6 py-4">{getStatusBadge(p.payment_status)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setSelected(p)} className="p-2 text-[#506147] hover:bg-[#E4EBE0] rounded-lg transition-colors"><span className="material-symbols-outlined text-[20px]">visibility</span></button>
                          <button onClick={() => handleSync(p.order_id)} className={`p-2 text-[#506147] hover:bg-[#E4EBE0] rounded-lg ${syncing === p.order_id ? 'animate-spin' : ''}`}><span className="material-symbols-outlined text-[20px]">sync</span></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="py-24 text-center text-sm text-[#6B6E6A]">No transactions found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Detail */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-[#2D312C]/40 backdrop-blur-sm animate-fadeIn" onClick={() => setSelected(null)}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl border border-[#E5E1DA] max-w-lg w-full z-10 p-8 animate-slideUp">
               <h3 className="font-['Newsreader',serif] text-2xl font-semibold text-[#2D312C] mb-6">Transaction Details</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b pb-2"><span className="text-[#6B6E6A]">Order ID</span><span className="font-bold">{selected.order_id}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-[#6B6E6A]">Pelanggan</span><span className="font-bold">{selected.booking?.guests?.[0]?.name}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-[#6B6E6A]">Total</span><span className="font-bold text-[#506147]">{fmtRupiah(selected.gross_amount)}</span></div>
              </div>
              <div className="mt-8 flex gap-3">
                 <button onClick={() => setSelected(null)} className="flex-1 h-11 border border-[#E5E0D8] rounded-xl font-bold hover:bg-[#F9F6F1]">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;