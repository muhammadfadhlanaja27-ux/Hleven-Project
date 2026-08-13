import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const SuperAdminDashboard = () => {
    const [summary, setSummary] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mengambil data dari multiple endpoint secara bersamaan
        const fetchDashboardData = async () => {
            try {
                const [summaryRes, activitiesRes] = await Promise.all([
                    api.get('/super-admin/dashboard'),
                    api.get('/super-admin/dashboard/recent-activities')
                ]);

                setSummary(summaryRes.data.data);
                setActivities(activitiesRes.data.data);
            } catch (error) {
                console.error("Gagal mengambil data dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg font-semibold text-gray-600">Memuat Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Super Admin</h1>

            {/* --- Bagian 1: Kartu Ringkasan (Summary) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <SummaryCard title="Total Users" value={summary?.total_users} color="text-blue-600" />
                <SummaryCard title="Total Hotels" value={summary?.total_hotels} color="text-green-600" />
                <SummaryCard title="Active Bookings" value={summary?.active_bookings} color="text-yellow-600" />
                <SummaryCard 
                    title="Pendapatan Hari Ini" 
                    value={`Rp ${summary?.today_revenue?.toLocaleString('id-ID')}`} 
                    color="text-purple-600" 
                />
            </div>

            {/* --- Bagian 2: Aktivitas Terbaru --- */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Aktivitas Terbaru</h2>
                {activities.length > 0 ? (
                    <ul className="divide-y divide-gray-100">
                        {activities.map((act, index) => (
                            <li key={index} className="py-3 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-gray-800">{act.activity}</p>
                                    <p className="text-sm text-gray-500">Oleh: {act.user}</p>
                                </div>
                                <span className="text-xs text-gray-400">{act.time}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 text-sm">Belum ada aktivitas terbaru.</p>
                )}
            </div>
        </div>
    );
};

// Komponen kecil untuk Card agar kode lebih rapi
const SummaryCard = ({ title, value, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-center">
        <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
        <p className={`text-3xl font-bold ${color}`}>{value || 0}</p>
    </div>
);

export default SuperAdminDashboard;