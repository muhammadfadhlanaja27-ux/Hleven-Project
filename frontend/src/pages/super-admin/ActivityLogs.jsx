import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Pagination State
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
  });

  // Filter States
  const [searchActivity, setSearchActivity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(false);

      const params = {
        page: page,
      };
      if (searchActivity) params.activity = searchActivity;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await api.get("/activity-logs", { params });

      const data = response.data?.data || response.data || [];
      setLogs(Array.isArray(data) ? data : []);

      if (response.data?.meta) {
        setMeta(response.data.meta);
      } else if (response.data?.current_page) {
        setMeta({
          current_page: response.data.current_page,
          last_page: response.data.last_page || 1,
          total: response.data.total || data.length,
          per_page: response.data.per_page || 10,
        });
      }
    } catch (err) {
      console.error("Gagal mengambil data log aktivitas:", err);
      setError(true);
      toast.error("Gagal memuat log aktivitas. Pastikan server backend berjalan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLogs();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchActivity, startDate, endDate, page]);

  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
  };

  const handleResetFilter = () => {
    setSearchActivity("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  // Helper formatting initials
  const getInitials = (name) => {
    if (!name) return "SY";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Helper formatting timestamp
  const formatTimestamp = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;

    const dateFormatted = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const timeFormatted = d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    return `${dateFormatted} • ${timeFormatted}`;
  };

  // Badge styling helper based on activity text
  const getActivityBadge = (activity) => {
    const act = (activity || "").toLowerCase();

    if (act.includes("approve") || act.includes("success") || act.includes("active")) {
      return {
        bg: "bg-[#d1eac9]",
        text: "text-[#0c200c]",
        dot: "bg-[#768875]",
      };
    }
    if (act.includes("warn") || act.includes("fail") || act.includes("error") || act.includes("block") || act.includes("delete")) {
      return {
        bg: "bg-[#ffdad6]",
        text: "text-[#93000a]",
        dot: "bg-[#ba1a1a]",
      };
    }
    if (act.includes("report") || act.includes("pending") || act.includes("generate")) {
      return {
        bg: "bg-[#DED3C7]",
        text: "text-[#2F3231]",
        dot: "bg-[#7c7369]",
      };
    }
    return {
      bg: "bg-[#edeeec]",
      text: "text-[#434842]",
      dot: "bg-[#747872]",
    };
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 font-hanken">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-newsreader text-[32px] font-semibold text-[#4f604f] tracking-[-0.02em] leading-tight font-['Newsreader',serif]">
            Activity Logs
          </h2>
          <p className="font-hanken text-[14px] text-[#747872] mt-1">
            Track and audit all administrative actions and system events across the platform.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="flex items-center gap-1.5 px-3.5 py-2 border border-[#E5E0D8] rounded-lg bg-white text-[#434842] hover:bg-[#F9F6F1] transition-all font-hanken text-[13px] font-semibold shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter Bar Card */}
      <div className="bg-white rounded-xl p-5 shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8] flex flex-col md:flex-row gap-4 items-stretch md:items-end">
        {/* Search Activity */}
        <div className="flex-1">
          <label className="block font-hanken text-[11px] font-semibold tracking-[0.05em] uppercase text-[#747872] mb-1.5">
            Cari Aktivitas
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#747872] text-[20px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              placeholder="e.g. Update Status, Login..."
              value={searchActivity}
              onChange={(e) => handleFilterChange(setSearchActivity, e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E0D8] rounded-lg font-hanken text-[13.5px] text-[#191c1b] placeholder-[#747872] focus:outline-none focus:border-[#768875] focus:ring-2 focus:ring-[#768875]/20 transition-all"
            />
          </div>
        </div>

        {/* Date Range Start */}
        <div className="w-full md:w-52">
          <label className="block font-hanken text-[11px] font-semibold tracking-[0.05em] uppercase text-[#747872] mb-1.5">
            Tanggal Mulai
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => handleFilterChange(setStartDate, e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-[#E5E0D8] rounded-lg font-hanken text-[13.5px] text-[#191c1b] focus:outline-none focus:border-[#768875] focus:ring-2 focus:ring-[#768875]/20 transition-all"
          />
        </div>

        {/* Date Range End */}
        <div className="w-full md:w-52">
          <label className="block font-hanken text-[11px] font-semibold tracking-[0.05em] uppercase text-[#747872] mb-1.5">
            Tanggal Akhir
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => handleFilterChange(setEndDate, e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-[#E5E0D8] rounded-lg font-hanken text-[13.5px] text-[#191c1b] focus:outline-none focus:border-[#768875] focus:ring-2 focus:ring-[#768875]/20 transition-all"
          />
        </div>

        {/* Reset Filter Button */}
        {(searchActivity || startDate || endDate) && (
          <button
            onClick={handleResetFilter}
            className="h-10 px-4 rounded-lg bg-white border border-[#E5E0D8] text-[#747872] hover:bg-[#F9F6F1] font-hanken text-[13px] font-semibold transition-all"
          >
            Reset
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-[#ffdad6] border border-[#ffbab1] text-[#93000a] px-5 py-4 rounded-xl font-hanken text-[14px] flex items-center gap-3">
          <span className="material-symbols-outlined">error</span>
          <span>Terjadi kesalahan saat memuat log aktivitas. Pastikan backend aktif.</span>
        </div>
      )}

      {/* Data Table Card */}
      <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8] overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-[#E5E0D8] border-t-[#768875] rounded-full animate-spin"></div>
            <p className="font-hanken text-[14px] text-[#747872]">Memuat rekam aktivitas...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="bg-[#F9F6F1] border-b border-[#E5E0D8]">
                    <th className="py-4 px-6 font-hanken text-[12px] font-semibold text-[#434842] uppercase tracking-[0.05em] whitespace-nowrap">
                      Timestamp
                    </th>
                    <th className="py-4 px-6 font-hanken text-[12px] font-semibold text-[#434842] uppercase tracking-[0.05em]">
                      User
                    </th>
                    <th className="py-4 px-6 font-hanken text-[12px] font-semibold text-[#434842] uppercase tracking-[0.05em]">
                      Action Performed
                    </th>
                    <th className="py-4 px-6 font-hanken text-[12px] font-semibold text-[#434842] uppercase tracking-[0.05em] text-right">
                      IP Address
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E0D8] font-hanken text-[13.5px]">
                  {logs.length > 0 ? (
                    logs.map((row, idx) => {
                      const badge = getActivityBadge(row.activity);
                      const userName = row.user || row.user_name || "System";
                      const userEmail = row.user_email || row.email || "";

                      return (
                        <tr
                          key={row.id || idx}
                          className="hover:bg-[#F9F6F1]/50 transition-colors"
                        >
                          {/* Timestamp */}
                          <td className="py-4 px-6 whitespace-nowrap text-[#747872]">
                            {formatTimestamp(row.created_at || row.time)}
                          </td>

                          {/* User */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#677967] text-white flex items-center justify-center font-newsreader font-semibold text-[13px] shrink-0">
                                {getInitials(userName)}
                              </div>
                              <div>
                                <p className="font-medium text-[#191c1b]">
                                  {userName}
                                </p>
                                {userEmail ? (
                                  <p className="text-xs text-[#747872]">
                                    {userEmail}
                                  </p>
                                ) : (
                                  <p className="text-xs text-[#747872]">Admin</p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Action Performed */}
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${badge.bg} ${badge.text} text-[11px] font-semibold uppercase tracking-[0.05em]`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}
                              ></span>
                              {row.activity}
                            </span>
                            {row.description && (
                              <span className="block mt-1 text-[#434842] text-[13px]">
                                {row.description}
                              </span>
                            )}
                          </td>

                          {/* IP Address */}
                          <td className="py-4 px-6 text-right font-mono text-xs text-[#747872]">
                            {row.ip_address || "127.0.0.1"}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-12 text-center text-[#747872] font-hanken text-[14px]"
                      >
                        Tidak ada catatan log aktivitas yang ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="bg-[#F9F6F1] border-t border-[#E5E0D8] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-body-sm text-[#747872] font-hanken">
              <span className="text-[13px]">
                Menampilkan halaman <strong className="text-[#191c1b]">{meta.current_page}</strong> dari{" "}
                <strong className="text-[#191c1b]">{meta.last_page}</strong>{" "}
                {meta.total ? `(Total: ${meta.total} aktivitas)` : ""}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-md border border-[#E5E0D8] bg-white text-[#434842] hover:bg-[#F9F6F1] font-medium text-[13px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Sebelumnya
                </button>

                <div className="px-2 font-medium text-[13px] text-[#191c1b]">
                  {meta.current_page} / {meta.last_page}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(p + 1, meta.last_page))}
                  disabled={page >= meta.last_page}
                  className="px-3 py-1.5 rounded-md border border-[#E5E0D8] bg-white text-[#434842] hover:bg-[#F9F6F1] font-medium text-[13px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;