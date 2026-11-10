import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { cachedGet, getCachedData, getCacheKey } from "../../services/apiCache";
import { toast } from "react-hot-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const Reports = () => {
  // Date Filter State
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const cachedBookings = getCachedData(getCacheKey("/reports/bookings"))?.data || null;
  const cachedRevenue = getCachedData(getCacheKey("/reports/revenue"))?.data || null;
  const cachedUsers = getCachedData(getCacheKey("/reports/users"))?.data || null;

  const hasCache = !!(cachedBookings || cachedRevenue || cachedUsers);

  const [loading, setLoading] = useState(!hasCache);
  const [error, setError] = useState(false);

  // Report Data State
  const [data, setData] = useState({
    bookings: cachedBookings || {},
    revenue: cachedRevenue || {},
    users: cachedUsers || {},
    financial: null,
    top_bookings: [],
    top_revenue: [],
  });

  // Export State
  const [exportType, setExportType] = useState("booking");
  const [isExporting, setIsExporting] = useState(false);

  // Rupiah formatter
  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number || 0);
  };

  const fetchReports = async (forceRefresh = false) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const bKey = getCacheKey("/reports/bookings", params);
    const rKey = getCacheKey("/reports/revenue", params);
    const uKey = getCacheKey("/reports/users", params);

    const bCached = getCachedData(bKey);
    const rCached = getCachedData(rKey);
    const uCached = getCachedData(uKey);

    if (!forceRefresh && (bCached || rCached || uCached)) {
      setData({
        bookings: bCached?.data || bCached || {},
        revenue: rCached?.data || rCached || {},
        users: uCached?.data || uCached || {},
      });
      setLoading(false);
    } else if (!hasCache || forceRefresh) {
      if (!data.bookings.total && !data.revenue.total_revenue) setLoading(true);
    }

    try {
      setError(false);

      // Run API requests concurrently
      const [bookingRes, revenueRes, userRes, summaryRes] = await Promise.all([
        cachedGet("/reports/bookings", { params }, forceRefresh),
        cachedGet("/reports/revenue", { params }, forceRefresh),
        cachedGet("/reports/users", { params }, forceRefresh),
        cachedGet("/reports/summary", { params }, forceRefresh),
      ]);

      setData({
        bookings: bookingRes.data?.data || bookingRes.data || {},
        revenue: revenueRes.data?.data || revenueRes.data || {},
        users: userRes.data?.data || userRes.data || {},
        financial: summaryRes.data?.data?.financial || null,
        top_bookings: summaryRes.data?.data?.top_bookings || [],
        top_revenue: summaryRes.data?.data?.top_revenue || [],
      });
      if (forceRefresh) {
        toast.success("Report data refreshed successfully");
      }
    } catch (err) {
      console.error("Failed to fetch report data:", err);
      if (!data.bookings.total && !data.revenue.total_revenue) setError(true);
      toast.error("Failed to load report data. Ensure backend server is running.");
    } finally {
      setLoading(false);
    }
  };

    // Fetch summary data for financial & top hotels
    const fetchSummary = async (forceRefresh = false) => {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const sKey = getCacheKey('/reports/summary', params);
      const sCached = getCachedData(sKey);

      if (!forceRefresh && sCached) {
        setData(prev => ({
          ...prev,
          financial: sCached.data?.financial || null,
          top_bookings: sCached.data?.top_bookings || [],
          top_revenue: sCached.data?.top_revenue || [],
        }));
        return;
      }

      try {
        const res = await cachedGet('/reports/summary', { params }, forceRefresh);
        setData(prev => ({
          ...prev,
          financial: res.data?.data?.financial || null,
          top_bookings: res.data?.data?.top_bookings || [],
          top_revenue: res.data?.data?.top_revenue || [],
        }));
      } catch (err) {
        console.error('Failed to fetch summary data:', err);
      }
    };

    useEffect(() => {
      fetchReports();
      fetchSummary();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startDate, endDate]);


  // Export Function (Download Excel / CSV / PDF)
  const handleExport = async (format) => {
    try {
      setIsExporting(true);
      toast.loading(`Preparing ${exportType.toUpperCase()} report (${format.toUpperCase()})...`, {
        id: "export-toast",
      });

      const params = {
        type: exportType,
        format: format,
      };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      try {
        await api.get("/reports/export", { params });
      } catch (err) {
        console.warn("Backend export request logged:", err);
      }

      const fileName = `HLeven_SuperAdmin_Report_${exportType}_${startDate || 'start'}_${endDate || 'end'}`;

        if (format === "excel") {
          let csvContent = "\uFEFF";
          csvContent += `H'LEVEN SUPER ADMIN SYSTEM REPORT\n`;
          csvContent += `Report Type,${exportType.toUpperCase()}\n`;
          csvContent += `Date Range,${startDate || 'All Time'} to ${endDate || 'Present'}\n`;
          csvContent += `Generated At,${new Date().toLocaleString("en-US")}\n\n`;

          csvContent += `FINANCIAL BREAKDOWN\n`;
          csvContent += `Metric,Value\n`;
          csvContent += `Gross Revenue,${formatRupiah(data.financial?.gross_revenue || 0)}\n`;
          csvContent += `Platform Commission,${formatRupiah(data.financial?.platform_commission || 0)}\n`;
          csvContent += `Hotel Net Revenue,${formatRupiah(data.financial?.hotel_net_revenue || 0)}\n\n`;

          csvContent += `SUMMARY METRICS\n`;
          csvContent += `Metric,Value\n`;
          csvContent += `Completed Bookings,${data.bookings?.completed || 0}\n`;
          csvContent += `Pending Bookings,${data.bookings?.pending || 0}\n`;
          csvContent += `Cancelled Bookings,${data.bookings?.cancelled || 0}\n`;
          csvContent += `Total Users,${data.users?.total_users || 0}\n\n`;

          if (data.top_bookings?.length > 0) {
            csvContent += `TOP BOOKING HOTELS\nName,Bookings\n`;
            data.top_bookings.forEach(h => csvContent += `"${h.name}",${h.value}\n`);
            csvContent += `\n`;
          }

          if (data.top_revenue?.length > 0) {
            csvContent += `TOP REVENUE HOTELS\nName,Revenue\n`;
            data.top_revenue.forEach(h => csvContent += `"${h.name}",${h.value}\n`);
            csvContent += `\n`;
          }

          if (data.revenue?.trend && data.revenue.trend.length > 0) {
            csvContent += `DAILY REVENUE TREND\n`;
            csvContent += `Date,Revenue (IDR)\n`;
            data.revenue.trend.forEach((item) => {
              csvContent += `"${item.date}",${item.total}\n`;
            });
          }


        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${fileName}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success(`Excel report (${exportType.toUpperCase()}) downloaded successfully!`, {
          id: "export-toast",
        });
      } else if (format === "pdf") {
        const printWin = window.open("", "_blank");
        if (!printWin) {
          toast.error("Pop-up blocked by browser. Allow pop-ups to print PDF.", {
            id: "export-toast",
          });
          return;
        }

        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>${fileName}</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #191c1b; background: #fff; }
              .header { border-bottom: 2px solid #4f604f; padding-bottom: 20px; margin-bottom: 30px; }
              .header h1 { margin: 0; color: #4f604f; font-size: 24px; font-family: 'Newsreader', serif; }
              .header p { margin: 8px 0 0; color: #747872; font-size: 13px; }
              .section-title { font-size: 16px; color: #4f604f; font-weight: 700; margin-top: 30px; margin-bottom: 15px; border-bottom: 1px solid #E5E0D8; padding-bottom: 5px; }
              .grid-financial { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
              .grid-hotels { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
              .card { border: 1px solid #E5E0D8; padding: 15px; border-radius: 8px; background: #F9F6F1; }
              .card-title { font-size: 10px; color: #747872; text-transform: uppercase; font-weight: 700; }
              .card-value { font-size: 18px; color: #191c1b; font-weight: bold; margin-top: 5px; }
              table { width: 100%; border-collapse: collapse; font-size: 12px; }
              th { background: #4f604f; color: white; text-align: left; padding: 8px; }
              td { border-bottom: 1px solid #E5E0D8; padding: 8px; }
              tr:nth-child(even) { background: #f9f9f9; }
              .footer { margin-top: 40px; font-size: 11px; color: #747872; text-align: center; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>H'Leven System Report</h1>
              <p>Type: <strong>${exportType.toUpperCase()}</strong> | Range: <strong>${startDate || 'All Time'}</strong> to <strong>${endDate || 'Present'}</strong></p>
            </div>

            <div class="section-title">Financial Breakdown</div>
            <div class="grid-financial">
              <div class="card"><div class="card-title">Gross Revenue</div><div class="card-value">${formatRupiah(data.financial?.gross_revenue || 0)}</div></div>
              <div class="card"><div class="card-title">Platform Commission</div><div class="card-value">${formatRupiah(data.financial?.platform_commission || 0)}</div></div>
              <div class="card"><div class="card-title">Hotel Net Revenue</div><div class="card-value">${formatRupiah(data.financial?.hotel_net_revenue || 0)}</div></div>
            </div>

            <div class="section-title">Operational Summary</div>
            <div class="grid-financial">
              <div class="card"><div class="card-title">Completed Bookings</div><div class="card-value">${(data.bookings?.completed || 0).toLocaleString()}</div></div>
              <div class="card"><div class="card-title">Registered Users</div><div class="card-value">${(data.users?.total_users || 0).toLocaleString()}</div></div>
            </div>

            <div class="grid-hotels">
              <div>
                <div class="section-title">Top Booking Hotels</div>
                <table>
                  <thead><tr><th>Name</th><th>Bookings</th></tr></thead>
                  <tbody>${data.top_bookings?.map(h => `<tr><td>${h.name}</td><td>${h.value}</td></tr>`).join('') || ''}</tbody>
                </table>
              </div>
              <div>
                <div class="section-title">Top Revenue Hotels</div>
                <table>
                  <thead><tr><th>Name</th><th>Revenue</th></tr></thead>
                  <tbody>${data.top_revenue?.map(h => `<tr><td>${h.name}</td><td>${formatRupiah(h.value)}</td></tr>`).join('') || ''}</tbody>
                </table>
              </div>
            </div>

            ${data.revenue?.trend && data.revenue.trend.length > 0 ? `
              <div class="section-title">Daily Revenue Trend</div>
              <table>
                <thead><tr><th>Date</th><th>Revenue</th></tr></thead>
                <tbody>${data.revenue.trend.map(t => `<tr><td>${t.date}</td><td>${formatRupiah(t.total)}</td></tr>`).join('')}</tbody>
              </table>
            ` : ''}

            <div class="footer">Generated by H'Leven System | ${new Date().toLocaleString()}</div>
            <script>window.onload = function() { window.print(); };</script>
          </body>
          </html>
        `;

        printWin.document.write(html);
        printWin.document.close();
        toast.success("Opening print dialog for PDF...", { id: "export-toast" });
      }
    } catch (err) {
      console.error(err);
       toast.error("Failed to export report.", { id: "export-toast" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 font-hanken">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="font-newsreader text-[32px] font-semibold text-[#4f604f] tracking-[-0.02em] leading-tight font-['Newsreader',serif]">
              System Report
            </h2>
          <p className="font-hanken text-[14px] text-[#747872] mt-1">
            Generate comprehensive insights and monitor system performance.
          </p>
        </div>

        <button
          onClick={() => fetchReports(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 border border-[#E5E0D8] rounded-lg bg-white text-[#434842] hover:bg-[#F9F6F1] transition-all font-hanken text-[13px] font-semibold shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Control Bar Card (Date Filter + Export Type + Export Buttons) */}
      <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8] flex flex-col xl:flex-row items-stretch xl:items-end gap-6 justify-between">
        {/* Date & Type Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
          {/* Start Date */}
          <div className="flex flex-col gap-1.5">
            <label className="font-hanken text-[11px] font-semibold tracking-[0.05em] uppercase text-[#747872]">
              START DATE
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-10 px-3.5 rounded-lg border border-[#E5E0D8] text-[#191c1b] bg-white font-hanken text-[13.5px] focus:outline-none focus:border-[#768875] focus:ring-2 focus:ring-[#768875]/20 transition-all"
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col gap-1.5">
            <label className="font-hanken text-[11px] font-semibold tracking-[0.05em] uppercase text-[#747872]">
              END DATE
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full h-10 px-3.5 rounded-lg border border-[#E5E0D8] text-[#191c1b] bg-white font-hanken text-[13.5px] focus:outline-none focus:border-[#768875] focus:ring-2 focus:ring-[#768875]/20 transition-all"
            />
          </div>

          {/* Export Type */}
          <div className="flex flex-col gap-1.5">
            <label className="font-hanken text-[11px] font-semibold tracking-[0.05em] uppercase text-[#747872]">
              EXPORT TYPE
            </label>
            <select
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
              className="w-full h-10 px-3.5 rounded-lg border border-[#E5E0D8] text-[#191c1b] bg-white font-hanken text-[13.5px] focus:outline-none focus:border-[#768875] focus:ring-2 focus:ring-[#768875]/20 transition-all cursor-pointer"
            >
              <option value="booking">Booking</option>
              <option value="revenue">Revenue</option>
              <option value="user">User</option>
              <option value="refund">Refund</option>
              <option value="hotel">Hotel</option>
              <option value="partner">Partner</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              className="h-10 px-4 rounded-lg bg-white border border-[#E5E0D8] text-[#747872] hover:bg-[#F9F6F1] font-hanken text-[13px] font-medium transition-all"
            >
              Reset
            </button>
          )}

          <button
            onClick={() => handleExport("pdf")}
            disabled={isExporting}
            className="flex-1 sm:flex-none px-5 h-10 rounded-lg bg-[#768875] text-white font-hanken text-[13.5px] font-semibold tracking-[0.01em] flex items-center justify-center gap-2 hover:bg-[#657764] transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">
              picture_as_pdf
            </span>
            <span>Export PDF</span>
          </button>

          <button
            onClick={() => handleExport("excel")}
            disabled={isExporting}
            className="flex-1 sm:flex-none px-5 h-10 rounded-lg bg-transparent border border-[#768875] text-[#768875] font-hanken text-[13.5px] font-semibold tracking-[0.01em] flex items-center justify-center gap-2 hover:bg-[#768875]/10 transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">
              table_view
            </span>
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {error ? (
        <div className="bg-[#ffdad6] border border-[#ffbab1] text-[#93000a] px-6 py-6 rounded-xl text-center space-y-3 font-hanken">
          <p className="font-medium">An error occurred while loading report data.</p>
          <button
            onClick={fetchReports}
            className="px-4 py-2 bg-[#ba1a1a] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-[#E5E0D8] border-t-[#768875] rounded-full animate-spin"></div>
          <p className="font-hanken text-[14px] text-[#747872]">Loading system analytics...</p>
        </div>
      ) : (
        <>
          {/* Financial Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8]">
              <div className="text-[#747872] text-[11px] font-semibold uppercase tracking-wider mb-1">Gross Revenue</div>
              <div className="text-[24px] font-bold text-[#191c1b]">{formatRupiah(data.financial?.gross_revenue || 0)}</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8]">
              <div className="text-[#747872] text-[11px] font-semibold uppercase tracking-wider mb-1">Platform Commission</div>
              <div className="text-[24px] font-bold text-[#4f604f]">{formatRupiah(data.financial?.platform_commission || 0)}</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8]">
              <div className="text-[#747872] text-[11px] font-semibold uppercase tracking-wider mb-1">Hotel Net Revenue</div>
              <div className="text-[24px] font-bold text-[#625b51]">{formatRupiah(data.financial?.hotel_net_revenue || 0)}</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Section: Daily Revenue Trend */}
            <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8]">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E5E0D8]">
                <div>
                  <h3 className="font-newsreader text-[20px] font-medium text-[#4f604f]">
                    Daily Revenue Trend
                  </h3>
                  <p className="font-hanken text-[13px] text-[#747872] mt-0.5">
                    Hotel operational revenue performance visualization
                  </p>
                </div>
              </div>

              <div className="w-full h-80">
                {data.revenue?.trend && data.revenue.trend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={data.revenue.trend}
                      margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#E5E0D8"
                      />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#747872", fontSize: 12, fontFamily: "Hanken Grotesk" }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#747872", fontSize: 12, fontFamily: "Hanken Grotesk" }}
                        tickFormatter={(value) => {
                          if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
                          if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                          return value;
                        }}
                      />
                      <Tooltip
                        formatter={(value) => [formatRupiah(value), "Revenue"]}
                        labelStyle={{
                          color: "#191c1b",
                          fontWeight: "600",
                          fontFamily: "Hanken Grotesk",
                        }}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid #E5E0D8",
                          boxShadow: "0 4px 20px rgba(47,50,49,0.06)",
                          fontFamily: "Hanken Grotesk",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#768875"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                        activeDot={{ r: 6, fill: "#768875", stroke: "#fff", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full bg-[#F9F6F1]/50 rounded-lg flex items-center justify-center border border-[#E5E0D8] border-dashed">
                    <span className="text-[#747872] font-hanken text-[14px]">
                      No revenue data for the selected date range.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Pie Chart: Booking Status */}
            <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8]">
              <div className="mb-6 pb-4 border-b border-[#E5E0D8]">
                <h3 className="font-newsreader text-[20px] font-medium text-[#4f604f]">
                  Booking Distribution
                </h3>
                <p className="font-hanken text-[13px] text-[#747872] mt-0.5">
                  Status breakdown
                </p>
              </div>
              <div className="w-full h-60">
                {data.bookings?.distribution && Object.keys(data.bookings.distribution).length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(data.bookings.distribution).map(([name, value]) => ({ name, value }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {Object.entries(data.bookings.distribution).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#768875', '#ba1a1a', '#DED3C7', '#f59e0b'][index % 4]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#747872] font-hanken text-[14px]">
                    No distribution data.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Top Hotels Tables Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Top Booking Hotels */}
            <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8]">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#E5E0D8]">
                <h3 className="font-newsreader text-[18px] font-medium text-[#4f604f]">Top Booking Hotels</h3>
                <a href="/super-admin/hotels" className="text-xs font-semibold text-[#768875] hover:underline">View All</a>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-[#F9F6F1] text-[#434842] text-xs uppercase">
                      <th className="py-2.5 px-4">Hotel Name</th>
                      <th className="py-2.5 px-4 text-right">Bookings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E0D8]">
                    {data.top_bookings?.length > 0 ? (
                      data.top_bookings.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#F9F6F1]/50">
                          <td className="py-3 px-4 font-medium text-[#191c1b]">{item.name}</td>
                          <td className="py-3 px-4 text-right font-semibold">{item.value}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="py-6 text-center text-[#747872]">No data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Revenue Hotels */}
            <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8]">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#E5E0D8]">
                <h3 className="font-newsreader text-[18px] font-medium text-[#4f604f]">Top Revenue Hotels</h3>
                <a href="/super-admin/hotels" className="text-xs font-semibold text-[#768875] hover:underline">View All</a>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-[#F9F6F1] text-[#434842] text-xs uppercase">
                      <th className="py-2.5 px-4">Hotel Name</th>
                      <th className="py-2.5 px-4 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E0D8]">
                    {data.top_revenue?.length > 0 ? (
                      data.top_revenue.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#F9F6F1]/50">
                          <td className="py-3 px-4 font-medium text-[#191c1b]">{item.name}</td>
                          <td className="py-3 px-4 text-right font-semibold">{formatRupiah(item.value)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="py-6 text-center text-[#747872]">No data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;