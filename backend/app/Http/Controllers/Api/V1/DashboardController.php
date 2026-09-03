<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingRoom;
use App\Models\Hotel;
use App\Models\RoomType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $hotel = $user->hotel ?? Hotel::first();

        if (! $hotel) {
            return response()->json(['success' => false, 'message' => 'Hotel not found'], 404);
        }

        $hotelId = $hotel->id;

        $totalRooms = RoomType::where('hotel_id', $hotelId)->sum('stock');
        $occupiedRooms = BookingRoom::whereHas('booking', function ($q) use ($hotelId) {
            $q->where('hotel_id', $hotelId)->where('status', 'checked_in');
        })->sum('qty');
        $availableRooms = max(0, $totalRooms - $occupiedRooms);

        $revenueQuery = Booking::where('hotel_id', $hotelId)
            ->whereIn('status', ['paid', 'checked_in', 'checked_out']);

        $totalRevenue = (clone $revenueQuery)->sum('grand_total');

        $today = now()->toDateString();
        $todayStats = Booking::where('hotel_id', $hotelId)
            ->selectRaw('
                COUNT(CASE WHEN DATE(created_at) = ? THEN 1 END) as today_bookings,
                COUNT(CASE WHEN DATE(check_in) = ? THEN 1 END) as today_checkins,
                COUNT(CASE WHEN DATE(check_out) = ? THEN 1 END) as today_checkouts
            ', [$today, $today, $today])
            ->first();

        $bookingStatuses = Booking::where('hotel_id', $hotelId)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $bookingBreakdown = [
            'pending' => $bookingStatuses['pending'] ?? 0,
            'unpaid' => $bookingStatuses['unpaid'] ?? 0,
            'paid' => $bookingStatuses['paid'] ?? 0,
            'checked_in' => $bookingStatuses['checked_in'] ?? 0,
            'checked_out' => $bookingStatuses['checked_out'] ?? 0,
            'cancelled' => $bookingStatuses['cancelled'] ?? 0,
            'expired' => $bookingStatuses['expired'] ?? 0,
        ];

        $startOfWeek = now()->startOfWeek()->toDateString();
        $endOfWeek = now()->endOfWeek()->toDateString();
        $currentMonth = now()->month;
        $currentYear = now()->year;

        $revenueStats = (clone $revenueQuery)
            ->selectRaw('
                SUM(CASE WHEN DATE(created_at) = ? THEN grand_total ELSE 0 END) as daily,
                SUM(CASE WHEN DATE(created_at) BETWEEN ? AND ? THEN grand_total ELSE 0 END) as weekly,
                SUM(CASE WHEN EXTRACT(MONTH FROM created_at) = ? AND EXTRACT(YEAR FROM created_at) = ? THEN grand_total ELSE 0 END) as monthly,
                SUM(CASE WHEN EXTRACT(YEAR FROM created_at) = ? THEN grand_total ELSE 0 END) as yearly
            ', [$today, $startOfWeek, $endOfWeek, $currentMonth, $currentYear, $currentYear])
            ->first();

        $revenueDetails = [
            'daily' => (float) ($revenueStats->daily ?? 0),
            'weekly' => (float) ($revenueStats->weekly ?? 0),
            'monthly' => (float) ($revenueStats->monthly ?? 0),
            'yearly' => (float) ($revenueStats->yearly ?? 0),
        ];

        $monthlyData = (clone $revenueQuery)
            ->whereYear('created_at', $currentYear)
            ->selectRaw('EXTRACT(MONTH FROM created_at) as month, SUM(grand_total) as amount')
            ->groupBy('month')
            ->pluck('amount', 'month');

        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        $monthlyChart = [];
        for ($m = 1; $m <= 12; $m++) {
            $monthlyChart[] = [
                'month' => $months[$m - 1],
                'amount' => (float) ($monthlyData[$m] ?? 0),
            ];
        }

        // Booking trend per bulan (Completed = paid/checked_in/checked_out, Pending = pending/unpaid)
        $bookingTrend = Booking::where('hotel_id', $hotelId)
            ->whereYear('created_at', $currentYear)
            ->selectRaw('
                EXTRACT(MONTH FROM created_at) as month,
                SUM(CASE WHEN status IN ("paid", "checked_in", "checked_out") THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status IN ("pending", "unpaid") THEN 1 ELSE 0 END) as pending
            ')
            ->groupBy('month')
            ->get()
            ->keyBy('month');

        $monthlyBookingChart = [];
        for ($m = 1; $m <= 12; $m++) {
            $trend = $bookingTrend->get($m);
            $monthlyBookingChart[] = [
                'month' => $months[$m - 1],
                'completed' => (int) ($trend->completed ?? 0),
                'pending' => (int) ($trend->pending ?? 0),
            ];
        }

        // Booking trend harian — 7 hari terakhir
        $dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        $dailyTrend = Booking::where('hotel_id', $hotelId)
            ->whereBetween('created_at', [now()->subDays(6)->startOfDay(), now()->endOfDay()])
            ->selectRaw('
                DATE(created_at) as day,
                SUM(CASE WHEN status IN ("paid", "checked_in", "checked_out") THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status IN ("pending", "unpaid") THEN 1 ELSE 0 END) as pending
            ')
            ->groupBy('day')
            ->get()
            ->keyBy(fn ($r) => substr($r->day, 5));

        $dailyBookingChart = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $key = $date->format('Y-m-d');
            $trend = $dailyTrend->get($key);
            $dailyBookingChart[] = [
                'label' => $dayNames[$date->dayOfWeek] . ' ' . $date->day,
                'completed' => (int) ($trend->completed ?? 0),
                'pending' => (int) ($trend->pending ?? 0),
            ];
        }

        // Booking trend mingguan — 8 minggu terakhir
        $weeklyTrend = Booking::where('hotel_id', $hotelId)
            ->whereBetween('created_at', [now()->subWeeks(7)->startOfWeek(), now()->endOfWeek()])
            ->selectRaw('
                EXTRACT(WEEK FROM created_at) as week,
                EXTRACT(YEAR FROM created_at) as year,
                SUM(CASE WHEN status IN ("paid", "checked_in", "checked_out") THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status IN ("pending", "unpaid") THEN 1 ELSE 0 END) as pending
            ')
            ->groupBy('year', 'week')
            ->get();

        $weeklyBookingChart = [];
        for ($i = 7; $i >= 0; $i--) {
            $weekStart = now()->subWeeks($i)->startOfWeek();
            $weekYear = $weekStart->year;
            $weekNum = $weekStart->weekOfYear;
            $trend = $weeklyTrend->first(fn ($r) => (int) $r->year === $weekYear && (int) $r->week === $weekNum);
            $weeklyBookingChart[] = [
                'label' => 'M' . $weekNum,
                'completed' => (int) ($trend->completed ?? 0),
                'pending' => (int) ($trend->pending ?? 0),
            ];
        }

        // Booking trend tahunan — 5 tahun terakhir
        $yearlyTrend = Booking::where('hotel_id', $hotelId)
            ->selectRaw('
                EXTRACT(YEAR FROM created_at) as year,
                SUM(CASE WHEN status IN ("paid", "checked_in", "checked_out") THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status IN ("pending", "unpaid") THEN 1 ELSE 0 END) as pending
            ')
            ->groupBy('year')
            ->get()
            ->keyBy('year');

        $yearlyBookingChart = [];
        for ($i = 4; $i >= 0; $i--) {
            $year = now()->year - $i;
            $trend = $yearlyTrend->get($year);
            $yearlyBookingChart[] = [
                'label' => (string) $year,
                'completed' => (int) ($trend->completed ?? 0),
                'pending' => (int) ($trend->pending ?? 0),
            ];
        }

        $recentBookings = Booking::with(['user', 'bookingRooms.roomType', 'payment'])
            ->where('hotel_id', $hotelId)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Dashboard data berhasil dimuat',
            'data' => [
                'hotel_name' => is_string($hotel->name) ? $hotel->name : "H'Leven Hotel",
                'total_rooms' => (int) $totalRooms,
                'occupied_rooms' => (int) $occupiedRooms,
                'available_rooms' => (int) $availableRooms,
                'revenue' => (float) $totalRevenue,
                'today_bookings' => (int) $todayStats->today_bookings,
                'today_checkins' => (int) $todayStats->today_checkins,
                'today_checkouts' => (int) $todayStats->today_checkouts,
                'average_rating' => round($hotel->reviews()->avg('rating') ?? 0, 1),
                'total_bookings' => array_sum($bookingBreakdown),
                'booking_breakdown' => $bookingBreakdown,
                'revenue_details' => $revenueDetails,
                'monthly_chart' => $monthlyChart,
                'monthly_booking_chart' => $monthlyBookingChart,
                'daily_booking_chart' => $dailyBookingChart,
                'weekly_booking_chart' => $weeklyBookingChart,
                'yearly_booking_chart' => $yearlyBookingChart,
                'recent_bookings' => $recentBookings,
            ],
        ], 200);
    }
}
