<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        // Asumsi hotel admin terhubung ke user, atau ambil hotel berdasarkan request/admin
        $hotel = $user->hotel; // Sesuaikan dengan relasi model Anda jika ada

        if (!$hotel) {
            return response()->json([
                'status' => 'error',
                'message' => 'Hotel not found for this user.'
            ], 404);
        }

        $now = Carbon::now();

        // Contoh perhitungan pendapatan dari tabel bookings / payments
        // Sesuaikan nama tabel dan kolom status (misal: 'completed' atau 'success')
        $query = \App\Models\Payment::whereHas('booking.rooms.roomType', function($q) use ($hotel) {
            $q->where('hotel_id', $hotel->id);
        })->where('status', 'success');

        // Pendapatan Per Hari (Hari ini)
        $daily = (clone $query)->whereDate('created_at', $now->toDateString())->sum('amount');

        // Pendapatan Per Minggu (Minggu ini)
        $weekly = (clone $query)->whereBetween('created_at', [
            $now->copy()->startOfWeek(),
            $now->copy()->endOfWeek()
        ])->sum('amount');

        // Pendapatan Per Bulan (Bulan ini)
        $monthly = (clone $query)->whereMonth('created_at', $now->month)
            ->whereYear('created_at', $now->year)
            ->sum('amount');

        // Pendapatan Per Tahun (Tahun ini)
        $yearly = (clone $query)->whereYear('created_at', $now->year)->sum('amount');

        return response()->json([
            'status' => 'success',
            'data' => [
                'hotel_name' => $hotel->name,
                'revenue' => [
                    'daily' => $daily,
                    'weekly' => $weekly,
                    'monthly' => $monthly,
                    'yearly' => $yearly,
                ]
            ]
        ]);
    }
}