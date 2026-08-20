import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { cachedGet } from '../../services/apiCache';

// ─── Helper Safe Text Render ────────────────────────────────────────────────
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

function Skeleton({ className = '' }) {
  return <div className={`bg-[#e5e2de] rounded animate-pulse ${className}`} />;
}

export default function Dashboard() {
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [revPeriod, setRevPeriod] = useState('monthly');
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

  const totalRooms     = Number(stats?.total_rooms || 0);
  const occupiedRooms  = Number(stats?.occupied_rooms || 0);
  const availableRooms = Number(stats?.available_rooms || 0);
  const occupancyRate  = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

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
  const currentRevenue = revenueByPeriod[revPeriod] || 0;

  const chartRaw = Array.isArray(stats?.monthly_chart) ? stats.monthly_chart : [];
  const chartMax = chartRaw.length ? Math.max(...chartRaw.map((d) => Number(d.amount || 0)), 1) : 1;

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  if (error && !stats) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <span className="material-symbols-outlined text-[48px] text-[#9B5235]">warning</span>
        <p className="text-[#2D312C] font-semibold text-lg text-center">{error}</p>
        <button
          onClick={() => fetchStats(true)}
          className="px-5 py-2.5 bg-[#506147] text-white rounded-lg text-sm font-semibold hover:bg-[#3b4b33] transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-8 font-['Hanken_Grotesk',sans-serif]">
      {/* HEADER */}
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
              <p className="text-sm text-[#6B6E6A] mt-1">
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
          <div className="px-4 py-2 border border-[#c4c8be] rounded-lg bg-[#fcf9f5] text-[#506147] text-xs font-semibold flex items-center shadow-sm">
            <span className="material-symbols-outlined mr-2 text-[18px]">calendar_month</span>
            {todayFormatted}
          </div>
          <button
            onClick={() => fetchStats(true)}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-[#506147] text-white text-xs font-semibold hover:bg-[#3b4b33] transition-all shadow-sm flex items-center gap-1.5 disabled:bg-[#a2ba9c]"
          >
            <span className={`material-symbols-outlined text-[18px] ${loading ? 'animate-spin' : ''}`}>
              refresh
            </span>
            Segarkan Data
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-[#E5E1DA] p-6 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">Total Kamar</p>
          <h3 className="font-['Newsreader',serif] text-4xl font-semibold text-[#2D312C] mt-2">
            {loading ? <Skeleton className="h-9 w-16" /> : totalRooms}
          </h3>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E1DA] p-6 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">Kamar Tersedia</p>
          <h3 className="font-['Newsreader',serif] text-4xl font-semibold text-[#2D312C] mt-2">
            {loading ? <Skeleton className="h-9 w-16" /> : availableRooms}
          </h3>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E1DA] p-6 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">Kamar Terisi</p>
          <h3 className="font-['Newsreader',serif] text-4xl font-semibold text-[#2D312C] mt-2">
            {loading ? <Skeleton className="h-9 w-16" /> : occupiedRooms}
          </h3>
        </div>
        <div className="bg-[#F2EBE1] rounded-xl border border-[#E5E1DA] p-6 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold text-[#2D312C] uppercase tracking-wider">Total Pendapatan</p>
          <h3 className="font-['Newsreader',serif] text-3xl font-semibold text-[#506147] mt-2">
            {loading ? <Skeleton className="h-9 w-36" /> : fmt(stats?.revenue)}
          </h3>
        </div>
      </div>

      {/* RECENT BOOKINGS TABLE */}
      <div className="bg-white rounded-xl border border-[#E5E1DA] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[#E5E1DA] flex justify-between items-center bg-[#fcf9f5]">
          <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C]">Pesanan Terbaru</h3>
          <Link to="/admin/bookings" className="text-xs font-semibold text-[#506147] hover:underline">
            Lihat Semua
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F2EBE1] border-b border-[#E5E1DA]">
                {['Kode Booking', 'Tamu', 'Tipe Kamar', 'Check In', 'Check Out', 'Total Biaya', 'Status Bayar', 'Status Pesanan'].map((h) => (
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
                    {Array.from({ length: 8 }).map((__, j) => (
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
                      <td className="p-4 font-semibold text-[#2D312C]">{renderText(booking.booking_code, `#HL-${booking.id}`)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#f0ede9] text-[#506147] font-semibold text-xs flex items-center justify-center shrink-0 border border-[#E5E1DA]">
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
                      <td className="p-4"><StatusBadge status={booking.payment?.payment_status || 'unpaid'} /></td>
                      <td className="p-4"><StatusBadge status={booking.status} /></td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="p-10 text-center text-[#6B6E6A]">Belum ada pesanan tercatat.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}