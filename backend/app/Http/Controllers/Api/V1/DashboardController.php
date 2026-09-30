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

        $revFrom = $request->query('rev_from');
        $revTo = $request->query('rev_to');
        $revMonth = $request->query('rev_month');
        $hasCustomRange = $revFrom && $revTo && strtotime($revFrom) && strtotime($revTo);
        $hasCustomMonth = $revMonth && preg_match('/^\d{4}-\d{2}$/', $revMonth);

        $totalRooms = RoomType::where('hotel_id', $hotelId)->sum('stock');
        $occupiedRooms = BookingRoom::whereHas('booking', function ($q) use ($hotelId) {
            $q->where('hotel_id', $hotelId)->where('status', 'checked_in');
        })->sum('qty');
        $availableRooms = max(0, $totalRooms - $occupiedRooms);

        $revenueQuery = Booking::where('hotel_id', $hotelId)
            ->whereIn('status', ['paid', 'checked_in', 'checked_out']);
        $bookingTrendBase = Booking::where('hotel_id', $hotelId);

        if ($hasCustomRange) {
            try {
                $fromDate = \Carbon\Carbon::parse($revFrom)->startOfDay();
                $toDate = \Carbon\Carbon::parse($revTo)->endOfDay();
                $revenueQuery->whereBetween('created_at', [$fromDate, $toDate]);
                $bookingTrendBase->whereBetween('created_at', [$fromDate, $toDate]);
            } catch (\Exception $e) {}
        } elseif ($hasCustomMonth) {
            [$y, $m] = explode('-', $revMonth);
            $revenueQuery->whereYear('created_at', (int)$y)->whereMonth('created_at', (int)$m);
            $bookingTrendBase->whereYear('created_at', (int)$y)->whereMonth('created_at', (int)$m);
        }

        $totalRevenue = (clone $revenueQuery)->sum('grand_total');
        $hasCustom = $hasCustomRange || $hasCustomMonth;

        $today = now()->toDateString();
        $todayStats = (clone $bookingTrendBase)
            ->selectRaw('
                COUNT(CASE WHEN DATE(created_at) = ? THEN 1 END) as today_bookings,
                COUNT(CASE WHEN DATE(check_in) = ? THEN 1 END) as today_checkins,
                COUNT(CASE WHEN DATE(check_out) = ? THEN 1 END) as today_checkouts
            ', [$today, $today, $today])
            ->first();

        $bookingStatuses = (clone $bookingTrendBase)
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

        if ($hasCustom) {
            $revenueDetails = [
                'daily' => (float) $totalRevenue,
                'weekly' => (float) $totalRevenue,
                'monthly' => (float) $totalRevenue,
                'yearly' => (float) $totalRevenue,
            ];
        } else {
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
        }

        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        if ($hasCustomMonth) {
            [$y, $m] = explode('-', $revMonth);
            $y = (int)$y; $m = (int)$m;
            $daysInMonth = \Carbon\Carbon::create($y, $m, 1)->daysInMonth;
            $raw = (clone $revenueQuery)
                ->selectRaw('EXTRACT(DAY FROM created_at) as d, SUM(grand_total) as amount')
                ->groupBy('d')
                ->pluck('amount', 'd');
            $monthlyChart = [];
            for ($d = 1; $d <= $daysInMonth; $d++) {
                $monthlyChart[] = [
                    'month' => sprintf('%02d', $d),
                    'amount' => (float) ($raw[$d] ?? 0),
                ];
            }
        } elseif ($hasCustomRange) {
            $fromDate = \Carbon\Carbon::parse($revFrom)->startOfDay();
            $toDate = \Carbon\Carbon::parse($revTo)->startOfDay();
            $raw = (clone $revenueQuery)
                ->selectRaw('DATE(created_at) as d, SUM(grand_total) as amount')
                ->groupBy('d')
                ->pluck('amount', 'd');
            $monthlyChart = [];
            $period = \Carbon\CarbonPeriod::create($fromDate, $toDate);
            foreach ($period as $date) {
                $key = $date->format('Y-m-d');
                $monthlyChart[] = [
                    'month' => $date->format('d M'),
                    'amount' => (float) ($raw[$key] ?? 0),
                ];
            }
        } else {
            $monthlyData = (clone $revenueQuery)
                ->whereYear('created_at', $currentYear)
                ->selectRaw('EXTRACT(MONTH FROM created_at) as month, SUM(grand_total) as amount')
                ->groupBy('month')
                ->pluck('amount', 'month');

            $monthlyChart = [];
            for ($m = 1; $m <= 12; $m++) {
                $monthlyChart[] = [
                    'month' => $months[$m - 1],
                    'amount' => (float) ($monthlyData[$m] ?? 0),
                ];
            }
        }

        if ($hasCustomMonth) {
            [$y, $m] = explode('-', $revMonth);
            $y = (int)$y; $m = (int)$m;
            $daysInMonth = \Carbon\Carbon::create($y, $m, 1)->daysInMonth;
            $rawTrend = (clone $bookingTrendBase)
                ->selectRaw('EXTRACT(DAY FROM created_at) as d, SUM(CASE WHEN status IN (\'paid\', \'checked_in\', \'checked_out\') THEN 1 ELSE 0 END) as completed, SUM(CASE WHEN status IN (\'pending\', \'unpaid\') THEN 1 ELSE 0 END) as pending')
                ->groupBy('d')
                ->get()->keyBy('d');
            $monthlyBookingChart = [];
            for ($d = 1; $d <= $daysInMonth; $d++) {
                $t = $rawTrend->get($d);
                $monthlyBookingChart[] = ['month' => sprintf('%02d', $d), 'completed' => (int)($t->completed ?? 0), 'pending' => (int)($t->pending ?? 0)];
            }
        } elseif ($hasCustomRange) {
            $fromDate = \Carbon\Carbon::parse($revFrom)->startOfDay();
            $toDate = \Carbon\Carbon::parse($revTo)->startOfDay();
            $rawTrend = (clone $bookingTrendBase)
                ->selectRaw('DATE(created_at) as d, SUM(CASE WHEN status IN (\'paid\', \'checked_in\', \'checked_out\') THEN 1 ELSE 0 END) as completed, SUM(CASE WHEN status IN (\'pending\', \'unpaid\') THEN 1 ELSE 0 END) as pending')
                ->groupBy('d')
                ->get()->keyBy('d');
            $monthlyBookingChart = [];
            $period = \Carbon\CarbonPeriod::create($fromDate, $toDate);
            foreach ($period as $date) {
                $key = $date->format('Y-m-d');
                $t = $rawTrend->get($key);
                $monthlyBookingChart[] = ['month' => $date->format('d M'), 'completed' => (int)($t->completed ?? 0), 'pending' => (int)($t->pending ?? 0)];
            }
        } else {
            // Booking trend per bulan (Completed = paid/checked_in/checked_out, Pending = pending/unpaid)
            $bookingTrend = (clone $bookingTrendBase)
                ->whereYear('created_at', $currentYear)
                ->selectRaw('
                    EXTRACT(MONTH FROM created_at) as month,
                    SUM(CASE WHEN status IN (\'paid\', \'checked_in\', \'checked_out\') THEN 1 ELSE 0 END) as completed,
                    SUM(CASE WHEN status IN (\'pending\', \'unpaid\') THEN 1 ELSE 0 END) as pending
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
        }

        // Booking trend harian — Hari Ini saja (1 nilai total)
        $todayRow = Booking::where('hotel_id', $hotelId)
            ->whereDate('created_at', $today)
            ->selectRaw('
                SUM(CASE WHEN status IN (\'paid\', \'checked_in\', \'checked_out\') THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status IN (\'pending\', \'unpaid\') THEN 1 ELSE 0 END) as pending
            ')
            ->first();

        $dailyBookingChart = [[
            'label' => 'Hari Ini',
            'completed' => (int) ($todayRow->completed ?? 0),
            'pending' => (int) ($todayRow->pending ?? 0),
        ]];

        // Booking trend mingguan — Minggu 1-4 dalam bulan (tanggal 1-7, 8-14, 15-21, 22-akhir)
        $weekBaseMonth = $hasCustomMonth ? \Carbon\Carbon::createFromFormat('Y-m', $revMonth)->startOfMonth() : now()->startOfMonth();
        $weekHotelId = $hotelId;
        $weeklyTrendRaw = (clone $bookingTrendBase)
            ->whereYear('created_at', $weekBaseMonth->year)
            ->whereMonth('created_at', $weekBaseMonth->month)
            ->selectRaw("
                CASE WHEN EXTRACT(DAY FROM created_at) BETWEEN 1 AND 7 THEN 1
                     WHEN EXTRACT(DAY FROM created_at) BETWEEN 8 AND 14 THEN 2
                     WHEN EXTRACT(DAY FROM created_at) BETWEEN 15 AND 21 THEN 3
                     ELSE 4 END as minggu,
                SUM(CASE WHEN status IN ('paid', 'checked_in', 'checked_out') THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status IN ('pending', 'unpaid') THEN 1 ELSE 0 END) as pending
            ")
            ->groupBy('minggu')
            ->get()->keyBy('minggu');

        $weeklyBookingChart = [];
        for ($w = 1; $w <= 4; $w++) {
            $t = $weeklyTrendRaw->get($w);
            $weeklyBookingChart[] = [
                'label' => 'Minggu ' . $w,
                'completed' => (int) ($t->completed ?? 0),
                'pending' => (int) ($t->pending ?? 0),
            ];
        }

        // Revenue mingguan Minggu 1-4 (untuk grafik Analisis Pendapatan mode Mingguan)
        $weeklyRevenueRaw = (clone $revenueQuery)
            ->whereYear('created_at', $weekBaseMonth->year)
            ->whereMonth('created_at', $weekBaseMonth->month)
            ->selectRaw("
                CASE WHEN EXTRACT(DAY FROM created_at) BETWEEN 1 AND 7 THEN 1
                     WHEN EXTRACT(DAY FROM created_at) BETWEEN 8 AND 14 THEN 2
                     WHEN EXTRACT(DAY FROM created_at) BETWEEN 15 AND 21 THEN 3
                     ELSE 4 END as minggu,
                SUM(grand_total) as amount
            ")
            ->groupBy('minggu')
            ->pluck('amount', 'minggu');

        $weeklyRevenueChart = [];
        for ($w = 1; $w <= 4; $w++) {
            $weeklyRevenueChart[] = [
                'name' => 'Minggu ' . $w,
                'amount' => (float) ($weeklyRevenueRaw[$w] ?? 0),
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
                'weekly_revenue_chart' => $weeklyRevenueChart,
                'monthly_booking_chart' => $monthlyBookingChart,
                'daily_booking_chart' => $dailyBookingChart,
                'weekly_booking_chart' => $weeklyBookingChart,
                'yearly_booking_chart' => $yearlyBookingChart,
                'recent_bookings' => $recentBookings,
            ],
        ], 200);
    }
}
