import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";

const STATUS_LABEL = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  paid: "Transferred",
};

const STATUS_CLASS = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
  paid: "bg-emerald-100 text-emerald-700",
};

const rupiah = (v) => "Rp " + Number(v || 0).toLocaleString("id-ID");

export default function FinancePayouts() {
  const [loading, setLoading] = useState(true);
  const [payouts, setPayouts] = useState([]);
  const [hotelBreakdown, setHotelBreakdown] = useState([]);
  const [summary, setSummary] = useState({
    total_gross: 0,
    platform_commission: 0,
    hotel_net_revenue: 0,
    commission_rate: 0,
  });
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  
  const [breakdownPage, setBreakdownPage] = useState(1);
  const [breakdownLastPage, setBreakdownLastPage] = useState(1);
  const [breakdownTotal, setBreakdownTotal] = useState(0);

  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/super-admin/payouts", {
        params: { 
            page, 
            breakdown_page: breakdownPage,
            status: status || undefined, 
            search: search || undefined 
        },
      });
      const result = res.data?.data || {};
      setPayouts(result.payouts?.data || []);
      
      const breakdown = result.hotel_breakdown || { data: [], pagination: null };
      setHotelBreakdown(breakdown.data || []);
      setBreakdownLastPage(breakdown.pagination?.last_page || 1);
      setBreakdownTotal(breakdown.pagination?.total || 0);

      setSummary(result.summary || {
        total_gross: 0,
        platform_commission: 0,
        hotel_net_revenue: 0,
        commission_rate: 0,
      });
      setLastPage(result.payouts?.last_page || 1);
      setTotal(result.payouts?.total || 0);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load finance data.");
    } finally {
      setLoading(false);
    }
  }, [page, breakdownPage, status, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 font-hanken">
      {/* Header */}
      <div>
        <h2 className="font-newsreader text-[32px] font-semibold text-[#4f604f] tracking-[-0.02em] leading-tight font-['Newsreader',serif]">
          Finance & Payouts
        </h2>
        <p className="font-hanken text-[14px] text-[#747872] mt-1">
          Monitor platform revenue and partner hotel withdrawals.
        </p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8]">
          <p className="text-xs text-[#747872] font-semibold uppercase tracking-wider">Total Gross Revenue</p>
          <p className="font-newsreader text-[28px] font-semibold text-[#191c1b] mt-2 leading-none">
            {rupiah(summary.total_gross)}
          </p>
          <p className="text-[11px] text-[#747872] mt-2 italic">Total successful payments across all hotels.</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8]">
          <p className="text-xs text-[#768875] font-semibold uppercase tracking-wider">Platform Commission ({(summary.commission_rate * 100).toFixed(0)}%)</p>
          <p className="font-newsreader text-[28px] font-semibold text-[#4f604f] mt-2 leading-none">
            {rupiah(summary.platform_commission)}
          </p>
          <p className="text-[11px] text-[#747872] mt-2 italic">Total revenue earned by H'Leven platform.</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8]">
          <p className="text-xs text-[#747872] font-semibold uppercase tracking-wider">Hotel Net Revenue</p>
          <p className="font-newsreader text-[28px] font-semibold text-[#191c1b] mt-2 leading-none">
            {rupiah(summary.hotel_net_revenue)}
          </p>
          <p className="text-[11px] text-[#747872] mt-2 italic">Net amount owed to all partner hotels.</p>
        </div>
      </div>

        {/* Hotel Revenue Breakdown Table */}
        <div className="bg-white rounded-lg shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8] overflow-hidden">
          <div className="p-6 border-b border-[#E5E0D8]">
            <h3 className="font-newsreader text-[20px] font-semibold text-[#191c1b]">Hotel Revenue Breakdown</h3>
            <p className="text-xs text-[#747872] mt-1">Detailed calculation of gross, commission, and net per partner.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F9F6F1] border-b border-[#E5E0D8] font-hanken text-[11px] font-bold text-[#434842] uppercase tracking-wider">
                  <th className="py-4 px-6">Hotel Name</th>
                  <th className="py-4 px-6">Total Gross</th>
                  <th className="py-4 px-6">Platform ({(summary.commission_rate * 100).toFixed(0)}%)</th>
                  <th className="py-4 px-6 text-right">Net Revenue</th>
                </tr>
              </thead>
              <tbody className="font-hanken text-[13px] text-[#191c1b] divide-y divide-[#E5E0D8]">
                {hotelBreakdown.length > 0 ? hotelBreakdown.map((h) => (
                  <tr key={h.id} className="hover:bg-[#F9F6F1]/50 transition-colors">
                    <td className="py-4 px-6 font-medium">{h.name}</td>
                    <td className="py-4 px-6">{rupiah(h.hotel_revenue)}</td>
                    <td className="py-4 px-6 text-[#A65A3D]">{rupiah(h.platform_commission)}</td>
                    <td className="py-4 px-6 text-right font-semibold text-[#4f604f]">{rupiah(h.hotel_net)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="py-10 text-center text-[#747872]">No revenue data found.</td></tr>
                )}
              </tbody>
              <tfoot className="bg-[#506147]/5 font-bold text-[#191c1b]">
                <tr>
                  <td className="py-4 px-6">TOTAL ALL PARTNERS</td>
                  <td className="py-4 px-6">{rupiah(summary.total_gross)}</td>
                  <td className="py-4 px-6 text-[#A65A3D]">{rupiah(summary.platform_commission)}</td>
                  <td className="py-4 px-6 text-right text-[#4f604f]">{rupiah(summary.hotel_net_revenue)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          {/* Breakdown Pagination */}
          <div className="bg-[#F9F6F1] border-t border-[#E5E0D8] p-4 flex flex-col md:flex-row justify-between items-center gap-4 text-[#747872] font-hanken">
            <span className="text-[13px] shrink-0">
              Showing {hotelBreakdown.length > 0 ? (breakdownPage - 1) * 10 + 1 : 0} to {Math.min(breakdownPage * 10, breakdownTotal)} of {breakdownTotal} hotels
            </span>
            <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-full">
              <button
                disabled={breakdownPage <= 1}
                onClick={() => setBreakdownPage((p) => p - 1)}
                className="px-3 py-1 border border-[#E5E0D8] rounded-md bg-white hover:bg-[#F9F6F1] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-[13px] font-medium text-[#434842]"
              >
                Prev
              </button>
              {Array.from({ length: breakdownLastPage }, (_, i) => i + 1)
                .filter(n => Math.abs(n - breakdownPage) <= 2 || n === 1 || n === breakdownLastPage)
                .map((pageNum, idx, arr) => (
                  <React.Fragment key={pageNum}>
                    {idx > 0 && arr[idx-1] !== pageNum - 1 && <span className="px-1">...</span>}
                    <button
                      onClick={() => setBreakdownPage(pageNum)}
                      className={`px-3 py-1 border rounded-md text-[13px] font-medium transition-colors ${
                        breakdownPage === pageNum
                          ? "bg-[#768875] text-white border-[#768875]"
                          : "bg-white border-[#E5E0D8] text-[#434842] hover:bg-[#F9F6F1]"
                      }`}
                    >
                      {pageNum}
                    </button>
                  </React.Fragment>
                ))}
              <button
                disabled={breakdownPage >= breakdownLastPage}
                onClick={() => setBreakdownPage((p) => p + 1)}
                className="px-3 py-1 border border-[#E5E0D8] rounded-md bg-white hover:bg-[#F9F6F1] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-[13px] font-medium text-[#434842]"
              >
                Next
              </button>
            </div>
          </div>
        </div>


      {/* Payout History Table */}
      <div className="bg-white rounded-lg shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8] overflow-hidden">
        <div className="p-6 border-b border-[#E5E0D8] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="font-newsreader text-[20px] font-semibold text-[#191c1b]">Withdrawal & Payout History</h3>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#747872] text-[18px] pointer-events-none">
                search
              </span>
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Cari hotel..."
                className="w-full pl-9 pr-4 py-1.5 bg-[#fcfcfc] border border-[#E5E0D8] rounded-lg font-hanken text-[13px] text-[#191c1b] focus:outline-none focus:border-[#768875] transition-all"
              />
            </div>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="px-3 py-1.5 bg-[#fcfcfc] border border-[#E5E0D8] rounded-lg font-hanken text-[13px] text-[#191c1b] focus:outline-none focus:border-[#768875] cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="paid">Transferred</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-[#E5E0D8] border-t-[#768875] rounded-full animate-spin"></div>
            <p className="font-hanken text-[14px] text-[#747872]">Loading finance data...</p>
          </div>
        ) : payouts.length === 0 ? (
          <p className="py-12 text-center text-[#747872] font-hanken text-[14px]">No withdrawal data found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F9F6F1] border-b border-[#E5E0D8] font-hanken text-[11px] font-bold text-[#434842] uppercase tracking-wider">
                  <th className="py-4 px-6">Hotel Info</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Bank Account</th>
                   <th className="py-4 px-6">Status</th>
                   <th className="py-4 px-6 text-right">Requested At</th>
                </tr>
              </thead>
              <tbody className="font-hanken text-[14px] text-[#191c1b] divide-y divide-[#E5E0D8]">
                {payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F9F6F1]/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-medium text-[#191c1b]">{p.hotel?.name || "-"}</div>
                      <div className="text-[12px] text-[#747872]">{p.requester?.email || "-"}</div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-[#191c1b]">{rupiah(p.amount)}</td>
                    <td className="py-4 px-6 text-[#434842]">
                      <div className="text-sm">{p.bank_name}</div>
                      <div className="text-[11px] text-[#747872]">{p.bank_account_number} — {p.bank_account_name}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_CLASS[p.status] || "bg-gray-100 text-gray-700"}`}>
                        {STATUS_LABEL[p.status] || p.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-[#747872] text-xs">
                      {p.requested_at ? new Date(p.requested_at).toLocaleString("id-ID", { dateStyle: "medium" }) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="bg-[#F9F6F1] border-t border-[#E5E0D8] p-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#747872] font-hanken">
          <span>Displaying {payouts.length} of {total} entries</span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 border border-[#E5E0D8] rounded-md bg-white hover:bg-[#F9F6F1] disabled:opacity-40 font-medium text-[#434842]"
            >
              Prev
            </button>
            <span className="font-medium text-[#191c1b] px-2">{page} / {lastPage}</span>
            <button
              disabled={page >= lastPage}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border border-[#E5E0D8] rounded-md bg-white hover:bg-[#F9F6F1] disabled:opacity-40 font-medium text-[#434842]"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-[#506147]/5 border border-[#506147]/20 rounded-lg p-5">
        <h4 className="text-[#4f604f] font-semibold text-sm mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">info</span>
          Monitoring Note
        </h4>
        <p className="text-xs text-[#434842] leading-relaxed">
          The system is currently configured for <strong>Automatic Approval</strong> for all hotel payout requests to simulate the workflow. 
          Financial figures are calculated based on successful payment transactions. 
          Platform commission is calculated at {summary.commission_rate * 100}% of the gross amount.
        </p>
      </div>
    </div>
  );
}
