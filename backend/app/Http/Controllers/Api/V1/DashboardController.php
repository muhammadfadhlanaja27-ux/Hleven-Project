<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Hotel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function getAdminStats(Request $request)
    {
        $adminId = $request->user()->id;
        $hotel = Hotel::where('admin_id', $adminId)->firstOrFail();

        // Statistik Booking
        $stats = [
            'total_bookings' => Booking::where('hotel_id', $hotel->id)->count(),
            'pending_bookings' => Booking::where('hotel_id', $hotel->id)->where('status', 'pending')->count(),
            'revenue' => Booking::where('hotel_id', $hotel->id)
                            ->where('status', 'paid')
                            ->sum('grand_total'),
            'recent_bookings' => Booking::where('hotel_id', $hotel->id)
                                    ->with(['user', 'bookingRooms.roomType'])
                                    ->latest()->take(5)->get()
        ];

        return response()->json(['success' => true, 'data' => $stats]);
    }
}
