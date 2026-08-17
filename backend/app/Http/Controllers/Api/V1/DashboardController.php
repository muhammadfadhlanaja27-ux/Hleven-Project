<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Models\Booking;
use App\Models\Payment;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $hotel = $user->hotel; // Asumsi hotel admin terhubung ke user

        if (!$hotel) {
            return response()->json([
                'status' => 'error',
                'message' => 'Hotel not found for this user.'
            ], 404);
        }

        $now = Carbon::now();

        // 1. Total Booking untuk hotel ini
        $totalBookings = Booking::where('hotel_id', $hotel->id)->count();

        // 2. Booking Pending untuk hotel ini
        $pendingBookings = Booking::where('hotel_id', $hotel->id)->where('status', 'pending')->count();

        // 3. Query dasar Payment yang berelasi dengan booking di hotel ini & status sukses/paid
        $paymentQuery = Payment::whereHas('booking', function($q) use ($hotel) {
            $q->where('hotel_id', $hotel->id);
        })->where('payment_status', 'success'); // Sesuaikan dengan kolom di model Payment

        // Total Pendapatan secara keseluruhan untuk ditampilkan di kartu utama
        $totalRevenue = (clone $paymentQuery)->sum('gross_amount');

        // Rincian Pendapatan (Daily, Weekly, Monthly, Yearly)
        $daily = (clone $paymentQuery)->whereDate('created_at', $now->toDateString())->sum('gross_amount');
        $weekly = (clone $paymentQuery)->whereBetween('created_at', [
            $now->copy()->startOfWeek(),
            $now->copy()->endOfWeek()
        ])->sum('gross_amount');
        $monthly = (clone $paymentQuery)->whereMonth('created_at', $now->month)
            ->whereYear('created_at', $now->year)
            ->sum('gross_amount');
        $yearly = (clone $paymentQuery)->whereYear('created_at', $now->year)->sum('gross_amount');

        // 4. Pesanan Terbaru (Recent Bookings) dengan eager loading relasi user dan kamar
        $recentBookings = Booking::with(['user', 'bookingRooms.roomType'])
            ->where('hotel_id', $hotel->id)
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'hotel_name' => $hotel->name,
                'total_bookings' => $totalBookings,
                'pending_bookings' => $pendingBookings,
                'revenue' => $totalRevenue, // Menyesuaikan dengan kebutuhan frontend Dashboard.jsx
                'revenue_details' => [
                    'daily' => $daily,
                    'weekly' => $weekly,
                    'monthly' => $monthly,
                    'yearly' => $yearly,
                ],
                'recent_bookings' => $recentBookings,
            ]
        ]);
    }
}