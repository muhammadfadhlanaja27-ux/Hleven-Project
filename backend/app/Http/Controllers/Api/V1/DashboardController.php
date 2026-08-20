<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Hotel;
use App\Models\RoomType;
use App\Models\BookingRoom;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $hotel = $user->hotel ?? Hotel::first();

        if (!$hotel) {
            return response()->json(['success' => false, 'message' => 'Hotel not found'], 404);
        }

        $totalRooms = RoomType::where('hotel_id', $hotel->id)->sum('stock');
        $occupiedRooms = BookingRoom::whereHas('booking', function ($q) use ($hotel) {
            $q->where('hotel_id', $hotel->id)->where('status', 'checked_in');
        })->sum('qty');
        $availableRooms = max(0, $totalRooms - $occupiedRooms);

        $totalRevenue = Booking::where('hotel_id', $hotel->id)
            ->whereIn('status', ['paid', 'checked_in', 'checked_out'])
            ->sum('grand_total');

        $today = now()->toDateString();
        $todayBookings = Booking::where('hotel_id', $hotel->id)->whereDate('created_at', $today)->count();
        $todayCheckins = Booking::where('hotel_id', $hotel->id)->whereDate('check_in', $today)->count();
        $todayCheckouts = Booking::where('hotel_id', $hotel->id)->whereDate('check_out', $today)->count();

        $bookingStatuses = Booking::where('hotel_id', $hotel->id)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $bookingBreakdown = [
            'pending'     => $bookingStatuses['pending'] ?? 0,
            'unpaid'      => $bookingStatuses['unpaid'] ?? 0,
            'paid'        => $bookingStatuses['paid'] ?? 0,
            'checked_in'  => $bookingStatuses['checked_in'] ?? 0,
            'checked_out' => $bookingStatuses['checked_out'] ?? 0,
            'cancelled'   => $bookingStatuses['cancelled'] ?? 0,
            'expired'     => $bookingStatuses['expired'] ?? 0,
        ];

        $revenueDetails = [
            'daily'   => Booking::where('hotel_id', $hotel->id)->whereIn('status', ['paid', 'checked_in', 'checked_out'])->whereDate('created_at', $today)->sum('grand_total'),
            'weekly'  => Booking::where('hotel_id', $hotel->id)->whereIn('status', ['paid', 'checked_in', 'checked_out'])->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->sum('grand_total'),
            'monthly' => Booking::where('hotel_id', $hotel->id)->whereIn('status', ['paid', 'checked_in', 'checked_out'])->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->sum('grand_total'),
            'yearly'  => Booking::where('hotel_id', $hotel->id)->whereIn('status', ['paid', 'checked_in', 'checked_out'])->whereYear('created_at', now()->year)->sum('grand_total'),
        ];

        $monthlyChart = [];
        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        for ($m = 1; $m <= 12; $m++) {
            $amount = Booking::where('hotel_id', $hotel->id)
                ->whereIn('status', ['paid', 'checked_in', 'checked_out'])
                ->whereYear('created_at', now()->year)
                ->whereMonth('created_at', $m)
                ->sum('grand_total');
            $monthlyChart[] = [
                'month'  => $months[$m - 1],
                'amount' => (float) $amount,
            ];
        }

        $recentBookings = Booking::with(['user', 'bookingRooms.roomType'])
            ->where('hotel_id', $hotel->id)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Dashboard data berhasil dimuat',
            'data'    => [
                'hotel_name'        => is_string($hotel->name) ? $hotel->name : "H'Leven Hotel",
                'total_rooms'       => $totalRooms,
                'occupied_rooms'    => $occupiedRooms,
                'available_rooms'   => $availableRooms,
                'revenue'           => (float) $totalRevenue,
                'today_bookings'    => $todayBookings,
                'today_checkins'    => $todayCheckins,
                'today_checkouts'   => $todayCheckouts,
                'average_rating'    => round($hotel->reviews()->avg('rating') ?? 0, 1),
                'total_bookings'    => array_sum($bookingBreakdown),
                'booking_breakdown' => $bookingBreakdown,
                'revenue_details'   => $revenueDetails,
                'monthly_chart'     => $monthlyChart,
                'recent_bookings'   => $recentBookings,
            ],
        ], 200);
    }
}