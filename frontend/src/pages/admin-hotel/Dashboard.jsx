import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { cachedGet } from '../../services/apiCache';

// ─── Helper: Format Rupiah ────────────────────────────────────────────────────
const fmt = (val) =>
  'Rp ' + Number(val || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 });

// ─── Helper: Greeting ────────────────────────────────────────────────────────
const greeting = () => {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat Pagi';
  if (h < 15) return 'Selamat Siang';
  if (h < 18) return 'Selamat Sore';
  return 'Selamat Malam';
};

// ─── Helper: Format tanggal ───────────────────────────────────────────────────
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

// ─── Status Badge ─────────────────────────────────────────────────────────────
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
  const cfg = map[s] || { bg: '#f0ede9', text: '#6B6E6A', label: status || 'N/A' };
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
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

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function Skeleton({ className = '' }) {
  return (
    <div className={`bg-[#e5e2de] rounded animate-pulse ${className}`} />
  );
}

export default function Dashboard() {
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [revPeriod, setRevPeriod] = useState('monthly'); // 'daily'|'weekly'|'monthly'|'yearly'
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const u = localStorage.getItem('user');
      if (u) setCurrentUser(JSON.parse(u));
    } catch (_) {}
    fetchStats();
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

  // ── Derived values ─────────────────────────────────────────────────────────
  const totalRooms     = stats?.total_rooms      ?? 0;
  const occupiedRooms  = stats?.occupied_rooms   ?? 0;
  const availableRooms = stats?.available_rooms  ?? 0;
  const occupancyRate  = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const bookingBD = stats?.booking_breakdown ?? {
    pending: 0, unpaid: 0, paid: 0,
    checked_in: 0, checked_out: 0, cancelled: 0, expired: 0,
  };

  const revenueByPeriod = {
    daily:   stats?.revenue_details?.daily   ?? 0,
    weekly:  stats?.revenue_details?.weekly  ?? 0,
    monthly: stats?.revenue_details?.monthly ?? 0,
    yearly:  stats?.revenue_details?.yearly  ?? 0,
  };
  const currentRevenue = revenueByPeriod[revPeriod];

  // Chart data dari backend (monthly_chart) atau fallback kosong
  const chartRaw = stats?.monthly_chart ?? [];
  const chartMax = chartRaw.length ? Math.max(...chartRaw.map((d) => d.amount), 1) : 1;

  // Tanggal hari ini
  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // ── Error state ────────────────────────────────────────────────────────────
  if (error && !stats) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <span className="material-symbols-outlined text-[48px] text-[#9B5235]">warning</span>
        <p className="text-[#2D312C] font-semibold text-lg text-center">{error}</p>
        <button
          onClick={fetchStats}
          className="px-5 py-2.5 bg-[#506147] text-white rounded-lg text-sm font-semibold hover:bg-[#3b4b33] transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-8 font-['Hanken_Grotesk',sans-serif]">

      {/* ====== HEADER ====================================================== */}
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
                {greeting()}, {currentUser?.name || 'Manager'}
              </h2>
              <p className="text-sm text-[#6B6E6A] mt-1">
                Ringkasan operasional{' '}
                <span className="font-semibold text-[#2D312C]">
                  {stats?.hotel_name || "H'Leven Hotel"}
                </span>{' '}
                saat ini.
              </p>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 border border-[#c4c8be] rounded-lg bg-[#fcf9f5] text-[#506147] text-xs font-semibold flex items-center shadow-sm">
            <span className="material-symbols-outlined mr-2 text-[18px]">calendar_month</span>
            {todayFormatted}
          </div>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-[#506147] text-white text-xs font-semibold hover:bg-[#3b4b33] transition-all shadow-sm hover:shadow active:scale-[0.98] flex items-center gap-1.5 disabled:bg-[#a2ba9c] disabled:cursor-not-allowed"
          >
            <span className={`material-symbols-outlined text-[18px] ${loading ? 'animate-spin' : ''}`}>
              refresh
            </span>
            Segarkan Data
          </button>
        </div>
      </div>

      {/* ====== BENTO SUMMARY CARDS ========================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Total Kamar */}
        <div className="bg-white rounded-xl border border-[#E5E1DA] p-6 shadow-sm flex flex-col justify-between hover:border-[#c4c8be] transition-colors">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">Total Kamar</p>
            <span className="material-symbols-outlined text-[#757870] text-[22px]">bed</span>
          </div>
          <div>
            {loading ? (
              <Skeleton className="h-9 w-16 mb-2" />
            ) : (
              <h3 className="font-['Newsreader',serif] text-4xl font-semibold text-[#2D312C]">
                {totalRooms}
              </h3>
            )}
            <p className="text-xs text-[#6D7E63] mt-2 flex items-center font-medium">
              <span className="material-symbols-outlined text-[15px] mr-1">check_circle</span>
              Semua Kamar Siap Operasional
            </p>
          </div>
        </div>

        {/* Kamar Tersedia */}
        <div className="bg-white rounded-xl border border-[#E5E1DA] p-6 shadow-sm flex flex-col justify-between hover:border-[#c4c8be] transition-colors">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">Kamar Tersedia</p>
            <span className="material-symbols-outlined text-[#757870] text-[22px]">key</span>
          </div>
          <div>
            {loading ? (
              <Skeleton className="h-9 w-16 mb-2" />
            ) : (
              <h3 className="font-['Newsreader',serif] text-4xl font-semibold text-[#2D312C]">
                {availableRooms}
              </h3>
            )}
            <p className="text-xs text-[#6B6E6A] mt-2">
              {loading ? '—' : `${100 - occupancyRate}% dari total kapasitas`}
            </p>
          </div>
        </div>

        {/* Kamar Terisi */}
        <div className="bg-white rounded-xl border border-[#E5E1DA] p-6 shadow-sm flex flex-col justify-between hover:border-[#c4c8be] transition-colors">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">Kamar Terisi</p>
            <span className="material-symbols-outlined text-[#757870] text-[22px]">meeting_room</span>
          </div>
          <div>
            {loading ? (
              <Skeleton className="h-9 w-16 mb-2" />
            ) : (
              <h3 className="font-['Newsreader',serif] text-4xl font-semibold text-[#2D312C]">
                {occupiedRooms}
              </h3>
            )}
            <p className="text-xs text-[#6B6E6A] mt-2">
              {loading ? '—' : `${occupancyRate}% Tingkat Okupansi`}
            </p>
          </div>
        </div>

        {/* Total Pendapatan */}
        <div className="bg-[#F2EBE1] rounded-xl border border-[#E5E1DA] p-6 shadow-sm flex flex-col justify-between hover:border-[#c4c8be] transition-colors">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-semibold text-[#2D312C] uppercase tracking-wider">Total Pendapatan</p>
            <span className="material-symbols-outlined text-[#506147] text-[22px]">payments</span>
          </div>
          <div>
            {loading ? (
              <Skeleton className="h-9 w-36 mb-2" />
            ) : (
              <h3
                className="font-['Newsreader',serif] text-3xl font-semibold text-[#506147] truncate"
                title={fmt(stats?.revenue)}
              >
                {fmt(stats?.revenue)}
              </h3>
            )}
            <p className="text-xs text-[#2D312C]/80 mt-2 flex items-center font-medium">
              <span className="material-symbols-outlined text-[15px] mr-1 text-[#6D7E63]">trending_up</span>
              Pendapatan terverifikasi keseluruhan
            </p>
          </div>
        </div>
      </div>

      {/* ====== SECONDARY STAT CARDS ======================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <div className="bg-white rounded-lg border border-[#E5E1DA] px-5 py-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[11px] font-semibold text-[#6B6E6A] uppercase tracking-wider">Pesanan Hari Ini</p>
            {loading
              ? <Skeleton className="h-7 w-10 mt-1" />
              : <p className="font-['Newsreader',serif] text-2xl font-semibold text-[#2D312C] mt-0.5">{stats?.today_bookings ?? 0}</p>
            }
          </div>
          <div className="w-10 h-10 rounded-full bg-[#f0ede9] flex items-center justify-center text-[#6B6E6A]">
            <span className="material-symbols-outlined text-[20px]">book_online</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#E5E1DA] px-5 py-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[11px] font-semibold text-[#6B6E6A] uppercase tracking-wider">Check In Hari Ini</p>
            {loading
              ? <Skeleton className="h-7 w-10 mt-1" />
              : <p className="font-['Newsreader',serif] text-2xl font-semibold text-[#2D312C] mt-0.5">{stats?.today_checkins ?? 0}</p>
            }
          </div>
          <div className="w-10 h-10 rounded-full bg-[#d2e5cb] flex items-center justify-center text-[#566752]">
            <span className="material-symbols-outlined text-[20px]">login</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#E5E1DA] px-5 py-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[11px] font-semibold text-[#6B6E6A] uppercase tracking-wider">Check Out Hari Ini</p>
            {loading
              ? <Skeleton className="h-7 w-10 mt-1" />
              : <p className="font-['Newsreader',serif] text-2xl font-semibold text-[#2D312C] mt-0.5">{stats?.today_checkouts ?? 0}</p>
            }
          </div>
          <div className="w-10 h-10 rounded-full bg-[#ffdad6] flex items-center justify-center text-[#93000a]">
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#E5E1DA] px-5 py-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[11px] font-semibold text-[#6B6E6A] uppercase tracking-wider">Rating Kepuasan</p>
            {loading
              ? <Skeleton className="h-7 w-20 mt-1" />
              : (
                <div className="flex items-center gap-1 mt-0.5">
                  <p className="font-['Newsreader',serif] text-2xl font-semibold text-[#2D312C]">
                    {stats?.average_rating != null ? stats.average_rating : '—'}
                  </p>
                  {stats?.average_rating != null && (
                    <span className="material-symbols-outlined text-[#D48C45] text-[20px]">star</span>
                  )}
                </div>
              )
            }
          </div>
          <div className="w-10 h-10 rounded-full bg-[#F2EBE1] flex items-center justify-center text-[#D48C45]">
            <span className="material-symbols-outlined text-[20px]">reviews</span>
          </div>
        </div>
      </div>

      {/* ====== ANALYTICS SECTION =========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Booking Statistics Breakdown */}
        <div className="bg-white rounded-xl border border-[#E5E1DA] p-6 shadow-sm flex flex-col">
          <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C] mb-6">
            Statistik Pesanan
          </h3>

          <div className="flex-1 space-y-4 text-sm">
            {[
              { key: 'pending',     label: 'Pending',     color: '#c4c8be' },
              { key: 'unpaid',      label: 'Belum Bayar', color: '#D48C45' },
              { key: 'paid',        label: 'Terbayar',    color: '#6D7E63' },
              { key: 'checked_in',  label: 'Checked In',  color: '#506147' },
              { key: 'checked_out', label: 'Checked Out', color: '#6B6E6A' },
              { key: 'cancelled',   label: 'Dibatalkan',  color: '#9B5235' },
              { key: 'expired',     label: 'Kadaluarsa',  color: '#c4c8be' },
            ].map(({ key, label, color }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
                  <span className="text-[#6B6E6A]">{label}</span>
                </div>
                {loading
                  ? <Skeleton className="h-4 w-8" />
                  : <span className="font-semibold text-[#2D312C]">{bookingBD[key] ?? 0}</span>
                }
              </div>
            ))}
          </div>

          <div className="pt-5 mt-5 border-t border-[#E5E1DA] flex items-center justify-between text-xs text-[#6B6E6A]">
            <span>Total Semua Transaksi</span>
            {loading
              ? <Skeleton className="h-4 w-10" />
              : <span className="font-bold text-[#2D312C] text-sm">{stats?.total_bookings ?? 0}</span>
            }
          </div>
        </div>

        {/* Revenue Analysis Chart */}
        <div className="bg-white rounded-xl border border-[#E5E1DA] p-6 shadow-sm lg:col-span-2 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C]">
                Analisis Pendapatan
              </h3>
              {loading
                ? <Skeleton className="h-3.5 w-40 mt-1.5" />
                : (
                  <p className="text-xs text-[#6B6E6A] mt-0.5">
                    Periode terpilih:{' '}
                    <span className="font-semibold text-[#506147]">{fmt(currentRevenue)}</span>
                  </p>
                )
              }
            </div>

            {/* Period Switcher */}
            <div className="flex items-center gap-1 bg-[#f0ede9] p-1 rounded-lg shrink-0">
              {[
                { key: 'daily',   label: 'Harian' },
                { key: 'weekly',  label: 'Mingguan' },
                { key: 'monthly', label: 'Bulanan' },
                { key: 'yearly',  label: 'Tahunan' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setRevPeriod(key)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    revPeriod === key
                      ? key === 'monthly'
                        ? 'bg-[#506147] text-white shadow-sm'
                        : 'bg-white text-[#2D312C] shadow-sm'
                      : 'text-[#6B6E6A] hover:text-[#2D312C]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Bar Chart - bulan dalam tahun ini */}
          <div className="relative min-h-[200px] border-b border-l border-[#E5E1DA] pl-6 pb-6 pt-4 flex items-end flex-1">
            {/* Y axis guide */}
            <div className="absolute left-0 top-2 bottom-8 flex flex-col justify-between text-[10px] text-[#757870] select-none w-5">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>

            {/* Grid lines */}
            <div className="absolute inset-0 left-8 bottom-6 flex flex-col justify-between pointer-events-none opacity-40">
              {[0,1,2,3].map((i) => (
                <div key={i} className="w-full border-t border-dashed border-[#E5E1DA]" />
              ))}
            </div>

            {/* Bars */}
            <div className="w-full h-full flex items-end justify-around relative z-10 px-1 gap-1">
              {loading
                ? Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                      <Skeleton className="w-full rounded-t-md" style={{ height: `${30 + Math.random() * 60}px` }} />
                      <Skeleton className="h-3 w-6" />
                    </div>
                  ))
                : chartRaw.length > 0
                ? chartRaw.map((item, idx) => {
                    const pct = chartMax > 0 ? (item.amount / chartMax) * 100 : 0;
                    const isCurrentMonth = idx === new Date().getMonth();
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer min-w-0">
                        <div
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#2D312C] text-white text-[10px] font-semibold py-1 px-1.5 rounded pointer-events-none shadow whitespace-nowrap"
                        >
                          {fmt(item.amount)}
                        </div>
                        <div
                          className={`w-full rounded-t-md transition-all duration-300 min-h-[4px] ${
                            isCurrentMonth
                              ? 'bg-[#506147] group-hover:bg-[#3b4b33]'
                              : 'bg-[#d6e8c8] group-hover:bg-[#506147]'
                          }`}
                          style={{ height: `${Math.max(pct * 1.6, 4)}px` }}
                        />
                        <span className="text-[10px] font-semibold text-[#6B6E6A] group-hover:text-[#2D312C] truncate w-full text-center">
                          {item.month}
                        </span>
                      </div>
                    );
                  })
                : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-[#6B6E6A]">
                    Belum ada data pendapatan
                  </div>
                )
              }
            </div>
          </div>
        </div>
      </div>

      {/* ====== RECENT BOOKINGS TABLE ======================================= */}
      <div className="bg-white rounded-xl border border-[#E5E1DA] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[#E5E1DA] flex justify-between items-center bg-[#fcf9f5]">
          <div>
            <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C]">
              Pesanan Terbaru
            </h3>
            <p className="text-xs text-[#6B6E6A] mt-0.5">
              Data real-time dari server — {stats?.total_bookings ?? '—'} total transaksi tercatat.
            </p>
          </div>
          <Link
            to="/admin/bookings"
            className="text-xs font-semibold text-[#506147] hover:text-[#3b4b33] hover:underline flex items-center gap-1"
          >
            Lihat Semua
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F2EBE1] border-b border-[#E5E1DA]">
                {['Kode Booking', 'Tamu', 'Tipe Kamar', 'Check In', 'Check Out', 'Total Biaya', 'Status Bayar', 'Status Pesanan'].map((h) => (
                  <th key={h} className="p-4 text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E5E1DA] text-sm">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} className="p-4">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : stats?.recent_bookings?.length > 0 ? (
                stats.recent_bookings.map((booking) => {
                  const roomName =
                    booking.booking_rooms?.[0]?.room_type?.name ?? '—';
                  const guestName = booking.user?.name ?? 'Tamu';
                  const initials = guestName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();
                  const totalCost =
                    booking.grand_total ??
                    booking.subtotal ??
                    booking.payment?.gross_amount ??
                    0;
                  const paymentStatus = booking.payment?.payment_status ?? 'unpaid';

                  return (
                    <tr key={booking.id} className="hover:bg-[#A8BBA2]/10 transition-colors">
                      <td className="p-4 font-semibold text-[#2D312C] whitespace-nowrap">
                        {booking.booking_code ?? `#HL-${booking.id}`}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#f0ede9] text-[#506147] font-semibold text-xs flex items-center justify-center shrink-0 border border-[#E5E1DA]">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[#2D312C] leading-none truncate">{guestName}</p>
                            <p className="text-xs text-[#6B6E6A] mt-0.5 truncate">{booking.user?.email ?? '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-[#6B6E6A] font-medium whitespace-nowrap">{roomName}</td>
                      <td className="p-4 text-[#6B6E6A] whitespace-nowrap">{fmtDate(booking.check_in)}</td>
                      <td className="p-4 text-[#6B6E6A] whitespace-nowrap">{fmtDate(booking.check_out)}</td>
                      <td className="p-4 font-semibold text-[#2D312C] whitespace-nowrap">{fmt(totalCost)}</td>
                      <td className="p-4"><StatusBadge status={paymentStatus} /></td>
                      <td className="p-4"><StatusBadge status={booking.status} /></td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="p-10 text-center text-[#6B6E6A]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[40px] text-[#c4c8be]">inbox</span>
                      <p className="font-medium">Belum ada pesanan tercatat.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}