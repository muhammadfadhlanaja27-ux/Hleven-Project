import React, { useState, useMemo, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
} from "recharts";
import { INITIAL_BOOKINGS } from "../../utils/bookingData";

// ─── Formatters ───────────────────────────────────────────────────────────────
const formatRp = (value) => {
  if (value === null || value === undefined || isNaN(value)) return "Rp 0";
  return "Rp " + Number(value).toLocaleString("id-ID");
};

const formatRpShort = (value) => {
  if (!value || isNaN(value)) return "0";
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "Jt";
  if (value >= 1_000) return (value / 1_000).toFixed(0) + "Rb";
  return String(value);
};

// ─── Date Helpers ─────────────────────────────────────────────────────────────
const today = new Date("2026-08-18");

const getPeriodRange = (period) => {
  const d = new Date(today);
  switch (period) {
    case "today":
      return { start: new Date(d.setHours(0, 0, 0, 0)), end: new Date(today.setHours(23, 59, 59)) };
    case "thisWeek": {
      const day = d.getDay();
      const mon = new Date(d);
      mon.setDate(d.getDate() - ((day + 6) % 7));
      mon.setHours(0, 0, 0, 0);
      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);
      sun.setHours(23, 59, 59);
      return { start: mon, end: sun };
    }
    case "thisMonth":
      return { start: new Date(2026, 7, 1), end: new Date(2026, 7, 31, 23, 59) };
    case "lastMonth":
      return { start: new Date(2026, 6, 1), end: new Date(2026, 6, 31, 23, 59) };
    case "thisYear":
      return { start: new Date(2026, 0, 1), end: new Date(2026, 11, 31, 23, 59) };
    default:
      return { start: new Date(2026, 7, 1), end: new Date(2026, 7, 31, 23, 59) };
  }
};

const getPreviousPeriodRange = (period) => {
  switch (period) {
    case "today":
      return { start: new Date(2026, 7, 17), end: new Date(2026, 7, 17, 23, 59) };
    case "thisWeek":
      return { start: new Date(2026, 7, 4), end: new Date(2026, 7, 10, 23, 59) };
    case "thisMonth":
      return { start: new Date(2026, 6, 1), end: new Date(2026, 6, 31, 23, 59) };
    case "lastMonth":
      return { start: new Date(2026, 5, 1), end: new Date(2026, 5, 30, 23, 59) };
    case "thisYear":
      return { start: new Date(2025, 0, 1), end: new Date(2025, 11, 31, 23, 59) };
    default:
      return { start: new Date(2026, 6, 1), end: new Date(2026, 6, 31, 23, 59) };
  }
};

const isInRange = (dateStr, range) => {
  const d = new Date(dateStr);
  return d >= range.start && d <= range.end;
};

// ─── Revenue Calculations ─────────────────────────────────────────────────────
const SUCCESSFUL_STATUSES = ["Paid"];
const PENDING_STATUSES = ["Pending"];
const REFUNDED_STATUSES = ["Refunded"];
const CANCELLED_BOOKING_STATUSES = ["Cancelled", "Expired"];

const calcRevenue = (bookings) => {
  const validBookings = bookings.filter(
    (b) => !CANCELLED_BOOKING_STATUSES.includes(b.bookingStatus)
  );
  const paidBookings = bookings.filter((b) => SUCCESSFUL_STATUSES.includes(b.paymentStatus));
  const pendingBookings = bookings.filter((b) => PENDING_STATUSES.includes(b.paymentStatus));
  const refundedBookings = bookings.filter((b) => REFUNDED_STATUSES.includes(b.paymentStatus));

  const totalRevenue = validBookings.reduce((s, b) => s + (b.totalAmount || 0), 0);
  const paidRevenue = paidBookings.reduce((s, b) => s + (b.totalAmount || 0), 0);
  const pendingRevenue = pendingBookings.reduce((s, b) => s + (b.totalAmount || 0), 0);
  const refundedRevenue = refundedBookings.reduce((s, b) => s + (b.totalAmount || 0), 0);

  const totalDiscount = validBookings.reduce((s, b) => s + (b.discount || 0), 0);
  const grossRevenue = validBookings.reduce((s, b) => s + (b.roomPriceSum || 0) + (b.additionalCharges || 0), 0);
  const netRevenue = Math.max(0, grossRevenue - totalDiscount - refundedRevenue);

  const weekdayRevenue = paidBookings.reduce(
    (s, b) => s + (b.weekdayNights || 0) * (b.room?.weekdayPrice || 0), 0
  );
  const weekendRevenue = paidBookings.reduce(
    (s, b) => s + (b.weekendNights || 0) * (b.room?.weekendPrice || 0), 0
  );

  const avgBookingValue = paidBookings.length > 0
    ? Math.round(paidRevenue / paidBookings.length)
    : 0;

  return {
    totalRevenue,
    paidRevenue,
    pendingRevenue,
    refundedRevenue,
    grossRevenue,
    totalDiscount,
    netRevenue,
    weekdayRevenue,
    weekendRevenue,
    avgBookingValue,
    totalBookings: bookings.length,
    paidCount: paidBookings.length,
    pendingCount: pendingBookings.length,
    refundedCount: refundedBookings.length,
    cancelledCount: bookings.filter((b) => CANCELLED_BOOKING_STATUSES.includes(b.bookingStatus)).length,
    weekdayBookings: paidBookings.reduce((s, b) => s + (b.weekdayNights > 0 ? 1 : 0), 0),
    weekendBookings: paidBookings.reduce((s, b) => s + (b.weekendNights > 0 ? 1 : 0), 0),
  };
};

