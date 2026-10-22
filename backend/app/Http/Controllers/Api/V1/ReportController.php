<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    // Menampilkan laporan pendapatan berdasarkan period (daily, weekly, monthly, yearly) atau rentang tanggal
    public function revenueReport(Request $request)
    {
        $user = $request->user();
        $hotel = $user->hotel;

        if (! $hotel) {
            return response()->json(['status' => 'error', 'message' => 'Hotel not found.'], 404);
        }

        $period = $request->get('period', 'monthly'); // Default monthly

        $query = Payment::whereHas('booking.bookingRooms.roomType', function ($q) use ($hotel) {
            $q->where('hotel_id', $hotel->id);
        })
            ->where('payment_status', 'success')
            ->with(['booking.user', 'booking.bookingRooms.roomType']);

        // Filter berdasarkan periode waktu
        $now = Carbon::now();
        if ($period === 'daily') {
            $query->whereDate('created_at', $now->toDateString());
        } elseif ($period === 'weekly') {
            $query->whereBetween('created_at', [$now->copy()->startOfWeek(), $now->copy()->endOfWeek()]);
        } elseif ($period === 'monthly') {
            $query->whereYear('created_at', $now->year)
                ->whereMonth('created_at', $now->month);
        } elseif ($period === 'yearly') {
            $query->whereYear('created_at', $now->year);
        }

        $payments = $query->latest()->get();

        // Hitung total pendapatan
        $totalRevenue = $payments->sum('gross_amount');

        // Petakan data untuk rincian tabel di frontend
        $details = $payments->map(function ($payment) {
            return [
                'date' => $payment->created_at->format('Y-m-d H:i'),
                'booking_code' => $payment->booking->booking_code ?? 'INV-'.$payment->id,
                'payment_method' => $payment->payment_method ?? 'Transfer',
                'amount' => $payment->gross_amount,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => [
                'hotel_name' => $hotel->name,
                'total_revenue' => $totalRevenue,
                'period_revenue' => $totalRevenue, // Pendapatan sesuai periode yang dipilih
                'transactions_count' => $payments->count(),
                'details' => $details,
            ],
        ]);
    }
}
