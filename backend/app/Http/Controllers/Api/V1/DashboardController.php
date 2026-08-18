<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Review;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user  = $request->user();
        $hotel = $user->hotels()->first(); // User hasMany hotels via admin_id

        if (!$hotel) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Hotel not found for this user.',
            ], 404);
        }

        $now   = Carbon::now();
        $today = $now->toDateString();

        // -----------------------------------------------------------------------
        // 1. Query dasar Booking hotel ini
        // -----------------------------------------------------------------------
        $baseBooking = Booking::where('hotel_id', $hotel->id);

        // Total seluruh booking
        $totalBookings = (clone $baseBooking)->count();

        // Breakdown status booking
        $statusCounts = (clone $baseBooking)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();

        $bookingBreakdown = [
            'pending'     => $statusCounts['pending']     ?? 0,
            'unpaid'      => $statusCounts['unpaid']      ?? 0,
            'paid'        => $statusCounts['paid']        ?? 0,
            'checked_in'  => $statusCounts['checked_in']  ?? 0,
            'checked_out' => $statusCounts['checked_out'] ?? 0,
            'cancelled'   => $statusCounts['cancelled']   ?? 0,
            'expired'     => $statusCounts['expired']     ?? 0,
        ];

        // Statistik hari ini
        $todayBookings  = (clone $baseBooking)->whereDate('created_at', $today)->count();
        $todayCheckins  = (clone $baseBooking)->whereDate('check_in', $today)->count();
        $todayCheckouts = (clone $baseBooking)->whereDate('check_out', $today)->count();

        // -----------------------------------------------------------------------
        // 2. Data Kamar Hotel
        // -----------------------------------------------------------------------
        $hotel->loadCount('roomTypes');
        $totalRoomTypes = $hotel->room_types_count;

        // Total stok kamar dari semua tipe kamar
        $totalRooms = $hotel->roomTypes()->withoutTrashed()->sum('stock');

        // Kamar terisi = jumlah booking dengan status checked_in hari ini
        $occupiedRooms = (clone $baseBooking)
            ->where('status', 'checked_in')
            ->whereDate('check_in', '<=', $today)
            ->whereDate('check_out', '>=', $today)
            ->count();

        $availableRooms = max(0, $totalRooms - $occupiedRooms);

        // -----------------------------------------------------------------------
        // 3. Pendapatan (Payment dengan status success)
        // -----------------------------------------------------------------------
        $paymentQuery = Payment::whereHas('booking', function ($q) use ($hotel) {
            $q->where('hotel_id', $hotel->id);
        })->where('payment_status', 'success');

        $totalRevenue = (clone $paymentQuery)->sum('gross_amount');

        $revenueDaily   = (clone $paymentQuery)->whereDate('created_at', $today)->sum('gross_amount');
        $revenueWeekly  = (clone $paymentQuery)->whereBetween('created_at', [
            $now->copy()->startOfWeek(),
            $now->copy()->endOfWeek(),
        ])->sum('gross_amount');
        $revenueMonthly = (clone $paymentQuery)
            ->whereMonth('created_at', $now->month)
            ->whereYear('created_at', $now->year)
            ->sum('gross_amount');
        $revenueYearly  = (clone $paymentQuery)
            ->whereYear('created_at', $now->year)
            ->sum('gross_amount');

        // Data revenue per bulan untuk chart (12 bulan dalam tahun ini)
        $monthlyChart = [];
        for ($m = 1; $m <= 12; $m++) {
            $monthlyChart[] = [
                'month'  => Carbon::create(null, $m)->format('M'),
                'amount' => (clone $paymentQuery)
                    ->whereMonth('created_at', $m)
                    ->whereYear('created_at', $now->year)
                    ->sum('gross_amount'),
            ];
        }

        // -----------------------------------------------------------------------
        // 4. Rata-rata Rating & Total Ulasan
        // -----------------------------------------------------------------------
        $avgRating   = Review::where('hotel_id', $hotel->id)->avg('rating');
        $totalReview = Review::where('hotel_id', $hotel->id)->count();

        // -----------------------------------------------------------------------
        // 5. Pesanan Terbaru (5 booking terbaru)
        // -----------------------------------------------------------------------
        $recentBookings = Booking::with([
            'user:id,name,email',
            'bookingRooms.roomType:id,name',
            'payment:id,booking_id,payment_status,gross_amount',
        ])
            ->where('hotel_id', $hotel->id)
            ->latest()
            ->take(8)
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => [
                // Identitas Hotel
                'hotel_name'  => $hotel->name,
                'hotel_id'    => $hotel->id,

                // Ringkasan Kamar
                'total_rooms'     => (int) $totalRooms,
                'occupied_rooms'  => (int) $occupiedRooms,
                'available_rooms' => (int) $availableRooms,

                // Ringkasan Booking
                'total_bookings'   => $totalBookings,
                'pending_bookings' => $bookingBreakdown['pending'],
                'booking_breakdown' => $bookingBreakdown,

                // Statistik Harian
                'today_bookings'  => $todayBookings,
                'today_checkins'  => $todayCheckins,
                'today_checkouts' => $todayCheckouts,

                // Pendapatan
                'revenue' => $totalRevenue,
                'revenue_details' => [
                    'daily'   => $revenueDaily,
                    'weekly'  => $revenueWeekly,
                    'monthly' => $revenueMonthly,
                    'yearly'  => $revenueYearly,
                ],
                'monthly_chart' => $monthlyChart,

                // Rating
                'average_rating' => $avgRating ? round($avgRating, 1) : null,
                'total_reviews'  => $totalReview,

                // Pesanan Terbaru
                'recent_bookings' => $recentBookings,
            ],
        ]);
    }
}