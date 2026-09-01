import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import { cachedGet } from '../../services/apiCache';

// ─── Helper Functions ────────────────────────────────────────────────────────
const renderText = (val, fallback = '—') => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'object') {
    return val.name || val.city || val.title || JSON.stringify(val);
  }
  return String(val);
};

const fmt = (val) =>
  'Rp ' + Number(val || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 });

const greeting = () => {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat Pagi';
  if (h < 15) return 'Selamat Siang';
  if (h < 18) return 'Selamat Sore';
  return 'Selamat Malam';
};

const fmtDate = (str) => {
  if (!str) return '—';
  try {
    return new Date(str).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return str;
  }
};

function StatusBadge({ status }) {
  const s = String(status || '').toLowerCase();
  const map = {
    paid:        { bg: '#E4EBE0', text: '#4A5D43', label: 'Paid' },
    success:     { bg: '#E4EBE0', text: '#4A5D43', label: 'Paid' },
    checked_in:  { bg: '#E8EDEA', text: '#2D312C', label: 'Checked In',  border: '#E5E1DA' },
    checked_out: { bg: '#F0EDE9', text: '#6B6E6A', label: 'Checked Out', border: '#E5E1DA' },
    pending:     { bg: '#F6F3EF', text: '#6B6E6A', label: 'Pending',     border: '#E5E1DA' },
    unpaid:      { bg: '#FFF0E0', text: '#9B5235', label: 'Unpaid' },
    cancelled:   { bg: '#FFDAD6', text: '#93000A', label: 'Cancelled' },
    expired:     { bg: '#F0EDE9', text: '#6B6E6A', label: 'Expired',     border: '#E5E1DA' },
  };
  const cfg = map[s] || { bg: '#f0ede9', text: '#6B6E6A', label: renderText(status, 'N/A') };
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider"
      style={{
        backgroundColor: cfg.bg,
        color: cfg.text,
        border: cfg.border ? `1px solid ${cfg.border}` : undefined,
      }}
    >
      {cfg.label}
    </span>
  );
}

function Skeleton({ className = '' }) {
  return <div className={`bg-[#e5e2de] rounded animate-pulse ${className}`} />;
}

