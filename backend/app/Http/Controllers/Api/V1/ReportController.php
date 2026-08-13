<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReportController extends Controller
{
    // Menampilkan laporan pendapatan berdasarkan rentang tanggal (start_date & end_date)
    public function revenueReport(Request $request)
    {
        $user = $request->user();
        $hotel = $user->hotel;

        if (!$hotel) {
            return response()->json(['status' => 'error', 'message' => 'Hotel not found.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        $startDate = $request->start_date;
        $endDate = $request->end_date;

        // Mengambil data pembayaran yang sukses dalam rentang tanggal
        $payments = Payment::whereHas('booking.rooms.roomType', function($q) use ($hotel) {
                $q->where('hotel_id', $hotel->id);
            })
            ->where('status', 'success')
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->with(['booking.user', 'booking.rooms.roomType'])
            ->get();

        // Hitung total pendapatan pada rentang tanggal tersebut
        $totalRevenue = $payments->sum('amount');

        return response()->json([
            'status' => 'success',
            'data' => [
                'hotel_name' => $hotel->name,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'total_transactions' => $payments->count(),
                'total_revenue' => $totalRevenue,
                'transactions' => $payments
            ]
        ]);
    }
}