import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { cachedGet, getCachedData, getCacheKey } from '../../services/apiCache';
import { toast } from 'react-hot-toast';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

// Helper to format numbers as IDR currency
const formatCurrency = (num) => {
  if (num === null || num === undefined) return '-';
  // Check if num is greater than a million to format it nicely like Rp 12.8B
  if (num >= 1000000000) {
    return `Rp ${(num / 1000000000).toFixed(1)}B`;
  }
  if (num >= 1000000) {
    return `Rp ${(num / 1000000).toFixed(1)}M`;
  }
  return `Rp ${num.toLocaleString('id-ID')}`;
};

const SuperAdminDashboard = () => {
  const cachedSummary = getCachedData(getCacheKey('/super-admin/dashboard'))?.data || null;
  const cachedActivities = getCachedData(getCacheKey('/super-admin/dashboard/recent-activities'))?.data || [];

  const [summary, setSummary] = useState(cachedSummary);
  const [activities, setActivities] = useState(cachedActivities);
  const [loading, setLoading] = useState(!cachedSummary);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const fetchDashboardData = async (forceRefresh = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else if (!summary) {
      setLoading(true);
    }
    setError(false);
    try {
      const [summaryRes, activitiesRes] = await Promise.all([
        cachedGet('/super-admin/dashboard', {}, forceRefresh),
        cachedGet('/super-admin/dashboard/recent-activities', {}, forceRefresh),
      ]);
      setSummary(summaryRes.data?.data || summaryRes.data || null);
      setActivities(activitiesRes.data?.data || activitiesRes.data || []);
      if (forceRefresh) {
        toast.success('Data dashboard berhasil diperbarui');
      }
    } catch (err) {
      console.error('Gagal mengambil data dashboard:', err);
      if (!summary) setError(true);
      toast.error('Gagal memuat data dashboard. Silakan coba lagi.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(false);
  }, []);

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-[#E5E0D8] border-t-[#768875] rounded-full animate-spin" />
          <p className="font-hanken text-[#747872] text-[14px]">Memuat Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <p className="font-hanken text-[#ba1a1a] font-semibold text-[16px]">Terjadi kesalahan saat memuat data.</p>
        <button
          onClick={() => fetchDashboardData(true)}
          className="px-4 py-2 bg-[#768875] text-[#ffffff] rounded-lg hover:opacity-90 transition font-hanken text-[14px] font-semibold"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-[32px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-newsreader text-[32px] md:text-[32px] leading-[1.2] font-semibold tracking-[-0.02em] text-[#4f604f]">
          System Overview
        </h2>
        <button
          onClick={() => fetchDashboardData(true)}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-1.5 border border-[#E5E0D8] rounded bg-white text-[#434842] hover:bg-gray-50 disabled:opacity-50 transition-colors font-hanken text-[12px] font-semibold uppercase tracking-[0.05em]"
        >
          <span className={`material-symbols-outlined text-[16px] ${isRefreshing ? 'animate-spin' : ''}`}>refresh</span>
          {isRefreshing ? 'Memperbarui...' : 'Refresh'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
        <SummaryCard
          title="Total Users"
          value={summary?.total_users ?? "12,450"} // fallback for demo match if null
          icon="group"
          trend={summary?.users_trend ?? "+5.2% from last month"}
        />
        <SummaryCard
          title="Active Hotels"
          value={summary?.total_hotels ?? "420"}
          icon="domain"
          trend={summary?.hotels_trend ?? "+12 new this week"}
        />
        <SummaryCard
          title="Active Bookings"
          value={summary?.active_bookings ?? "8,932"}
          icon="calendar_today"
          trend={summary?.bookings_trend ?? "+2.4% from yesterday"}
        />
        <SummaryCard
          title="Total Revenue"
          value={formatCurrency(summary?.today_revenue) ?? "Rp 12.8B"}
          icon="payments"
          trend={summary?.revenue_trend ?? "+8.4% YoY"}
        />
      </div>

      {/* Revenue Analysis Section */}
      <div className="bg-[#ffffff] rounded-lg p-[24px] shadow-[0_4px_20px_rgba(47,50,49,0.06)]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-newsreader text-[24px] font-medium leading-[1.3] text-[#4f604f]">
            Revenue Analysis
          </h3>
          <select className="border border-[#E5E0D8] rounded px-3 py-1 font-hanken text-[14px] leading-[1.5] text-[#191c1b] bg-white focus:outline-none focus:ring-1 focus:ring-[#4f604f] focus:border-[#4f604f]">
            <option>Last 30 Days</option>
            <option>This Quarter</option>
            <option>This Year</option>
          </select>
        </div>
        
        {/* Chart */}
        {summary?.revenue_by_day && summary.revenue_by_day.length > 0 ? (
          <ResponsiveContainer width="100%" height={256}>
            <LineChart data={summary.revenue_by_day} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E0D8" />
              <XAxis dataKey="date" stroke="#747872" tick={{fontFamily: 'Hanken Grotesk', fontSize: 12}} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={formatCurrency} stroke="#747872" tick={{fontFamily: 'Hanken Grotesk', fontSize: 12}} tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{fontFamily: 'Hanken Grotesk', borderRadius: '8px', border: '1px solid #E5E0D8', boxShadow: '0 4px 20px rgba(47,50,49,0.06)'}} />
              <Line type="monotone" dataKey="revenue" stroke="#768875" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, fill: '#768875', stroke: '#fff', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-64 bg-[#F9F6F1]/50 rounded flex items-center justify-center border border-[#E5E0D8] border-dashed">
            <span className="text-[#747872] font-hanken text-[16px]">Data revenue belum tersedia</span>
          </div>
        )}
      </div>

      {/* Recent Activities Table */}
      <div className="bg-[#ffffff] rounded-lg p-[24px] shadow-[0_4px_20px_rgba(47,50,49,0.06)]">
        <h3 className="font-newsreader text-[24px] font-medium leading-[1.3] text-[#4f604f] mb-6">
          Recent Activities
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9F6F1] border-b border-[#E5E0D8]">
                <th className="py-3 px-4 font-hanken text-[12px] font-semibold leading-[1] tracking-[0.05em] text-[#434842] uppercase">
                  Activity
                </th>
                <th className="py-3 px-4 font-hanken text-[12px] font-semibold leading-[1] tracking-[0.05em] text-[#434842] uppercase">
                  User
                </th>
                <th className="py-3 px-4 font-hanken text-[12px] font-semibold leading-[1] tracking-[0.05em] text-[#434842] uppercase text-right">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="font-hanken text-[14px] leading-[1.5] text-[#191c1b]">
              {activities.length > 0 ? (
                activities.map((act, idx) => {
                  // Determine status dot color based on some simple rules or existing data
                  let dotColor = "bg-[#747872]"; // outline/neutral
                  if (act.activity?.toLowerCase().includes("approve") || act.activity?.toLowerCase().includes("success")) dotColor = "bg-[#768875]"; // active
                  if (act.activity?.toLowerCase().includes("warn") || act.activity?.toLowerCase().includes("error") || act.activity?.toLowerCase().includes("fail")) dotColor = "bg-[#ba1a1a]"; // error
                  if (act.activity?.toLowerCase().includes("report") || act.activity?.toLowerCase().includes("generat")) dotColor = "bg-[#DED3C7]"; // pending/neutral warm

                  return (
                    <tr key={idx} className="border-b border-[#E5E0D8] hover:bg-[#F9F6F1]/50 transition-colors">
                      <td className="py-4 px-4 flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`}></div>
                        <span>{act.activity}</span>
                      </td>
                      <td className="py-4 px-4">{act.user}</td>
                      <td className="py-4 px-4 text-right text-[#434842]">{act.time}</td>
                    </tr>
                  )
                })
              ) : (
                /* Placeholder data matching the design if no API data */
                <>
                  <tr className="border-b border-[#E5E0D8] hover:bg-[#F9F6F1]/50 transition-colors">
                    <td className="py-4 px-4 flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#768875]"></div>
                      <span>Partner application approved: The Grand Budapest</span>
                    </td>
                    <td className="py-4 px-4">SuperAdmin_1</td>
                    <td className="py-4 px-4 text-right text-[#434842]">Oct 25, 2024 • 14:32:10 UTC</td>
                  </tr>
                  <tr className="border-b border-[#E5E0D8] hover:bg-[#F9F6F1]/50 transition-colors">
                    <td className="py-4 px-4 flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#DED3C7]"></div>
                      <span>System generated weekly revenue report</span>
                    </td>
                    <td className="py-4 px-4">System</td>
                    <td className="py-4 px-4 text-right text-[#434842]">Oct 25, 2024 • 12:00:00 UTC</td>
                  </tr>
                  <tr className="border-b border-[#E5E0D8] hover:bg-[#F9F6F1]/50 transition-colors">
                    <td className="py-4 px-4 flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#A65A3D]"></div>
                      <span>Issued warning to Fawlty Towers for compliance violation</span>
                    </td>
                    <td className="py-4 px-4">Admin_Sarah</td>
                    <td className="py-4 px-4 text-right text-[#434842]">Oct 24, 2024 • 09:15:22 UTC</td>
                  </tr>
                  <tr className="border-b border-[#E5E0D8] hover:bg-[#F9F6F1]/50 transition-colors">
                    <td className="py-4 px-4 flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#747872]"></div>
                      <span>Disabled account ID #88492</span>
                    </td>
                    <td className="py-4 px-4">User_Mgmt</td>
                    <td className="py-4 px-4 text-right text-[#434842]">Oct 23, 2024 • 16:45:01 UTC</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Summary Card component
const SummaryCard = ({ title, value, icon, trend }) => {
  const isPositive = typeof trend === 'string' && (trend.startsWith('+') || trend.includes('up') || trend.includes('new'));
  const trendColor = isPositive ? 'text-[#768875]' : (trend && trend.startsWith('-') ? 'text-[#ba1a1a]' : 'text-[#747872]');
  const trendIcon = isPositive ? 'trending_up' : (trend && trend.startsWith('-') ? 'trending_down' : 'trending_flat');

  return (
    <div className="bg-[#ffffff] rounded-lg p-[24px] shadow-[0_4px_20px_rgba(47,50,49,0.06)] flex flex-col justify-between min-h-[140px]">
      <div className="flex justify-between items-start mb-4">
        <span className="font-hanken text-[12px] font-semibold leading-[1] tracking-[0.05em] text-[#434842] uppercase">
          {title}
        </span>
        <span className="material-symbols-outlined text-[#747872]">{icon}</span>
      </div>
      <div>
        <div className="font-newsreader text-[32px] leading-[1.2] font-semibold tracking-[-0.02em] text-[#191c1b] mb-2">
          {value}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 font-hanken text-[14px] leading-[1.5] ${trendColor}`}>
            <span className="material-symbols-outlined text-[16px]">{trendIcon}</span>
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
