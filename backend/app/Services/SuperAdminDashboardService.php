<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Booking;
use App\Models\Hotel;
use App\Models\PartnerApplication;
use App\Models\Payment;
use App\Models\Refund;
use App\Models\RoomType;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class SuperAdminDashboardService
{
    public function getSummary(): array
    {
        return Cache::remember('super_admin_summary', 30, function () {
            // DASHBOARD-SA-003: Pendapatan hari ini hanya dari status Success
            $todayRevenue = Payment::where('payment_status', 'Success')
                ->whereDate('paid_at', Carbon::today())
                ->sum('gross_amount');

            return [
                'total_users' => User::count(),
                'total_hotels' => Hotel::count(),
                'total_rooms' => RoomType::sum('stock'),
                'total_bookings' => Booking::count(),
                'active_bookings' => Booking::whereIn('status', ['Pending', 'Paid', 'Checked In'])->count(),
                'today_revenue' => (float) $todayRevenue,
                'pending_refunds' => Refund::where('status', 'Pending')->count(),
                'pending_partner_applications' => PartnerApplication::where('status', 'pending')->count(),
            ];
        });
    }

    public function getBookingStats(): array
    {
        return [
            'pending' => Booking::where('status', 'Pending')->count(),
            'paid' => Booking::where('status', 'Paid')->count(),
            'checked_in' => Booking::where('status', 'Checked In')->count(),
            'checked_out' => Booking::where('status', 'Checked Out')->count(),
            'cancelled' => Booking::where('status', 'Cancelled')->count(),
            'expired' => Booking::where('status', 'Expired')->count(),
            'refunded' => Booking::where('status', 'Refunded')->count(),
        ];
    }

    public function getPaymentStats(): array
    {
        return [
            'pending' => Payment::where('payment_status', 'Pending')->count(),
            'success' => Payment::where('payment_status', 'Success')->count(),
            'failed' => Payment::where('payment_status', 'Failed')->count(),
            'expired' => Payment::where('payment_status', 'Expired')->count(),
            'cancelled' => Payment::where('payment_status', 'Cancelled')->count(),
            'total_transaction' => (float) Payment::where('payment_status', 'Success')->sum('gross_amount'),
        ];
    }

    public function getRefundStats(): array
    {
        // DASHBOARD-SA-004: Refund dihitung dari yang Completed/Approved[cite: 1]
        return [
            'pending' => Refund::where('status', 'Pending')->count(),
            'approved' => Refund::where('status', 'Approved')->count(),
            'rejected' => Refund::where('status', 'Rejected')->count(),
            'completed' => Refund::where('status', 'Completed')->count(),
            'total_refund_amount' => (float) Refund::whereIn('status', ['Approved', 'Completed'])
                ->join('payments', 'refunds.booking_id', '=', 'payments.booking_id')
                ->sum('payments.gross_amount'),
        ];
    }

    public function getRevenueStats($month = null, $year = null): array
    {
        $targetMonth = $month ?? Carbon::now()->month;
        $targetYear = $year ?? Carbon::now()->year;

        // Total Bulanan[cite: 1]
        $monthlyTotal = Payment::where('payment_status', 'Success')
            ->whereYear('paid_at', $targetYear)
            ->whereMonth('paid_at', $targetMonth)
            ->sum('gross_amount');

        // Total Tahunan[cite: 1]
        $yearlyTotal = Payment::where('payment_status', 'Success')
            ->whereYear('paid_at', $targetYear)
            ->sum('gross_amount');

        // Data Harian dalam satu bulan[cite: 1]
        $daily = Payment::select(DB::raw('DATE(paid_at) as date'), DB::raw('SUM(gross_amount) as total'))
            ->where('payment_status', 'Success')
            ->whereYear('paid_at', $targetYear)
            ->whereMonth('paid_at', $targetMonth)
            ->groupBy('date')
            ->get();

        return [
            'daily' => $daily,
            'monthly_total' => (float) $monthlyTotal,
            'yearly_total' => (float) $yearlyTotal,
        ];
    }

    public function getUserStats(): array
    {
        return [
            'total_users' => User::count(),
            'active_users' => User::where('status', 'Active')->count(),
            'new_users_this_month' => User::whereMonth('created_at', Carbon::now()->month)
                ->whereYear('created_at', Carbon::now()->year)
                ->count(),
        ];
    }

    public function getHotelStats(): array
    {
        // Jika dipanggil oleh endpoint statistik lama
        return [
            'active_hotels' => Hotel::where('status', 'Active')->count(),
            'inactive_hotels' => Hotel::where('status', 'Inactive')->count(),
            'blocked_hotels' => Hotel::where('status', 'Blocked')->count(),
        ];
    }

    // TAMBAHKAN METHOD INI UNTUK LIST HOTEL DI MONITORING
    public function getAllHotelsForMonitoring($search = null, $status = null)
    {
        $query = Hotel::with(['admin:id,email', 'city']);

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        // TAMBAHAN: Filter status jika dipilih
        if ($status) {
            $query->where('status', $status);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    public function getPartnerStats(): array
    {
        return [
            'pending' => PartnerApplication::where('status', 'pending')->count(),
            'approved' => PartnerApplication::where('status', 'approved')->count(),
            'rejected' => PartnerApplication::where('status', 'rejected')->count(),
        ];
    }

    public function getCharts(): array
    {
        // Ini adalah *placeholder* yang bisa Anda modifikasi logika grafiknya
        // sesuai library (Recharts/Chart.js) yang dipakai di Frontend
        return [
            'booking_chart' => [],
            'revenue_chart' => [],
            'user_chart' => [],
            'hotel_chart' => [],
            'refund_chart' => [],
        ];
    }

    public function getRecentActivities(): array
    {
        return Cache::remember('super_admin_recent_activities', 15, function () {
            $activities = ActivityLog::with('user:id,name')
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();

            return $activities->map(function ($log) {
                return [
                    'activity' => $log->activity,
                    'user' => $log->user ? $log->user->name : 'System',
                    'time' => $log->created_at instanceof \DateTimeInterface
                        ? $log->created_at->format('Y-m-d H:i:s')
                        : ($log->created_at ? (string) $log->created_at : now()->format('Y-m-d H:i:s')),
                ];
            })->toArray();
        });
    }

    public function getHotelCommissionStats($startDate = null, $endDate = null, $sortBy = 'platform_commission', $sortDir = 'desc', $perPage = 10, $search = null): array
    {
        $allowedSort = ['hotel_revenue', 'platform_commission', 'hotel_name', 'transactions_count'];
        if (! in_array($sortBy, $allowedSort)) {
            $sortBy = 'platform_commission';
        }
        $sortDir = strtolower($sortDir) === 'asc' ? 'asc' : 'desc';

        $query = Payment::where('payment_status', 'success')
            ->when($startDate, fn ($q) => $q->whereDate('paid_at', '>=', $startDate))
            ->when($endDate, fn ($q) => $q->whereDate('paid_at', '<=', $endDate))
            ->join('bookings', 'payments.booking_id', '=', 'bookings.id')
            ->join('hotels', 'bookings.hotel_id', '=', 'hotels.id')
            ->when($search, fn ($q) => $q->where('hotels.name', 'like', "%{$search}%"))
            ->select(
                'hotels.id',
                'hotels.name as hotel_name',
                'hotels.city_id',
                'hotels.admin_id',
                DB::raw('SUM(payments.gross_amount) as hotel_revenue'),
                DB::raw('COUNT(payments.id) as transactions_count'),
                DB::raw('SUM(payments.gross_amount) * 0.05 as platform_commission'),
                DB::raw('SUM(payments.gross_amount) * 0.95 as hotel_net')
            )
            ->groupBy('hotels.id', 'hotels.name', 'hotels.city_id', 'hotels.admin_id');

        if ($sortBy === 'hotel_name') {
            $query->orderBy('hotels.name', $sortDir);
        } else {
            $query->orderBy($sortBy, $sortDir);
        }

        $paginated = $query->paginate($perPage);

        $hotelIds = $paginated->pluck('id')->toArray();
        $cities = Hotel::whereIn('id', $hotelIds)->with('city:id,city')->get()->keyBy('id');
        $admins = User::whereIn('id', $paginated->pluck('admin_id')->filter()->unique()->toArray())->get(['id', 'email'])->keyBy('id');

        $hotels = $paginated->getCollection()->map(function ($row) use ($cities, $admins) {
            $hotel = $cities->get($row->id);

            return [
                'id' => $row->id,
                'name' => $row->hotel_name,
                'city' => $hotel?->city?->city ?? '-',
                'admin_email' => $admins->get($row->admin_id)?->email ?? '-',
                'hotel_revenue' => (float) $row->hotel_revenue,
                'platform_commission' => (float) $row->platform_commission,
                'hotel_net' => (float) $row->hotel_net,
                'transactions_count' => (int) $row->transactions_count,
            ];
        });

        $paginated->setCollection($hotels);

        // ponytail: summary tanpa pagination — 2 query tambahan, gabung via union jika jadi bottleneck
        $summaryBase = Payment::where('payment_status', 'success')
            ->when($startDate, fn ($q) => $q->whereDate('paid_at', '>=', $startDate))
            ->when($endDate, fn ($q) => $q->whereDate('paid_at', '<=', $endDate))
            ->join('bookings', 'payments.booking_id', '=', 'bookings.id')
            ->join('hotels', 'bookings.hotel_id', '=', 'hotels.id')
            ->when($search, fn ($q) => $q->where('hotels.name', 'like', "%{$search}%"));

        $totalRevenue = (clone $summaryBase)->sum('payments.gross_amount');
        $totalHotels = (clone $summaryBase)->distinct()->count('bookings.hotel_id');

        $chartData = Payment::where('payment_status', 'success')
            ->when($startDate, fn ($q) => $q->whereDate('paid_at', '>=', $startDate))
            ->when($endDate, fn ($q) => $q->whereDate('paid_at', '<=', $endDate))
            ->join('bookings', 'payments.booking_id', '=', 'bookings.id')
            ->join('hotels', 'bookings.hotel_id', '=', 'hotels.id')
            ->when($search, fn ($q) => $q->where('hotels.name', 'like', "%{$search}%"))
            ->select('hotels.id', 'hotels.name', DB::raw('SUM(payments.gross_amount) * 0.05 as platform_commission'))
            ->groupBy('hotels.id', 'hotels.name')
            ->orderByDesc('platform_commission')
            ->limit(5)
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'name' => $r->name,
                'platform_commission' => (float) $r->platform_commission,
            ])
            ->toArray();

        return [
            'summary' => [
                'total_hotel_revenue' => (float) $totalRevenue,
                'total_platform_commission' => (float) $totalRevenue * 0.05,
                'total_hotels' => (int) $totalHotels,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'hotels' => $hotels->values()->toArray(),
            'chart_data' => $chartData,
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
                'last_page' => $paginated->lastPage(),
            ],
        ];
    }

    public function updateHotelStatus(Hotel $hotel, string $status): void
    {
        $old = $hotel->status;
        $hotel->update(['status' => $status]);
        ActivityLog::create([
            'user_id' => auth()->id() ?? $hotel->admin_id,
            'activity' => 'Update Hotel Status',
            'description' => "Hotel {$hotel->name} status {$old} -> {$status}",
            'ip_address' => request()->ip(),
        ]);
        Cache::forget('super_admin_summary');
    }

    public function updateHotelStar(Hotel $hotel, ?int $starRating, ?string $reason, User $verifier): void
    {
        $hotel->update([
            'star_rating' => $starRating,
            'star_verified_by' => $starRating ? $verifier->id : null,
            'star_verified_at' => $starRating ? now() : null,
            'star_verified_reason' => $starRating ? $reason : null,
        ]);
        ActivityLog::create([
            'user_id' => $verifier->id,
            'activity' => 'Update Star Rating',
            'description' => $starRating ? "Set bintang hotel {$hotel->name} ke {$starRating}".($reason ? " (Alasan: {$reason})" : '') : "Hapus bintang hotel {$hotel->name}",
            'ip_address' => request()->ip(),
        ]);
        Cache::forget('super_admin_summary');
    }
}
