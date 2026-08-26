<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\Refund;
use App\Models\User;
use App\Models\Hotel;
use App\Models\PartnerApplication;
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
        if (!empty($filters['start_date']) && !empty($filters['end_date'])) {
            $query->whereBetween($dateColumn, [
                $filters['start_date'] . ' 00:00:00',
                $filters['end_date'] . ' 23:59:59'
            ]);
        }

        return $query;
    }

    public function getBookingReport($user, array $filters): array
    {
        $query = Booking::query();
        $this->applyRoleAndDateFilters($query, $user, $filters, 'check_in');

        return [
            'total_booking' => $query->count(),
            'completed' => (clone $query)->where('status', 'Checked Out')->count(),
            'cancelled' => (clone $query)->where('status', 'Cancelled')->count(),
            'expired' => (clone $query)->where('status', 'Expired')->count(),
            'pending' => (clone $query)->where('status', 'Pending')->count(),
        ];
    }

    public function getRevenueReport($user, array $filters): array
    {
        $query = Payment::query()->where('payment_status', 'Success');
        $this->applyRoleAndDateFilters($query, $user, $filters, 'paid_at');

        $totalRevenue = (clone $query)->sum('gross_amount');

        // TAMBAHAN: Mengambil data tren harian untuk grafik (dikelompokkan per tanggal)
        $trend = (clone $query)
            ->selectRaw('DATE(paid_at) as date, SUM(gross_amount) as total')
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->limit(30) // Batasi 30 hari terakhir agar grafik tidak terlalu padat
            ->get();

        return [
            'total_revenue' => (float) $totalRevenue,
            'average_daily' => (float) ($totalRevenue / 30), // Simplifikasi
            'trend' => $trend // Data untuk grafik Recharts
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
            'refund_amount' => (float) $totalAmount
        ];
    }

    public function getUserReport(array $filters): array
    {
        $query = User::query();

        if (!empty($filters['start_date']) && !empty($filters['end_date'])) {
            $query->whereBetween('created_at', [$filters['start_date'], $filters['end_date']]);
        }

        return [
            'total_users' => $query->count(),
            'verified_users' => (clone $query)->whereNotNull('email_verified_at')->count(), // Future dev[cite: 1]
            'new_users' => (clone $query)->whereMonth('created_at', now()->month)->count(),
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

    public function getPartnerReport(array $filters): array
    {
        $query = PartnerApplication::query();

        return [
            'pending' => (clone $query)->where('status', 'Pending')->count(),
            'approved' => (clone $query)->where('status', 'Approved')->count(),
            'rejected' => (clone $query)->where('status', 'Rejected')->count(),
        ];
    }

    public function exportReport($user, array $filters): array
    {
        $type = $filters['type'] ?? 'booking';
        $format = $filters['format'] ?? 'pdf';

        // Logika pembuatan file PDF/Excel diletakkan di sini (bisa menggunakan dompdf atau laravel-excel)[cite: 1]
        // Sebagai contoh simulasi untuk merespons pembuatan file URL[cite: 1]:
        $fileName = "report-{$type}-" . now()->format('Ym') . "-" . Str::random(5) . ".{$format}";

        // Simpan logika *generate* di *storage*
        // return path download
        return [
            'message' => 'Report berhasil dibuat.',
            'download_url' => "/storage/reports/{$fileName}"
        ];
    }
}
