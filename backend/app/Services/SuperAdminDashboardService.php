<?php

namespace App\Services;

use App\Models\User;
use App\Models\Hotel;
use App\Models\RoomType;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Refund;
use App\Models\PartnerApplication;
use App\Models\ActivityLog;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SuperAdminDashboardService
{
    public function getSummary(): array
    {
        // DASHBOARD-SA-003: Pendapatan hari ini hanya dari status Success[cite: 1]
        $todayRevenue = Payment::where('payment_status', 'Success')
            ->whereDate('paid_at', Carbon::today())
            ->sum('gross_amount');

        return [
            'total_users' => User::count(),
            'total_hotels' => Hotel::count(),
            'total_rooms' => RoomType::sum('stock'),
            'total_bookings' => Booking::count(),
            'active_bookings' => Booking::whereIn('status', ['Pending', 'Paid', 'Checked In'])->count(),
            'today_revenue' => (float) $todayRevenue,
            'pending_refunds' => Refund::where('status', 'Pending')->count(),
            'pending_partner_applications' => PartnerApplication::where('status', 'Pending')->count(),
        ];
    }

    public function getBookingStats(): array
    {
        return [
            'pending' => Booking::where('status', 'Pending')->count(),
            'paid' => Booking::where('status', 'Paid')->count(),
            'checked_in' => Booking::where('status', 'Checked In')->count(),
            'checked_out' => Booking::where('status', 'Checked Out')->count(),
            'cancelled' => Booking::where('status', 'Cancelled')->count(),
            'expired' => Booking::where('status', 'Expired')->count(),
            'refunded' => Booking::where('status', 'Refunded')->count(),
        ];
    }

    public function getPaymentStats(): array
    {
        return [
            'pending' => Payment::where('payment_status', 'Pending')->count(),
            'success' => Payment::where('payment_status', 'Success')->count(),
            'failed' => Payment::where('payment_status', 'Failed')->count(),
            'expired' => Payment::where('payment_status', 'Expired')->count(),
            'cancelled' => Payment::where('payment_status', 'Cancelled')->count(),
            'total_transaction' => (float) Payment::where('payment_status', 'Success')->sum('gross_amount')
        ];
    }

    public function getRefundStats(): array
    {
        // DASHBOARD-SA-004: Refund dihitung dari yang Completed/Approved[cite: 1]
        return [
            'pending' => Refund::where('status', 'Pending')->count(),
            'approved' => Refund::where('status', 'Approved')->count(),
            'rejected' => Refund::where('status', 'Rejected')->count(),
            'completed' => Refund::where('status', 'Completed')->count(),
            'total_refund_amount' => (float) Refund::whereIn('status', ['Approved', 'Completed'])
                ->join('payments', 'refunds.booking_id', '=', 'payments.booking_id')
                ->sum('payments.gross_amount')
        ];
    }

    public function getRevenueStats($month = null, $year = null): array
    {
        $targetMonth = $month ?? Carbon::now()->month;
        $targetYear = $year ?? Carbon::now()->year;

        // Total Bulanan[cite: 1]
        $monthlyTotal = Payment::where('payment_status', 'Success')
            ->whereMonth('paid_at', $targetMonth)
            ->whereYear('paid_at', $targetYear)
            ->sum('gross_amount');

        // Total Tahunan[cite: 1]
        $yearlyTotal = Payment::where('payment_status', 'Success')
            ->whereYear('paid_at', $targetYear)
            ->sum('gross_amount');

        // Data Harian dalam satu bulan[cite: 1]
        $daily = Payment::select(DB::raw('DATE(paid_at) as date'), DB::raw('SUM(gross_amount) as total'))
            ->where('payment_status', 'Success')
            ->whereMonth('paid_at', $targetMonth)
            ->whereYear('paid_at', $targetYear)
            ->groupBy('date')
            ->get();

        return [
            'daily' => $daily,
            'monthly_total' => (float) $monthlyTotal,
            'yearly_total' => (float) $yearlyTotal,
        ];
    }

    public function getUserStats(): array
    {
        return [
            'total_users' => User::count(),
            'active_users' => User::where('status', 'Active')->count(),
            'new_users_this_month' => User::whereMonth('created_at', Carbon::now()->month)
                                        ->whereYear('created_at', Carbon::now()->year)
                                        ->count(),
        ];
    }

    public function getHotelStats(): array
    {
        return [
            'active_hotels' => Hotel::where('status', 'Active')->count(),
            'inactive_hotels' => Hotel::where('status', 'Inactive')->count(),
            'blocked_hotels' => Hotel::where('status', 'Blocked')->count(),
        ];
    }

    public function getPartnerStats(): array
    {
        return [
            'pending' => PartnerApplication::where('status', 'Pending')->count(),
            'approved' => PartnerApplication::where('status', 'Approved')->count(),
            'rejected' => PartnerApplication::where('status', 'Rejected')->count(),
        ];
    }

    public function getCharts(): array
    {
        // Ini adalah *placeholder* yang bisa Anda modifikasi logika grafiknya
        // sesuai library (Recharts/Chart.js) yang dipakai di Frontend
        return [
            'booking_chart' => [],
            'revenue_chart' => [],
            'user_chart' => [],
            'hotel_chart' => [],
            'refund_chart' => []
        ];
    }

    public function getRecentActivities(): array
    {
        // DASHBOARD-SA-006: Diambil dari tabel activity_logs[cite: 1]
        $activities = ActivityLog::with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return $activities->map(function ($log) {
            return [
                'activity' => $log->activity,
                'user' => $log->user ? $log->user->name : 'System',
                'time' => $log->created_at->format('Y-m-d H:i:s')
            ];
        })->toArray();
    }
}
