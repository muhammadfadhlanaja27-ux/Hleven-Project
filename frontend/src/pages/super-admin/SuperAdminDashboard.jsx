import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import api from '../../services/api';
import { cachedGet, getCachedData, getCacheKey } from '../../services/apiCache';

// ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────
const formatCurrency = (num) => {
  if (num === null || num === undefined) return 'Rp 0';
  const val = Number(num);
  if (isNaN(val) || val === 0) return 'Rp 0';
  if (val >= 1000000000) {
    return `Rp ${(val / 1000000000).toFixed(2)}B`;
  }
  if (val >= 1000000) {
    return `Rp ${(val / 1000000).toFixed(1)}M`;
  }
  return `Rp ${val.toLocaleString('id-ID')}`;
};

// Color Palette matching design.md (H'Leven Authority)
const COLORS = {
  primary: '#4f604f',
  primaryLight: '#b9ccb6',
  secondary: '#4e644b',
  active: '#768875',
  pending: '#DED3C7',
  error: '#A65A3D',
  surfaceDim: '#d9dad9',
  outline: '#747872',
  border: '#E5E0D8',
};

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label, isCurrency = false }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#E5E0D8] p-3 rounded-lg shadow-md font-['Hanken_Grotesk',sans-serif] space-y-1 z-50">
        <p className="text-xs font-bold text-[#191c1b] mb-1">{label}</p>
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[#434842]">{entry.name}:</span>
            <span className="font-semibold text-[#191c1b]">
              {isCurrency ? formatCurrency(entry.value) : (entry.value ?? 0)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const SuperAdminDashboard = () => {
  const cachedSummary = getCachedData(getCacheKey('/super-admin/dashboard'))?.data || null;
  const cachedActivities = getCachedData(getCacheKey('/super-admin/dashboard/recent-activities'))?.data || [];

  const [summary, setSummary] = useState(cachedSummary);
  const [activities, setActivities] = useState(cachedActivities);
  const [bookingStats, setBookingStats] = useState(null);
  const [paymentStats, setPaymentStats] = useState(null);
  const [revenueStats, setRevenueStats] = useState(null);
  const [hotelsList, setHotelsList] = useState([]);

  const [loading, setLoading] = useState(!cachedSummary);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Period Filters
  const [revenuePeriod, setRevenuePeriod] = useState('Bulan');
  const [bookingRange, setBookingRange] = useState('Last 6 Months');
  const [userGrowthPeriod, setUserGrowthPeriod] = useState('Bulanan');
  const [hotelPerfLimit, setHotelPerfLimit] = useState('Top 5');

  const fetchDashboardData = async (forceRefresh = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else if (!summary) {
      setLoading(true);
    }

    try {
      const results = await Promise.allSettled([
        cachedGet('/super-admin/dashboard', {}, forceRefresh),
        cachedGet('/super-admin/dashboard/recent-activities', {}, forceRefresh),
        cachedGet('/super-admin/dashboard/bookings', {}, forceRefresh),
        cachedGet('/super-admin/dashboard/payments', {}, forceRefresh),
        cachedGet('/super-admin/dashboard/revenue', {}, forceRefresh),
        cachedGet('/super-admin/hotels', {}, forceRefresh),
      ]);

      if (results[0].status === 'fulfilled' && results[0].value?.data) {
        setSummary(results[0].value.data.data || results[0].value.data);
      }
      if (results[1].status === 'fulfilled' && results[1].value?.data) {
        setActivities(results[1].value.data.data || results[1].value.data || []);
      }
      if (results[2].status === 'fulfilled' && results[2].value?.data) {
        setBookingStats(results[2].value.data.data || results[2].value.data);
      }
      if (results[3].status === 'fulfilled' && results[3].value?.data) {
        setPaymentStats(results[3].value.data.data || results[3].value.data);
      }
      if (results[4].status === 'fulfilled' && results[4].value?.data) {
        setRevenueStats(results[4].value.data.data || results[4].value.data);
      }
      if (results[5].status === 'fulfilled' && results[5].value?.data) {
        setHotelsList(results[5].value.data.data || results[5].value.data || []);
      }

      if (forceRefresh) {
        toast.success('Data dashboard berhasil diperbarui');
      }
    } catch (err) {
      console.error('Gagal mengambil data dashboard:', err);
      toast.error('Gagal memuat data backend.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(false);
  }, []);

  // ─── STRICT REAL DATA BINDINGS (0 FALLBACK IF DATA ABSENT FROM BACKEND) ─────

  // 1. Grafik Pendapatan
  const revenueChartData = (revenueStats?.daily && Array.isArray(revenueStats.daily) && revenueStats.daily.length > 0)
    ? revenueStats.daily.map((d) => ({ name: d.date, revenue: Number(d.total || 0) }))
    : summary?.revenue_by_day && Array.isArray(summary.revenue_by_day) && summary.revenue_by_day.length > 0
    ? summary.revenue_by_day.map((d) => ({ name: d.date, revenue: Number(d.revenue || 0) }))
    : [
        { name: 'Jan', revenue: 0 },
        { name: 'Feb', revenue: 0 },
        { name: 'Mar', revenue: 0 },
        { name: 'Apr', revenue: 0 },
        { name: 'Mei', revenue: 0 },
        { name: 'Jun', revenue: 0 },
      ];

  // 2. Status Pembayaran (Donut Chart)
  const paymentStatusData = [
    { name: 'Berhasil', value: paymentStats?.success ?? 0, color: COLORS.active },
    { name: 'Pending', value: paymentStats?.pending ?? 0, color: COLORS.pending },
    { name: 'Gagal', value: paymentStats?.failed ?? 0, color: COLORS.error },
    { name: 'Expired', value: paymentStats?.expired ?? 0, color: COLORS.outline },
    { name: 'Refund', value: paymentStats?.cancelled ?? 0, color: COLORS.primaryLight },
  ];

  // 3. Grafik Booking (Stacked Area Chart)
  const totalPaidBookings = (bookingStats?.paid || 0) + (bookingStats?.checked_in || 0) + (bookingStats?.checked_out || 0);
  const totalPendingBookings = bookingStats?.pending || 0;
  const totalCancelledBookings = (bookingStats?.cancelled || 0) + (bookingStats?.expired || 0);

  const bookingChartData = [
    { name: 'Jan', Berhasil: 0, Menunggu: 0, Dibatalkan: 0 },
    { name: 'Feb', Berhasil: 0, Menunggu: 0, Dibatalkan: 0 },
    { name: 'Mar', Berhasil: 0, Menunggu: 0, Dibatalkan: 0 },
    { name: 'Apr', Berhasil: 0, Menunggu: 0, Dibatalkan: 0 },
    { name: 'Mei', Berhasil: 0, Menunggu: 0, Dibatalkan: 0 },
    {
      name: 'Bulan Ini',
      Berhasil: totalPaidBookings,
      Menunggu: totalPendingBookings,
      Dibatalkan: totalCancelledBookings,
    },
  ];

  // 4. Pertumbuhan User (Line Chart)
  const totalUsers = summary?.total_users ?? 0;
  const userGrowthData = [
    { name: 'Jan', 'User Aktif': 0, 'User Baru': 0 },
    { name: 'Feb', 'User Aktif': 0, 'User Baru': 0 },
    { name: 'Mar', 'User Aktif': 0, 'User Baru': 0 },
    { name: 'Apr', 'User Aktif': 0, 'User Baru': 0 },
    { name: 'Mei', 'User Aktif': 0, 'User Baru': 0 },
    { name: 'Bulan Ini', 'User Aktif': totalUsers, 'User Baru': summary?.new_users ?? 0 },
  ];

  // 5. Performa Hotel (Bar Chart)
  const hotelPerformanceData = (hotelsList && Array.isArray(hotelsList) && hotelsList.length > 0)
    ? hotelsList.slice(0, 5).map((h) => ({
        name: h.name || 'Hotel',
        bookings: h.bookings_count ?? h.total_bookings ?? 0,
      }))
    : [
        { name: 'Belum ada data', bookings: 0 },
      ];

  const lastUpdatedTime = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] font-['Hanken_Grotesk',sans-serif]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-[#E5E0D8] border-t-[#768875] rounded-full animate-spin" />
          <p className="text-[#747872] text-sm">Memuat Dashboard Super Admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 font-['Hanken_Grotesk',sans-serif] bg-[#f8faf8] p-4 lg:p-6 rounded-xl">

      {/* ─── HEADER SECTION ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="font-['Newsreader',serif] text-3xl md:text-4xl font-semibold text-[#4f604f] tracking-tight">
            System Overview
          </h2>
          <p className="text-sm text-[#434842] mt-1">
            Terakhir diperbarui: Hari ini pukul {lastUpdatedTime} WIB
          </p>
        </div>
        <button
          onClick={() => fetchDashboardData(true)}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 border border-[#E5E0D8] rounded-lg bg-white text-[#434842] hover:bg-[#f2f4f2] disabled:opacity-50 transition-colors text-xs font-semibold uppercase tracking-wider shadow-xs cursor-pointer"
        >
          <span className={`material-symbols-outlined text-[16px] ${isRefreshing ? 'animate-spin' : ''}`}>
            refresh
          </span>
          {isRefreshing ? 'Memperbarui...' : 'Segarkan Data'}
        </button>
      </div>

      {/* ─── ACTION REQUIRED BANNER ─────────────────────────────────────────── */}
      <div className="bg-[#ffdad6]/30 border border-[#A65A3D]/30 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[#A65A3D]">warning</span>
          <h3 className="font-['Newsreader',serif] text-xl font-medium text-[#A65A3D]">
            Action Required / Perlu Tindakan
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 bg-white p-3.5 rounded-lg shadow-xs border border-[#E5E0D8]">
            <span className="material-symbols-outlined text-[#A65A3D] bg-[#A65A3D]/10 p-2 rounded-full text-[20px]">
              handshake
            </span>
            <span className="text-xs font-semibold text-[#191c1b]">
              {summary?.pending_partner_applications ?? 0} Partner menunggu approval
            </span>
          </div>

          <div className="flex items-center gap-3 bg-white p-3.5 rounded-lg shadow-xs border border-[#E5E0D8]">
            <span className="material-symbols-outlined text-[#A65A3D] bg-[#A65A3D]/10 p-2 rounded-full text-[20px]">
              currency_exchange
            </span>
            <span className="text-xs font-semibold text-[#191c1b]">
              {summary?.pending_refunds ?? 0} Refund menunggu proses
            </span>
          </div>

          <div className="flex items-center gap-3 bg-white p-3.5 rounded-lg shadow-xs border border-[#E5E0D8]">
            <span className="material-symbols-outlined text-[#A65A3D] bg-[#A65A3D]/10 p-2 rounded-full text-[20px]">
              domain
            </span>
            <span className="text-xs font-semibold text-[#191c1b]">
              {summary?.blocked_hotels ?? 0} Hotel terkena warning
            </span>
          </div>

          <div className="flex items-center gap-3 bg-white p-3.5 rounded-lg shadow-xs border border-[#E5E0D8]">
            <span className="material-symbols-outlined text-[#A65A3D] bg-[#A65A3D]/10 p-2 rounded-full text-[20px]">
              pending_actions
            </span>
            <span className="text-xs font-semibold text-[#191c1b]">
              {paymentStats?.pending ?? 0} Payment masih pending
            </span>
          </div>
        </div>
      </div>

      {/* ─── 6 KPI CARDS BENTO GRID ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Total User */}
        <SummaryCard
          title="Total User"
          value={summary?.total_users !== undefined ? summary.total_users.toLocaleString('id-ID') : '0'}
          icon="group"
          trend={summary?.total_users ? "+ Real-time" : "0 user"}
        />

        {/* Card 2: Total Hotel */}
        <SummaryCard
          title="Total Hotel"
          value={summary?.total_hotels !== undefined ? summary.total_hotels.toLocaleString('id-ID') : '0'}
          icon="domain"
          trend={summary?.total_hotels ? "+ Real-time" : "0 hotel"}
        />

        {/* Card 3: Total Booking */}
        <SummaryCard
          title="Total Booking"
          value={summary?.total_bookings !== undefined ? summary.total_bookings.toLocaleString('id-ID') : '0'}
          icon="calendar_today"
          trend={summary?.total_bookings ? "+ Real-time" : "0 booking"}
        />

        {/* Card 4: Pendapatan Hari Ini */}
        <SummaryCard
          title="Pendapatan Hari Ini"
          value={formatCurrency(summary?.today_revenue ?? 0)}
          icon="payments"
          trend={summary?.today_revenue ? "+ Real-time" : "Rp 0"}
        />

        {/* Card 5: Active Booking */}
        <SummaryCard
          title="Active Booking"
          value={summary?.active_bookings !== undefined ? summary.active_bookings.toLocaleString('id-ID') : '0'}
          icon="hourglass_empty"
          trend="Menunggu konfirmasi / Aktif"
          isNeutral
        />

        {/* Card 6: Refund */}
        <SummaryCard
          title="Pending Refund"
          value={summary?.pending_refunds !== undefined ? `${summary.pending_refunds} Pengajuan` : '0 Pengajuan'}
          icon="currency_exchange"
          trend={summary?.pending_refunds ? "Perlu diproses" : "0 refund"}
          isError={Boolean(summary?.pending_refunds)}
          isNeutral={!summary?.pending_refunds}
        />
      </div>

      {/* ─── CHARTS ROW 1: PENDAPATAN & STATUS PEMBAYARAN ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grafik Pendapatan */}
        <div className="bg-white rounded-lg p-6 shadow-[0_4px_20px_rgba(47,50,49,0.06)] lg:col-span-2 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-['Newsreader',serif] text-xl font-medium text-[#4f604f]">
              Grafik Pendapatan
            </h3>
            <select
              value={revenuePeriod}
              onChange={(e) => setRevenuePeriod(e.target.value)}
              className="border border-[#E5E0D8] rounded px-3 py-1 text-xs text-[#191c1b] bg-white focus:outline-none focus:ring-1 focus:ring-[#4f604f] cursor-pointer"
            >
              <option value="Hari">Hari</option>
              <option value="Minggu">Minggu</option>
              <option value="Bulan">Bulan</option>
              <option value="Tahun">Tahun</option>
            </select>
          </div>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E0D8" />
                <XAxis dataKey="name" stroke="#747872" tick={{ fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#E5E0D8' }} />
                <YAxis tickFormatter={(v) => formatCurrency(v)} stroke="#747872" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <RechartsTooltip content={<CustomTooltip isCurrency />} />
                <Area type="monotone" dataKey="revenue" name="Pendapatan" stroke={COLORS.primary} strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Pembayaran (Donut Chart) */}
        <div className="bg-white rounded-lg p-6 shadow-[0_4px_20px_rgba(47,50,49,0.06)] flex flex-col justify-between">
          <h3 className="font-['Newsreader',serif] text-xl font-medium text-[#4f604f] mb-4">
            Status Pembayaran
          </h3>
          <div className="w-full h-[220px] relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-['Newsreader',serif] text-xl font-bold text-[#4f604f]">
                {summary?.total_bookings !== undefined ? summary.total_bookings.toLocaleString('id-ID') : '0'}
              </span>
              <span className="text-[11px] text-[#747872]">Total Transaksi</span>
            </div>
          </div>
          {/* Custom Legend */}
          <div className="flex flex-wrap justify-center gap-3 pt-4 border-t border-[#E5E0D8] text-xs">
            {paymentStatusData.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[#434842]">{item.name}: <b>{item.value}</b></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── CHARTS ROW 2: GRAFIK BOOKING ───────────────────────────────────── */}
      <div className="bg-white rounded-lg p-6 shadow-[0_4px_20px_rgba(47,50,49,0.06)] flex flex-col justify-between">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-['Newsreader',serif] text-xl font-medium text-[#4f604f]">
            Grafik Booking
          </h3>
          <select
            value={bookingRange}
            onChange={(e) => setBookingRange(e.target.value)}
            className="border border-[#E5E0D8] rounded px-3 py-1 text-xs text-[#191c1b] bg-white focus:outline-none focus:ring-1 focus:ring-[#4f604f] cursor-pointer"
          >
            <option value="Last 6 Months">Last 6 Months</option>
            <option value="This Year">This Year</option>
          </select>
        </div>
        <div className="w-full h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={bookingChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E0D8" />
              <XAxis dataKey="name" stroke="#747872" tick={{ fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#E5E0D8' }} />
              <YAxis stroke="#747872" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Area type="monotone" dataKey="Berhasil" stackId="1" stroke={COLORS.active} fill={COLORS.active} fillOpacity={0.6} />
              <Area type="monotone" dataKey="Menunggu" stackId="1" stroke={COLORS.pending} fill={COLORS.pending} fillOpacity={0.6} />
              <Area type="monotone" dataKey="Dibatalkan" stackId="1" stroke={COLORS.error} fill={COLORS.error} fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ─── CHARTS ROW 3: PERTUMBUHAN USER & PERFORMA HOTEL ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pertumbuhan User */}
        <div className="bg-white rounded-lg p-6 shadow-[0_4px_20px_rgba(47,50,49,0.06)] flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-['Newsreader',serif] text-xl font-medium text-[#4f604f]">
              Pertumbuhan User
            </h3>
            <select
              value={userGrowthPeriod}
              onChange={(e) => setUserGrowthPeriod(e.target.value)}
              className="border border-[#E5E0D8] rounded px-3 py-1 text-xs text-[#191c1b] bg-white focus:outline-none focus:ring-1 focus:ring-[#4f604f] cursor-pointer"
            >
              <option value="Harian">Harian</option>
              <option value="Mingguan">Mingguan</option>
              <option value="Bulanan">Bulanan</option>
            </select>
          </div>
          <div className="w-full h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E0D8" />
                <XAxis dataKey="name" stroke="#747872" tick={{ fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#E5E0D8' }} />
                <YAxis stroke="#747872" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Line type="monotone" dataKey="User Aktif" stroke={COLORS.primary} strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="User Baru" stroke={COLORS.secondary} strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performa Hotel (Booking) */}
        <div className="bg-white rounded-lg p-6 shadow-[0_4px_20px_rgba(47,50,49,0.06)] flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-['Newsreader',serif] text-xl font-medium text-[#4f604f]">
              Performa Hotel (Booking)
            </h3>
            <select
              value={hotelPerfLimit}
              onChange={(e) => setHotelPerfLimit(e.target.value)}
              className="border border-[#E5E0D8] rounded px-3 py-1 text-xs text-[#191c1b] bg-white focus:outline-none focus:ring-1 focus:ring-[#4f604f] cursor-pointer"
            >
              <option value="Top 5">Top 5</option>
              <option value="Top 10">Top 10</option>
              <option value="All">Semua</option>
            </select>
          </div>
          <div className="w-full h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={hotelPerformanceData} margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E0D8" />
                <XAxis type="number" stroke="#747872" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#747872" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={110} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar dataKey="bookings" name="Total Booking" fill={COLORS.active} radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ─── RECENT ACTIVITIES TABLE ────────────────────────────────────────── */}
      <div className="bg-white rounded-lg p-6 shadow-[0_4px_20px_rgba(47,50,49,0.06)]">
        <h3 className="font-['Newsreader',serif] text-xl font-medium text-[#4f604f] mb-6">
          Recent Activities
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9F6F1] border-b border-[#E5E0D8]">
                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-[#434842]">
                  Activity
                </th>
                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-[#434842]">
                  User
                </th>
                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-[#434842] text-right">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="text-sm text-[#191c1b]">
              {activities.length > 0 ? (
                activities.map((act, idx) => {
                  let dotColor = 'bg-[#747872]';
                  const actLower = String(act.activity || '').toLowerCase();
                  if (actLower.includes('approve') || actLower.includes('success')) dotColor = 'bg-[#768875]';
                  if (actLower.includes('warn') || actLower.includes('error') || actLower.includes('fail') || actLower.includes('disable')) dotColor = 'bg-[#A65A3D]';
                  if (actLower.includes('report') || actLower.includes('generat')) dotColor = 'bg-[#DED3C7]';

                  return (
                    <tr key={idx} className="border-b border-[#E5E0D8] hover:bg-[#F9F6F1]/50 transition-colors">
                      <td className="py-4 px-4 flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColor}`} />
                        <span>{act.activity}</span>
                      </td>
                      <td className="py-4 px-4 text-[#434842]">{act.user}</td>
                      <td className="py-4 px-4 text-right text-[#747872]">{act.time}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-[#747872]">
                    Belum ada aktivitas terbaru.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

// Summary Card component matching dashboard.html styling
const SummaryCard = ({ title, value, icon, trend, isNeutral = false, isError = false }) => {
  const isPositive = typeof trend === 'string' && (trend.startsWith('+') || trend.includes('up') || trend.includes('baru') || trend.includes('Real-time'));
  
  let trendColor = 'text-[#768875]';
  let trendIcon = 'trending_up';

  if (isError) {
    trendColor = 'text-[#A65A3D]';
    trendIcon = 'trending_down';
  } else if (isNeutral) {
    trendColor = 'text-[#747872]';
    trendIcon = 'horizontal_rule';
  } else if (!isPositive && trend?.startsWith('-')) {
    trendColor = 'text-[#A65A3D]';
    trendIcon = 'trending_down';
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-[0_4px_20px_rgba(47,50,49,0.06)] flex flex-col justify-between min-h-[140px]">
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-semibold tracking-wider text-[#434842] uppercase">
          {title}
        </span>
        <span className="material-symbols-outlined text-[#747872]">{icon}</span>
      </div>
      <div>
        <div className="font-['Newsreader',serif] text-3xl font-semibold tracking-tight text-[#191c1b] mb-2">
          {value}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
            <span className="material-symbols-outlined text-[16px]">{trendIcon}</span>
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
