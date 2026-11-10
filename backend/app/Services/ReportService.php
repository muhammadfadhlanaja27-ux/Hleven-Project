<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Hotel;
use App\Models\PartnerApplication;
use App\Models\Payment;
use App\Models\Refund;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

class ReportService
{
    /**
     * Helper untuk memfilter kueri berdasarkan role dan hotel_id[cite: 1]
     */
    private function applyRoleAndDateFilters(Builder $query, $user, array $filters, string $dateColumn = 'created_at')
    {
        // REPORT-001: Admin Hotel hanya melihat hotel miliknya[cite: 1]
        if ($user->role === 'admin_hotel') {
            $hotelIds = Hotel::where('admin_id', $user->id)->pluck('id');
            // Asumsi tabel yang di-query memiliki kolom hotel_id atau berelasi ke hotel[cite: 1]
            if (in_array('hotel_id', $query->getModel()->getFillable()) || $query->getModel()->getKeyName() === 'hotel_id') {
                $query->whereIn('hotel_id', $hotelIds);
            } elseif ($query->getModel() instanceof Payment || $query->getModel() instanceof Refund) {
                $query->whereHas('booking', function ($q) use ($hotelIds) {
                    $q->whereIn('hotel_id', $hotelIds);
                });
            }
        } elseif (isset($filters['hotel_id'])) {
            $query->where('hotel_id', $filters['hotel_id']);
        }

        // REPORT-003: Filter tanggal opsional[cite: 1]
        if (! empty($filters['start_date']) && ! empty($filters['end_date'])) {
            $query->whereBetween($dateColumn, [
                $filters['start_date'].' 00:00:00',
                $filters['end_date'].' 23:59:59',
            ]);
        }

        return $query;
    }

    public function getBookingReport($user, array $filters): array
    {
        $query = Booking::query();
        $this->applyRoleAndDateFilters($query, $user, $filters, 'check_in');

        // Distribution
        $distribution = (clone $query)
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status')
            ->toArray();

        // Previous month
        $prevMonthStart = now()->subMonth()->startOfMonth()->toDateString();
        $prevMonthEnd = now()->subMonth()->endOfMonth()->toDateString();
        
        $prevQuery = Booking::query();
        $this->applyRoleAndDateFilters($prevQuery, $user, ['start_date' => $prevMonthStart, 'end_date' => $prevMonthEnd], 'check_in');
        
        $prevCompleted = (clone $prevQuery)->where('status', 'Checked Out')->count();
        $currentCompleted = $distribution['Checked Out'] ?? 0;

        return [
            'total_booking' => $query->count(),
            'completed' => $currentCompleted,
            'cancelled' => $distribution['Cancelled'] ?? 0,
            'expired' => $distribution['Expired'] ?? 0,
            'pending' => $distribution['Pending'] ?? 0,
            'diff' => $currentCompleted - $prevCompleted,
            'distribution' => $distribution,
        ];
    }

    public function getRevenueReport($user, array $filters): array
    {
        $query = Payment::query()->where('payment_status', 'Success');
        $this->applyRoleAndDateFilters($query, $user, $filters, 'paid_at');

        $totalRevenue = (clone $query)->sum('gross_amount');

        // TAMBAHAN: Pendapatan bulan lalu untuk perbandingan
        $lastMonthStart = now()->subMonth()->startOfMonth()->toDateString();
        $lastMonthEnd = now()->subMonth()->endOfMonth()->toDateString();
        
        $prevMonthRevenue = (clone $query)
            ->whereBetween('paid_at', [$lastMonthStart.' 00:00:00', $lastMonthEnd.' 23:59:59'])
            ->sum('gross_amount');

        $trend = (clone $query)
            ->selectRaw('DATE(paid_at) as date, SUM(gross_amount) as total')
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->limit(30)
            ->get();

        return [
            'total_revenue' => (float) $totalRevenue,
            'prev_month_revenue' => (float) $prevMonthRevenue,
            'diff' => (float) ($totalRevenue - $prevMonthRevenue),
            'trend' => $trend,
        ];
    }

