import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from "recharts";

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // State untuk data laporan
  const [data, setData] = useState({
    bookings: {},
    revenue: {},
    users: {},
  });

  // State untuk Filter Tanggal
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // State untuk Export
  const [exportType, setExportType] = useState("booking");
  const [isExporting, setIsExporting] = useState(false);

  // Helper untuk format Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number || 0);
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(false);

      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      // Menjalankan request API secara bersamaan
      const [bookingRes, revenueRes, userRes] = await Promise.all([
        api.get("/reports/bookings", { params }),
        api.get("/reports/revenue", { params }),
        api.get("/reports/users", { params }),
      ]);

      setData({
        bookings: bookingRes.data?.data || bookingRes.data || {},
        revenue: revenueRes.data?.data || revenueRes.data || {},
        users: userRes.data?.data || userRes.data || {},
      });
    } catch (err) {
      console.error("Gagal mengambil data laporan:", err);
      setError(true);
      toast.error("Gagal memuat data laporan. Pastikan server backend berjalan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  // Fungsi untuk Export (Download File)
  const handleExport = async (format) => {
    try {
      setIsExporting(true);
      toast.loading(`Mempersiapkan laporan ${format.toUpperCase()}...`, {
        id: "export-toast",
      });

      const params = {
        type: exportType,
        format: format,
      };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await api.get("/reports/export", { params });

      const downloadUrl = response.data?.download_url;

      if (downloadUrl) {
        const finalUrl = downloadUrl.startsWith("http")
          ? downloadUrl
          : `http://localhost:8000${downloadUrl}`;

        window.open(finalUrl, "_blank");
        toast.success(response.data?.message || "Laporan berhasil diunduh!", {
          id: "export-toast",
        });
      } else {
        toast.success(
          response.data?.message || "File laporan berhasil dibuat.",
          { id: "export-toast" }
        );
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Gagal mengekspor laporan.",
        { id: "export-toast" }
      );
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
            Reports &amp; Analytics
          </h2>
          <p className="font-hanken text-[14px] text-[#747872] mt-1">
            Generate comprehensive insights and monitor system performance.
          </p>
        </div>

        <button
          onClick={fetchReports}
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
              <option value="refund">Refund (Pengembalian)</option>
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
          <p className="font-medium">Terjadi kesalahan saat memuat data laporan.</p>
          <button
            onClick={fetchReports}
            className="px-4 py-2 bg-[#ba1a1a] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Coba Lagi
          </button>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-[#E5E0D8] border-t-[#768875] rounded-full animate-spin"></div>
          <p className="font-hanken text-[14px] text-[#747872]">Memuat analitik sistem...</p>
        </div>
      ) : (
        <>
          {/* Summary Section (3 Cards matching reports.html) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Total Revenue */}
            <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8] flex flex-col justify-between min-h-[150px]">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-newsreader text-[20px] font-medium text-[#191c1b]">
                  Total Revenue
                </h3>
                <div className="w-8 h-8 rounded-full bg-[#F9F6F1] flex items-center justify-center text-[#768875]">
                  <span className="material-symbols-outlined text-[20px]">
                    payments
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-3">
                  <span className="font-newsreader text-[32px] font-semibold text-[#191c1b] tracking-[-0.02em] leading-tight">
                    {formatRupiah(data.revenue?.total_revenue)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[#768875] font-hanken text-[12px] font-semibold mt-1">
                  <span className="material-symbols-outlined text-[16px]">
                    trending_up
                  </span>
                  <span>+12.5% vs last period</span>
                </div>
              </div>
            </div>

            {/* Card 2: Completed Bookings */}
            <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8] flex flex-col justify-between min-h-[150px]">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-newsreader text-[20px] font-medium text-[#191c1b]">
                  Completed Bookings
                </h3>
                <div className="w-8 h-8 rounded-full bg-[#F9F6F1] flex items-center justify-center text-[#4f604f]">
                  <span className="material-symbols-outlined text-[20px]">
                    check_circle
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-3">
                  <span className="font-newsreader text-[32px] font-semibold text-[#191c1b] tracking-[-0.02em] leading-tight">
                    {(data.bookings?.completed || 0).toLocaleString("id-ID")}
                  </span>
                  <span className="font-hanken text-[13px] text-[#747872]">
                    transaksi
                  </span>
                </div>
                <div className="flex gap-3 text-[12px] text-[#747872] mt-1 font-hanken">
                  <span>
                    Pending:{" "}
                    <strong className="text-[#DED3C7] text-gray-700">
                      {data.bookings?.pending || 0}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Batal:{" "}
                    <strong className="text-[#ba1a1a]">
                      {data.bookings?.cancelled || 0}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Registered Users */}
            <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8] flex flex-col justify-between min-h-[150px]">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-newsreader text-[20px] font-medium text-[#191c1b]">
                  Registered Users
                </h3>
                <div className="w-8 h-8 rounded-full bg-[#F9F6F1] flex items-center justify-center text-[#625b51]">
                  <span className="material-symbols-outlined text-[20px]">
                    group
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-3">
                  <span className="font-newsreader text-[32px] font-semibold text-[#191c1b] tracking-[-0.02em] leading-tight">
                    {(data.users?.total_users || 0).toLocaleString("id-ID")}
                  </span>
                  <span className="font-hanken text-[13px] text-[#747872]">
                    pengguna
                  </span>
                </div>
                <p className="font-hanken text-[12px] text-[#768875] font-semibold mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">
                    trending_up
                  </span>
                  <span>+{data.users?.new_users || 0} bulan ini</span>
                </p>
              </div>
            </div>
          </div>

          {/* Chart Section: Daily Revenue Trend */}
          <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8]">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E5E0D8]">
              <div>
                <h3 className="font-newsreader text-[20px] font-medium text-[#4f604f]">
                  Daily Revenue Trend
                </h3>
                <p className="font-hanken text-[13px] text-[#747872] mt-0.5">
                  Visualisasi performa pendapatan operasional hotel
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
                      formatter={(value) => [formatRupiah(value), "Pendapatan"]}
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
                    Tidak ada data pendapatan untuk rentang tanggal yang dipilih.
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;