// ─── Custom Recharts Tooltip ──────────────────────────────────────────────────
const CustomChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white border border-[#E5E1DA] rounded-xl shadow-lg p-3 text-xs">
      <p className="font-bold text-[#2D312C] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {formatRp(p.value)}
        </p>
      ))}
    </div>
  );
};

// ─── Skeleton Component ───────────────────────────────────────────────────────
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-[#E5E1DA] rounded-lg ${className}`} />
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RevenueReport() {
  const [selectedPeriod, setSelectedPeriod] = useState("thisMonth");
  const [chartPeriod, setChartPeriod] = useState("daily");
  const [loading, setLoading] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);
  const [detailSort, setDetailSort] = useState({ col: "date", dir: "desc" });
  const [detailPage, setDetailPage] = useState(1);
  const exportRef = useRef(null);
  const ROWS_PER_PAGE = 8;

  // Close export dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Simulate loading
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [selectedPeriod]);

  // Reset page when period changes
  useEffect(() => {
    setDetailPage(1);
  }, [selectedPeriod]);

  // ─── Filtered Data ─────────────────────────────────────────────────────────
  const allBookings = INITIAL_BOOKINGS;
  const range = getPeriodRange(selectedPeriod);
  const prevRange = getPreviousPeriodRange(selectedPeriod);

  const filteredBookings = useMemo(
    () => allBookings.filter((b) => isInRange(b.checkIn, range)),
    [selectedPeriod]
  );

  const prevBookings = useMemo(
    () => allBookings.filter((b) => isInRange(b.checkIn, prevRange)),
    [selectedPeriod]
  );

  const stats = useMemo(() => calcRevenue(filteredBookings), [filteredBookings]);
  const prevStats = useMemo(() => calcRevenue(prevBookings), [prevBookings]);

  const growthPct =
    prevStats.totalRevenue > 0
      ? (((stats.totalRevenue - prevStats.totalRevenue) / prevStats.totalRevenue) * 100).toFixed(1)
      : stats.totalRevenue > 0
      ? "100.0"
      : "0.0";
  const growthPositive = Number(growthPct) >= 0;

  // ─── Chart Data ────────────────────────────────────────────────────────────
  const chartData = useMemo(() => {
    if (chartPeriod === "daily") {
      const days = {};
      filteredBookings
        .filter((b) => !CANCELLED_BOOKING_STATUSES.includes(b.bookingStatus))
        .forEach((b) => {
          const key = b.checkIn;
          if (!days[key]) days[key] = { date: key, revenue: 0, bookings: 0 };
          days[key].revenue += b.totalAmount || 0;
          days[key].bookings += 1;
        });
      return Object.values(days)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map((d) => ({
          ...d,
          label: new Date(d.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
        }));
    } else {
      const weeks = {};
      filteredBookings
        .filter((b) => !CANCELLED_BOOKING_STATUSES.includes(b.bookingStatus))
        .forEach((b) => {
          const d = new Date(b.checkIn);
          const wk = `W${Math.ceil(d.getDate() / 7)}`;
          if (!weeks[wk]) weeks[wk] = { label: wk, revenue: 0, bookings: 0 };
          weeks[wk].revenue += b.totalAmount || 0;
          weeks[wk].bookings += 1;
        });
      return Object.values(weeks);
    }
  }, [filteredBookings, chartPeriod]);

  // ─── Revenue by Room ───────────────────────────────────────────────────────
  const roomRevenue = useMemo(() => {
    const map = {};
    filteredBookings
      .filter((b) => b.paymentStatus === "Paid")
      .forEach((b) => {
        const key = b.room.name;
        if (!map[key]) map[key] = { name: b.room.name, type: b.room.type, revenue: 0, bookings: 0, nights: 0 };
        map[key].revenue += b.totalAmount || 0;
        map[key].bookings += 1;
        map[key].nights += b.nights || 0;
      });
    const total = Object.values(map).reduce((s, r) => s + r.revenue, 0);
    return Object.values(map)
      .map((r) => ({ ...r, pct: total > 0 ? ((r.revenue / total) * 100).toFixed(1) : "0.0" }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredBookings]);

  // ─── Revenue by Room Type ──────────────────────────────────────────────────
  const roomTypeRevenue = useMemo(() => {
    const map = {};
    filteredBookings
      .filter((b) => b.paymentStatus === "Paid")
      .forEach((b) => {
        const key = b.room.type;
        if (!map[key]) map[key] = { type: key, revenue: 0, bookings: 0 };
        map[key].revenue += b.totalAmount || 0;
        map[key].bookings += 1;
      });
    const total = Object.values(map).reduce((s, r) => s + r.revenue, 0);
    return Object.values(map).map((r) => ({
      ...r,
      pct: total > 0 ? ((r.revenue / total) * 100).toFixed(1) : "0.0",
    }));
  }, [filteredBookings]);

  // ─── Revenue Details Table Data ────────────────────────────────────────────
  const detailRows = useMemo(() => {
    const days = {};
    filteredBookings.forEach((b) => {
      const key = b.checkIn;
      if (!days[key]) days[key] = { date: key, total: 0, paid: 0, nights: 0, gross: 0, discount: 0, refund: 0 };
      days[key].total += 1;
      if (b.paymentStatus === "Paid") days[key].paid += 1;
      if (!CANCELLED_BOOKING_STATUSES.includes(b.bookingStatus)) {
        days[key].nights += b.nights || 0;
        days[key].gross += (b.roomPriceSum || 0) + (b.additionalCharges || 0);
        days[key].discount += b.discount || 0;
      }
      if (b.paymentStatus === "Refunded") days[key].refund += b.totalAmount || 0;
    });
    return Object.values(days).map((d) => ({
      ...d,
      net: Math.max(0, d.gross - d.discount - d.refund),
    }));
  }, [filteredBookings]);

  const sortedDetails = useMemo(() => {
    return [...detailRows].sort((a, b) => {
      let va = a[detailSort.col];
      let vb = b[detailSort.col];
      if (typeof va === "string") {
        va = va.toLowerCase();
        vb = vb.toLowerCase();
      }
      if (va < vb) return detailSort.dir === "asc" ? -1 : 1;
      if (va > vb) return detailSort.dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [detailRows, detailSort]);

  const totalDetailPages = Math.max(1, Math.ceil(sortedDetails.length / ROWS_PER_PAGE));
  const pagedDetails = sortedDetails.slice((detailPage - 1) * ROWS_PER_PAGE, detailPage * ROWS_PER_PAGE);

  const toggleSort = (col) => {
    setDetailSort((s) => ({ col, dir: s.col === col && s.dir === "asc" ? "desc" : "asc" }));
    setDetailPage(1);
  };

  const SortIcon = ({ col }) => (
    <span className="material-symbols-outlined text-[14px] align-middle ml-0.5">
      {detailSort.col === col ? (detailSort.dir === "asc" ? "arrow_upward" : "arrow_downward") : "unfold_more"}
    </span>
  );

  // ─── Revenue Insights ──────────────────────────────────────────────────────
  const insights = useMemo(() => {
    const list = [];
    if (Number(growthPct) > 0) list.push(`Revenue increased by ${growthPct}% compared to the previous period.`);
    else if (Number(growthPct) < 0) list.push(`Revenue decreased by ${Math.abs(growthPct)}% compared to the previous period.`);

    const topRoom = roomRevenue[0];
    if (topRoom) list.push(`"${topRoom.name}" generated the highest revenue (${formatRp(topRoom.revenue)}) this period.`);

    const avgWeekday = stats.weekdayBookings > 0
      ? Math.round(stats.weekdayRevenue / stats.weekdayBookings)
      : 0;
    const avgWeekend = stats.weekendBookings > 0
      ? Math.round(stats.weekendRevenue / stats.weekendBookings)
      : 0;
    if (avgWeekend > avgWeekday) list.push("Weekend bookings generated higher average revenue than weekday bookings.");
    else if (avgWeekday > avgWeekend && avgWeekday > 0) list.push("Weekday bookings generated higher average revenue than weekend bookings.");

    const topType = [...roomTypeRevenue].sort((a, b) => b.revenue - a.revenue)[0];
    if (topType) list.push(`"${topType.type}" room type contributed the most to total revenue (${topType.pct}%).`);

    return list;
  }, [stats, roomRevenue, roomTypeRevenue, growthPct]);

  // ─── Export Handler ────────────────────────────────────────────────────────
  const handleExport = (type) => {
    setExportOpen(false);
    toast.success(`Report exported as ${type}.`);
  };

  // ─── Period Labels ─────────────────────────────────────────────────────────
  const periodLabels = {
    today: "Today",
    thisWeek: "This Week",
    thisMonth: "This Month",
    lastMonth: "Last Month",
    thisYear: "This Year",
  };

  const ROOM_TYPE_COLORS = { Deluxe: "#506147", Suite: "#ad6042", Standard: "#6B6E6A" };
  const ROOM_TYPE_BG = { Deluxe: "bg-[#506147]", Suite: "bg-[#ad6042]", Standard: "bg-[#6B6E6A]" };

  const isEmpty = filteredBookings.length === 0;

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-8 font-['Hanken_Grotesk',sans-serif]">

      {/* ══════════════════════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#E5E1DA]">
        <div>
          <h2 className="font-['Newsreader',serif] text-3xl sm:text-4xl font-semibold text-[#2D312C] tracking-tight">
            Revenue Report
          </h2>
          <p className="text-sm text-[#6B6E6A] mt-1">
            Monitor and analyze your hotel&apos;s revenue performance.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Period Selector */}
          <div className="flex items-center bg-white rounded-lg border border-[#E5E1DA] p-1 shadow-sm">
            {Object.entries(periodLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedPeriod(key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  selectedPeriod === key
                    ? "bg-[#506147] text-white shadow-sm"
                    : "text-[#6B6E6A] hover:bg-[#f0ede9]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setExportOpen((o) => !o)}
              className="flex items-center gap-2 bg-white border border-[#E5E1DA] px-4 py-2.5 rounded-lg text-xs font-semibold text-[#2D312C] hover:bg-[#f0ede9] transition-colors shadow-sm whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[18px] text-[#6B6E6A]">file_download</span>
              Export Report
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </button>
            {exportOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-[#E5E1DA] rounded-xl shadow-xl z-20 min-w-[180px] overflow-hidden">
                {["PDF", "Excel", "CSV"].map((type) => (
                  <button
                    key={type}
                    onClick={() => handleExport(type)}
                    className="w-full text-left px-4 py-3 text-xs font-semibold text-[#2D312C] hover:bg-[#f0ede9] transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#506147]">
                      {type === "PDF" ? "picture_as_pdf" : type === "Excel" ? "table_view" : "csv"}
                    </span>
                    Export as {type}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          LOADING SKELETONS
      ══════════════════════════════════════════════════════════ */}
      {loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
          </div>
          <Skeleton className="h-72 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-52 w-full" />
            <Skeleton className="h-52 w-full" />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          EMPTY STATE
      ══════════════════════════════════════════════════════════ */}
      {!loading && isEmpty && (
        <div className="bg-white rounded-xl border border-[#E5E1DA] p-16 text-center">
          <span className="material-symbols-outlined text-[56px] text-[#c4c8be]">monitoring</span>
          <p className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C] mt-3">No revenue data available</p>
          <p className="text-sm text-[#6B6E6A] mt-1">There is no revenue data for the selected period.</p>
          <button
            onClick={() => setSelectedPeriod("thisMonth")}
            className="mt-4 px-5 py-2 bg-[#506147] text-white text-xs font-semibold rounded-lg hover:bg-[#3b4b33] transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {!loading && !isEmpty && (
        <>
          {/* ══════════════════════════════════════════════════════
              1. SUMMARY CARDS
          ══════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Total Revenue */}
            <div className="bg-white rounded-xl border border-[#E5E1DA] p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-[#506147]">payments</span>
              </div>
              <div className="flex justify-between items-start mb-3 relative z-10">
                <p className="text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">Total Revenue</p>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${growthPositive ? "bg-[#E4EBE0] text-[#506147]" : "bg-[#ffdad6] text-[#ba1a1a]"}`}>
                  <span className="material-symbols-outlined text-[12px]">{growthPositive ? "trending_up" : "trending_down"}</span>
                  {growthPositive ? "+" : ""}{growthPct}%
                </span>
              </div>
              <div className="relative z-10">
                <p className="font-['Newsreader',serif] text-3xl font-bold text-[#2D312C]">{formatRp(stats.totalRevenue)}</p>
                <p className="text-xs text-[#6B6E6A] mt-1">vs {formatRp(prevStats.totalRevenue)} prev period</p>
              </div>
            </div>

            {/* Paid Revenue */}
            <div className="bg-white rounded-xl border border-[#E5E1DA] p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-[#506147]">check_circle</span>
              </div>
              <p className="text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider mb-3">Paid Revenue</p>
              <p className="font-['Newsreader',serif] text-3xl font-bold text-[#2D312C]">{formatRp(stats.paidRevenue)}</p>
              <div className="w-full bg-[#f0ede9] rounded-full h-1.5 mt-3">
                <div
                  className="bg-[#506147] h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${stats.totalRevenue > 0 ? Math.round((stats.paidRevenue / stats.totalRevenue) * 100) : 0}%` }}
                />
              </div>
              <p className="text-xs text-[#6B6E6A] mt-1">
                {stats.totalRevenue > 0 ? Math.round((stats.paidRevenue / stats.totalRevenue) * 100) : 0}% of total
              </p>
            </div>

            {/* Pending Revenue */}
            <div className="bg-white rounded-xl border border-[#E5E1DA] p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-[#D48C45]">schedule</span>
              </div>
              <p className="text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider mb-3">Pending Revenue</p>
              <p className="font-['Newsreader',serif] text-3xl font-bold text-[#2D312C]">{formatRp(stats.pendingRevenue)}</p>
              <div className="w-full bg-[#f0ede9] rounded-full h-1.5 mt-3">
                <div
                  className="bg-[#D48C45] h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${stats.totalRevenue > 0 ? Math.round((stats.pendingRevenue / stats.totalRevenue) * 100) : 0}%` }}
                />
              </div>
              <p className="text-xs text-[#6B6E6A] mt-1">Awaiting payment confirmation</p>
            </div>

            {/* Total Bookings */}
            <div className="bg-[#F2EBE1] rounded-xl border border-[#E5E1DA] p-6 shadow-sm flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider mb-1">Total Bookings</p>
                <p className="font-['Newsreader',serif] text-4xl font-bold text-[#2D312C]">{stats.totalBookings}</p>
                <p className="text-xs text-[#6B6E6A] mt-1">{stats.paidCount} paid · {stats.pendingCount} pending</p>
              </div>
              <span className="material-symbols-outlined text-[36px] text-[#506147]/40">book_online</span>
            </div>

            {/* Average Booking Value */}
            <div className="bg-white rounded-xl border border-[#E5E1DA] p-6 shadow-sm flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider mb-1">Avg. Booking Value</p>
                <p className="font-['Newsreader',serif] text-2xl font-bold text-[#2D312C]">{formatRp(stats.avgBookingValue)}</p>
                <p className="text-xs text-[#6B6E6A] mt-1">Per paid booking</p>
              </div>
              <span className="material-symbols-outlined text-[36px] text-[#506147]/40">receipt_long</span>
            </div>

            {/* Net Revenue */}
            <div className="bg-[#506147] rounded-xl p-6 shadow-sm flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-[#d6e8c8] uppercase tracking-wider mb-1">Net Revenue</p>
                <p className="font-['Newsreader',serif] text-2xl font-bold text-white">{formatRp(stats.netRevenue)}</p>
                <p className="text-xs text-[#d6e8c8] mt-1">After discounts & refunds</p>
              </div>
              <span className="material-symbols-outlined text-[36px] text-white/40">account_balance_wallet</span>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              2. REVENUE OVERVIEW CHART + COMPARISON
          ══════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Area Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E1DA] shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C]">Revenue Overview</h3>
                  <p className="text-xs text-[#6B6E6A] mt-0.5">Revenue performance during the selected period.</p>
                </div>
                <div className="flex bg-[#f0ede9] rounded-lg p-0.5">
                  {["daily", "weekly"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setChartPeriod(p)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors capitalize ${
                        chartPeriod === p ? "bg-white text-[#2D312C] shadow-sm" : "text-[#6B6E6A] hover:text-[#2D312C]"
                      }`}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {chartData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-[#6B6E6A] text-sm">No chart data for this period.</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="10%" stopColor="#506147" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#506147" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0ede9" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6B6E6A" }} />
                    <YAxis tickFormatter={formatRpShort} tick={{ fontSize: 11, fill: "#6B6E6A" }} width={60} />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#506147" strokeWidth={2.5} fill="url(#revGrad)" dot={{ r: 3, fill: "#506147" }} activeDot={{ r: 5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Revenue Comparison */}
            <div className="bg-white rounded-xl border border-[#E5E1DA] shadow-sm p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C] mb-1">Revenue Comparison</h3>
                <p className="text-xs text-[#6B6E6A] mb-6">Current vs previous period.</p>

                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider mb-1">Current Period</p>
                    <p className="font-['Newsreader',serif] text-2xl font-bold text-[#2D312C]">{formatRp(stats.totalRevenue)}</p>
                    <div className="w-full bg-[#f0ede9] rounded-full h-2 mt-2">
                      <div className="bg-[#506147] h-2 rounded-full" style={{ width: "100%" }} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider mb-1">Previous Period</p>
                    <p className="font-['Newsreader',serif] text-xl font-bold text-[#6B6E6A]">{formatRp(prevStats.totalRevenue)}</p>
                    <div className="w-full bg-[#f0ede9] rounded-full h-2 mt-2">
                      <div
                        className="bg-[#c4c8be] h-2 rounded-full"
                        style={{
                          width: `${
                            stats.totalRevenue > 0
                              ? Math.min(100, Math.round((prevStats.totalRevenue / stats.totalRevenue) * 100))
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className={`mt-6 p-4 rounded-xl border ${growthPositive ? "bg-[#E4EBE0] border-[#506147]/20" : "bg-[#ffdad6] border-[#ba1a1a]/20"}`}>
                <p className="text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider mb-1">Growth</p>
                <p className={`font-['Newsreader',serif] text-3xl font-bold ${growthPositive ? "text-[#506147]" : "text-[#ba1a1a]"}`}>
                  {growthPositive ? "+" : ""}{growthPct}%
                </p>
                <p className="text-xs text-[#6B6E6A] mt-0.5">compared to previous period</p>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              3. REVENUE BY ROOM TYPE (Bar Chart) + WEEKDAY vs WEEKEND
          ══════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart by Room Type */}
            <div className="bg-white rounded-xl border border-[#E5E1DA] shadow-sm p-6">
              <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C] mb-1">Revenue by Room Type</h3>
              <p className="text-xs text-[#6B6E6A] mb-5">Breakdown of paid revenue per room type.</p>

              {roomTypeRevenue.length === 0 ? (
                <p className="text-sm text-[#6B6E6A]">No data.</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={roomTypeRevenue} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0ede9" vertical={false} />
                      <XAxis dataKey="type" tick={{ fontSize: 11, fill: "#6B6E6A" }} />
                      <YAxis tickFormatter={formatRpShort} tick={{ fontSize: 11, fill: "#6B6E6A" }} width={60} />
                      <Tooltip content={<CustomChartTooltip />} />
                      <Bar dataKey="revenue" name="Revenue" radius={[6, 6, 0, 0]}>
                        {roomTypeRevenue.map((entry) => (
                          <Cell key={entry.type} fill={ROOM_TYPE_COLORS[entry.type] || "#506147"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {roomTypeRevenue.map((r) => (
                      <div key={r.type} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${ROOM_TYPE_BG[r.type] || "bg-[#506147]"}`} />
                          <span className="font-semibold text-[#2D312C]">{r.type}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-[#2D312C]">{formatRp(r.revenue)}</span>
                          <span className="text-[#6B6E6A] ml-2">({r.pct}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Weekday vs Weekend */}
            <div className="bg-white rounded-xl border border-[#E5E1DA] shadow-sm p-6 flex flex-col">
              <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C] mb-1">Weekday vs Weekend Revenue</h3>
              <p className="text-xs text-[#6B6E6A] mb-5">Based on weekdayPrice and weekendPrice of bookings.</p>

              <div className="space-y-5 flex-1">
                {/* Weekday */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-[#2D312C]">Weekday Revenue</span>
                    <span className="font-bold text-[#2D312C]">{formatRp(stats.weekdayRevenue)}</span>
                  </div>
                  <div className="w-full bg-[#f0ede9] rounded-full h-3">
                    <div
                      className="bg-[#506147] h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          (stats.weekdayRevenue + stats.weekendRevenue) > 0
                            ? Math.round((stats.weekdayRevenue / (stats.weekdayRevenue + stats.weekendRevenue)) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#6B6E6A] mt-1">
                    <span>{stats.weekdayBookings} bookings</span>
                    <span>
                      Avg:{" "}
                      {stats.weekdayBookings > 0
                        ? formatRp(Math.round(stats.weekdayRevenue / stats.weekdayBookings))
                        : "Rp 0"}
                    </span>
                  </div>
                </div>

                {/* Weekend */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-[#2D312C]">Weekend Revenue</span>
                    <span className="font-bold text-[#2D312C]">{formatRp(stats.weekendRevenue)}</span>
                  </div>
                  <div className="w-full bg-[#f0ede9] rounded-full h-3">
                    <div
                      className="bg-[#ad6042] h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          (stats.weekdayRevenue + stats.weekendRevenue) > 0
                            ? Math.round((stats.weekendRevenue / (stats.weekdayRevenue + stats.weekendRevenue)) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#6B6E6A] mt-1">
                    <span>{stats.weekendBookings} bookings</span>
                    <span>
                      Avg:{" "}
                      {stats.weekendBookings > 0
                        ? formatRp(Math.round(stats.weekendRevenue / stats.weekendBookings))
                        : "Rp 0"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Insight */}
              <div className="mt-6 bg-[#F2EBE1] rounded-xl p-4 border border-[#E5E1DA]">
                <p className="text-[10px] font-bold text-[#2D312C] uppercase tracking-wider mb-1">Pricing Dynamics</p>
                <p className="text-xs text-[#6B6E6A] italic">
                  {stats.weekendRevenue > stats.weekdayRevenue
                    ? "Weekend rates are driving disproportionate value relative to occupancy volume."
                    : "Weekday bookings are driving the majority of revenue this period."}
                </p>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              4. REVENUE BY ROOM (TABLE) + TOP PERFORMING ROOMS
          ══════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue by Room Table */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E1DA] shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-[#E5E1DA] bg-[#F2EBE1]">
                <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C]">Revenue by Room</h3>
                <p className="text-xs text-[#6B6E6A] mt-0.5">Paid revenue breakdown per room.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#fcf9f5] border-b border-[#E5E1DA]">
                      <th className="py-3 px-4 font-semibold text-[#2D312C] uppercase tracking-wider">Room</th>
                      <th className="py-3 px-4 font-semibold text-[#2D312C] uppercase tracking-wider">Type</th>
                      <th className="py-3 px-4 font-semibold text-[#2D312C] uppercase tracking-wider text-center">Bookings</th>
                      <th className="py-3 px-4 font-semibold text-[#2D312C] uppercase tracking-wider text-center">Nights</th>
                      <th className="py-3 px-4 font-semibold text-[#2D312C] uppercase tracking-wider text-right">Revenue</th>
                      <th className="py-3 px-4 font-semibold text-[#2D312C] uppercase tracking-wider text-right">%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E1DA]">
                    {roomRevenue.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-[#6B6E6A]">No paid room revenue for this period.</td>
                      </tr>
                    ) : (
                      roomRevenue.map((r) => (
                        <tr key={r.name} className="hover:bg-[#fcf9f5] transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-[#2D312C]">{r.name}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ROOM_TYPE_BG[r.type] || "bg-[#506147]"} text-white`}>{r.type}</span>
                          </td>
                          <td className="py-3.5 px-4 text-center text-[#6B6E6A]">{r.bookings}</td>
                          <td className="py-3.5 px-4 text-center text-[#6B6E6A]">{r.nights}</td>
                          <td className="py-3.5 px-4 text-right font-bold text-[#2D312C]">{formatRp(r.revenue)}</td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-[#6B6E6A]">{r.pct}%</span>
                              <div className="w-12 bg-[#f0ede9] rounded-full h-1.5">
                                <div className="bg-[#506147] h-1.5 rounded-full" style={{ width: `${r.pct}%` }} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Performing Rooms */}
            <div className="bg-white rounded-xl border border-[#E5E1DA] shadow-sm p-6">
              <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C] mb-1">Top Performing Rooms</h3>
              <p className="text-xs text-[#6B6E6A] mb-5">Ranked by total paid revenue.</p>
              <div className="space-y-4">
                {roomRevenue.slice(0, 5).map((r, i) => (
                  <div key={r.name} className="flex items-start gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? "bg-[#D48C45] text-white" : i === 1 ? "bg-[#c4c8be] text-[#2D312C]" : i === 2 ? "bg-[#ad6042] text-white" : "bg-[#f0ede9] text-[#6B6E6A]"}`}>
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-[#2D312C] leading-snug">{r.name}</p>
                      <p className="text-[10px] text-[#6B6E6A]">{r.bookings} bookings · {r.nights} nights</p>
                      <p className="text-xs font-bold text-[#506147] mt-0.5">{formatRp(r.revenue)}</p>
                    </div>
                  </div>
                ))}
                {roomRevenue.length === 0 && (
                  <p className="text-sm text-[#6B6E6A]">No data for this period.</p>
                )}
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              5. BOOKING REVENUE BREAKDOWN + PAYMENT OVERVIEW
          ══════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Booking Revenue Breakdown */}
            <div className="bg-white rounded-xl border border-[#E5E1DA] shadow-sm p-6">
              <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C] mb-1">Booking Revenue</h3>
              <p className="text-xs text-[#6B6E6A] mb-5">Revenue by booking status category.</p>
              {[
                { label: "Paid Bookings", count: stats.paidCount, amount: stats.paidRevenue, color: "#506147", bg: "bg-[#506147]" },
                { label: "Pending Bookings", count: stats.pendingCount, amount: stats.pendingRevenue, color: "#D48C45", bg: "bg-[#D48C45]" },
                { label: "Refunded Bookings", count: stats.refundedCount, amount: stats.refundedRevenue, color: "#ad6042", bg: "bg-[#ad6042]" },
                { label: "Cancelled / Expired", count: stats.cancelledCount, amount: 0, color: "#c4c8be", bg: "bg-[#c4c8be]", note: "Not counted as revenue" },
              ].map(({ label, count, amount, bg, note }) => {
                const total = stats.paidRevenue + stats.pendingRevenue + stats.refundedRevenue;
                const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
                return (
                  <div key={label} className="mb-4">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs font-semibold text-[#2D312C]">{label}</span>
                      <div className="text-right">
                        <span className="text-xs font-bold text-[#2D312C]">{note || formatRp(amount)}</span>
                        <span className="text-[10px] text-[#6B6E6A] ml-2">{count} booking{count !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                    <div className="w-full bg-[#f0ede9] rounded-full h-2">
                      <div className={`${bg} h-2 rounded-full transition-all duration-500`} style={{ width: note ? "0%" : `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment Overview */}
            <div className="bg-white rounded-xl border border-[#E5E1DA] shadow-sm p-6">
              <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C] mb-1">Payment Overview</h3>
              <p className="text-xs text-[#6B6E6A] mb-5">Breakdown by payment status (separate from booking status).</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Paid", count: stats.paidCount, amount: stats.paidRevenue, icon: "check_circle", iconColor: "text-[#506147]", bg: "bg-[#E4EBE0]" },
                  { label: "Pending", count: stats.pendingCount, amount: stats.pendingRevenue, icon: "schedule", iconColor: "text-[#D48C45]", bg: "bg-[#FFF3E0]" },
                  { label: "Refunded", count: stats.refundedCount, amount: stats.refundedRevenue, icon: "reply", iconColor: "text-[#ad6042]", bg: "bg-[#FBE9E7]" },
                  { label: "Failed / Expired", count: filteredBookings.filter((b) => b.paymentStatus === "Expired").length, amount: 0, icon: "cancel", iconColor: "text-[#ba1a1a]", bg: "bg-[#ffdad6]" },
                ].map(({ label, count, amount, icon, iconColor, bg }) => (
                  <div key={label} className={`${bg} rounded-xl p-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-bold text-[#6B6E6A] uppercase tracking-wider">{label}</p>
                      <span className={`material-symbols-outlined text-[18px] ${iconColor}`}>{icon}</span>
                    </div>
                    <p className="font-['Newsreader',serif] text-xl font-bold text-[#2D312C]">{formatRp(amount)}</p>
                    <p className="text-[10px] text-[#6B6E6A] mt-0.5">{count} booking{count !== 1 ? "s" : ""}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              6. FINANCIAL BREAKDOWN
          ══════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-xl border border-[#E5E1DA] shadow-sm p-6">
            <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C] mb-6">Financial Breakdown</h3>
            <div className="flex flex-col md:flex-row items-stretch gap-3">
              {[
                { label: "Gross Revenue", value: stats.grossRevenue, accent: null, note: "Before deductions" },
                { label: "Discount", value: stats.totalDiscount, accent: "#D48C45", note: "Applied discounts" },
                { label: "Refunds", value: stats.refundedRevenue, accent: "#ba1a1a", note: "Returned to guests" },
              ].map(({ label, value, accent, note }, i) => (
                <React.Fragment key={label}>
                  <div className={`flex-1 bg-[#fcf9f5] rounded-xl border border-[#E5E1DA] p-5 relative overflow-hidden ${accent ? "pl-6" : ""}`}>
                    {accent && <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: accent }} />}
                    <p className="text-[10px] font-bold text-[#6B6E6A] uppercase tracking-wider">{label}</p>
                    <p className="font-['Newsreader',serif] text-xl font-bold text-[#2D312C] mt-1">{formatRp(value)}</p>
                    <p className="text-[10px] text-[#6B6E6A]">{note}</p>
                  </div>
                  {i < 2 && (
                    <div className="flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#c4c8be] text-[24px]">remove</span>
                    </div>
                  )}
                </React.Fragment>
              ))}
              <div className="flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#506147] text-[24px]">drag_handle</span>
              </div>
              <div className="flex-[1.5] bg-[#F2EBE1] rounded-xl border border-[#506147]/20 p-5 relative overflow-hidden shadow-sm">
                <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-[#506147]" />
                <p className="text-[10px] font-bold text-[#506147] uppercase tracking-wider">Net Revenue</p>
                <p className="font-['Newsreader',serif] text-2xl font-bold text-[#2D312C] mt-1">{formatRp(stats.netRevenue)}</p>
                <p className="text-[10px] text-[#6B6E6A]">Gross − Discount − Refund</p>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              7. REVENUE INSIGHTS
          ══════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-xl border border-[#E5E1DA] shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="material-symbols-outlined text-[#506147] text-[22px]">lightbulb</span>
              <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C]">Revenue Insights</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {insights.map((insight, i) => (
                <div key={i} className="bg-[#F2EBE1] rounded-xl p-4 border border-[#E5E1DA] flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#506147] text-[18px] mt-0.5 shrink-0">insights</span>
                  <p className="text-sm text-[#444840] leading-relaxed italic">&ldquo;{insight}&rdquo;</p>
                </div>
              ))}
              {insights.length === 0 && (
                <p className="text-sm text-[#6B6E6A]">Not enough data to generate insights.</p>
              )}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              8. REVENUE DETAILS TABLE
          ══════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-xl border border-[#E5E1DA] shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-[#E5E1DA] bg-[#F2EBE1] flex justify-between items-center">
              <div>
                <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C]">Revenue Details</h3>
                <p className="text-xs text-[#6B6E6A] mt-0.5">Daily revenue summary for selected period.</p>
              </div>
              <span className="text-xs text-[#6B6E6A]">{sortedDetails.length} day{sortedDetails.length !== 1 ? "s" : ""}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-[#fcf9f5] border-b border-[#E5E1DA]">
                    {[
                      { col: "date", label: "Date" },
                      { col: "total", label: "Bookings" },
                      { col: "paid", label: "Paid" },
                      { col: "nights", label: "Nights" },
                      { col: "gross", label: "Gross Revenue" },
                      { col: "discount", label: "Discount" },
                      { col: "refund", label: "Refund" },
                      { col: "net", label: "Net Revenue" },
                    ].map(({ col, label }) => (
                      <th
                        key={col}
                        onClick={() => toggleSort(col)}
                        className="py-3 px-4 font-semibold text-[#2D312C] uppercase tracking-wider cursor-pointer hover:text-[#506147] select-none whitespace-nowrap"
                      >
                        {label} <SortIcon col={col} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E1DA]">
                  {pagedDetails.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-[#6B6E6A]">No data for this period.</td>
                    </tr>
                  ) : (
                    pagedDetails.map((row) => (
                      <tr key={row.date} className="hover:bg-[#fcf9f5] transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-[#2D312C] whitespace-nowrap">
                          {new Date(row.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="py-3.5 px-4 text-[#6B6E6A]">{row.total}</td>
                        <td className="py-3.5 px-4 text-[#506147] font-semibold">{row.paid}</td>
                        <td className="py-3.5 px-4 text-[#6B6E6A]">{row.nights}</td>
                        <td className="py-3.5 px-4 font-semibold text-[#2D312C]">{formatRp(row.gross)}</td>
                        <td className="py-3.5 px-4 text-[#D48C45]">{row.discount > 0 ? formatRp(row.discount) : "—"}</td>
                        <td className="py-3.5 px-4 text-[#ba1a1a]">{row.refund > 0 ? formatRp(row.refund) : "—"}</td>
                        <td className="py-3.5 px-4 font-bold text-[#506147]">{formatRp(row.net)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalDetailPages > 1 && (
              <div className="px-6 py-4 border-t border-[#E5E1DA] flex items-center justify-between">
                <p className="text-xs text-[#6B6E6A]">
                  Page {detailPage} of {totalDetailPages}
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={detailPage === 1}
                    onClick={() => setDetailPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 bg-[#f0ede9] text-[#2D312C] text-xs font-semibold rounded-lg disabled:opacity-40 hover:bg-[#e5e2de] transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    disabled={detailPage === totalDetailPages}
                    onClick={() => setDetailPage((p) => Math.min(totalDetailPages, p + 1))}
                    className="px-3 py-1.5 bg-[#506147] text-white text-xs font-semibold rounded-lg disabled:opacity-40 hover:bg-[#3b4b33] transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}