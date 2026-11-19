<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * Menampilkan laporan pendapatan berdasarkan period (daily, weekly, monthly, yearly) atau rentang tanggal.
     *
     * Parameter yang dapat dikirim:
     * - start_date: tanggal mulai (format Y-m-d), opsional jika menggunakan parameter period
     * - end_date: tanggal akhir (format Y-m-d), opsional jika menggunakan parameter period
     * - period: periode yang dipilih (daily, weekly, monthly, yearly). Default: monthly
     *
 * Jika diberikan start_date dan end_date, laporan akan filter berdasarkan rentang tanggal tersebut.
 * Jika tidak, akan menggunakan periode 'default' (bulan ini) atau periode yang spesifik.
 *
 * Data yang dikembalikan meliputi:
 * - hotel_name: nama hotel
 * - total_revenue: total pendapatan seluruh transaksi sesuai periode
 * - period_revenue: alias dari total_revenue (pendapatan sesuai periode yang dipilih)
 * - transactions_count: jumlah total transaksi (payments)
 * - details: array of detail transaksi setiap payment beserta booking code, metode pembayaran, dan amount
 *
 * Setiap detail transaksi berisi:
 * - date: tanggal pembuatan pembayaran format Y-m-d H:i
 * - booking_code: kode booking atau INV-{id} jika booking code tidak tersedia
 * - payment_method: metode pembayaran (Transfer, Cash, dll)
 * - amount: jumlah pembayaran (gross_amount)
 *
 * @param \Illuminate\Http\Request $request
 * @return \Illuminate\Http\JsonResponse JSON response berisi laporan pendapatan lengkap
 */
    // Menampilkan laporan pendapatan berdasarkan period (daily, weekly, monthly, yearly) atau rentang tanggal
    public function revenueReport(Request $request)
    {
        $user = $request->user();
        $hotel = $user->hotel;

        if (! $hotel) {
            return response()->json(['status' => 'error', 'message' => 'Hotel not found.'], 404);
        }

        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');

        // Filter berdasarkan rentang tanggal atau periode
        $query = Payment::where('hotel_id', $hotel->id);

        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay()
            ]);
        } else {
            $allowedPeriods = ['daily', 'weekly', 'monthly', 'yearly'];
            $period = in_array($request->get('period'), $allowedPeriods) ? $request->get('period') : 'monthly';
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
