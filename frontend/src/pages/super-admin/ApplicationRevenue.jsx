import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#4f604f", "#768875", "#b9ccb6", "#DED3C7", "#A65A3D"];

const formatRupiah = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n || 0);

const shortRupiah = (v) => {
  if (!v) return "0";
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}M`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(0)}jt`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}rb`;
  return String(v);
};

const ApplicationRevenue = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("platform_commission");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [summary, setSummary] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchData = async () => {
    try {
      setError(false);
      if (hotels.length === 0) setLoading(true);
      const params = { sort_by: sortBy, sort_dir: sortDir, page, per_page: perPage };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (search) params.search = search;
      const res = await api.get("/super-admin/dashboard/hotel-commission", { params });
      const d = res.data?.data || {};
      setSummary(d.summary || null);
      setHotels(Array.isArray(d.hotels) ? d.hotels : []);
      setChartData(Array.isArray(d.chart_data) ? d.chart_data : []);
      setPagination(d.pagination || null);
    } catch (err) {
      console.error("Gagal memuat pendapatan aplikasi:", err);
      if (hotels.length === 0) setError(true);
      toast.error("Gagal memuat data pendapatan aplikasi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchData, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, search, sortBy, sortDir, page]);

  const toggleSort = (col) => {
    if (sortBy === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir("desc");
    }
    setPage(1);
  };

  const sortIcon = (col) => {
    if (sortBy !== col) return "unfold_more";
    return sortDir === "asc" ? "arrow_upward" : "arrow_downward";
  };

  const barData = [...hotels]
    .sort((a, b) => b.platform_commission - a.platform_commission)
    .slice(0, 10)
    .map((h) => ({ name: h.name?.length > 18 ? h.name.slice(0, 18) + "…" : h.name, komisi: h.platform_commission }));

  const pieData = chartData.map((h) => ({
    name: h.name,
    short: h.name?.length > 15 ? h.name.slice(0, 15) + "…" : h.name,
    value: h.platform_commission,
  }));

  const handleExport = () => {
    try {
      setExporting(true);
      const fileName = `HLeven_Komisi_Aplikasi_${startDate || "awal"}_${endDate || "akhir"}`;
      let csv = "\uFEFFH'LEVEN PENDAPATAN APLIKASI (KOMISI 5%)\n";
      csv += `Periode,${startDate || "Awal"} s/d ${endDate || "Sekarang"}\n`;
      csv += `Total Komisi,${summary?.total_platform_commission || 0}\n`;
      csv += `Total Pendapatan Hotel,${summary?.total_hotel_revenue || 0}\n\n`;
      csv += `Hotel,Kota,Total Pendapatan,Komisi 5%,Net Hotel 95%,Transaksi\n`;
      hotels.forEach((h) => {
        csv += `"${h.name}","${h.city}",${h.hotel_revenue},${h.platform_commission},${h.hotel_net},${h.transactions_count}\n`;
      });
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${fileName}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("File Excel (CSV) berhasil diunduh!");
    } finally {
      setExporting(false);
    }
  };

  const th = "py-4 px-6 cursor-pointer select-none hover:text-[#4f604f] transition-colors";

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 font-hanken">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-newsreader text-[32px] font-semibold text-[#4f604f] tracking-[-0.02em] leading-tight font-['Newsreader',serif]">
            App Revenue
          </h2>
          <p className="font-hanken text-[14px] text-[#747872] mt-1">
            Komisi platform 5% dari setiap hotel mitra.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-[#E5E0D8] rounded-lg bg-white text-[#434842] hover:bg-[#F9F6F1] transition-all font-hanken text-[13px] font-semibold shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || hotels.length === 0}
            className="px-5 py-2 rounded-lg bg-transparent border border-[#768875] text-[#768875] font-hanken text-[13px] font-semibold flex items-center gap-2 hover:bg-[#768875]/10 transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">table_view</span>
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8] flex flex-col xl:flex-row items-stretch xl:items-end gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
          <div className="flex flex-col gap-1.5">
            <label className="font-hanken text-[11px] font-semibold tracking-[0.05em] uppercase text-[#747872]">
              Cari Hotel
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#747872] text-[20px] pointer-events-none">
                search
              </span>
              <input
                type="text"
                placeholder="Cari nama hotel..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full h-10 pl-10 pr-3.5 rounded-lg border border-[#E5E0D8] text-[#191c1b] bg-white font-hanken text-[13.5px] placeholder-[#747872] focus:outline-none focus:border-[#768875] focus:ring-2 focus:ring-[#768875]/20 transition-all"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-hanken text-[11px] font-semibold tracking-[0.05em] uppercase text-[#747872]">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="w-full h-10 px-3.5 rounded-lg border border-[#E5E0D8] text-[#191c1b] bg-white font-hanken text-[13.5px] focus:outline-none focus:border-[#768875] focus:ring-2 focus:ring-[#768875]/20 transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-hanken text-[11px] font-semibold tracking-[0.05em] uppercase text-[#747872]">
              Tanggal Selesai
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="w-full h-10 px-3.5 rounded-lg border border-[#E5E0D8] text-[#191c1b] bg-white font-hanken text-[13.5px] focus:outline-none focus:border-[#768875] focus:ring-2 focus:ring-[#768875]/20 transition-all"
            />
          </div>
        </div>
        {(startDate || endDate || search) && (
          <button
            onClick={() => { setStartDate(""); setEndDate(""); setSearch(""); setPage(1); }}
            className="h-10 px-4 rounded-lg bg-white border border-[#E5E0D8] text-[#747872] hover:bg-[#F9F6F1] font-hanken text-[13px] font-medium transition-all"
          >
            Reset
          </button>
        )}
      </div>

      {error ? (
        <div className="bg-[#ffdad6] border border-[#ffbab1] text-[#93000a] px-6 py-6 rounded-xl text-center space-y-3 font-hanken">
          <p className="font-medium">Terjadi kesalahan saat memuat data.</p>
          <button onClick={fetchData} className="px-4 py-2 bg-[#ba1a1a] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
            Coba Lagi
          </button>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-[#E5E0D8] border-t-[#768875] rounded-full animate-spin"></div>
          <p className="font-hanken text-[14px] text-[#747872]">Memuat pendapatan aplikasi...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8] min-h-[150px]">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-newsreader text-[20px] font-medium text-[#191c1b]">Total Komisi Aplikasi</h3>
                <div className="w-8 h-8 rounded-full bg-[#F9F6F1] flex items-center justify-center text-[#768875]">
                  <span className="material-symbols-outlined text-[20px]">payments</span>
                </div>
              </div>
              <span className="font-newsreader text-[32px] font-semibold text-[#4f604f] tracking-[-0.02em] leading-tight">
                {formatRupiah(summary?.total_platform_commission)}
              </span>
              <p className="font-hanken text-[12px] text-[#747872] mt-1">5% dari seluruh transaksi sukses</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8] min-h-[150px]">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-newsreader text-[20px] font-medium text-[#191c1b]">Total Pendapatan Hotel</h3>
                <div className="w-8 h-8 rounded-full bg-[#F9F6F1] flex items-center justify-center text-[#4f604f]">
                  <span className="material-symbols-outlined text-[20px]">domain</span>
                </div>
              </div>
              <span className="font-newsreader text-[32px] font-semibold text-[#191c1b] tracking-[-0.02em] leading-tight">
                {formatRupiah(summary?.total_hotel_revenue)}
              </span>
              <p className="font-hanken text-[12px] text-[#747872] mt-1">Gross seluruh hotel mitra</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8] min-h-[150px]">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-newsreader text-[20px] font-medium text-[#191c1b]">Hotel Berkontribusi</h3>
                <div className="w-8 h-8 rounded-full bg-[#F9F6F1] flex items-center justify-center text-[#625b51]">
                  <span className="material-symbols-outlined text-[20px]">group</span>
                </div>
              </div>
              <span className="font-newsreader text-[32px] font-semibold text-[#191c1b] tracking-[-0.02em] leading-tight">
                {(summary?.total_hotels || 0).toLocaleString("id-ID")}
              </span>
              <p className="font-hanken text-[12px] text-[#747872] mt-1">hotel dengan transaksi sukses</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F9F6F1] border-b border-[#E5E0D8] font-hanken text-[12px] font-semibold leading-[1] text-[#434842] uppercase tracking-[0.05em]">
                    <th className={th} onClick={() => toggleSort("hotel_name")}>
                      Hotel <span className="material-symbols-outlined text-[16px] align-middle">{sortIcon("hotel_name")}</span>
                    </th>
                    <th className="py-4 px-6">Kota</th>
                    <th className={th} onClick={() => toggleSort("hotel_revenue")}>
                      Total Pendapatan <span className="material-symbols-outlined text-[16px] align-middle">{sortIcon("hotel_revenue")}</span>
                    </th>
                    <th className={th} onClick={() => toggleSort("platform_commission")}>
                      Komisi 5% <span className="material-symbols-outlined text-[16px] align-middle">{sortIcon("platform_commission")}</span>
                    </th>
                    <th className="py-4 px-6">Net Hotel 95%</th>
                    <th className={th} onClick={() => toggleSort("transactions_count")}>
                      Transaksi <span className="material-symbols-outlined text-[16px] align-middle">{sortIcon("transactions_count")}</span>
                    </th>
                    <th className="py-4 px-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="font-hanken text-[14px] text-[#191c1b] divide-y divide-[#E5E0D8]">
                  {hotels.length > 0 ? (
                    hotels.map((h) => (
                      <tr key={h.id} className="hover:bg-[#F9F6F1]/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-medium">{h.name}</div>
                          <div className="text-[#747872] text-[12px] mt-0.5">ID: HTL-{String(h.id).padStart(4, "0")}</div>
                        </td>
                        <td className="py-4 px-6 text-[#434842]">{h.city}</td>
                        <td className="py-4 px-6 font-semibold">{formatRupiah(h.hotel_revenue)}</td>
                        <td className="py-4 px-6 font-semibold text-[#4f604f]">{formatRupiah(h.platform_commission)}</td>
                        <td className="py-4 px-6 text-[#434842]">{formatRupiah(h.hotel_net)}</td>
                        <td className="py-4 px-6 text-center">{h.transactions_count}</td>
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedHotel(h)}
                            className="font-hanken text-[13px] font-semibold text-[#768875] hover:text-[#4f604f] transition-colors border border-[#768875] px-3 py-1.5 rounded-lg hover:bg-[#768875]/5 active:scale-95"
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-[#747872] font-hanken text-[14px]">
                        Tidak ada data untuk periode yang dipilih.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {pagination && pagination.last_page > 1 && (
              <div className="bg-[#F9F6F1] border-t border-[#E5E0D8] p-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-[#747872] font-hanken">
                <span className="text-[13px]">
                  Halaman {pagination.current_page} dari {pagination.last_page} • {pagination.total} hotel
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="px-3 py-1 border border-[#E5E0D8] rounded-md bg-white hover:bg-[#F9F6F1] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-[13px] font-medium text-[#434842]"
                  >
                    Prev
                  </button>
                  {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`px-3 py-1 border rounded-md text-[13px] font-medium transition-colors ${
                        page === n ? "bg-[#768875] text-white border-[#768875]" : "bg-white border-[#E5E0D8] text-[#434842] hover:bg-[#F9F6F1]"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(p + 1, pagination.last_page))}
                    disabled={page === pagination.last_page}
                    className="px-3 py-1 border border-[#E5E0D8] rounded-md bg-white hover:bg-[#F9F6F1] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-[13px] font-medium text-[#434842]"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8]">
              <h3 className="font-newsreader text-[20px] font-medium text-[#4f604f]">Top 10 Hotel — Komisi Tertinggi</h3>
              <p className="font-hanken text-[13px] text-[#747872] mt-0.5 mb-4">Berdasarkan data periode yang dipilih</p>
              <div className="w-full h-80">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={barData} margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E0D8" />
                      <XAxis type="number" stroke="#747872" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={shortRupiah} />
                      <YAxis dataKey="name" type="category" stroke="#747872" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={130} />
                      <Tooltip formatter={(v) => [formatRupiah(v), "Komisi 5%"]} contentStyle={{ borderRadius: "8px", border: "1px solid #E5E0D8" }} />
                      <Bar dataKey="komisi" name="Komisi 5%" fill="#768875" radius={[0, 4, 4, 0]} barSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full bg-[#F9F6F1]/50 rounded-lg flex items-center justify-center border border-[#E5E0D8] border-dashed">
                    <span className="text-[#747872] font-hanken text-[14px]">Belum ada data komisi.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8]">
              <h3 className="font-newsreader text-[20px] font-medium text-[#4f604f]">Distribusi Komisi — Top 5</h3>
              <p className="font-hanken text-[13px] text-[#747872] mt-0.5 mb-4">Pangsa 5 hotel kontributor terbesar</p>
              <div className="w-full h-80">
                {chartData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height="75%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={3}
                        >
                          {pieData.map((entry, i) => (
                            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => [formatRupiah(v), "Komisi 5%"]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-3 pt-2 text-xs font-hanken">
                      {pieData.map((item, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-[#434842]">{item.short}: <b>{formatRupiah(item.value)}</b></span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-[#F9F6F1]/50 rounded-lg flex items-center justify-center border border-[#E5E0D8] border-dashed">
                    <span className="text-[#747872] font-hanken text-[14px]">Belum ada data komisi.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {selectedHotel && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="fixed inset-0 bg-[#2e3130]/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedHotel(null)}></div>
              <div className="relative w-full max-w-lg bg-white rounded-xl shadow-[0_12px_40px_rgba(47,50,49,0.12)] p-7 border border-[#E5E0D8] z-10 font-hanken">
                <div className="flex justify-between items-start mb-6 pb-4 border-b border-[#E5E0D8]">
                  <div>
                    <h3 className="font-newsreader text-[24px] font-semibold text-[#4f604f] font-['Newsreader',serif]">
                      {selectedHotel.name}
                    </h3>
                    <p className="font-hanken text-[13px] text-[#747872] mt-1">
                      ID: HTL-{String(selectedHotel.id).padStart(4, "0")} • {selectedHotel.city}
                    </p>
                  </div>
                  <button onClick={() => setSelectedHotel(null)} className="text-[#747872] hover:text-[#191c1b] p-1.5 rounded-lg hover:bg-[#F9F6F1] transition-colors">
                    <span className="material-symbols-outlined text-[22px]">close</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                  <div>
                    <label className="block font-hanken text-[11px] font-semibold text-[#747872] uppercase tracking-[0.05em] mb-1">Admin Hotel</label>
                    <p className="font-hanken text-[14px] text-[#191c1b] break-all">{selectedHotel.admin_email}</p>
                  </div>
                  <div>
                    <label className="block font-hanken text-[11px] font-semibold text-[#747872] uppercase tracking-[0.05em] mb-1">Transaksi Sukses</label>
                    <p className="font-hanken text-[14px] text-[#191c1b]">{selectedHotel.transactions_count} transaksi</p>
                  </div>
                  <div>
                    <label className="block font-hanken text-[11px] font-semibold text-[#747872] uppercase tracking-[0.05em] mb-1">Total Pendapatan</label>
                    <p className="font-hanken text-[16px] font-semibold text-[#191c1b]">{formatRupiah(selectedHotel.hotel_revenue)}</p>
                  </div>
                  <div>
                    <label className="block font-hanken text-[11px] font-semibold text-[#747872] uppercase tracking-[0.05em] mb-1">Komisi Aplikasi 5%</label>
                    <p className="font-hanken text-[16px] font-semibold text-[#4f604f]">{formatRupiah(selectedHotel.platform_commission)}</p>
                  </div>
                  <div>
                    <label className="block font-hanken text-[11px] font-semibold text-[#747872] uppercase tracking-[0.05em] mb-1">Net Hotel 95%</label>
                    <p className="font-hanken text-[14px] text-[#434842]">{formatRupiah(selectedHotel.hotel_net)}</p>
                  </div>
                  <div>
                    <label className="block font-hanken text-[11px] font-semibold text-[#747872] uppercase tracking-[0.05em] mb-1">Periode</label>
                    <p className="font-hanken text-[14px] text-[#434842]">{startDate || "Awal"} s/d {endDate || "Sekarang"}</p>
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-[#E5E0D8]">
                  <button
                    type="button"
                    onClick={() => setSelectedHotel(null)}
                    className="px-4 py-2 border border-[#E5E0D8] rounded-lg font-hanken text-[13px] font-semibold text-[#434842] hover:bg-[#F9F6F1] transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ApplicationRevenue;