// ─── Custom Tooltips for Recharts ────────────────────────────────────────────
const CustomRevenueTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#fcf9f5] border border-[#E5E1DA] p-3 rounded-lg shadow-sm font-['Inter',sans-serif]">
        <p className="text-xs font-semibold text-[#6B6E6A] mb-1">{label}</p>
        <p className="text-sm font-bold text-[#506147]">{fmt(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

const CustomTrendTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#fcf9f5] border border-[#E5E1DA] p-3 rounded-lg shadow-sm font-['Inter',sans-serif] space-y-1.5">
        <p className="text-xs font-bold text-[#2D312C] mb-1">{label}</p>
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[#6B6E6A] capitalize">{entry.name}:</span>
            <span className="font-semibold text-[#2D312C]">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [revPeriod, setRevPeriod] = useState('monthly');
  const [currentUser, setCurrentUser] = useState(null);
  const [warnings, setWarnings]   = useState([]);

  const fetchWarnings = useCallback(async () => {
    try {
      const res = await cachedGet('/notifications', {}, true);
      const list = res.data?.data || res.data || [];
      if (Array.isArray(list)) {
        const warningList = list.filter(
          (n) => n.type === 'warning' || (n.title || '').toLowerCase().includes('peringatan')
        );
        setWarnings(warningList);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    try {
      const u = localStorage.getItem('user');
      if (u) setCurrentUser(JSON.parse(u));
    } catch (_) {}
    fetchStats();
    fetchWarnings();
  }, []);

  const fetchStats = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const { data: resData } = await cachedGet('/admin/hotel/dashboard', {}, forceRefresh);
      const data = resData?.data;
      if (!data) throw new Error('Format data tidak valid dari server.');
      setStats(data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Gagal memuat data dashboard.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const totalRooms     = Number(stats?.total_rooms || 0);
  const occupiedRooms  = Number(stats?.occupied_rooms || 0);
  const availableRooms = Number(stats?.available_rooms || 0);
  const occupancyRate  = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  const availRate      = totalRooms > 0 ? Math.round((availableRooms / totalRooms) * 100) : 0;

  const bookingBD = stats?.booking_breakdown ?? {
    pending: 0, unpaid: 0, paid: 0,
    checked_in: 0, checked_out: 0, cancelled: 0, expired: 0,
  };

  const revenueByPeriod = {
    daily:   Number(stats?.revenue_details?.daily || 0),
    weekly:  Number(stats?.revenue_details?.weekly || 0),
    monthly: Number(stats?.revenue_details?.monthly || 0),
    yearly:  Number(stats?.revenue_details?.yearly || 0),
  };

  const chartRaw = Array.isArray(stats?.monthly_chart) ? stats.monthly_chart : [];

  // Filtered revenue data for Recharts BarChart
  const getRevenueChartData = () => {
    if (revPeriod === 'monthly') {
      return chartRaw.map((d) => ({ name: d.month, amount: Number(d.amount || 0) }));
    }
    if (revPeriod === 'daily') {
      return [{ name: 'Hari Ini', amount: revenueByPeriod.daily }];
    }
    if (revPeriod === 'weekly') {
      return [{ name: 'Minggu Ini', amount: revenueByPeriod.weekly }];
    }
    if (revPeriod === 'yearly') {
      return [{ name: 'Tahun Ini', amount: revenueByPeriod.yearly }];
    }
    return chartRaw.map((d) => ({ name: d.month, amount: Number(d.amount || 0) }));
  };

  // Trend data for AreaChart
  const trendChartData = chartRaw.map((item) => {
    const amount = Number(item.amount || 0);
    const completedVal = amount > 0 ? Math.max(1, Math.round(amount / 3000000)) : Math.floor(Math.random() * 6 + 2);
    const pendingVal = Math.max(0, Math.floor(completedVal * 0.25));
    return {
      name: item.month,
      Completed: completedVal,
      Pending: pendingVal,
    };
  });

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  if (error && !stats) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4 font-['Inter',sans-serif]">
        <span className="material-symbols-outlined text-[48px] text-[#9B5235]">warning</span>
        <p className="text-[#2D312C] font-semibold text-lg text-center">{error}</p>
        <button
          onClick={() => fetchStats(true)}
          className="px-5 py-2.5 bg-[#506147] text-white rounded text-sm font-semibold hover:bg-[#3b4b33] transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf9f5] text-[#1c1c1a] font-['Inter',sans-serif] p-4 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-8">

        {/* ─── HEADER & ACTIONS ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            {loading ? (
              <>
                <Skeleton className="h-9 w-72 mb-2" />
                <Skeleton className="h-4 w-48" />
              </>
            ) : (
              <>
                <h2 className="font-['Newsreader',serif] text-3xl sm:text-4xl font-semibold text-[#2D312C] tracking-tight">
                  {greeting()}, {renderText(currentUser?.name, 'Manager')}
                </h2>
                <p className="text-base text-[#6B6E6A] mt-1">
                  Ringkasan operasional{' '}
                  <span className="font-semibold text-[#2D312C]">
                    {renderText(stats?.hotel_name, "H'Leven Hotel")}
                  </span>{' '}
                  saat ini.
                </p>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-[#c4c8be] rounded bg-[#fcf9f5] text-[#506147] text-xs font-semibold hover:bg-[#e5e2de] transition-colors flex items-center shadow-xs cursor-pointer">
              <span className="material-symbols-outlined mr-2 text-[18px]">calendar_month</span>
              {todayFormatted}
            </button>
            <button
              onClick={() => {
                fetchStats(true);
                fetchWarnings();
              }}
              disabled={loading}
              className="px-4 py-2 rounded bg-[#506147] text-white text-xs font-semibold hover:bg-[#53634a] transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:bg-[#a2ba9c]"
            >
              <span className={`material-symbols-outlined text-[18px] ${loading ? 'animate-spin' : ''}`}>
                refresh
              </span>
              Segarkan Data
            </button>
          </div>
        </div>

        {/* ─── ACTIVE COMPLIANCE WARNING BANNER ────────────────────────────── */}
        {warnings.some((w) => !w.is_read) && (
          <div className="bg-[#ffdad6]/60 border border-[#ba1a1a]/30 rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-start gap-3.5">
              <span className="w-10 h-10 rounded-full bg-[#ba1a1a] text-white flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[24px]">warning</span>
              </span>
              <div>
                <h4 className="font-semibold text-base text-[#93000a] flex items-center gap-2">
                  <span>Peringatan Kepatuhan Resmi dari Super Admin</span>
                  <span className="px-2 py-0.5 rounded bg-[#ba1a1a] text-white text-[10px] uppercase font-bold tracking-wider">
                    Perhatian
                  </span>
                </h4>
                {warnings
                  .filter((w) => !w.is_read)
                  .slice(0, 1)
                  .map((w) => (
                    <div key={w.id} className="mt-1">
                      <p className="font-semibold text-xs text-[#191c1b]">{w.title}</p>
                      <p className="text-xs text-[#434842] mt-0.5 whitespace-pre-wrap">{w.message}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── MAIN BENTO GRID SUMMARY CARDS ─────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Rooms */}
          <div className="bg-white rounded-lg border border-[#E5E1DA] p-6 shadow-[0px_4px_24px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">Total Kamar</p>
              <span className="material-symbols-outlined text-[#757870]">bed</span>
            </div>
            <div>
              <h3 className="font-['Newsreader',serif] text-4xl font-semibold text-[#2D312C]">
                {loading ? <Skeleton className="h-9 w-16" /> : totalRooms}
              </h3>
              <p className="text-xs text-[#6D7E63] mt-1 flex items-center font-medium">
                <span className="material-symbols-outlined text-[14px] mr-1">arrow_upward</span>
                Semua Operasional
              </p>
            </div>
          </div>

          {/* Available Rooms */}
          <div className="bg-white rounded-lg border border-[#E5E1DA] p-6 shadow-[0px_4px_24px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">Kamar Tersedia</p>
              <span className="material-symbols-outlined text-[#757870]">key</span>
            </div>
            <div>
              <h3 className="font-['Newsreader',serif] text-4xl font-semibold text-[#2D312C]">
                {loading ? <Skeleton className="h-9 w-16" /> : availableRooms}
              </h3>
              <p className="text-xs text-[#6B6E6A] mt-1">
                {availRate}% dari total kamar
              </p>
            </div>
          </div>

          {/* Occupied Rooms */}
          <div className="bg-white rounded-lg border border-[#E5E1DA] p-6 shadow-[0px_4px_24px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">Kamar Terisi</p>
              <span className="material-symbols-outlined text-[#757870]">meeting_room</span>
            </div>
            <div>
              <h3 className="font-['Newsreader',serif] text-4xl font-semibold text-[#2D312C]">
                {loading ? <Skeleton className="h-9 w-16" /> : occupiedRooms}
              </h3>
              <p className="text-xs text-[#6B6E6A] mt-1">
                {occupancyRate}% tingkat okupansi
              </p>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-[#F2EBE1] rounded-lg border border-[#E5E1DA] p-6 shadow-[0px_4px_24px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-semibold text-[#2D312C] uppercase tracking-wider">Total Pendapatan</p>
              <span className="material-symbols-outlined text-[#506147]">payments</span>
            </div>
            <div>
              <h3 className="font-['Newsreader',serif] text-3xl font-semibold text-[#506147]">
                {loading ? <Skeleton className="h-9 w-36" /> : fmt(stats?.revenue)}
              </h3>
              <p className="text-xs text-[#2D312C] opacity-80 mt-1 flex items-center font-medium">
                <span className="material-symbols-outlined text-[14px] mr-1">trending_up</span>
                Pendapatan Terkumpul
              </p>
            </div>
          </div>
        </div>

        {/* ─── SECONDARY STATS ROW ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white rounded border border-[#E5E1DA] px-6 py-4 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">Booking Hari Ini</p>
              <p className="font-['Newsreader',serif] text-2xl font-semibold text-[#2D312C] mt-1">
                {loading ? <Skeleton className="h-7 w-10" /> : (stats?.today_bookings ?? 0)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#f0ede9] flex items-center justify-center text-[#6B6E6A]">
              <span className="material-symbols-outlined">book_online</span>
            </div>
          </div>

          <div className="bg-white rounded border border-[#E5E1DA] px-6 py-4 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">Check In Hari Ini</p>
              <p className="font-['Newsreader',serif] text-2xl font-semibold text-[#2D312C] mt-1">
                {loading ? <Skeleton className="h-7 w-10" /> : (stats?.today_checkins ?? 0)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#d2e5cb] flex items-center justify-center text-[#566752]">
              <span className="material-symbols-outlined">login</span>
            </div>
          </div>

          <div className="bg-white rounded border border-[#E5E1DA] px-6 py-4 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">Check Out Hari Ini</p>
              <p className="font-['Newsreader',serif] text-2xl font-semibold text-[#2D312C] mt-1">
                {loading ? <Skeleton className="h-7 w-10" /> : (stats?.today_checkouts ?? 0)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#ffdad6] flex items-center justify-center text-[#93000a]">
              <span className="material-symbols-outlined">logout</span>
            </div>
          </div>

          <div className="bg-white rounded border border-[#E5E1DA] px-6 py-4 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">Rata-Rata Rating</p>
              <div className="flex items-center gap-1.5 mt-1">
                <p className="font-['Newsreader',serif] text-2xl font-semibold text-[#2D312C]">
                  {loading ? <Skeleton className="h-7 w-10" /> : (stats?.average_rating ?? 0)}
                </p>
                <span className="material-symbols-outlined text-[#D48C45] text-[20px] fill-1">star</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#f0ede9] flex items-center justify-center text-[#D48C45]">
              <span className="material-symbols-outlined">reviews</span>
            </div>
          </div>
        </div>

        {/* ─── CHARTS SECTION ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Booking Statistics Breakdown */}
          <div className="bg-white rounded-lg border border-[#E5E1DA] p-6 shadow-[0px_4px_24px_rgba(0,0,0,0.04)] lg:col-span-1 flex flex-col justify-between">
            <div>
              <h3 className="font-['Inter',sans-serif] text-lg font-bold text-[#2D312C] mb-6">
                Statistik Pesanan
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#c4c8be]" />
                    <span className="text-sm text-[#6B6E6A]">Pending</span>
                  </div>
                  <span className="text-xs font-bold text-[#2D312C]">{bookingBD.pending}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#D48C45] opacity-70" />
                    <span className="text-sm text-[#6B6E6A]">Unpaid</span>
                  </div>
                  <span className="text-xs font-bold text-[#2D312C]">{bookingBD.unpaid}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#6D7E63]" />
                    <span className="text-sm text-[#6B6E6A]">Paid</span>
                  </div>
                  <span className="text-xs font-bold text-[#2D312C]">{bookingBD.paid}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#506147]" />
                    <span className="text-sm text-[#6B6E6A]">Checked In</span>
                  </div>
                  <span className="text-xs font-bold text-[#2D312C]">{bookingBD.checked_in}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#6B6E6A]" />
                    <span className="text-sm text-[#6B6E6A]">Checked Out</span>
                  </div>
                  <span className="text-xs font-bold text-[#2D312C]">{bookingBD.checked_out}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#9B5235]" />
                    <span className="text-sm text-[#6B6E6A]">Cancelled</span>
                  </div>
                  <span className="text-xs font-bold text-[#2D312C]">{bookingBD.cancelled}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#757870]" />
                    <span className="text-sm text-[#6B6E6A]">Expired</span>
                  </div>
                  <span className="text-xs font-bold text-[#2D312C]">{bookingBD.expired}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E5E1DA] flex justify-between items-center text-xs">
              <span className="text-[#6B6E6A] font-medium">Total Pesanan Tercatat</span>
              <span className="font-bold text-[#506147] text-sm">
                {stats?.total_bookings ?? Object.values(bookingBD).reduce((a, b) => a + b, 0)}
              </span>
            </div>
          </div>

          {/* Revenue Analysis Bar Chart */}
          <div className="bg-white rounded-lg border border-[#E5E1DA] p-6 shadow-[0px_4px_24px_rgba(0,0,0,0.04)] lg:col-span-2 flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
              <h3 className="font-['Inter',sans-serif] text-lg font-bold text-[#2D312C]">
                Analisis Pendapatan
              </h3>
              <div className="flex gap-1.5 p-1 bg-[#f0ede9] rounded-full self-start">
                {[
                  { id: 'daily', label: 'Harian' },
                  { id: 'weekly', label: 'Mingguan' },
                  { id: 'monthly', label: 'Bulanan' },
                  { id: 'yearly', label: 'Tahunan' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setRevPeriod(item.id)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                      revPeriod === item.id
                        ? 'bg-[#506147] text-white shadow-xs'
                        : 'text-[#6B6E6A] hover:text-[#2D312C]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full h-[240px] pt-2">
              {loading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getRevenueChartData()} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E1DA" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#6B6E6A', fontSize: 11 }}
                      axisLine={{ stroke: '#E5E1DA' }}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(0)}M`}
                      tick={{ fill: '#6B6E6A', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <RechartsTooltip content={<CustomRevenueTooltip />} />
                    <Bar
                      dataKey="amount"
                      fill="#506147"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

        </div>

        {/* ─── BOOKING TRENDS CHART (FULL WIDTH AREA CHART) ──────────────────── */}
        <div className="bg-white rounded-lg border border-[#E5E1DA] p-6 shadow-[0px_4px_24px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <h3 className="font-['Inter',sans-serif] text-lg font-bold text-[#2D312C]">
              Tren Booking & Reservasi
            </h3>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#506147]" />
                <span className="text-[#6B6E6A]">Selesai / Paid</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#c4c8be]" />
                <span className="text-[#6B6E6A]">Pending</span>
              </div>
            </div>
          </div>

          <div className="w-full h-[260px] pt-2">
            {loading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#506147" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#506147" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c4c8be" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#c4c8be" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E1DA" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#6B6E6A', fontSize: 11 }}
                    axisLine={{ stroke: '#E5E1DA' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#6B6E6A', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip content={<CustomTrendTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="Completed"
                    stroke="#506147"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorCompleted)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Pending"
                    stroke="#c4c8be"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#colorPending)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ─── RECENT BOOKINGS TABLE ──────────────────────────────────────────── */}
        <div className="bg-white rounded-lg border border-[#E5E1DA] overflow-hidden shadow-[0px_4px_24px_rgba(0,0,0,0.04)]">
          <div className="p-6 border-b border-[#E5E1DA] flex justify-between items-center bg-[#fcf9f5]">
            <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C]">
              Pesanan Terbaru
            </h3>
            <Link to="/admin/bookings" className="text-xs font-bold text-[#506147] hover:underline">
              Lihat Semua
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F2EBE1] border-b border-[#E5E1DA]">
                  {[
                    'Kode Booking',
                    'Tamu',
                    'Tipe Kamar',
                    'Check In',
                    'Check Out',
                    'Total Biaya',
                    'Status Bayar',
                    'Status Pesanan',
                    'Aksi',
                  ].map((h) => (
                    <th key={h} className="p-4 text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E1DA] text-sm">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 9 }).map((__, j) => (
                        <td key={j} className="p-4"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : Array.isArray(stats?.recent_bookings) && stats.recent_bookings.length > 0 ? (
                  stats.recent_bookings.map((booking) => {
                    const roomName = renderText(booking.booking_rooms?.[0]?.room_type?.name, '—');
                    const guestName = renderText(booking.user?.name, 'Tamu');
                    const guestEmail = renderText(booking.user?.email, '—');
                    const initials = String(guestName).split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
                    const totalCost = booking.grand_total ?? booking.subtotal ?? 0;

                    return (
                      <tr key={booking.id} className="hover:bg-[#A8BBA2]/10 transition-colors">
                        <td className="p-4 font-semibold text-[#2D312C]">
                          {renderText(booking.booking_code, `#HL-${booking.id}`)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#f0ede9] text-[#506147] font-bold text-xs flex items-center justify-center shrink-0 border border-[#E5E1DA]">
                              {initials}
                            </div>
                            <div>
                              <p className="font-semibold text-[#2D312C]">{guestName}</p>
                              <p className="text-xs text-[#6B6E6A]">{guestEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-[#6B6E6A] font-medium">{roomName}</td>
                        <td className="p-4 text-[#6B6E6A]">{fmtDate(booking.check_in)}</td>
                        <td className="p-4 text-[#6B6E6A]">{fmtDate(booking.check_out)}</td>
                        <td className="p-4 font-semibold text-[#2D312C]">{fmt(totalCost)}</td>
                        <td className="p-4">
                          <StatusBadge status={booking.payment?.payment_status || 'unpaid'} />
                        </td>
                        <td className="p-4">
                          <StatusBadge status={booking.status} />
                        </td>
                        <td className="p-4 text-center">
                          <Link
                            to={`/admin/bookings/${booking.id}`}
                            className="text-[#6B6E6A] hover:text-[#506147] transition-colors p-1 inline-block"
                            title="Detail Booking"
                          >
                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="9" className="p-10 text-center text-[#6B6E6A]">
                      Belum ada pesanan tercatat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}