    public function getRefundReport($user, array $filters): array
    {
        $query = Refund::query()->where('status', 'Completed');
        $this->applyRoleAndDateFilters($query, $user, $filters, 'approved_at');

        $totalAmount = $query->join('payments', 'refunds.booking_id', '=', 'payments.booking_id')
            ->sum('payments.gross_amount');

        return [
            'total_refund' => $query->count(),
            'refund_amount' => (float) $totalAmount,
        ];
    }

    public function getUserReport(array $filters): array
    {
        $query = User::query();

        if (! empty($filters['start_date']) && ! empty($filters['end_date'])) {
            $query->whereBetween('created_at', [$filters['start_date'], $filters['end_date']]);
        }

        $totalUsers = $query->count();
        
        // Previous month
        $prevMonthStart = now()->subMonth()->startOfMonth()->toDateString();
        $prevMonthEnd = now()->subMonth()->endOfMonth()->toDateString();
        $prevUsers = User::query()->whereBetween('created_at', [$prevMonthStart, $prevMonthEnd])->count();

        return [
            'total_users' => $totalUsers,
            'verified_users' => (clone $query)->whereNotNull('email_verified_at')->count(), // Future dev[cite: 1]
            'new_users' => (clone $query)->whereYear('created_at', now()->year)->whereMonth('created_at', now()->month)->count(),
            'diff' => $totalUsers - $prevUsers,
        ];
    }

    public function getHotelReport(array $filters): array
    {
        $query = Hotel::query();

        return [
            'total_hotels' => $query->count(),
            'active_hotels' => (clone $query)->where('status', 'Active')->count(),
            'inactive_hotels' => (clone $query)->where('status', 'Inactive')->count(),
        ];
    }

    public function getFinancialSummary(array $filters, $user): array
    {
        $query = Payment::query()->where('payment_status', 'Success');
        $this->applyRoleAndDateFilters($query, $user, $filters, 'paid_at');

        $commissionRate = config('hleven.commission_rate', 0.10);
        
        $stats = (clone $query)
            ->selectRaw('SUM(gross_amount) as gross_revenue')
            ->first();

        $gross = (float) ($stats->gross_revenue ?? 0);
        $platformCut = $gross * $commissionRate;
        $hotelNet = $gross - $platformCut;

        // Top Bookings
        $topBookings = \App\Models\Hotel::query()
            ->withCount('bookings')
            ->orderByDesc('bookings_count')
            ->limit(5)
            ->get()
            ->map(fn($h) => ['name' => $h->name, 'value' => $h->bookings_count]);

        // Top Revenue
        $topRevenue = \App\Models\Hotel::query()
            ->leftJoin('bookings', 'hotels.id', '=', 'bookings.hotel_id')
            ->leftJoin('payments', 'bookings.id', '=', 'payments.booking_id')
            ->select('hotels.name')
            ->selectRaw('SUM(payments.gross_amount) as total_revenue')
            ->where('payments.payment_status', 'Success')
            ->groupBy('hotels.id', 'hotels.name')
            ->orderByDesc('total_revenue')
            ->limit(5)
            ->get()
            ->map(fn($h) => ['name' => $h->name, 'value' => (float)($h->total_revenue ?? 0)]);

        return [
            'financial' => [
                'gross_revenue' => $gross,
                'platform_commission' => $platformCut,
                'hotel_net_revenue' => $hotelNet,
            ],
            'top_bookings' => $topBookings,
            'top_revenue' => $topRevenue,
        ];
    }

    public function exportReport($user, array $filters): array
    {
        $type = $filters['type'] ?? 'booking';
        $format = $filters['format'] ?? 'pdf';

        // Logika pembuatan file PDF/Excel diletakkan di sini (bisa menggunakan dompdf atau laravel-excel)[cite: 1]
        // Sebagai contoh simulasi untuk merespons pembuatan file URL[cite: 1]:
        $fileName = "report-{$type}-".now()->format('Ym').'-'.Str::random(5).".{$format}";

        // Simpan logika *generate* di *storage*
        // return path download
        return [
            'message' => 'Report berhasil dibuat.',
            'download_url' => "/storage/reports/{$fileName}",
        ];
    }
}
